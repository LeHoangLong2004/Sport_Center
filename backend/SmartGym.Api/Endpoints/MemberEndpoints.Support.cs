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
                var list = SupportTicketStore.GetAll();
                return Results.Ok(list);
            })
            .WithTags("Member Portal")
            .WithSummary("Get member support tickets");

            group.MapPost("/support-tickets", (HttpContext context, [FromBody] JsonElement body) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var category = body.TryGetProperty("category", out var c) ? c.GetString() : "Tư vấn dịch vụ & Gia hạn gói";
                var subject = body.TryGetProperty("subject", out var s) ? s.GetString() : "Yêu cầu từ hội viên";
                var content = body.TryGetProperty("content", out var ct) ? ct.GetString() : "";

                var newTicket = new SupportTicketModel
                {
                    id = $"TCK-{Random.Shared.Next(100, 999)}",
                    userId = userId,
                    memberName = "Lê Quang Vinh",
                    memberPhone = "0987654321",
                    category = category ?? "Tư vấn dịch vụ & Gia hạn gói",
                    subject = subject ?? "Yêu cầu từ hội viên",
                    content = content ?? "",
                    status = "open",
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };

                SupportTicketStore.Add(newTicket);
                return Results.Ok(new { message = "Đã gửi yêu cầu hỗ trợ thành công!", ticket = newTicket });
            })
            .WithTags("Member Portal")
            .WithSummary("Create new support ticket");

            // 6. POST /api/member/ai-ask - Flow 6 AI Assistant (Gemini, shared API key with Flow 5)
            //    Implementation: MemberEndpoints.AiAssistant.cs
            MapMemberAiAssistantEndpoints(group);
        }
    }
}
