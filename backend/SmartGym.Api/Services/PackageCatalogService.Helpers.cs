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
        var existingIds = await db
            .Packages.Where(package => Defaults.Select(item => item.Id).Contains(package.Id))
            .Select(package => package.Id)
            .ToListAsync(cancellationToken);
        var missing = Defaults.Where(item => !existingIds.Contains(item.Id)).ToArray();
        if (missing.Length == 0)
            return;

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
    }

    private async Task<CatalogPackageDto?> GetActiveMembershipAsync(
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
                package.Category == "membership" && package.Tier is "plus" or "premium"
            );
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
            if (create || package.Tier is not ("basic" or "plus" or "premium"))
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Chỉ được cấu hình ba hạng Cơ bản, Plus và Premium."
                );
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
                || string.IsNullOrWhiteSpace(package.Area)
                || package.Format is not ("self" or "group" or "coach")
                || package.Prices.Values.Any(price => price <= 0)
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Gói môn tập cần bộ môn, khu, hình thức và giá dương cho đủ kỳ hạn."
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
