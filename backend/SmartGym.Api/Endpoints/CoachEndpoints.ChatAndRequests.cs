using System;
using System.Collections.Generic;
using System.Linq;
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

        private static readonly List<object> _mockRequests = new()
        {
            new {
                id = "req-1",
                sessionId = "s5",
                className = "Yoga Phục Hồi",
                requestType = "dạy thay",
                substituteCoachName = "HLV Trần Minh Tuấn",
                reason = "Bận việc gia đình đột xuất",
                status = "đã duyệt",
                createdAt = DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd HH:mm"),
                managerNote = "Đã phân công lại cho HLV Tuấn"
            },
            new {
                id = "req-2",
                sessionId = "s4",
                className = "Boxing Cơ Bản",
                requestType = "dời lịch",
                newDate = DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"),
                newTime = "08:00 - 09:30",
                reason = "Phòng võ đài bảo trì thiết bị",
                status = "chờ duyệt",
                createdAt = DateTime.Now.AddHours(-4).ToString("yyyy-MM-dd HH:mm"),
                managerNote = ""
            }
        };

        private static readonly List<object> _mockSlots = new()
        {
            new { id = "slot-1", dayOfWeek = 1, period = "Sáng", startTime = "07:00", endTime = "08:30", isOpen = true, bookedMemberName = "Nguyễn Văn An", bookedMemberPhone = "0912345678", goal = "Tăng cơ giảm mỡ" },
            new { id = "slot-2", dayOfWeek = 1, period = "Chiều", startTime = "15:00", endTime = "16:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
            new { id = "slot-3", dayOfWeek = 2, period = "Sáng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "Lê Thu Hà", bookedMemberPhone = "0987654321", goal = "Cải thiện vóc dáng" },
            new { id = "slot-4", dayOfWeek = 3, period = "Tối", startTime = "18:00", endTime = "19:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
            new { id = "slot-5", dayOfWeek = 4, period = "Chiều", startTime = "14:30", endTime = "16:00", isOpen = false, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
            new { id = "slot-6", dayOfWeek = 5, period = "Sáng", startTime = "07:30", endTime = "09:00", isOpen = true, bookedMemberName = "Phạm Tuấn Kiệt", bookedMemberPhone = "0903332211", goal = "Sức bền tim mạch" },
            new { id = "slot-7", dayOfWeek = 6, period = "Sáng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
        };

        private static void MapInteractiveCoachFeatures(RouteGroupBuilder group)
        {
            // 1. Schedule Requests (Đổi lịch / Dạy thay / Báo vắng)
            group.MapGet("/schedule-requests", () => Results.Ok(_mockRequests));

            group.MapPost("/schedule-requests", ([FromBody] System.Text.Json.JsonElement req) =>
            {
                var newReq = new
                {
                    id = "req-" + Guid.NewGuid().ToString().Substring(0, 8),
                    sessionId = req.TryGetProperty("sessionId", out var sId) ? sId.GetString() : "",
                    className = req.TryGetProperty("className", out var cN) ? cN.GetString() : "Lớp học",
                    requestType = req.TryGetProperty("requestType", out var rT) ? rT.GetString() : "dời lịch",
                    substituteCoachName = req.TryGetProperty("substituteCoachName", out var sC) ? sC.GetString() : "",
                    newDate = req.TryGetProperty("newDate", out var nD) ? nD.GetString() : "",
                    newTime = req.TryGetProperty("newTime", out var nT) ? nT.GetString() : "",
                    reason = req.TryGetProperty("reason", out var rS) ? rS.GetString() : "",
                    status = "chờ duyệt",
                    createdAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                    managerNote = ""
                };
                _mockRequests.Insert(0, newReq);
                return Results.Ok(new { success = true, data = newReq });
            });

            // 2. PT 1-1 Availability Slots
            group.MapGet("/availability", () => Results.Ok(_mockSlots));

            group.MapPost("/availability/toggle/{slotId}", (string slotId) =>
            {
                return Results.Ok(new { success = true, message = "Đã cập nhật trạng thái slot!" });
            });

            // 3. Coach Chat Conversations (Persistent via ChatStoreService)
            group.MapGet("/chat/conversations", (ChatStoreService chatStore, string? coachId) => 
                Results.Ok(chatStore.GetConversationsForCoach(coachId)));

            group.MapGet("/{coachId}/chat/conversations", (ChatStoreService chatStore, string coachId) => 
                Results.Ok(chatStore.GetConversationsForCoach(coachId)));

            // 4. Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (ChatStoreService chatStore, string conversationId) =>
            {
                var messages = chatStore.GetMessages(conversationId);
                if (messages == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(messages);
            });

            // 5. Coach Chat Send Message
            group.MapPost("/chat/messages", (ChatStoreService chatStore, [FromBody] SendCoachChatMessageRequest req) =>
            {
                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var newMsg = chatStore.AddMessage(req.ConversationId, req.Text, "coach", req.CoachName);
                if (newMsg == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                return Results.Ok(new { success = true, data = newMsg });
            });
        }
    }
}
