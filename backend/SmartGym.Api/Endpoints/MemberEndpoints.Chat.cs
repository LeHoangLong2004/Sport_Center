using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Api.Services;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        public class SendMemberChatMessageRequest
        {
            public string ConversationId { get; set; } = "";
            public string Text { get; set; } = "";
            public string? MemberId { get; set; }
            public string? MemberName { get; set; }
        }

        public class StartChatRequest
        {
            public string? CoachId { get; set; }
            public string? CoachName { get; set; }
            public string? TargetId { get; set; }
            public string? TargetName { get; set; }
            public string? Role { get; set; }
            public string? MemberId { get; set; }
            public string? MemberName { get; set; }
            public string? Avatar { get; set; }
            public string? Subtitle { get; set; }
        }

        private static void MapMemberChatEndpoints(RouteGroupBuilder group)
        {
            // 7. GET /api/member/chat/conversations
            group.MapGet("/chat/conversations", (ChatStoreService chatStore, HttpContext context, string? memberId) =>
            {
                var effectiveMemberId = memberId ?? GetUserId(context) ?? "m-lananh";
                return Results.Ok(chatStore.GetConversationsForMember(effectiveMemberId));
            })
            .WithTags("Member Portal")
            .WithSummary("Get chat conversations for member with their coaches and classes");

            // 8. GET /api/member/chat/messages/{conversationId}
            group.MapGet("/chat/messages/{conversationId}", (ChatStoreService chatStore, string conversationId) =>
            {
                var messages = chatStore.GetMessages(conversationId);
                if (messages == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(messages);
            })
            .WithTags("Member Portal")
            .WithSummary("Get chat messages in a conversation for member");

            // 9. POST /api/member/chat/messages
            group.MapPost("/chat/messages", (ChatStoreService chatStore, [FromBody] SendMemberChatMessageRequest req) =>
            {
                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var newMsg = chatStore.AddMessage(req.ConversationId, req.Text, "member", req.MemberName);
                if (newMsg == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                return Results.Ok(new { success = true, data = newMsg });
            })
            .WithTags("Member Portal")
            .WithSummary("Send chat message from member to coach");

            // 10. POST /api/member/chat/start
            group.MapPost("/chat/start", (ChatStoreService chatStore, [FromBody] StartChatRequest req) =>
            {
                var memberName = !string.IsNullOrWhiteSpace(req.MemberName) ? req.MemberName : "Hồ Xuân Ánh Nam";
                var memberId = !string.IsNullOrWhiteSpace(req.MemberId) ? req.MemberId : "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
                var targetId = req.TargetId ?? req.CoachId ?? "target-01";
                var targetName = req.TargetName ?? req.CoachName ?? "HLV";
                var role = req.Role ?? "coach";

                var conv = chatStore.StartOrGetConversation(
                    targetId,
                    targetName,
                    role,
                    memberId,
                    memberName,
                    req.Avatar,
                    req.Subtitle
                );
                return Results.Ok(new { success = true, conversation = conv });
            })
            .WithTags("Member Portal")
            .WithSummary("Start direct chat with a coach, member, or staff");
        }
    }
}
