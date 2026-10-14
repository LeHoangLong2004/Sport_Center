using System;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private static void MapMemberSupportEndpoints(RouteGroupBuilder group)
        {
            // 5. GET & POST /api/member/support-tickets
            group.MapGet("/support-tickets", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var tickets = _memberSupportTickets.GetOrAdd(userId, _ => GetDefaultTickets());
                return Results.Ok(tickets);
            })
            .WithTags("Member Portal")
            .WithSummary("Get member support tickets");

            group.MapPost("/support-tickets", (HttpContext context, [FromBody] JsonElement body) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var tickets = _memberSupportTickets.GetOrAdd(userId, _ => GetDefaultTickets());

                var newTicket = new
                {
                    id = $"TCK-{Random.Shared.Next(100, 999)}",
                    category = body.TryGetProperty("category", out var c) ? c.GetString() : "Tư vấn dịch vụ",
                    subject = body.TryGetProperty("subject", out var s) ? s.GetString() : "Yêu cầu từ hội viên",
                    content = body.TryGetProperty("content", out var ct) ? ct.GetString() : "",
                    status = "open",
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    reply = (string?)null,
                    repliedAt = (string?)null,
                    repliedBy = (string?)null
                };

                tickets.Insert(0, newTicket);
                return Results.Ok(new { message = "Đã gửi yêu cầu hỗ trợ thành công!", ticket = newTicket });
            })
            .WithTags("Member Portal")
            .WithSummary("Create new support ticket");

            // 6. POST /api/member/ai-ask - Intelligent AI Assistant endpoint
            group.MapPost("/ai-ask", ([FromBody] JsonElement body) =>
            {
                var query = body.TryGetProperty("query", out var q) ? q.GetString()?.ToLower() ?? "" : "";
                string answer;

                if (query.Contains("lịch") || query.Contains("buổi") || query.Contains("ngày mai") || query.Contains("hôm nay"))
                {
                    answer = "📅 Bạn có ca tập gần nhất là lớp **Yoga Cân Bằng Cột Sống** vào ngày mai lúc 07:00 tại Studio 2 với HLV Minh Tuấn, và ca **Kèm 1-1 PT Gym** vào 08:30.";
                }
                else if (query.Contains("gói") || query.Contains("hạn") || query.Contains("hạn dùng"))
                {
                    answer = "💳 Bạn đang có 2 gói còn hiệu lực:\n1. **Gói Yoga Chuyên Sâu 3 Tháng** (Hạn đến 30/11/2026, còn 49 ngày).\n2. **Gói Gym & Thể Lực 1 Tháng** (Hạn đến 31/10/2026, còn 19 ngày).";
                }
                else if (query.Contains("thực đơn") || query.Contains("đạm") || query.Contains("dinh dưỡng") || query.Contains("ăn"))
                {
                    answer = "🥗 Gợi ý thực đơn tăng cơ giảm mỡ chuẩn SportCenter:\n• Sáng: 2 trứng ốp la + 1 lát bánh mì nguyên cám + 1 cốc sữa hạt.\n• Trưa: 150g ức gà hoặc phi lê bò + cơm gạo lứt + rau luộc.\n• Trước tập: 1 quả chuối tiêu hoặc 1 muỗng Whey Protein.\n• Tối: 150g cá hồi áp chảo + đĩa salad sốt chanh leo.";
                }
                else if (query.Contains("đau") || query.Contains("mỏi") || query.Contains("chân") || query.Contains("giãn"))
                {
                    answer = "💪 Khắc phục mỏi cơ bắp sau ngày tập nặng:\n1. Thực hiện giãn cơ tĩnh 10-15 phút sau buổi tập.\n2. Lăn ống Foam Roller vùng đùi và bắp chân.\n3. Uống đủ 2 - 2.5 lít nước, bổ sung điện giải và ngủ đủ 7-8 tiếng.";
                }
                else
                {
                    answer = "SportCenter AI Assistant đã ghi nhận câu hỏi của bạn. Hệ thống khuyên bạn nên duy trì tập luyện đều đặn 3 buổi/tuần và có thể gửi ticket hỗ trợ nếu cần sự can thiệp từ ban quản lý hoặc HLV!";
                }

                return Results.Ok(new { answer, timestamp = DateTime.UtcNow.ToString("HH:mm") });
            })
            .WithTags("Member Portal")
            .WithSummary("AI assistant chat consultation for member");
        }
    }
}
