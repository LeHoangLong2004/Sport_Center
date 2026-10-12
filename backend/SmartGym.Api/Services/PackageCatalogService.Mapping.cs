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
    private static PackageOrderResponse MapOrder(
        Subscription subscription,
        string userName,
        string userEmail,
        CatalogPackageDto snapshot
    )
    {
        var duration = subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod);
        return new PackageOrderResponse
        {
            Id = subscription.Id,
            UserId = subscription.UserId,
            UserName = userName,
            UserEmail = userEmail,
            PackageId = subscription.PackageId ?? snapshot.Id,
            PackageSnapshot = snapshot,
            DurationMonths = duration,
            Subtotal = subscription.TotalAmount + subscription.DiscountAmount,
            DiscountPct = subscription.DiscountPct,
            DiscountAmount = subscription.DiscountAmount,
            Total = subscription.TotalAmount,
            Status = subscription.PaymentStatus switch
            {
                PaymentStatus.Completed => "paid",
                PaymentStatus.Failed or PaymentStatus.Expired => "failed",
                _ => "pending",
            },
            CreatedAt = subscription.CreatedAt,
            PaidAt = subscription.PaidAt,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
        };
    }

    private static int ParseDuration(string? billingPeriod) =>
        billingPeriod switch
        {
            "monthly" => 1,
            "yearly" => 12,
            _ when billingPeriod?.StartsWith("months:", StringComparison.OrdinalIgnoreCase) == true
                    && int.TryParse(billingPeriod.AsSpan(7), out var months) => months,
            _ => 1,
        };

    private static CatalogPackageDto DeserializeSnapshot(Subscription subscription)
    {
        if (!string.IsNullOrWhiteSpace(subscription.PackageSnapshotJson))
            return DeserializeCatalog(subscription.PackageSnapshotJson);

        var package = subscription.Package;
        if (package == null)
        {
            return new CatalogPackageDto
            {
                Id = subscription.PackageId ?? "unknown",
                Category = "unknown",
                Name = "Gói đã xóa hoặc không xác định",
                Description = "Thông tin gói tập không còn tồn tại trong hệ thống.",
                Prices = new Dictionary<int, decimal> { [1] = subscription.TotalAmount },
                Benefits = new List<string>(),
                Terms = new List<string>(),
            };
        }

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
                [12] = package.YearlyPrice ?? (package.MonthlyPrice ?? 0) * 12 * 0.85m,
            },
            Benefits = package.Features?.Select(f => f.FeatureText).ToList() ?? new List<string>(),
            Terms = new List<string> { "Gói tập được áp dụng theo quy định của trung tâm." },
            Sport = package.PackageType == "sport" ? package.Name : null,
        };
    }

    private static CatalogPackageDto DeserializeCatalog(string json) =>
        JsonSerializer.Deserialize<CatalogPackageDto>(json, JsonOptions)
        ?? throw new PackageCatalogException(
            StatusCodes.Status500InternalServerError,
            "Dữ liệu danh mục gói không hợp lệ."
        );

}
