using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed partial class PackageCatalogService
{
    private async Task EnsureDefaultsAsync(CancellationToken cancellationToken)
    {
        var existingPackages = await db
            .Packages.Where(package =>
                package.Id == "membership-basic"
                || package.Id == "membership-plus"
                || package.Id == "membership-premium")
            .ToListAsync(cancellationToken);
        var existingIds = existingPackages.Select(p => p.Id).ToHashSet();
        var missing = Defaults.Where(item => !existingIds.Contains(item.Id)).ToArray();

        var updated = false;
        foreach (var def in Defaults.Where(d => d.Category == "membership"))
        {
            var existing = existingPackages.FirstOrDefault(p => p.Id == def.Id);
            if (existing != null && !string.IsNullOrWhiteSpace(existing.CatalogJson))
            {
                var cur = DeserializeCatalog(existing.CatalogJson);
                if (cur.GroupDiscountPct != def.GroupDiscountPct 
                    || cur.CoachDiscountPct != def.CoachDiscountPct
                    || cur.TierRank != def.TierRank
                    || string.Join("|", cur.Benefits) != string.Join("|", def.Benefits))
                {
                    cur.GroupDiscountPct = def.GroupDiscountPct;
                    cur.CoachDiscountPct = def.CoachDiscountPct;
                    cur.TierRank = def.TierRank;
                    cur.Benefits = def.Benefits;
                    existing.CatalogJson = JsonSerializer.Serialize(cur, JsonOptions);
                    updated = true;
                }
            }
        }

        if (missing.Length == 0)
        {
            if (updated)
                await db.SaveChangesAsync(cancellationToken);
            await RemoveLegacySportPackagesAsync(cancellationToken);
            return;
        }

        foreach (var item in missing)
        {
            db.Packages.Add(
                new Package
                {
                    Id = item.Id,
                    Name = item.Name,
                    Tagline = item.Category == "membership" ? item.Tier : item.Format,
                    PackageType = item.Category,
                    MonthlyPrice = item.Prices[1],
                    YearlyPrice = item.Prices[12],
                    Description = item.Description,
                    Status = item.IsActive,
                    CatalogJson = JsonSerializer.Serialize(item, JsonOptions),
                    Features = item
                        .Benefits.Select(text => new PackageFeature
                        {
                            PackageId = item.Id,
                            FeatureText = text,
                        })
                        .ToList(),
                    Benefits = item
                        .Benefits.Select(text => new MembershipBenefit
                        {
                            PackageId = item.Id,
                            BenefitType = "general",
                            Description = text,
                        })
                        .ToList(),
                }
            );
        }
        await db.SaveChangesAsync(cancellationToken);
        await RemoveLegacySportPackagesAsync(cancellationToken);
    }

    private async Task RemoveLegacySportPackagesAsync(CancellationToken cancellationToken)
    {
        var legacyPackages = await db.Packages
            .Include(package => package.Features)
            .Include(package => package.Benefits)
            .Where(package => package.PackageType == "sport")
            .ToListAsync(cancellationToken);
        if (legacyPackages.Count == 0) return;

        var subscriptions = await db.Subscriptions
            .Join(
                db.Packages.Where(package => package.PackageType == "sport"),
                subscription => subscription.PackageId,
                package => package.Id,
                (subscription, _) => subscription
            )
            .ToListAsync(cancellationToken);

        var referencedPackageIds = subscriptions
            .Select(subscription => subscription.PackageId!)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var subscription in subscriptions)
        {
            var package = legacyPackages.First(item => item.Id == subscription.PackageId);
            // Keep a snapshot for receipts and payment history before removing the catalog row.
            if (string.IsNullOrWhiteSpace(subscription.PackageSnapshotJson))
            {
                subscription.PackageSnapshotJson = !string.IsNullOrWhiteSpace(package.CatalogJson)
                    ? package.CatalogJson
                    : JsonSerializer.Serialize(new CatalogPackageDto
                    {
                        Id = package.Id,
                        Category = "sport",
                        Name = package.Name,
                        Description = package.Description ?? package.Name,
                        IsActive = false,
                        Prices = new Dictionary<int, decimal>
                        {
                            [1] = package.MonthlyPrice ?? 0,
                            [3] = (package.MonthlyPrice ?? 0) * 3,
                            [6] = (package.MonthlyPrice ?? 0) * 6,
                            [12] = package.YearlyPrice ?? (package.MonthlyPrice ?? 0) * 12,
                        },
                        Benefits = package.Features.Select(feature => feature.FeatureText)
                            .Concat(package.Benefits.Select(benefit => benefit.Description))
                            .Distinct()
                            .ToList(),
                        Terms = new List<string> { "Sản phẩm lưu trữ cho lịch sử giao dịch cũ." },
                    }, JsonOptions);
            }

        }

        // Keep packages still referenced by subscriptions (including active entitlements and invoices),
        // but retire them from sale. Orphan catalog rows and their dependent features/benefits can be removed.
        foreach (var package in legacyPackages.Where(package => referencedPackageIds.Contains(package.Id)))
            package.Status = false;

        db.Packages.RemoveRange(legacyPackages.Where(package => !referencedPackageIds.Contains(package.Id)));
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<CatalogPackageDto?> GetActiveMembershipAsync(
        Guid userId,
        DateTime now,
        CancellationToken cancellationToken
    )
    {
        var subscriptions = await db
            .Subscriptions.AsNoTracking()
            .Include(s => s.Package)
            .Where(subscription =>
                subscription.UserId == userId
                && subscription.PaymentStatus == PaymentStatus.Completed
                && subscription.StartDate <= now
                && subscription.EndDate >= now
            )
            .OrderByDescending(subscription => subscription.StartDate)
            .ToListAsync(cancellationToken);

        return subscriptions
            .Select(DeserializeSnapshot)
            .FirstOrDefault(package =>
                package.Category == "membership"
                && !string.IsNullOrWhiteSpace(package.Tier)
                && package.Tier != "basic"
            );
    }

    public static int GetTierRank(string? tier) => tier?.ToLowerInvariant() switch
    {
        "basic" => 0,
        "plus" => 1,
        "premium" => 2,
        "vip" => 3,
        "diamond" => 4,
        _ => 1
    };

    public static int GetTierRank(CatalogPackageDto package) =>
        package.TierRank ?? GetTierRank(package.Tier);

    public async Task<Subscription?> GetActiveMembershipSubscriptionAsync(
        Guid userId,
        DateTime now,
        CancellationToken cancellationToken
    )
    {
        var subscriptions = await db
            .Subscriptions
            .Include(s => s.Package)
            .Where(subscription =>
                subscription.UserId == userId
                && subscription.PaymentStatus == PaymentStatus.Completed
                && subscription.StartDate <= now
                && subscription.EndDate >= now
                && subscription.PackageSnapshotJson != null
            )
            .OrderByDescending(subscription => subscription.StartDate)
            .ToListAsync(cancellationToken);

        return subscriptions.FirstOrDefault(s =>
        {
            var pkg = DeserializeSnapshot(s);
            return pkg.Category == "membership"
                && !string.IsNullOrWhiteSpace(pkg.Tier)
                && pkg.Tier != "basic";
        });
    }

    public async Task ClosePreviousMembershipSubscriptionsAsync(
        Guid userId,
        Guid currentSubscriptionId,
        DateTime cutoffDate,
        CancellationToken cancellationToken
    )
    {
        var oldMemberships = await db.Subscriptions
            .Where(s => s.UserId == userId
                     && s.Id != currentSubscriptionId
                     && s.PaymentStatus == PaymentStatus.Completed
                     && s.EndDate >= cutoffDate
                     && s.PackageSnapshotJson != null)
            .ToListAsync(cancellationToken);

        var changed = false;
        foreach (var oldSub in oldMemberships)
        {
            var oldSnap = DeserializeSnapshot(oldSub);
            if (oldSnap.Category == "membership")
            {
                oldSub.EndDate = cutoffDate.AddSeconds(-1);
                changed = true;
            }
        }

        if (changed)
        {
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<(DateTime Start, DateTime End)> GetProjectedPeriodAsync(
        Guid userId,
        CatalogPackageDto snapshot,
        int durationMonths,
        DateTime now,
        CancellationToken cancellationToken
    )
    {
        var today = now.Date;
        var subscriptions = await db
            .Subscriptions.AsNoTracking()
            .Where(item =>
                item.UserId == userId
                && item.PaymentStatus == PaymentStatus.Completed
                && item.PackageSnapshotJson != null
            )
            .Select(item => new { item.PackageSnapshotJson, item.EndDate })
            .ToListAsync(cancellationToken);

        var matchingEnds = subscriptions
            .Select(item => new
            {
                Package = DeserializeCatalog(item.PackageSnapshotJson!),
                item.EndDate,
            })
            .Where(item =>
                item.Package.Category == snapshot.Category
                && (
                    snapshot.Category == "membership"
                    || string.Equals(
                        item.Package.Sport,
                        snapshot.Sport,
                        StringComparison.OrdinalIgnoreCase
                    )
                )
            )
            .Select(item => item.EndDate.Date);
        var latestEnd = matchingEnds.DefaultIfEmpty(today.AddDays(-1)).Max();
        var start = latestEnd >= today ? latestEnd.AddDays(1) : today;
        var end = start.AddMonths(durationMonths).AddDays(-1);
        return (
            DateTime.SpecifyKind(start, DateTimeKind.Utc),
            DateTime.SpecifyKind(end, DateTimeKind.Utc).AddHours(23).AddMinutes(59).AddSeconds(59)
        );
    }

    private static void ValidatePackage(string id, CatalogPackageDto package, bool create)
    {
        if (!string.Equals(id, package.Id, StringComparison.Ordinal))
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Mã gói trong URL và nội dung không khớp."
            );
        if (
            string.IsNullOrWhiteSpace(package.Name)
            || string.IsNullOrWhiteSpace(package.Description)
        )
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Tên gói và mô tả là bắt buộc."
            );
        if (package.Benefits.Count == 0 || package.Benefits.Any(string.IsNullOrWhiteSpace))
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Gói cần ít nhất một quyền lợi hợp lệ."
            );
        if (
            !new[] { 1, 3, 6, 12 }.All(period =>
                package.Prices.TryGetValue(period, out var price) && price >= 0
            )
        )
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Cần cấu hình giá không âm cho các kỳ hạn 1, 3, 6 và 12 tháng."
            );
        if (package.Category is not ("membership" or "sport"))
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Loại gói không hợp lệ."
            );
        if (package.Category == "membership")
        {
            if (string.IsNullOrWhiteSpace(package.Tier)
                || package.Tier.Length > 48
                || !System.Text.RegularExpressions.Regex.IsMatch(package.Tier, "^[a-z0-9]+(?:-[a-z0-9]+)*$"))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Mã hạng thành viên không hợp lệ.");
            if (!string.Equals(id, $"membership-{package.Tier}", StringComparison.Ordinal))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Mã gói phải tương ứng với mã hạng thành viên.");
            if (create && (package.Tier is "basic" or "plus" or "premium" || package.TierRank is null or < 3))
                throw new PackageCatalogException(StatusCodes.Status400BadRequest, "Hạng mới cần mã riêng và thứ tự xếp hạng hợp lệ.");
            if (
                package.Tier == "basic"
                && (package.Prices.Values.Any(price => price != 0) || !package.IsActive)
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Hạng Cơ bản luôn miễn phí và luôn được mở."
                );
            if (package.Tier != "basic" && package.Prices.Values.Any(price => price <= 0))
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Các hạng trả phí phải có giá lớn hơn 0."
                );
            if (
                package.GroupDiscountPct is < 0 or > 100
                || package.CoachDiscountPct is < 0 or > 100
                || package.BookingAdvanceHours < 0
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Quy tắc ưu đãi không hợp lệ."
                );
        }
        else
        {
            if (
                string.IsNullOrWhiteSpace(package.Sport)
                || package.Format is not ("self" or "group" or "coach")
                || package.Prices.Values.Any(price => price <= 0)
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Gói môn tập cần bộ môn, hình thức và giá dương cho đủ kỳ hạn."
                );
            if (
                package.Format != "self"
                && (
                    package.SessionsPerMonth is null or <= 0
                    || package.MinutesPerSession is null or <= 0
                )
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Gói lớp nhóm/Coach cần số buổi mỗi tháng và thời lượng."
                );
            if (package.Format == "group" && package.MaxClassSize is null or <= 0)
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Gói lớp nhóm cần sĩ số tối đa hợp lệ."
                );
            if (create && package.Id.StartsWith("membership-", StringComparison.Ordinal))
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Mã gói môn không hợp lệ."
                );
        }
    }
}
