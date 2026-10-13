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
    public async Task<PackageOrderResponse> CreateOrderAsync(
        Guid userId,
        CreatePackageOrderRequest request,
        CancellationToken cancellationToken
    )
    {
        if (request.DurationMonths is not (1 or 3 or 6 or 12))
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Kỳ hạn chỉ được là 1, 3, 6 hoặc 12 tháng."
            );

        var user = await db
            .Users.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId && item.Status, cancellationToken);
        if (user is null)
            throw new PackageCatalogException(
                StatusCodes.Status401Unauthorized,
                "Không tìm thấy hội viên đang đăng nhập."
            );

        var package = await db
            .Packages.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == request.PackageId, cancellationToken);
        if (package?.CatalogJson is null || !package.Status)
            throw new PackageCatalogException(
                StatusCodes.Status404NotFound,
                "Gói này không tồn tại hoặc đã ngừng bán."
            );

        var snapshot = DeserializeCatalog(package.CatalogJson);
        if (snapshot.Category == "membership" && snapshot.Tier == "basic")
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Hạng Cơ bản miễn phí, không cần tạo đơn."
            );

        var subtotal = snapshot.Prices.GetValueOrDefault(request.DurationMonths);
        if (subtotal <= 0)
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Gói chưa cấu hình giá cho kỳ hạn này."
            );

        var membership = await GetActiveMembershipAsync(userId, DateTime.UtcNow, cancellationToken);
        var discountPct =
            snapshot.Category == "sport"
                ? snapshot.Format == "coach"
                    ? membership?.CoachDiscountPct ?? 0
                    : membership?.GroupDiscountPct ?? 0
                : 0;
        var discountAmount = decimal.Round(
            subtotal * discountPct / 100m,
            0,
            MidpointRounding.AwayFromZero
        );
        var total = subtotal - discountAmount;
        var now = DateTime.UtcNow;
        var (start, end) = await GetProjectedPeriodAsync(
            userId,
            snapshot,
            request.DurationMonths,
            now,
            cancellationToken
        );

        var subscription = new Subscription
        {
            UserId = userId,
            PackageId = package.Id,
            BillingPeriod = $"months:{request.DurationMonths}",
            DurationMonths = request.DurationMonths,
            TotalAmount = total,
            DiscountPct = discountPct,
            DiscountAmount = discountAmount,
            PackageSnapshotJson = JsonSerializer.Serialize(snapshot, JsonOptions),
            PaymentStatus = PaymentStatus.Pending,
            StartDate = start,
            EndDate = end,
            CreatedAt = now,
            AutoRenew = false,
        };
        db.Subscriptions.Add(subscription);
        await db.SaveChangesAsync(cancellationToken);
        return MapOrder(subscription, user.FullName, user.Email, snapshot);
    }

    public async Task<IReadOnlyList<PackageOrderResponse>> GetOrdersAsync(
        Guid? memberId,
        CancellationToken cancellationToken
    )
    {
        IQueryable<Subscription> query = db
            .Subscriptions.AsNoTracking()
            .Include(subscription => subscription.User)
            .Include(subscription => subscription.Package);
        if (memberId.HasValue)
            query = query.Where(subscription => subscription.UserId == memberId.Value);

        var subscriptions = await query
            .OrderByDescending(subscription => subscription.CreatedAt)
            .ToListAsync(cancellationToken);
        return subscriptions
            .Select(subscription =>
                MapOrder(
                    subscription,
                    subscription.User?.FullName ?? string.Empty,
                    subscription.User?.Email ?? string.Empty,
                    DeserializeSnapshot(subscription)
                )
            )
            .ToArray();
    }

    public async Task<PackageOrderResponse> ConfirmPaymentAsync(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var subscription = await db
            .Subscriptions.FromSqlInterpolated(
                $"SELECT * FROM subscriptions WHERE id = {orderId} FOR UPDATE"
            )
            .Include(item => item.User)
            .Include(item => item.Package)
            .FirstOrDefaultAsync(cancellationToken);
        if (subscription?.PackageSnapshotJson is null)
            throw new PackageCatalogException(
                StatusCodes.Status404NotFound,
                "Không tìm thấy đơn gói tập."
            );
        if (subscription.PaymentStatus != PaymentStatus.Pending)
            throw new PackageCatalogException(
                StatusCodes.Status409Conflict,
                "Đơn đã được xử lý, không thể xác nhận thanh toán lần nữa."
            );

        var snapshot = DeserializeSnapshot(subscription);
        var (start, end) = await GetProjectedPeriodAsync(
            subscription.UserId,
            snapshot,
            subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod),
            DateTime.UtcNow,
            cancellationToken
        );
        subscription.StartDate = start;
        subscription.EndDate = end;
        subscription.PaymentStatus = PaymentStatus.Completed;
        subscription.PaidAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapOrder(
            subscription,
            subscription.User?.FullName ?? string.Empty,
            subscription.User?.Email ?? string.Empty,
            snapshot
        );
    }

    public async Task<bool> HasActiveSportAccessAsync(
        Guid userId,
        string sport,
        CancellationToken cancellationToken
    )
    {
        var now = DateTime.UtcNow;
        var snapshots = await db
            .Subscriptions.AsNoTracking()
            .Where(subscription =>
                subscription.UserId == userId
                && subscription.PaymentStatus == PaymentStatus.Completed
                && subscription.PackageSnapshotJson != null
                && subscription.StartDate <= now
                && subscription.EndDate >= now
            )
            .Select(subscription => subscription.PackageSnapshotJson!)
            .ToListAsync(cancellationToken);
        return snapshots
            .Select(DeserializeCatalog)
            .Any(package =>
                package.Category == "sport"
                && string.Equals(
                    package.Sport?.Trim(),
                    sport.Trim(),
                    StringComparison.OrdinalIgnoreCase
                )
            );
    }

    public async Task<PackageCheckoutResponse> CheckoutAsync(
        Guid userId,
        CreatePackageCheckoutRequest request,
        CancellationToken cancellationToken
    )
    {
        if (request.DurationMonths is not (1 or 3 or 6 or 12))
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Kỳ hạn chỉ được là 1, 3, 6 hoặc 12 tháng."
            );

        var user = await db
            .Users.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == userId && item.Status, cancellationToken);
        if (user is null)
            throw new PackageCatalogException(
                StatusCodes.Status401Unauthorized,
                "Không tìm thấy hội viên đang đăng nhập."
            );

        var package = await db
            .Packages.AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == request.PackageId, cancellationToken);
        if (package?.CatalogJson is null || !package.Status)
            throw new PackageCatalogException(
                StatusCodes.Status404NotFound,
                "Gói này không tồn tại hoặc đã ngừng bán."
            );

        var snapshot = DeserializeCatalog(package.CatalogJson);
        if (snapshot.Category == "membership" && snapshot.Tier == "basic")
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Hạng Cơ bản miễn phí, không cần thanh toán."
            );

        var subtotal = snapshot.Prices.GetValueOrDefault(request.DurationMonths);
        if (subtotal <= 0)
            throw new PackageCatalogException(
                StatusCodes.Status400BadRequest,
                "Gói chưa cấu hình giá cho kỳ hạn này."
            );

        var membership = await GetActiveMembershipAsync(userId, DateTime.UtcNow, cancellationToken);
        var discountPct =
            snapshot.Category == "sport"
                ? snapshot.Format == "coach"
                    ? membership?.CoachDiscountPct ?? 0
                    : membership?.GroupDiscountPct ?? 0
                : 0;
        var discountAmount = decimal.Round(
            subtotal * discountPct / 100m,
            0,
            MidpointRounding.AwayFromZero
        );
        var total = subtotal - discountAmount;
        var now = DateTime.UtcNow;
        var (start, end) = await GetProjectedPeriodAsync(
            userId,
            snapshot,
            request.DurationMonths,
            request.StartDate ?? now,
            cancellationToken
        );

        var method = PaymentMethodExtensions.ParseDbValue(request.PaymentMethod ?? "counter");
        var isCounter = method == PaymentMethod.CashAtCounter;
        var paymentStatus = isCounter ? PaymentStatus.Pending : PaymentStatus.Completed;
        var paidAt = isCounter ? (DateTime?)null : now;

        var subscription = new Subscription
        {
            UserId = userId,
            PackageId = package.Id,
            BillingPeriod = $"months:{request.DurationMonths}",
            DurationMonths = request.DurationMonths,
            TotalAmount = total,
            DiscountPct = discountPct,
            DiscountAmount = discountAmount,
            PackageSnapshotJson = JsonSerializer.Serialize(snapshot, JsonOptions),
            PaymentStatus = paymentStatus,
            PaymentMethod = method,
            StartDate = start,
            EndDate = end,
            CreatedAt = now,
            PaidAt = paidAt,
            AutoRenew = false,
        };
        db.Subscriptions.Add(subscription);

        var invoice = new Invoice
        {
            UserId = userId,
            TotalAmount = total,
            PaymentMethod = method,
            Status = paymentStatus,
            CreatedAt = now,
            PaidAt = paidAt,
        };
        db.Invoices.Add(invoice);

        await db.SaveChangesAsync(cancellationToken);

        return new PackageCheckoutResponse
        {
            Order = MapOrder(subscription, user.FullName, user.Email, snapshot),
            InvoiceId = invoice.Id,
        };
    }
}
