using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF; 
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SmartGym.Api.Endpoints
{
    public static class CoachEndpoints
    {
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, System.Collections.Generic.List<object>> _mockAttendance = new();
        private static readonly System.Text.Json.Nodes.JsonArray _mockCurricula = new System.Text.Json.Nodes.JsonArray
        {
            new System.Text.Json.Nodes.JsonObject
            {
                ["id"] = "cur1",
                ["name"] = "Yoga Cơ Bản – Tuần 1",
                ["sport"] = "Yoga",
                ["goal"] = "Linh hoạt",
                ["level"] = "Cơ bản",
                ["duration"] = 60,
                ["status"] = "Đã giao",
                ["updatedAt"] = "2023-10-20",
                ["description"] = "Giáo án tuần đầu",
                ["exercises"] = new System.Text.Json.Nodes.JsonArray
                {
                    new System.Text.Json.Nodes.JsonObject
                    {
                        ["name"] = "Khởi động",
                        ["reps"] = "5 phút",
                        ["rest"] = "0",
                        ["note"] = ""
                    }
                },
                ["assignedTo"] = new System.Text.Json.Nodes.JsonArray
                {
                    new System.Text.Json.Nodes.JsonObject
                    {
                        ["type"] = "class",
                        ["id"] = "cls-yoga",
                        ["name"] = "Yoga Cơ Bản – Lớp A"
                    }
                }
            }
        };

        public static void MapCoachEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/coach");

            // 1. Dashboard
            group.MapGet("/dashboard", () =>
            {
                return Results.Ok(new {
                    totalSessions = 24,
                    completedSessions = 18,
                    totalMembers = 150,
                    upcomingClasses = 5
                });
            });

            // 2. Schedule
            group.MapGet("/schedule", ([FromQuery] string? startDate, [FromQuery] string? endDate) =>
            {
                var today = DateTime.Now;
                var mockResult = new[]
                {
                    new { id = "s1", classId = "cls-yoga", className = "Yoga Cơ Bản – Lớp A", sport = "Yoga", level = "Cơ bản", date = today.ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:00", room = "Studio 2", coachName = "HLV Demo", capacity = 10, registeredMemberIds = new[] { "m1", "m3", "m5" }, status = "hoàn thành" },
                    new { id = "s2", classId = "cls-gym", className = "Gym Group BodyCombat", sport = "Gym", level = "Nâng cao", date = today.ToString("yyyy-MM-dd"), startTime = "09:00", endTime = "10:30", room = "Khu Tạ Tự Do", coachName = "HLV Demo", capacity = 8, registeredMemberIds = new[] { "m2", "m3", "m4" }, status = "đang diễn ra" },
                    new { id = "s3", classId = "cls-zumba", className = "Zumba Dance", sport = "Zumba", level = "Trung bình", date = today.ToString("yyyy-MM-dd"), startTime = "17:00", endTime = "18:00", room = "Studio 1", coachName = "HLV Demo", capacity = 20, registeredMemberIds = new[] { "m1", "m2", "m5", "m6" }, status = "sắp diễn ra" },
                    new { id = "s4", classId = "cls-boxing", className = "Boxing Cơ Bản", sport = "Boxing", level = "Cơ bản", date = today.AddDays(1).ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:30", room = "Võ Đài", coachName = "HLV Demo", capacity = 6, registeredMemberIds = new[] { "m4", "m1" }, status = "sắp diễn ra" },
                    new { id = "s5", classId = "cls-yoga", className = "Yoga Phục Hồi", sport = "Yoga", level = "Cơ bản", date = today.AddDays(-1).ToString("yyyy-MM-dd"), startTime = "19:00", endTime = "20:00", room = "Studio 2", coachName = "HLV Demo", capacity = 15, registeredMemberIds = new[] { "m1", "m5", "m2" }, status = "hoàn thành" },
                    new { id = "s6", classId = "cls-gym", className = "Pilates Nâng Cao", sport = "Pilates", level = "Nâng cao", date = today.AddDays(2).ToString("yyyy-MM-dd"), startTime = "14:00", endTime = "15:00", room = "Studio 1", coachName = "HLV Demo", capacity = 12, registeredMemberIds = new[] { "m2", "m5" }, status = "sắp diễn ra" },
                    new { id = "s7", classId = "cls-swim", className = "Bơi Lội Sáng Mớm", sport = "Swimming", level = "Trung bình", date = today.AddDays(1).ToString("yyyy-MM-dd"), startTime = "06:00", endTime = "07:00", room = "Hồ Bơi", coachName = "HLV Demo", capacity = 15, registeredMemberIds = new[] { "m3" }, status = "sắp diễn ra" },
                };
                return Results.Ok(mockResult);
            });

            // 3. Class/Session Detail
            group.MapGet("/sessions/{sessionId}", (string sessionId) =>
            {
                return Results.Ok(new { id = sessionId, classId = "cls-yoga", className = "Yoga Cơ Bản – Lớp A", sport = "Yoga", level = "Cơ bản", date = DateTime.Now.ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:00", room = "Studio 2", coachName = "HLV Demo", capacity = 10, registeredMemberIds = new[] { "m1", "m3", "m5" }, status = "sắp diễn ra" });
            });

            // 4. Session Members
            group.MapGet("/sessions/{sessionId}/members", async (string sessionId, SmartGymDbContext db) =>
            {
                var users = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role != null && u.Role.Name == "member")
                    .Take(10)
                    .ToListAsync();
                    
                var members = users.Select(u => new
                {
                    id = u.Id.ToString(),
                    name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                    code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                    avatar = "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User"),
                    goal = "Giảm cân",
                    level = "Cơ bản",
                    sport = "Yoga",
                    phone = u.PhoneNumber ?? "0900000000",
                    email = u.Email ?? "",
                    classIds = new string[] { sessionId }
                }).ToList();

                if (members.Count == 0)
                {
                    return Results.Ok(new object[]
                    {
                        new { id = "m1", name = "Nguyễn Văn An", code = "MB001", avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", goal = "Tăng cơ giảm mỡ", level = "Cơ bản", sport = "Gym", phone = "0912345678", email = "an.nguyen@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m2", name = "Lê Thu Hà", code = "MB002", avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80", goal = "Cải thiện vóc dáng", level = "Trung bình", sport = "Yoga", phone = "0987654321", email = "ha.le@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m3", name = "Phạm Tuấn Kiệt", code = "MB003", avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", goal = "Sức bền tim mạch", level = "Nâng cao", sport = "Gym", phone = "0903332211", email = "kiet.pham@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m4", name = "Trần Minh Đức", code = "MB004", avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", goal = "Tăng cơ ngực & vai", level = "Cơ bản", sport = "Gym", phone = "0977889900", email = "duc.tran@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m5", name = "Hoàng Thu Uyên", code = "MB005", avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", goal = "Cải thiện tư thế", level = "Cơ bản", sport = "Pilates", phone = "0933112233", email = "uyen.hoang@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m6", name = "Đỗ Quốc Bảo", code = "MB006", avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", goal = "Bơi sải thể lực", level = "Trung bình", sport = "Swimming", phone = "0909123456", email = "bao.do@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m7", name = "Vũ Mai Chi", code = "MB007", avatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", goal = "Giảm mỡ toàn thân", level = "Cơ bản", sport = "Zumba", phone = "0922334455", email = "chi.vu@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m8", name = "Bùi Hoàng Nam", code = "MB008", avatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80", goal = "Tăng sức mạnh & Siết cơ", level = "Nâng cao", sport = "Boxing", phone = "0911223344", email = "nam.bui@gmail.com", classIds = new[] { sessionId } }
                    });
                }
                
                return Results.Ok(members);
            });

            // 4b. All Members
            group.MapGet("/members", async (SmartGymDbContext db) =>
            {
                var users = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role != null && u.Role.Name == "member")
                    .ToListAsync();
                    
                var allMembers = users.Select(u => new
                {
                    id = u.Id.ToString(),
                    name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                    code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                    avatar = "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User"),
                    goal = "Sức khỏe",
                    level = "Cơ bản",
                    sport = "Đa môn",
                    phone = u.PhoneNumber ?? "0900000000",
                    email = u.Email ?? "",
                    classIds = new string[] { }
                }).ToList();
                
                return Results.Ok(allMembers);
            });

            // 5. Attendance Get
            group.MapGet("/sessions/{sessionId}/attendance", async (string sessionId, SmartGymDbContext db) =>
            {
                if (_mockAttendance.TryGetValue(sessionId, out var savedAttendance))
                {
                    return Results.Ok(savedAttendance);
                }

                var members = await db.Users.Include(u => u.Role).Where(u => u.Role.Name == "member").Take(2).ToListAsync();
                var attendance = members.Select(m => new { sessionId, memberId = m.Id.ToString(), status = "chưa điểm danh", note = "" }).Cast<object>().ToList();
                return Results.Ok(attendance);
            });

            // 6. Attendance Draft
            group.MapPost("/sessions/{sessionId}/attendance/draft", (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
            {
                if (request.TryGetProperty("records", out var recordsElement) && recordsElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var list = new System.Collections.Generic.List<object>();
                    foreach (var record in recordsElement.EnumerateArray())
                    {
                        var mId = record.TryGetProperty("memberId", out var mProp) ? mProp.GetString() : "";
                        var st = record.TryGetProperty("status", out var sProp) ? sProp.GetString() : "chưa điểm danh";
                        var nt = record.TryGetProperty("note", out var nProp) ? nProp.GetString() : "";
                        list.Add(new
                        {
                            sessionId = sessionId,
                            memberId = mId,
                            status = st,
                            note = nt
                        });
                    }
                    _mockAttendance[sessionId] = list;
                }
                return Results.Ok(new { success = true, message = "Đã lưu nháp thành công!" });
            });

            // 7. Attendance Finalize
            group.MapPost("/sessions/{sessionId}/attendance/finalize", (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
            {
                if (request.TryGetProperty("records", out var recordsElement) && recordsElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                {
                    var list = new System.Collections.Generic.List<object>();
                    foreach (var record in recordsElement.EnumerateArray())
                    {
                        var mId = record.TryGetProperty("memberId", out var mProp) ? mProp.GetString() : "";
                        var st = record.TryGetProperty("status", out var sProp) ? sProp.GetString() : "chưa điểm danh";
                        var nt = record.TryGetProperty("note", out var nProp) ? nProp.GetString() : "";
                        list.Add(new
                        {
                            sessionId = sessionId,
                            memberId = mId,
                            status = st,
                            note = nt
                        });
                    }
                    _mockAttendance[sessionId] = list;
                }
                return Results.Ok(new { success = true, message = "Đã chốt điểm danh!" });
            });

            // 8. Curriculum Get
            group.MapGet("/curricula", () =>
            {
                return Results.Ok(_mockCurricula);
            });

            // 9. Curriculum Save
            group.MapPost("/curricula", ([FromBody] System.Text.Json.JsonElement request) =>
            {
                var id = request.GetProperty("id").GetString();
                var existingIndex = -1;
                for (int i = 0; i < _mockCurricula.Count; i++)
                {
                    if (_mockCurricula[i]?["id"]?.GetValue<string>() == id)
                    {
                        existingIndex = i;
                        break;
                    }
                }

                var newObj = System.Text.Json.Nodes.JsonObject.Create(request);
                if (existingIndex >= 0)
                {
                    _mockCurricula[existingIndex] = newObj;
                }
                else
                {
                    _mockCurricula.Add(newObj);
                }
                
                return Results.Ok(new { success = true });
            });

            // 10. Curriculum Assign
            group.MapPost("/curricula/{id}/assign", (string id, [FromBody] System.Text.Json.JsonElement request) =>
            {
                for (int i = 0; i < _mockCurricula.Count; i++)
                {
                    if (_mockCurricula[i]?["id"]?.GetValue<string>() == id)
                    {
                        var target = System.Text.Json.Nodes.JsonObject.Create(request);
                        var assignedTo = _mockCurricula[i]["assignedTo"]?.AsArray();
                        if (assignedTo == null)
                        {
                            assignedTo = new System.Text.Json.Nodes.JsonArray();
                            _mockCurricula[i]["assignedTo"] = assignedTo;
                        }
                        assignedTo.Add(target);
                        _mockCurricula[i]["status"] = "Đã giao";
                        break;
                    }
                }
                return Results.Ok(new { success = true });
            });

            // 11. Notifications Get
            group.MapGet("/notifications", () =>
            {
                var notifs = new[] {
                    new { id = "n1", title = "Nhắc nhở buổi yoga ngày mai", content = "Các bạn nhớ mang thảm nhé!", type = "Thông báo", sentAt = "2023-10-24T08:00:00", targetType = "class", targetId = "cls-yoga", targetName = "Yoga Cơ Bản" }
                };
                return Results.Ok(notifs);
            });

            // 12. Notifications Send
            group.MapPost("/notifications", ([FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true });
            });

            // 13. Assessments Get
            group.MapGet("/assessments", () =>
            {
                var assessments = new[] {
                    new { id = "as1", sessionId = "s1", memberId = "m1", completion = 90, metrics = new[] { new { label = "Thời gian", value = "25", unit = "s" } }, comment = "Tốt", nextStep = "Tiếp tục", createdAt = "2023-10-20T08:30:00" }
                };
                return Results.Ok(assessments);
            });

            // 14. Assessment Save
            group.MapPost("/assessments", ([FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true });
            });

            // 15. Schedule Requests (Đổi lịch / Dạy thay / Báo vắng)
            var mockRequests = new System.Collections.Generic.List<object>
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

            group.MapGet("/schedule-requests", () => Results.Ok(mockRequests));

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
                mockRequests.Insert(0, newReq);
                return Results.Ok(new { success = true, data = newReq });
            });

            // 16. PT 1-1 Availability Slots
            var mockSlots = new System.Collections.Generic.List<object>
            {
                new { id = "slot-1", dayOfWeek = 1, period = "Sáng", startTime = "07:00", endTime = "08:30", isOpen = true, bookedMemberName = "Nguyễn Văn An", bookedMemberPhone = "0912345678", goal = "Tăng cơ giảm mỡ" },
                new { id = "slot-2", dayOfWeek = 1, period = "Chiều", startTime = "15:00", endTime = "16:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-3", dayOfWeek = 2, period = "Sáng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "Lê Thu Hà", bookedMemberPhone = "0987654321", goal = "Cải thiện vóc dáng" },
                new { id = "slot-4", dayOfWeek = 3, period = "Tối", startTime = "18:00", endTime = "19:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-5", dayOfWeek = 4, period = "Chiều", startTime = "14:30", endTime = "16:00", isOpen = false, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-6", dayOfWeek = 5, period = "Sáng", startTime = "07:30", endTime = "09:00", isOpen = true, bookedMemberName = "Phạm Tuấn Kiệt", bookedMemberPhone = "0903332211", goal = "Sức bền tim mạch" },
                new { id = "slot-7", dayOfWeek = 6, period = "Sáng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
            };

            group.MapGet("/availability", () => Results.Ok(mockSlots));

            // 17. Coach Chat Conversations
            group.MapGet("/chat/conversations", (string? coachId) => Results.Ok(_chatConversations));
            group.MapGet("/{coachId}/chat/conversations", (string coachId) => Results.Ok(_chatConversations));

            // 18. Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (string conversationId) =>
            {
                var conv = _chatConversations.FirstOrDefault(c => c.Id == conversationId);
                if (conv == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(conv.Messages);
            });

            // 19. Coach Chat Send Message
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

        private static readonly System.Collections.Generic.List<CoachChatConversation> _chatConversations = new()
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
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m1", Sender = "coach", Text = "Chào An, tuần này em cảm thấy cơ bắp phục hồi thế nào rồi?", Timestamp = "09:15" },
                    new() { Id = "m2", Sender = "member", Text = "Dạ cơ đùi sau hôm tập chân hơi mỏi nhưng đỡ nhiều rồi thầy ạ.", Timestamp = "09:30" },
                    new() { Id = "m3", Sender = "coach", Text = "Tốt lắm, nhớ bổ sung đủ 2 lít nước và ăn đủ đạm sau buổi tập nhé.", Timestamp = "09:35" },
                    new() { Id = "m4", Sender = "member", Text = "Thầy ơi, buổi tập sáng mai 7h em đến sớm 10 phút khởi động trước nhé ạ!", Timestamp = "14:20" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-2",
                Type = "class",
                Title = "Lớp Yoga Cơ Bản – Lớp A",
                Subtitle = "Nhóm lớp • 10 học viên",
                LastMessage = "Coach: Nhắc cả lớp chiều nay mang theo thảm cá nhân nhé!",
                LastTime = "11:45",
                UnreadCount = 0,
                Online = true,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m20", Sender = "member", Text = "Em chào thầy và cả lớp ạ!", Timestamp = "08:00" },
                    new() { Id = "m21", Sender = "coach", Text = "Chào cả lớp, chiều nay chúng ta sẽ học kỹ thuật thở bụng sâu và tư thế chiến binh.", Timestamp = "11:40" },
                    new() { Id = "m22", Sender = "coach", Text = "Nhắc cả lớp chiều nay mang theo thảm cá nhân và khăn lau nhé!", Timestamp = "11:45" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-3",
                Type = "direct",
                Title = "Lê Thu Hà",
                Subtitle = "Học viên kèm 1-1 (Mục tiêu: Giảm mỡ)",
                Avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Em đã hoàn thành bài tập về nhà hôm qua rồi ạ.",
                LastTime = "Hôm qua",
                UnreadCount = 0,
                Online = false,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m30", Sender = "coach", Text = "Chào Hà, giáo án tuần 2 thầy đã giao trên hệ thống rồi nhé.", Timestamp = "Hôm qua 10:00" },
                    new() { Id = "m31", Sender = "member", Text = "Em đã hoàn thành bài tập về nhà hôm qua rồi ạ. Cảm giác rất khỏe!", Timestamp = "Hôm qua 17:30" },
                    new() { Id = "m32", Sender = "coach", Text = "Tuyệt vời, tiếp tục duy trì phong độ nhé!", Timestamp = "Hôm qua 18:00" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-4",
                Type = "class",
                Title = "Gym Group BodyCombat",
                Subtitle = "Nhóm lớp • 8 học viên",
                LastMessage = "Phạm Kiệt: Ca hôm nay tập sung quá mọi người!",
                LastTime = "Hôm qua",
                UnreadCount = 0,
                Online = true,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m40", Sender = "coach", Text = "Hôm nay cả lớp tập rất tốt, nhịp độ cardio rất đều.", Timestamp = "Hôm qua 10:45" },
                    new() { Id = "m41", Sender = "member", Text = "Ca hôm nay tập sung quá mọi người! Cảm ơn Coach nhiều ạ.", Timestamp = "Hôm qua 11:00" }
                }
            }
        };
    }

    public class CoachChatMessage
    {
        public string Id { get; set; } = string.Empty;
        public string Sender { get; set; } = "coach";
        public string Text { get; set; } = string.Empty;
        public string Timestamp { get; set; } = string.Empty;
    }

    public class CoachChatConversation
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = "direct";
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string LastMessage { get; set; } = string.Empty;
        public string LastTime { get; set; } = string.Empty;
        public int UnreadCount { get; set; } = 0;
        public bool Online { get; set; } = true;
        public System.Collections.Generic.List<CoachChatMessage> Messages { get; set; } = new();
    }

    public class SendCoachChatMessageRequest
    {
        public string ConversationId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string? CoachId { get; set; }
    }
}
