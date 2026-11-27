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
            if (subscription != null)
            {
                if (subscription.PaymentStatus != PaymentStatus.Pending)
                    throw new PackageCatalogException(
                        StatusCodes.Status409Conflict,
                        "Đơn đã được xử lý, không thể xác nhận thanh toán lần nữa."
                    );

                var snapshot = DeserializeSnapshot(subscription);
                if (snapshot.Category != "membership")
                    throw new PackageCatalogException(
                        StatusCodes.Status409Conflict,
                        "Đơn gói môn tập cũ không thể được xác nhận sau khi danh mục này ngừng kinh doanh."
                    );
                var now = DateTime.UtcNow;
                if (snapshot.Category == "membership")
                {
                    // Nếu đơn hàng này là Gia hạn nối tiếp (StartDate đã được ấn định trong tương lai) thì giữ nguyên
                    if (subscription.StartDate <= now.Date)
                    {
                        subscription.StartDate = DateTime.SpecifyKind(now.Date, DateTimeKind.Utc);
                        var duration = subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod);
                        subscription.EndDate = DateTime.SpecifyKind(subscription.StartDate.AddMonths(duration).AddDays(-1), DateTimeKind.Utc).AddHours(23).AddMinutes(59).AddSeconds(59);
                    }
                }
                else
                {
                    var (start, end) = await GetProjectedPeriodAsync(
                        subscription.UserId,
                        snapshot,
                        subscription.DurationMonths ?? ParseDuration(subscription.BillingPeriod),
                        now,
                        cancellationToken
                    );
                    subscription.StartDate = start;
                    subscription.EndDate = end;
                }
                subscription.PaymentStatus = PaymentStatus.Completed;
                subscription.PaidAt = now;
                if (snapshot.Category == "membership" && subscription.StartDate.Date <= now.Date)
                {
                    await ClosePreviousMembershipSubscriptionsAsync(subscription.UserId, subscription.Id, subscription.StartDate, cancellationToken);
                }
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
                       cb.subscription_id AS "SubscriptionId",
                       COALESCE(cb.status, 'pending') AS "Status",
                       COALESCE(cb.created_at, now()) AS "CreatedAt",
                       COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                       COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                       COALESCE(c.parent_id, c.id) AS "CourseId",
                       COALESCE(course.class_name, root.class_name, c.class_name, 'Lớp học') AS "CourseName",
                       GREATEST(COALESCE(course.total_sessions, root.total_sessions, c.total_sessions, 1), 1) AS "CourseSessionCount",
                       GREATEST(COALESCE(root.course_fee_snapshot,
                           root.price_per_session_snapshot * GREATEST(COALESCE(root.total_sessions, 1), 1),
                           active_price.price_per_session * GREATEST(COALESCE(root.total_sessions, 1), 1), 0), 0) AS "CourseSubtotal",
                       COALESCE(u.full_name, 'Hội viên') AS "UserName",
                       COALESCE(u.email, '') AS "UserEmail",
                       COALESCE(u.phone_number, '') AS "UserPhone"
                FROM class_bookings cb
                JOIN classes c ON c.id = cb.class_id
                LEFT JOIN class_courses course ON course.id = c.parent_id
                LEFT JOIN classes root ON root.id = COALESCE(c.parent_id, c.id)
                LEFT JOIN LATERAL (
                    SELECT p.price_per_session
                    FROM sport_class_pricing p
                    WHERE p.sport_id = root.sport_id AND p.is_active = TRUE
                      AND p.effective_from <= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                      AND (p.effective_to IS NULL OR p.effective_to >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)
                    ORDER BY p.effective_from DESC, p.created_at DESC
                    LIMIT 1
                ) active_price ON TRUE
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
                "UPDATE class_bookings SET status = 'confirmed' WHERE user_id = {0} AND class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1}) AND status = 'pending'",
                booking.UserId, booking.CourseId);

            var classInvoice = await db.Invoices
                .Where(i => i.UserId == booking.UserId && i.ClassId == booking.CourseId && i.Status == PaymentStatus.Pending)
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
                Subtotal = booking.CourseSubtotal > 0 ? booking.CourseSubtotal : 150000m,
                DiscountPct = booking.CourseSubtotal > 0 && classInvoice != null
                    ? decimal.Round(Math.Max(0m, booking.CourseSubtotal - classInvoice.TotalAmount) / booking.CourseSubtotal * 100m, 0)
                    : 0m,
                DiscountAmount = booking.CourseSubtotal > 0 && classInvoice != null
                    ? Math.Max(0m, booking.CourseSubtotal - classInvoice.TotalAmount)
                    : 0m,
                Total = classInvoice?.TotalAmount ?? (booking.CourseSubtotal > 0 ? booking.CourseSubtotal : 150000m),
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
            if (subscription != null)
            {
                if (subscription.PaymentStatus == PaymentStatus.Failed)
                    throw new PackageCatalogException(
                        StatusCodes.Status409Conflict,
                        "Đơn hàng này đã bị hủy trước đó."
                    );

                subscription.PaymentStatus = PaymentStatus.Failed;

                try
                {
                    var invoice = await db.Invoices
                        .Where(i => i.UserId == subscription.UserId && i.Status == PaymentStatus.Pending)
                        .OrderByDescending(i => i.CreatedAt)
                        .FirstOrDefaultAsync(cancellationToken);
                    if (invoice != null)
                    {
                        invoice.Status = PaymentStatus.Failed;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CancelOrder Invoice Warning] {ex.Message}");
                }

                await db.SaveChangesAsync(cancellationToken);

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE subscriptions SET payment_status = 'failed' WHERE id = {orderId}",
                        cancellationToken);
                }
                catch {}

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
                       cb.subscription_id AS "SubscriptionId",
                       COALESCE(cb.status, 'pending') AS "Status",
                       COALESCE(cb.created_at, now()) AS "CreatedAt",
                       COALESCE(c.class_name, 'Lớp học') AS "ClassName",
                       COALESCE(c.schedule_time, now()) AS "ScheduleTime",
                       COALESCE(c.parent_id, c.id) AS "CourseId",
                       COALESCE(root.class_name, c.class_name, 'Lớp học') AS "CourseName",
                       GREATEST(COALESCE(root.total_sessions, c.total_sessions, 1), 1) AS "CourseSessionCount",
                       GREATEST(COALESCE(root.course_fee_snapshot,
                           root.price_per_session_snapshot * GREATEST(COALESCE(root.total_sessions, 1), 1),
                           active_price.price_per_session * GREATEST(COALESCE(root.total_sessions, 1), 1), 0), 0) AS "CourseSubtotal",
                       COALESCE(u.full_name, 'Hội viên') AS "UserName",
                       COALESCE(u.email, '') AS "UserEmail",
                       COALESCE(u.phone_number, '') AS "UserPhone"
                FROM class_bookings cb
                JOIN classes c ON c.id = cb.class_id
                LEFT JOIN classes root ON root.id = COALESCE(c.parent_id, c.id)
                LEFT JOIN LATERAL (
                    SELECT p.price_per_session
                    FROM sport_class_pricing p
                    WHERE p.sport_id = root.sport_id AND p.is_active = TRUE
                      AND p.effective_from <= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
                      AND (p.effective_to IS NULL OR p.effective_to >= (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date)
                    ORDER BY p.effective_from DESC, p.created_at DESC
                    LIMIT 1
                ) active_price ON TRUE
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

            await db.Database.ExecuteSqlRawAsync("""
                WITH cancelled AS (
                    UPDATE class_bookings
                    SET status = 'cancelled'
                    WHERE user_id = {0}
                      AND class_id IN (SELECT id FROM classes WHERE id = {1} OR parent_id = {1})
                      AND status = 'pending'
                    RETURNING class_id
                ), affected_sessions AS (
                    SELECT DISTINCT class_id FROM cancelled
                )
                UPDATE classes c
                SET current_enrolled = (
                    SELECT COUNT(*) FROM class_bookings b
                    WHERE b.class_id = c.id
                      AND LOWER(b.status) IN ('confirmed', 'pending', 'approved', 'pending_payment')
                )
                WHERE c.id IN (SELECT class_id FROM affected_sessions)
                """, booking.UserId, booking.CourseId);

            var classInvoice = await db.Invoices
                .Where(i => i.UserId == booking.UserId && i.ClassId == booking.CourseId && i.Status == PaymentStatus.Pending)
                .OrderByDescending(i => i.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (classInvoice != null)
            {
                classInvoice.Status = PaymentStatus.Failed;
                await db.SaveChangesAsync(cancellationToken);
            }

            var cancelledSubtotal = booking.CourseSubtotal > 0 ? booking.CourseSubtotal : 150000m;
            var cancelledTotal = classInvoice?.TotalAmount ?? cancelledSubtotal;

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
                Subtotal = cancelledSubtotal,
                DiscountPct = cancelledSubtotal > 0
                    ? decimal.Round(Math.Max(0m, cancelledSubtotal - cancelledTotal) / cancelledSubtotal * 100m, 0)
                    : 0m,
                DiscountAmount = Math.Max(0m, cancelledSubtotal - cancelledTotal),
                Total = cancelledTotal,
                PaymentMethod = "counter",
                Status = "failed",
                CreatedAt = booking.CreatedAt,
            };
        });
    }
}
