using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Api.Services;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        public record SendCoachChatMessageRequest(string ConversationId, string Text, string? CoachId, string? CoachName = null);
        public record StartCoachMemberConversationRequest(string MemberId);

        private static void MapCoachChatEndpoints(RouteGroupBuilder group)
        {
            // Coach Chat Conversations (Persistent via ChatStoreService)
            group.MapGet("/chat/conversations", (ChatStoreService chatStore, HttpContext context) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                return coachUserId == null ? Results.Unauthorized() : Results.Ok(chatStore.GetConversationsForCoach(coachUserId));
            });

            group.MapPost("/chat/conversations/start", (ChatStoreService chatStore, HttpContext context, [FromBody] StartCoachMemberConversationRequest req) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();
                if (string.IsNullOrWhiteSpace(req.MemberId))
                    return Results.BadRequest(new { message = "Thiếu học viên cần nhắn tin" });

                var conversation = chatStore.StartOrGetCoachMemberConversation(req.MemberId, coachUserId);
                return conversation == null
                    ? Results.NotFound(new { message = "Học viên không thuộc danh sách phụ trách của bạn" })
                    : Results.Ok(new { success = true, conversation });
            });

            group.MapGet("/{coachId}/chat/conversations", (ChatStoreService chatStore, HttpContext context, string coachId) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                return coachUserId == null ? Results.Unauthorized() : Results.Ok(chatStore.GetConversationsForCoach(coachUserId));
            });

            // Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (ChatStoreService chatStore, HttpContext context, string conversationId) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();

                var messages = chatStore.GetMessagesForCoach(conversationId, coachUserId);
                if (messages == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(messages);
            });

            // Coach Chat Send Message
            group.MapPost("/chat/messages", (ChatStoreService chatStore, HttpContext context, [FromBody] SendCoachChatMessageRequest req) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();

                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var newMsg = chatStore.AddMessage(req.ConversationId, req.Text, "coach", req.CoachName, coachUserId);
                if (newMsg == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                return Results.Ok(new { success = true, data = newMsg });
            });
        }

        private static string? GetAuthenticatedCoachUserId(HttpContext context) =>
            context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;
    }
}
