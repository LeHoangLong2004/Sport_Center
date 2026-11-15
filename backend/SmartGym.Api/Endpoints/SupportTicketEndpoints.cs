using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public class SupportTicketDbRow
{
    public string Id { get; set; } = "";
    public Guid? UserId { get; set; }
    public string MemberName { get; set; } = "";
    public string MemberPhone { get; set; } = "";
    public string Category { get; set; } = "";
    public string Subject { get; set; } = "";
    public string Content { get; set; } = "";
    public string Status { get; set; } = "open";
    public string? Reply { get; set; }
    public string? RepliedBy { get; set; }
    public DateTime? RepliedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SupportTicketModel
{
    public string id { get; set; } = "";
    public string? userId { get; set; } = "m-demo";
    public string memberName { get; set; } = "Lê Quang Vinh";
    public string memberPhone { get; set; } = "0987654321";
    public string category { get; set; } = "Tư vấn dịch vụ & Gia hạn gói";
    public string subject { get; set; } = "";
    public string content { get; set; } = "";
    public string status { get; set; } = "open"; // "open" | "resolved"
    public string createdAt { get; set; } = "";
    public string? reply { get; set; }
    public string? repliedAt { get; set; }
    public string? repliedBy { get; set; }
}

public static class SupportTicketEndpoints
{
    public static void MapSupportTicketEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Receptionist Support Endpoints ──
        var recGroup = app.MapGroup("/api/receptionist/support-tickets");

        recGroup.MapGet("", async (SmartGymDbContext db) =>
        {
            try
            {
                var rows = await db.Database.SqlQueryRaw<SupportTicketDbRow>(@"
                    SELECT 
                        t.id AS ""Id"",
                        t.user_id AS ""UserId"",
                        COALESCE(u.full_name, 'Hội viên') AS ""MemberName"",
                        COALESCE(u.phone_number, 'Chưa có SĐT') AS ""MemberPhone"",
                        t.category AS ""Category"",
                        t.subject AS ""Subject"",
                        t.content AS ""Content"",
                        t.status AS ""Status"",
                        t.reply AS ""Reply"",
                        t.replied_by AS ""RepliedBy"",
                        t.replied_at AS ""RepliedAt"",
                        t.created_at AS ""CreatedAt""
                    FROM support_tickets t
                    LEFT JOIN users u ON t.user_id = u.id
                    ORDER BY t.created_at DESC
                ").ToListAsync();

                var list = rows.Select(r => new SupportTicketModel
                {
                    id = r.Id,
                    userId = r.UserId?.ToString(),
                    memberName = r.MemberName,
                    memberPhone = r.MemberPhone,
                    category = r.Category,
                    subject = r.Subject,
                    content = r.Content,
                    status = r.Status,
                    reply = r.Reply,
                    repliedBy = r.RepliedBy,
                    repliedAt = r.RepliedAt.HasValue ? r.RepliedAt.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss") : null,
                    createdAt = r.CreatedAt.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss")
                }).ToList();

                return Results.Ok(new
                {
                    total = list.Count,
                    openCount = list.Count(t => t.status == "open"),
                    resolvedCount = list.Count(t => t.status == "resolved"),
                    tickets = list
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SupportTicket] DB query error: {ex.Message}");
                return Results.Ok(new { total = 0, openCount = 0, resolvedCount = 0, tickets = new List<SupportTicketModel>() });
            }
        })
        .WithTags("Receptionist Portal")
        .WithSummary("Danh sách toàn bộ phiếu hỗ trợ từ hội viên (Supabase DB)");

        recGroup.MapPost("/{id}/reply", async (string id, [FromBody] JsonElement body, SmartGymDbContext db) =>
        {
            var replyText = body.TryGetProperty("reply", out var r) ? r.GetString() : "";
            var staffName = body.TryGetProperty("repliedBy", out var s) ? s.GetString() : "Nguyễn Văn Lễ Tân";

            if (string.IsNullOrWhiteSpace(replyText))
            {
                return Results.BadRequest(new { message = "Vui lòng nhập nội dung phản hồi cho hội viên." });
            }

            try
            {
                var affected = await db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE support_tickets
                    SET reply = {replyText.Trim()},
                        replied_by = {staffName ?? "Nguyễn Văn Lễ Tân"},
                        replied_at = now(),
                        status = 'resolved'
                    WHERE id = {id};
                ");

                if (affected == 0)
                {
                    return Results.NotFound(new { message = "Không tìm thấy mã phiếu hỗ trợ này trong CSDL." });
                }

                var updatedRow = await db.Database.SqlQueryRaw<SupportTicketDbRow>(@"
                    SELECT 
                        t.id AS ""Id"",
                        t.user_id AS ""UserId"",
                        COALESCE(u.full_name, 'Hội viên') AS ""MemberName"",
                        COALESCE(u.phone_number, 'Chưa có SĐT') AS ""MemberPhone"",
                        t.category AS ""Category"",
                        t.subject AS ""Subject"",
                        t.content AS ""Content"",
                        t.status AS ""Status"",
                        t.reply AS ""Reply"",
                        t.replied_by AS ""RepliedBy"",
                        t.replied_at AS ""RepliedAt"",
                        t.created_at AS ""CreatedAt""
                    FROM support_tickets t
                    LEFT JOIN users u ON t.user_id = u.id
                    WHERE t.id = {0}
                ", id).FirstOrDefaultAsync();

                var ticketDto = updatedRow != null ? new SupportTicketModel
                {
                    id = updatedRow.Id,
                    userId = updatedRow.UserId?.ToString(),
                    memberName = updatedRow.MemberName,
                    memberPhone = updatedRow.MemberPhone,
                    category = updatedRow.Category,
                    subject = updatedRow.Subject,
                    content = updatedRow.Content,
                    status = updatedRow.Status,
                    reply = updatedRow.Reply,
                    repliedBy = updatedRow.RepliedBy,
                    repliedAt = updatedRow.RepliedAt.HasValue ? updatedRow.RepliedAt.Value.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss") : null,
                    createdAt = updatedRow.CreatedAt.ToLocalTime().ToString("yyyy-MM-dd HH:mm:ss")
                } : null;

                return Results.Ok(new
                {
                    success = true,
                    message = "Đã phản hồi và xử lý phiếu thành công!",
                    ticket = ticketDto
                });
            }
            catch (Exception ex)
            {
                return Results.Problem($"Lỗi cập nhật CSDL: {ex.Message}");
            }
        })
        .WithTags("Receptionist Portal")
        .WithSummary("Lễ tân phản hồi và giải quyết phiếu hỗ trợ (Supabase DB)");
    }
}
