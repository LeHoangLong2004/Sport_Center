using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Notifications dành cho các vai trò vận hành trung tâm và Coach.
/// Dữ liệu cố định đọc từ bảng notifications; các cảnh báo vận hành được
/// tổng hợp từ dữ liệu hiện tại để Manager vẫn nhìn thấy việc cần xử lý.
/// </summary>
public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/notifications")
            .WithTags("Notifications")
            .RequireAuthorization();

        group.MapGet("", GetNotificationsAsync);

        group.MapPost("/{notificationId:guid}/read", MarkAsReadAsync);

        group.MapPost("/read-all", MarkAllAsReadAsync);
    }

    private static bool IsStaffRole(ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role)
            ?? user.FindFirstValue("role");
        return role is not null && (
            role.Equals("manager", StringComparison.OrdinalIgnoreCase)
            || role.Equals("admin", StringComparison.OrdinalIgnoreCase)
            || role.Equals("center_manager", StringComparison.OrdinalIgnoreCase)
            || role.Equals("centermanager", StringComparison.OrdinalIgnoreCase)
            || role.Equals("CenterManager", StringComparison.OrdinalIgnoreCase)
            || role.Equals("receptionist", StringComparison.OrdinalIgnoreCase)
            || role.Equals("coach", StringComparison.OrdinalIgnoreCase)
            || role.Equals("staff", StringComparison.OrdinalIgnoreCase));
    }

    private static async Task<IResult> GetNotificationsAsync(
        SmartGymDbContext db,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(context);
        if (userId is null)
            return Results.Unauthorized();

        var notifications = new List<NotificationResponse>();

        // notifications là bảng dùng chung cho member/coach/manager. Nếu môi
        // trường cũ chưa có bảng này, các cảnh báo vận hành bên dưới vẫn hoạt động.
        try
        {
            var rows = await db.Database.SqlQueryRaw<NotificationRow>(
                    """
                    SELECT id AS "Id", title AS "Title", message AS "Message",
                           type AS "Type", target_type AS "TargetType", target_id AS "TargetId",
                           is_read AS "IsRead", created_at AS "CreatedAt"
                    FROM notifications
                    WHERE user_id = {0}
                    ORDER BY created_at DESC
                    LIMIT 20
                    """,
                    userId.Value)
                .ToListAsync(cancellationToken);

            notifications.AddRange(rows.Select(row => new NotificationResponse(
                row.Id.ToString(),
                row.Title,
                row.Message,
                row.Type ?? "general",
                row.IsRead,
                row.CreatedAt,
                row.TargetType,
                row.TargetId?.ToString())));
        }
        catch
        {
            // Không làm hỏng TopBar nếu database cũ chưa chạy migration notifications.
        }

        // Cảnh báo hóa đơn pending chỉ dành cho nhóm vận hành, không hiển thị cho Coach.
        var role = context.User.FindFirstValue(ClaimTypes.Role)
            ?? context.User.FindFirstValue("role");
        var isCoach = role?.Equals("coach", StringComparison.OrdinalIgnoreCase) == true;
        if (!isCoach && IsStaffRole(context.User))
        {
            try
            {
                var pendingInvoices = await db.Database.SqlQueryRaw<CountRow>(
                        """
                        SELECT COUNT(*)::int AS "Value"
                        FROM invoices
                        WHERE payment_status = 'pending'
                        """)
                    .Select(row => row.Value)
                    .FirstOrDefaultAsync(cancellationToken);

                if (pendingInvoices > 0)
                {
                    notifications.Add(new NotificationResponse(
                        "derived-pending-invoices",
                        "Có giao dịch đang chờ xử lý",
                        $"Hiện có {pendingInvoices} hóa đơn chưa hoàn tất thanh toán hoặc đối soát.",
                        "payment",
                        false,
                        DateTime.UtcNow,
                        "payment"));
                }
            }
            catch
            {
                // Giữ API usable trong lúc schema invoices chưa đồng bộ.
            }
        }

        return Results.Ok(notifications
            .OrderByDescending(notification => notification.CreatedAt)
            .Take(20));
    }

    private static async Task<IResult> MarkAsReadAsync(
        Guid notificationId,
        SmartGymDbContext db,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(context);
        if (userId is null)
            return Results.Unauthorized();

        await db.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE notifications SET is_read = TRUE WHERE id = {notificationId} AND user_id = {userId.Value}",
            cancellationToken);

        return Results.Ok(new { success = true });
    }

    private static async Task<IResult> MarkAllAsReadAsync(
        SmartGymDbContext db,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId(context);
        if (userId is null)
            return Results.Unauthorized();

        await db.Database.ExecuteSqlInterpolatedAsync(
            $"UPDATE notifications SET is_read = TRUE WHERE user_id = {userId.Value} AND is_read = FALSE",
            cancellationToken);

        return Results.Ok(new { success = true });
    }

    private static Guid? GetUserId(HttpContext context)
    {
        var rawUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId) ? userId : null;
    }

    private sealed class NotificationRow
    {
        public Guid Id { get; init; }
        public string Title { get; init; } = string.Empty;
        public string? Message { get; init; }
        public string? Type { get; init; }
        public string? TargetType { get; init; }
        public Guid? TargetId { get; init; }
        public bool IsRead { get; init; }
        public DateTime CreatedAt { get; init; }
    }

    private sealed class CountRow
    {
        public int Value { get; init; }
    }

    private sealed record NotificationResponse(
        string Id,
        string Title,
        string? Message,
        string Type,
        bool IsRead,
        DateTime CreatedAt,
        string? TargetType = null,
        string? TargetId = null);
}
