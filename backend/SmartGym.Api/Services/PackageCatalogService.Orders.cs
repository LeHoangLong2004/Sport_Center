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
        if (request.StartDate.HasValue && request.StartDate.Value.Date >= DateTime.UtcNow.Date)
        {
            start = DateTime.SpecifyKind(request.StartDate.Value.Date, DateTimeKind.Utc);
            end = DateTime.SpecifyKind(start.AddMonths(request.DurationMonths).AddDays(-1), DateTimeKind.Utc).AddHours(23).AddMinutes(59).AddSeconds(59);
        }

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
            PaymentMethod = PaymentMethod.CashAtCounter,
            PaymentStatus = PaymentStatus.Pending,
            StartDate = start,
            EndDate = end,
            CreatedAt = now,
            AutoRenew = false,
        };

        db.Subscriptions.Add(subscription);
        await db.SaveChangesAsync(cancellationToken);
        return MapOrder(subscription, user.FullName, user.Email, user.PhoneNumber ?? string.Empty, snapshot);
    }

    public async Task<PackageCheckoutResponse> CheckoutAsync(
        Guid userId,
        CreatePackageCheckoutRequest request,
        CancellationToken cancellationToken
    )
    {
        var orderRequest = new CreatePackageOrderRequest
        {
            PackageId = request.PackageId,
            DurationMonths = request.DurationMonths,
            StartDate = request.StartDate,
        };

        var order = await CreateOrderAsync(userId, orderRequest, cancellationToken);
        var paymentMethod = PaymentMethodExtensions.ParseDbValue(request.PaymentMethod ?? "qr");

        // Chuyển khoản QR, thẻ hoặc ví điện tử: cập nhật hoàn tất thanh toán (paid)
        // Tiền mặt tại quầy (counter): giữ trạng thái chờ thanh toán
        var isOnlinePaid = paymentMethod != PaymentMethod.CashAtCounter;
        var paymentStatus = isOnlinePaid ? PaymentStatus.Completed : PaymentStatus.Pending;
        var paidAt = isOnlinePaid ? DateTime.UtcNow : (DateTime?)null;

        var subscription = await db.Subscriptions.FirstOrDefaultAsync(s => s.Id == order.Id, cancellationToken);
        if (subscription != null)
        {
            subscription.PaymentMethod = paymentMethod;
            if (isOnlinePaid)
            {
                subscription.PaymentStatus = paymentStatus;
                subscription.PaidAt = paidAt;
                order.Status = "paid";
                order.PaidAt = paidAt;
            }
            order.PaymentMethod = paymentMethod.ToDbValue();
        }

        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TotalAmount = order.Total,
            PaymentMethod = paymentMethod,
            Status = paymentStatus,
            CreatedAt = DateTime.UtcNow,
            PaidAt = paidAt,
        };

        db.Invoices.Add(invoice);
        await db.SaveChangesAsync(cancellationToken);

        return new PackageCheckoutResponse
        {
            Order = order,
            InvoiceId = invoice.Id,
        };
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
}
