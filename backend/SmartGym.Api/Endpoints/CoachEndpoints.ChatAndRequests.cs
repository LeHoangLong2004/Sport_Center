using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        public record SendCoachChatMessageRequest(string ConversationId, string Text, string? CoachId);

        public class CoachChatMessage
        {
            public string Id { get; set; } = "";
            public string Sender { get; set; } = "coach";
            public string Text { get; set; } = "";
            public string Timestamp { get; set; } = "";
        }

        public class CoachChatConversation
        {
            public string Id { get; set; } = "";
            public string Type { get; set; } = "direct";
            public string Title { get; set; } = "";
            public string Subtitle { get; set; } = "";
            public string Avatar { get; set; } = "";
            public string LastMessage { get; set; } = "";
            public string LastTime { get; set; } = "";
            public int UnreadCount { get; set; }
            public bool Online { get; set; }
            public List<CoachChatMessage> Messages { get; set; } = new();
        }

        private static readonly List<CoachChatConversation> _chatConversations = new()
        {
            new CoachChatConversation
            {
                Id = "conv-1",
                Type = "direct",
                Title = "Nguyễn Văn An",
                Subtitle = "Học viên PT 1-1 (Mục tiêu: Tăng cơ)",
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!",
                LastTime = "14:20",
                UnreadCount = 1,
                Online = true,
                Messages = new List<CoachChatMessage>
                {
                    new() { Id = "m1", Sender = "coach", Text = "Chào An, tuần này em cảm thấy cơ bắp phục hồi thế nào rồi?", Timestamp = "09:15" },
                    new() { Id = "m2", Sender = "member", Text = "Dạ đỡ mỏi đùi rồi thầy, form Squat bài trước em làm thấy vào mông đùi rất tốt ạ.", Timestamp = "09:30" },
                    new() { Id = "m3", Sender = "coach", Text = "Tốt lắm! Nhớ nạp đủ 120g protein/ngày và uống tối thiểu 2.5 lít nước nhé.", Timestamp = "09:35" },
                    new() { Id = "m4", Sender = "member", Text = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!", Timestamp = "14:20" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-2",
                Type = "class",
                Title = "Lớp Yoga Cơ Bản – Sáng 3-5-7",
                Subtitle = "Nhóm 12 học viên • Studio 2",
                Avatar = "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format&fit=crop&q=80",
                LastMessage = "HLV Minh Tuyết: Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!",
                LastTime = "11:05",
                UnreadCount = 0,
                Online = true,
                Messages = new List<CoachChatMessage>
                {
                    new() { Id = "c1", Sender = "coach", Text = "Chào cả lớp, mọi người nhớ mang theo khăn riêng và thảm cá nhân nhé.", Timestamp = "Hôm qua" },
                    new() { Id = "c2", Sender = "coach", Text = "Buổi mai lớp mình tập bài thở Pranayama nâng cao nhé!", Timestamp = "11:05" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-3",
                Type = "direct",
                Title = "Lê Thu Hà",
                Subtitle = "Học viên Yoga trị liệu",
                Avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Dạ cảm ơn thầy, lưng em nay không còn đau khi ngồi lâu nữa.",
                LastTime = "Hôm qua",
                UnreadCount = 0,
                Online = false,
                Messages = new List<CoachChatMessage>
                {
                    new() { Id = "h1", Sender = "coach", Text = "Chào Hà, động tác rắn hổ mang hôm qua có làm căng thắt lưng quá không em?", Timestamp = "Hôm qua" },
                    new() { Id = "h2", Sender = "member", Text = "Dạ cảm ơn thầy, lưng em nay không còn đau khi ngồi lâu nữa.", Timestamp = "Hôm qua" }
                }
            }
        };

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

            // 3. Coach Chat Conversations
            group.MapGet("/chat/conversations", (string? coachId) => Results.Ok(_chatConversations));
            group.MapGet("/{coachId}/chat/conversations", (string coachId) => Results.Ok(_chatConversations));

            // 4. Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (string conversationId) =>
            {
                var conv = _chatConversations.FirstOrDefault(c => c.Id == conversationId);
                if (conv == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(conv.Messages);
            });

            // 5. Coach Chat Send Message
            group.MapPost("/chat/messages", ([FromBody] SendCoachChatMessageRequest req) =>
            {
                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var conv = _chatConversations.FirstOrDefault(c => c.Id == req.ConversationId);
                if (conv == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                var newMsg = new CoachChatMessage
                {
                    Id = "msg-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    Sender = "coach",
                    Text = req.Text.Trim(),
                    Timestamp = DateTime.Now.ToString("HH:mm")
                };

                conv.Messages.Add(newMsg);
                conv.LastMessage = $"Coach: {newMsg.Text}";
                conv.LastTime = newMsg.Timestamp;

                return Results.Ok(new { success = true, data = newMsg });
            });
        }
    }
}
