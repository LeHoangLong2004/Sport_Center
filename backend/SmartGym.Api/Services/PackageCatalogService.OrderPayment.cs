using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed partial class PackageCatalogService
{
    public async Task<PackageOrderResponse> ConfirmPaymentAsync(
        Guid orderId,
        string? paymentMethod,
        CancellationToken cancellationToken
    )
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            var subscription = await db.Subscriptions
                .Include(item => item.User)
                .Include(item => item.Package)
                .FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);
            if (subscription != null && subscription.PackageSnapshotJson != null)
            {
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
                var now = DateTime.UtcNow;
                subscription.StartDate = start;
                subscription.EndDate = end;
                subscription.PaymentStatus = PaymentStatus.Completed;
                subscription.PaidAt = now;
                if (!string.IsNullOrWhiteSpace(paymentMethod))
                {
                    try
                    {
                        subscription.PaymentMethod = PaymentMethodExtensions.ParseDbValue(paymentMethod);
                    }
                    catch
                    {
                        // ignore
                    }
                }

                var invoice = await db.Invoices
                    .Where(i => i.UserId == subscription.UserId && i.Status == PaymentStatus.Pending)
                    .OrderByDescending(i => i.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);
                if (invoice != null)
                {
                    invoice.Status = PaymentStatus.Completed;
                    invoice.PaidAt = now;
                    if (subscription.PaymentMethod.HasValue)
                    {
                        invoice.PaymentMethod = subscription.PaymentMethod.Value;
                    }
                }

                try
                {
                    await db.Database.ExecuteSqlRawAsync(
                        "UPDATE class_bookings SET status = 'confirmed' WHERE user_id = {0} AND status = 'pending'",
                        subscription.UserId);
                }
                catch
                {
                    // ignore
                }

                await db.SaveChangesAsync(cancellationToken);

                return MapOrder(
                    subscription,
                    subscription.User?.FullName ?? string.Empty,
                    subscription.User?.Email ?? string.Empty,
                    subscription.User?.PhoneNumber ?? string.Empty,
                    snapshot
                );
            }

            // Kiểm tra xem có phải đơn đặt lớp học không
            var booking = await db.Database.SqlQueryRaw<ClassBookingOrderRaw>(
                """
                SELECT cb.id AS "BookingId", cb.user_id AS "UserId", cb.class_id AS "ClassId",
                       COALESCE(cb.status, 'pending') AS "Status",
                       COALESCE(cb.created_at, now()) AS "CreatedAt",
                       COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                       COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                       COALESCE(u.full_name, 'Hội viên') AS "UserName",
                       COALESCE(u.email, '') AS "UserEmail",
                       COALESCE(u.phone_number, '') AS "UserPhone"
                FROM class_bookings cb
                JOIN classes c ON c.id = cb.class_id
                JOIN users u ON u.id = cb.user_id
                WHERE cb.id = {0}
                """, orderId)
                .FirstOrDefaultAsync(cancellationToken);

            if (booking == null)
            {
                throw new PackageCatalogException(
                    StatusCodes.Status404NotFound,
                    "Không tìm thấy đơn hàng hoặc đơn đặt lớp."
                );
            }

            await db.Database.ExecuteSqlRawAsync(
                "UPDATE class_bookings SET status = 'confirmed' WHERE id = {0}",
                orderId);

            var classInvoice = await db.Invoices
                .Where(i => i.UserId == booking.UserId && i.Status == PaymentStatus.Pending)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            var completedNow = DateTime.UtcNow;
            if (classInvoice != null)
            {
                classInvoice.Status = PaymentStatus.Completed;
                classInvoice.PaidAt = completedNow;
                if (!string.IsNullOrWhiteSpace(paymentMethod))
                {
                    try { classInvoice.PaymentMethod = PaymentMethodExtensions.ParseDbValue(paymentMethod); } catch {}
                }
                await db.SaveChangesAsync(cancellationToken);
            }

            return new PackageOrderResponse
            {
                Id = booking.BookingId,
                UserId = booking.UserId,
                UserName = booking.UserName ?? "Hội viên",
                UserEmail = booking.UserEmail ?? "",
                UserPhone = booking.UserPhone ?? "",
                PackageId = booking.ClassId.ToString(),
                PackageSnapshot = new CatalogPackageDto
                {
                    Id = booking.ClassId.ToString(),
                    Name = $"Lớp: {booking.ClassName}",
                    Category = "class",
                    Tier = "Vé lớp học",
                    Description = $"Lịch học: {booking.ScheduleTime:HH:mm dd/MM/yyyy} • Đặt chỗ tại quầy",
                    Sport = "Lớp nhóm",
                },
                DurationMonths = 1,
                Subtotal = 150000m,
                Total = 150000m,
                PaymentMethod = paymentMethod ?? "counter",
                Status = "paid",
                CreatedAt = booking.CreatedAt,
                PaidAt = completedNow,
                StartDate = booking.ScheduleTime,
                EndDate = booking.ScheduleTime.AddHours(1),
            };
        });
    }

    public async Task<PackageOrderResponse> CancelOrderAsync(
        Guid orderId,
        CancellationToken cancellationToken
    )
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            var subscription = await db.Subscriptions
                .Include(item => item.User)
                .Include(item => item.Package)
                .FirstOrDefaultAsync(item => item.Id == orderId, cancellationToken);
            if (subscription != null && subscription.PackageSnapshotJson != null)
            {
                if (subscription.PaymentStatus != PaymentStatus.Pending)
                    throw new PackageCatalogException(
                        StatusCodes.Status409Conflict,
                        "Chỉ có thể hủy đơn đang chờ thanh toán."
                    );

                subscription.PaymentStatus = PaymentStatus.Failed;

                var invoice = await db.Invoices
                    .Where(i => i.UserId == subscription.UserId && i.Status == PaymentStatus.Pending)
                    .OrderByDescending(i => i.CreatedAt)
                    .FirstOrDefaultAsync(cancellationToken);
                if (invoice != null)
                {
                    invoice.Status = PaymentStatus.Failed;
                }

                await db.SaveChangesAsync(cancellationToken);

                var snapshot = DeserializeSnapshot(subscription);
                return MapOrder(
                    subscription,
                    subscription.User?.FullName ?? string.Empty,
                    subscription.User?.Email ?? string.Empty,
                    subscription.User?.PhoneNumber ?? string.Empty,
                    snapshot
                );
            }

            // Kiểm tra xem có phải đơn đặt lớp học không
            var booking = await db.Database.SqlQueryRaw<ClassBookingOrderRaw>(
                """
                SELECT cb.id AS "BookingId", cb.user_id AS "UserId", cb.class_id AS "ClassId",
                       COALESCE(cb.status, 'pending') AS "Status",
                       COALESCE(cb.created_at, now()) AS "CreatedAt",
                       COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                       COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                       COALESCE(u.full_name, 'Hội viên') AS "UserName",
                       COALESCE(u.email, '') AS "UserEmail",
                       COALESCE(u.phone_number, '') AS "UserPhone"
                FROM class_bookings cb
                JOIN classes c ON c.id = cb.class_id
                JOIN users u ON u.id = cb.user_id
                WHERE cb.id = {0}
                """, orderId)
                .FirstOrDefaultAsync(cancellationToken);

            if (booking == null)
            {
                throw new PackageCatalogException(
                    StatusCodes.Status404NotFound,
                    "Không tìm thấy đơn hàng hoặc đơn đặt lớp."
                );
            }

            await db.Database.ExecuteSqlRawAsync(
                "UPDATE class_bookings SET status = 'cancelled' WHERE id = {0}",
                orderId);

            await db.Database.ExecuteSqlRawAsync(
                "UPDATE classes SET current_enrolled = GREATEST(0, current_enrolled - 1) WHERE id = {0}",
                booking.ClassId);

            var classInvoice = await db.Invoices
                .Where(i => i.UserId == booking.UserId && i.Status == PaymentStatus.Pending)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (classInvoice != null)
            {
                classInvoice.Status = PaymentStatus.Failed;
                await db.SaveChangesAsync(cancellationToken);
            }

            return new PackageOrderResponse
            {
                Id = booking.BookingId,
                UserId = booking.UserId,
                UserName = booking.UserName ?? "Hội viên",
                UserEmail = booking.UserEmail ?? "",
                UserPhone = booking.UserPhone ?? "",
                PackageId = booking.ClassId.ToString(),
                PackageSnapshot = new CatalogPackageDto
                {
                    Id = booking.ClassId.ToString(),
                    Name = $"Lớp: {booking.ClassName}",
                    Category = "class",
                    Tier = "Vé lớp học",
                    Description = $"Suất học lúc {booking.ScheduleTime:HH:mm dd/MM/yyyy} • Đã hủy",
                    Sport = "Lớp nhóm",
                },
                DurationMonths = 1,
                Subtotal = 150000m,
                Total = 150000m,
                PaymentMethod = "counter",
                Status = "failed",
                CreatedAt = booking.CreatedAt,
            };
        });
    }
}
