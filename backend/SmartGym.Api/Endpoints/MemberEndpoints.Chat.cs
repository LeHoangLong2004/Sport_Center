using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
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
            public string? InitialMessage { get; set; }
        }

        private static void MapMemberChatEndpoints(RouteGroupBuilder group)
        {
            // Directory data is loaded from the database. The member portal must
            // not expose a hardcoded list of staff, members, or classes.
            group.MapGet("/chat/directory", async (
                HttpContext context,
                IUserRepository userRepository,
                ClassService classService) =>
            {
                if (GetUserId(context) == null) return Results.Unauthorized();

                var users = (await userRepository.GetAllUsersAsync())
                    .Where(user => user.Status)
                    .ToList();

                var managers = users
                    .Where(user => IsRole(user.Role?.Name, "manager", "admin", "center_manager", "center manager", "centermanager", "receptionist", "reception", "staff"))
                    .Select(user => new
                    {
                        id = user.Id.ToString(),
                        name = user.FullName,
                        role = IsRole(user.Role?.Name, "receptionist", "reception", "staff") ? "reception" : "manager",
                        roleTag = IsRole(user.Role?.Name, "receptionist", "reception", "staff") ? "LỄ TÂN" : "QUẢN LÝ",
                        subtitle = user.Role?.Name ?? "Nhân sự SportCenter",
                        avatar = user.AvatarUrl
                    })
                    .ToList();

                var members = users
                    .Where(user => IsRole(user.Role?.Name, "member", "user"))
                    .Where(user => user.Id.ToString() != GetUserId(context))
                    .Select(user => new
                    {
                        id = user.Id.ToString(),
                        name = user.FullName,
                        role = "member",
                        roleTag = "HỘI VIÊN",
                        subtitle = "Hội viên SportCenter",
                        avatar = user.AvatarUrl
                    })
                    .ToList();

                var classes = (await classService.GetAvailableClassesAsync())
                    .Where(item => item.Status && !string.Equals(item.ApprovalStatus, "rejected", StringComparison.OrdinalIgnoreCase))
                    .Select(item => new
                    {
                        id = item.Id.ToString(),
                        name = item.ClassName,
                        role = "class",
                        roleTag = "NHÓM LỚP",
                        subtitle = $"{item.SportName} · {item.CoachName ?? "Chưa phân công HLV"} · {item.FacilityName}",
                        avatar = item.CoachAvatar
                    })
                    .ToList();

                return Results.Ok(new { managers, members, classes });
            })
            .WithTags("Member Portal")
            .WithSummary("Get chat directory from database");

            // 7. GET /api/member/chat/conversations
            group.MapGet("/chat/conversations", (ChatStoreService chatStore, HttpContext context, string? memberId) =>
            {
                var authenticatedMemberId = GetUserId(context);
                return authenticatedMemberId == null
                    ? Results.Unauthorized()
                    : Results.Ok(chatStore.GetConversationsForMember(authenticatedMemberId));
            })
            .WithTags("Member Portal")
            .WithSummary("Get chat conversations for member with their coaches and classes");

            // 8. GET /api/member/chat/messages/{conversationId}
            group.MapGet("/chat/messages/{conversationId}", (ChatStoreService chatStore, HttpContext context, string conversationId) =>
            {
                var memberId = GetUserId(context);
                if (memberId == null) return Results.Unauthorized();

                var messages = chatStore.GetMessagesForMember(conversationId, memberId);
                if (messages == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(messages);
            })
            .WithTags("Member Portal")
            .WithSummary("Get chat messages in a conversation for member");

            // 9. POST /api/member/chat/messages
            group.MapPost("/chat/messages", (ChatStoreService chatStore, HttpContext context, [FromBody] SendMemberChatMessageRequest req) =>
            {
                var memberId = GetUserId(context);
                if (memberId == null) return Results.Unauthorized();

                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var newMsg = chatStore.AddMessage(req.ConversationId, req.Text, "member", req.MemberName, memberId);
                if (newMsg == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                return Results.Ok(new { success = true, data = newMsg });
            })
            .WithTags("Member Portal")
            .WithSummary("Send chat message from member to coach");

            // 10. POST /api/member/chat/start
            group.MapPost("/chat/start", (ChatStoreService chatStore, HttpContext context, [FromBody] StartChatRequest req) =>
            {
                var authenticatedMemberId = GetUserId(context);
                if (authenticatedMemberId == null) return Results.Unauthorized();
                var memberName = req.MemberName ?? "Hội viên";
                var memberId = authenticatedMemberId;
                var targetId = req.TargetId ?? req.CoachId;
                var targetName = req.TargetName ?? req.CoachName;
                var role = req.Role ?? "coach";
                if (string.IsNullOrWhiteSpace(targetId) || string.IsNullOrWhiteSpace(targetName))
                    return Results.BadRequest(new { message = "Thiếu người nhận cuộc trò chuyện" });

                var conv = chatStore.StartOrGetConversation(
                    targetId,
                    targetName,
                    role,
                    memberId,
                    memberName,
                    req.Avatar,
                    req.Subtitle,
                    req.InitialMessage
                );
                return conv == null
                    ? Results.BadRequest(new { message = "Không thể tạo cuộc trò chuyện" })
                    : Results.Ok(new { success = true, conversation = conv });
            })
            .WithTags("Member Portal")
            .WithSummary("Start direct chat with a coach, member, or staff");
        }

        private static bool IsRole(string? role, params string[] acceptedRoles) =>
            !string.IsNullOrWhiteSpace(role) && acceptedRoles.Any(accepted =>
                string.Equals(role, accepted, StringComparison.OrdinalIgnoreCase));
    }
}
