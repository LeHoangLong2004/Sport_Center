using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private static async Task<Guid?> ResolveCurrentMemberIdAsync(HttpContext context, SmartGymDbContext db)
        {
            var raw = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                   ?? context.User.FindFirstValue("sub")
                   ?? context.Request.Headers["X-User-Id"].FirstOrDefault()
                   ?? context.Request.Query["userId"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(raw) && Guid.TryParse(raw, out var parsedGuid))
            {
                return parsedGuid;
            }

            var email = context.User.FindFirstValue(ClaimTypes.Email)
                     ?? context.User.FindFirstValue("email")
                     ?? context.Request.Headers["X-User-Email"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(email))
            {
                var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
                if (user != null) return user.Id;
            }

            if (!string.IsNullOrWhiteSpace(raw))
            {
                var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.PhoneNumber == raw || u.MemberCode == raw);
                if (user != null) return user.Id;
            }

            return null;
        }

        private static void MapMemberSupportEndpoints(RouteGroupBuilder group)
        {
            // 5. GET & POST /api/member/support-tickets (Supabase DB)
            // Chỉ trả về các phiếu thuộc về chính hội viên đang đăng nhập
            group.MapGet("/support-tickets", async (HttpContext context, SmartGymDbContext db) =>
            {
                var memberGuid = await ResolveCurrentMemberIdAsync(context, db);

                if (!memberGuid.HasValue)
                {
                    // Nếu không xác định được hội viên, trả về danh sách rỗng (không lộ phiếu của người khác)
                    return Results.Ok(new List<SupportTicketModel>());
                }

                var query = @"
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
                    WHERE t.user_id = {0}
                    ORDER BY t.created_at DESC";

                var rows = await db.Database.SqlQueryRaw<SupportTicketDbRow>(query, memberGuid.Value).ToListAsync();

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

                return Results.Ok(list);
            })
            .WithTags("Member Portal")
            .WithSummary("Chỉ lấy danh sách phiếu hỗ trợ của chính hội viên hiện tại");

            group.MapPost("/support-tickets", async (HttpContext context, [FromBody] JsonElement body, SmartGymDbContext db) =>
            {
                var memberGuid = await ResolveCurrentMemberIdAsync(context, db);
                if (!memberGuid.HasValue)
                {
                    return Results.Unauthorized();
                }

                var category = body.TryGetProperty("category", out var c) ? c.GetString() : "Tư vấn dịch vụ & Gia hạn gói";
                var subject = body.TryGetProperty("subject", out var s) ? s.GetString() : "Yêu cầu từ hội viên";
                var content = body.TryGetProperty("content", out var ct) ? ct.GetString() : "";

                var newId = $"TCK-{Random.Shared.Next(100, 999)}";

                try
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO support_tickets (id, user_id, category, subject, content, status, created_at)
                        VALUES ({newId}, {memberGuid.Value}, {category ?? "Tư vấn dịch vụ & Gia hạn gói"}, {subject ?? "Yêu cầu từ hội viên"}, {content ?? ""}, 'open', now());
                    ");

                    var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == memberGuid.Value);

                    var newTicket = new SupportTicketModel
                    {
                        id = newId,
                        userId = memberGuid.Value.ToString(),
                        memberName = user?.FullName ?? "Hội viên",
                        memberPhone = user?.PhoneNumber ?? "",
                        category = category ?? "Tư vấn dịch vụ & Gia hạn gói",
                        subject = subject ?? "Yêu cầu từ hội viên",
                        content = content ?? "",
                        status = "open",
                        createdAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    };

                    return Results.Ok(new { message = "Đã gửi yêu cầu hỗ trợ thành công!", ticket = newTicket });
                }
                catch (Exception ex)
                {
                    return Results.Problem($"Lỗi lưu phiếu hỗ trợ vào CSDL: {ex.Message}");
                }
            })
            .WithTags("Member Portal")
            .WithSummary("Gửi phiếu hỗ trợ cho chính hội viên hiện tại (Supabase DB)");

            // 6. POST /api/member/ai-ask - Flow 6 AI Assistant (Gemini, shared API key with Flow 5)
            //    Implementation: MemberEndpoints.AiAssistant.cs
            MapMemberAiAssistantEndpoints(group);
        }
    }
}
