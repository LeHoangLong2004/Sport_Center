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
            .Subscriptions.AsNoTracking()
            .Include(subscription => subscription.User)
            .Include(subscription => subscription.Package);
        if (memberId.HasValue)
            query = query.Where(subscription => subscription.UserId == memberId.Value);

        var subscriptions = await query
            .OrderByDescending(subscription => subscription.CreatedAt)
            .ToListAsync(cancellationToken);
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
                       COALESCE(u.full_name, 'Hội viên') AS "UserName",
                       COALESCE(u.email, '') AS "UserEmail",
                       COALESCE(u.phone_number, '') AS "UserPhone"
                FROM class_bookings cb
                JOIN classes c ON c.id = cb.class_id
                JOIN users u ON u.id = cb.user_id
                WHERE LOWER(cb.status) IN ('pending', 'confirmed', 'approved')
                """;
            if (memberId.HasValue)
            {
                sql += $" AND cb.user_id = '{memberId.Value}'";
            }
            var classOrders = await db.Database.SqlQueryRaw<ClassBookingOrderRaw>(sql).ToListAsync(cancellationToken);
            foreach (var cb in classOrders)
            {
                var isPending = cb.Status.Trim().ToLowerInvariant() == "pending";
                var subtotal = 150000m;
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
                    var classInvoice = await db.Invoices
                        .AsNoTracking()
                        .Where(i => i.UserId == cb.UserId
                                 && i.Status == (isPending ? PaymentStatus.Pending : PaymentStatus.Completed)
                                 && i.TotalAmount <= 150000m
                                 && i.CreatedAt >= cb.CreatedAt.AddMinutes(-10)
                                 && i.CreatedAt <= cb.CreatedAt.AddMinutes(10))
                        .OrderByDescending(i => i.CreatedAt)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (classInvoice != null && classInvoice.TotalAmount > 0)
                    {
                        total = classInvoice.TotalAmount;
                    }
                    else
                    {
                        var activeMem = await GetActiveMembershipAsync(cb.UserId, cb.CreatedAt, cancellationToken);
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
                    PackageId = cb.ClassId.ToString(),
                    PackageSnapshot = new CatalogPackageDto
                    {
                        Id = cb.ClassId.ToString(),
                        Name = $"Lớp: {cb.ClassName}",
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
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PackageCatalogService] Không thể tải đơn đặt lớp: {ex.Message}");
        }

        return subOrders.OrderByDescending(o => o.CreatedAt).ToArray();
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
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
}
