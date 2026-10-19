using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs;
using SmartGym.Domain.Entities;
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
                        Tier = "Vé lớp học",
                        Description = $"Lịch học: {cb.ScheduleTime:HH:mm dd/MM/yyyy} • Đặt chỗ tại quầy",
                        Sport = "Lớp nhóm",
                        Format = "group",
                    },
                    DurationMonths = 1,
                    Subtotal = 150000m,
                    DiscountPct = 0,
                    DiscountAmount = 0,
                    Total = 150000m,
                    PaymentMethod = "counter",
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
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
}
