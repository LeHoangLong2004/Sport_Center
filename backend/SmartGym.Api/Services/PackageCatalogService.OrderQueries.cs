using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Domain.Entities;
using SmartGym.Domain.Enums;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed partial class PackageCatalogService
{
    public async Task<IReadOnlyList<PackageOrderResponse>> GetOrdersAsync(
        Guid? memberId,
        CancellationToken cancellationToken
    )
    {
        IQueryable<Subscription> query = db
            .Subscriptions
            .Include(subscription => subscription.User)
            .Include(subscription => subscription.Package);
        if (!memberId.HasValue)
            query = query.AsNoTracking();
        if (memberId.HasValue)
            query = query.Where(subscription => subscription.UserId == memberId.Value);

        var subscriptions = await query
            .OrderByDescending(subscription => subscription.CreatedAt)
            .ToListAsync(cancellationToken);

        // Reconcile already-paid renewal rows created before the effective
        // expiration was also persisted on the current subscription row.
        if (memberId.HasValue)
            await ReconcileMembershipRenewalEndDateAsync(subscriptions, cancellationToken);

        var subOrders = subscriptions
            .Select(subscription =>
                MapOrder(
                    subscription,
                    subscription.User?.FullName ?? string.Empty,
                    subscription.User?.Email ?? string.Empty,
                    subscription.User?.PhoneNumber ?? string.Empty,
                    DeserializeSnapshot(subscription)
                )
            )
            .ToList();

        // Lấy thêm các đơn đặt lớp lẻ thanh toán tại quầy
        try
        {
            var sql = """
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
                WHERE LOWER(cb.status) IN ('pending', 'confirmed', 'approved')
                  AND c.id = COALESCE(c.parent_id, c.id)
                """;
            if (memberId.HasValue)
            {
                sql += $" AND cb.user_id = '{memberId.Value}'";
            }
            var classOrders = await db.Database.SqlQueryRaw<ClassBookingOrderRaw>(sql).ToListAsync(cancellationToken);

            var classInvoices = new List<Invoice>();
            if (classOrders.Count > 0)
            {
                var userIds = classOrders.Select(order => order.UserId).Distinct().ToArray();
                var earliestBooking = classOrders.Min(order => order.CreatedAt).AddMinutes(-10);
                var latestBooking = classOrders.Max(order => order.CreatedAt).AddMinutes(10);
                classInvoices = await db.Invoices
                    .AsNoTracking()
                    .Where(invoice => userIds.Contains(invoice.UserId)
                        && invoice.ClassId.HasValue
                        && (invoice.Status == PaymentStatus.Pending || invoice.Status == PaymentStatus.Completed)
                        && invoice.CreatedAt >= earliestBooking
                        && invoice.CreatedAt <= latestBooking)
                    .ToListAsync(cancellationToken);
            }

            var activeMemberships = subscriptions
                .Where(subscription => subscription.PaymentStatus == PaymentStatus.Completed)
                .Select(subscription => new
                {
                    subscription.UserId,
                    subscription.StartDate,
                    subscription.EndDate,
                    Package = DeserializeSnapshot(subscription),
                })
                .Where(subscription => subscription.Package.Category == "membership"
                    && !string.IsNullOrWhiteSpace(subscription.Package.Tier)
                    && subscription.Package.Tier != "basic")
                .ToLookup(subscription => subscription.UserId);

            foreach (var cb in classOrders)
            {
                var isPending = cb.Status.Trim().ToLowerInvariant() == "pending";
                var subtotal = cb.CourseSubtotal > 0 ? cb.CourseSubtotal : 150000m;
                decimal total;
                decimal discountAmount;
                decimal discountPct;

                if (cb.SubscriptionId.HasValue)
                {
                    // Đặt theo quyền lợi gói tập/gói môn đã sở hữu -> Chi phí đặt lớp = 0 đ (giảm 100%)
                    total = 0m;
                    discountAmount = subtotal;
                    discountPct = 100m;
                }
                else
                {
                    // Đặt theo vé lẻ ngoài gói: tìm hóa đơn thanh toán lớp học tương ứng (tạo gần thời điểm đặt và <= 150.000 đ)
                    var classInvoice = classInvoices
                        .Where(invoice => invoice.UserId == cb.UserId
                            && invoice.ClassId == cb.CourseId
                            && invoice.Status == (isPending ? PaymentStatus.Pending : PaymentStatus.Completed)
                            && invoice.CreatedAt >= cb.CreatedAt.AddMinutes(-10)
                            && invoice.CreatedAt <= cb.CreatedAt.AddMinutes(10))
                        .OrderByDescending(invoice => invoice.CreatedAt)
                        .FirstOrDefault();

                    if (classInvoice != null)
                    {
                        total = classInvoice.TotalAmount;
                    }
                    else
                    {
                        var activeMem = activeMemberships[cb.UserId]
                            .Where(subscription => subscription.StartDate <= cb.CreatedAt
                                && subscription.EndDate >= cb.CreatedAt)
                            .OrderByDescending(subscription => subscription.StartDate)
                            .Select(subscription => subscription.Package)
                            .FirstOrDefault();
                        var pct = activeMem?.GroupDiscountPct ?? 0;
                        total = Math.Max(0, subtotal - decimal.Round(subtotal * pct / 100m, 0, MidpointRounding.AwayFromZero));
                    }

                    discountAmount = Math.Max(0, subtotal - total);
                    discountPct = subtotal > 0 ? decimal.Round(discountAmount / subtotal * 100m, 0) : 0;
                }

                subOrders.Add(new PackageOrderResponse
                {
                    Id = cb.BookingId,
                    UserId = cb.UserId,
                    UserName = cb.UserName ?? "Hội viên",
                    UserEmail = cb.UserEmail ?? "",
                    UserPhone = cb.UserPhone ?? "",
                    PackageId = cb.CourseId.ToString(),
                    PackageSnapshot = new CatalogPackageDto
                    {
                        Id = cb.ClassId.ToString(),
                        Name = $"Lớp: {cb.CourseName ?? cb.ClassName}",
                        Category = "class",
                        Tier = cb.SubscriptionId.HasValue ? "Theo gói môn" : "Vé lớp học",
                        Description = cb.SubscriptionId.HasValue
                            ? $"Lịch học: {cb.ScheduleTime:HH:mm dd/MM/yyyy} • Quyền lợi gói tập"
                            : $"Lịch học: {cb.ScheduleTime:HH:mm dd/MM/yyyy} • Đặt chỗ vé lẻ",
                        Sport = "Lớp nhóm",
                        Format = "group",
                    },
                    DurationMonths = 1,
                    Subtotal = subtotal,
                    DiscountPct = discountPct,
                    DiscountAmount = discountAmount,
                    Total = total,
                    PaymentMethod = cb.SubscriptionId.HasValue ? "package" : "counter",
                    Status = isPending ? "pending" : "paid",
                    CreatedAt = cb.CreatedAt,
                    PaidAt = isPending ? null : cb.CreatedAt,
                    StartDate = cb.ScheduleTime,
                    EndDate = cb.ScheduleTime.AddHours(1),
                    CourseId = cb.CourseId,
                    CourseName = cb.CourseName,
                    CourseSessionCount = cb.CourseSessionCount,
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PackageCatalogService] Không thể tải đơn đặt lớp: {ex.Message}");
        }

        return subOrders.OrderByDescending(o => o.CreatedAt).ToArray();
    }

    private async Task ReconcileMembershipRenewalEndDateAsync(
        IReadOnlyCollection<Subscription> subscriptions,
        CancellationToken cancellationToken
    )
    {
        var today = DateTime.UtcNow.Date;
        var current = subscriptions
            .Where(subscription => subscription.PaymentStatus == PaymentStatus.Completed
                && subscription.StartDate.Date <= today
                && subscription.EndDate.Date >= today
                && subscription.PackageSnapshotJson != null)
            .Select(subscription => new
            {
                Subscription = subscription,
                Package = DeserializeSnapshot(subscription),
            })
            .Where(item => item.Package.Category == "membership"
                && !string.IsNullOrWhiteSpace(item.Package.Tier)
                && !string.Equals(item.Package.Tier, "basic", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(item => item.Subscription.StartDate)
            .FirstOrDefault();

        if (current == null) return;

        var effectiveEnd = current.Subscription.EndDate.Date;
        var sameTierPaid = subscriptions
            .Where(subscription => subscription.PaymentStatus == PaymentStatus.Completed
                && subscription.PackageSnapshotJson != null)
            .Select(subscription => new
            {
                Subscription = subscription,
                Package = DeserializeSnapshot(subscription),
            })
            .Where(item => item.Package.Category == "membership"
                && string.Equals(item.Package.Tier?.Trim(), current.Package.Tier?.Trim(), StringComparison.OrdinalIgnoreCase))
            .OrderBy(item => item.Subscription.StartDate)
            .ToList();

        var changed = false;
        foreach (var renewal in sameTierPaid)
        {
            var startDay = renewal.Subscription.StartDate.Date;
            if (startDay < current.Subscription.StartDate.Date || startDay > effectiveEnd.AddDays(1))
                continue;
            if (renewal.Subscription.EndDate.Date <= effectiveEnd)
                continue;

            effectiveEnd = renewal.Subscription.EndDate.Date;
            changed = true;
        }

        if (!changed || effectiveEnd <= current.Subscription.EndDate.Date) return;

        current.Subscription.EndDate = effectiveEnd;
        await db.SaveChangesAsync(cancellationToken);
    }
}

public class ClassBookingOrderRaw
{
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public Guid ClassId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public Guid CourseId { get; set; }
    public string? CourseName { get; set; }
    public int CourseSessionCount { get; set; }
    public decimal CourseSubtotal { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
}
