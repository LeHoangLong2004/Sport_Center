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
    public async Task<IReadOnlyList<CatalogPackageDto>> GetCatalogAsync(
        bool includeInactive,
        CancellationToken cancellationToken
    )
    {
        await EnsureDefaultsAsync(cancellationToken);
        var query = db.Packages.Include(p => p.Features).Include(p => p.Benefits).AsNoTracking();
        if (!includeInactive)
            query = query.Where(package => package.Status);

        var packages = await query
            .OrderBy(package => package.PackageType)
            .ThenBy(package => package.Id)
            .ToListAsync(cancellationToken);

        return packages
            .Select(package =>
            {
                if (!string.IsNullOrEmpty(package.CatalogJson))
                {
                    return DeserializeCatalog(package.CatalogJson);
                }

                // Map legacy package or package added without CatalogJson
                return new CatalogPackageDto
                {
                    Id = package.Id,
                    Category = package.PackageType,
                    Name = package.Name,
                    Tier = package.PackageType == "membership" ? package.Tagline : null,
                    Format = package.PackageType == "sport" ? package.Tagline : null,
                    Description = package.Description ?? "",
                    IsActive = package.Status,
                    Prices = new Dictionary<int, decimal>
                    {
                        [1] = package.MonthlyPrice ?? 0,
                        [3] = (package.MonthlyPrice ?? 0) * 3 * 0.95m, // Guess discount
                        [6] = (package.MonthlyPrice ?? 0) * 6 * 0.9m,
                        [12] = package.YearlyPrice ?? (package.MonthlyPrice ?? 0) * 12 * 0.85m,
                    },
                    Benefits = package
                        .Features.Select(f => f.FeatureText)
                        .Concat(package.Benefits.Select(b => b.Description))
                        .ToList(),
                    Terms = new List<string>
                    {
                        "Gói tập được áp dụng theo quy định của trung tâm.",
                    },
                    GroupDiscountPct = 0,
                    CoachDiscountPct = 0,
                    BookingAdvanceHours = 24,
                    LockerTerms = "Sử dụng tủ theo quy định.",
                    Sport = package.PackageType == "sport" ? package.Name : null,
                };
            })
            .ToArray();
    }

    public async Task<CatalogPackageDto> SaveCatalogPackageAsync(
        string id,
        CatalogPackageDto request,
        bool create,
        CancellationToken cancellationToken
    )
    {
        ValidatePackage(id, request, create);
        await EnsureDefaultsAsync(cancellationToken);

        var package = await db
            .Packages.Include(item => item.Features)
            .Include(item => item.Benefits)
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (create)
        {
            if (package is not null)
                throw new PackageCatalogException(
                    StatusCodes.Status409Conflict,
                    "Đã tồn tại mã gói này."
                );
            package = new Package { Id = id };
            db.Packages.Add(package);
        }
        else if (package is null || package.CatalogJson is null)
        {
            throw new PackageCatalogException(
                StatusCodes.Status404NotFound,
                "Không tìm thấy gói trong danh mục."
            );
        }

        if (package!.CatalogJson is not null)
        {
            var current = DeserializeCatalog(package.CatalogJson);
            if (current.Category == "membership" && current.Tier != request.Tier)
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Mã hạng thành viên không thể thay đổi."
                );
            if (
                current.Tier == "basic"
                && (!request.IsActive || request.Prices.Values.Any(price => price != 0))
            )
                throw new PackageCatalogException(
                    StatusCodes.Status400BadRequest,
                    "Hạng Cơ bản luôn miễn phí và luôn được mở."
                );
        }

        package.Name = request.Name.Trim();
        package.Tagline = request.Category == "membership" ? request.Tier : request.Format;
        package.PackageType = request.Category;
        package.MonthlyPrice = request.Prices[1];
        package.YearlyPrice = request.Prices[12];
        package.Description = request.Description.Trim();
        package.Status = request.IsActive;
        package.CatalogJson = JsonSerializer.Serialize(request, JsonOptions);

        db.PackageFeatures.RemoveRange(package.Features);
        db.MembershipBenefits.RemoveRange(package.Benefits);
        package.Features = request
            .Benefits.Select(text => new PackageFeature { PackageId = id, FeatureText = text })
            .ToList();
        package.Benefits = request
            .Benefits.Select(text => new MembershipBenefit
            {
                PackageId = id,
                BenefitType = "general",
                Description = text,
            })
            .ToList();

        await db.SaveChangesAsync(cancellationToken);
        return request;
    }

    public async Task SetPackageStatusAsync(
        string id,
        bool isActive,
        CancellationToken cancellationToken
    )
    {
        var package = await db.Packages.FirstOrDefaultAsync(
            item => item.Id == id,
            cancellationToken
        );
        if (package?.CatalogJson is null)
            throw new PackageCatalogException(
                StatusCodes.Status404NotFound,
                "Không tìm thấy gói trong danh mục."
            );

        var catalog = DeserializeCatalog(package.CatalogJson);
        if (catalog.Tier == "basic" && !isActive)
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Hạng Cơ bản luôn được mở."
            );

        catalog.IsActive = isActive;
        package.Status = isActive;
        package.CatalogJson = JsonSerializer.Serialize(catalog, JsonOptions);
        await db.SaveChangesAsync(cancellationToken);
    }

}
