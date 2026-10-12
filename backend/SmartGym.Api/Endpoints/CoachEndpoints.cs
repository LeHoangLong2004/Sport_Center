using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<
            string,
            System.Collections.Generic.List<object>
        > _mockAttendance = new();
        private static readonly System.Text.Json.Nodes.JsonArray _mockCurricula =
            new System.Text.Json.Nodes.JsonArray
            {
                new System.Text.Json.Nodes.JsonObject
                {
                    ["id"] = "cur1",
                    ["name"] = "Yoga C╞í Bß║ún ΓÇô Tuß║ºn 1",
                    ["sport"] = "Yoga",
                    ["goal"] = "Linh hoß║ít",
                    ["level"] = "C╞í bß║ún",
                    ["duration"] = 60,
                    ["status"] = "─É├ú giao",
                    ["updatedAt"] = "2023-10-20",
                    ["description"] = "Gi├ío ├ín tuß║ºn ─æß║ºu",
                    ["exercises"] = new System.Text.Json.Nodes.JsonArray
                    {
                        new System.Text.Json.Nodes.JsonObject
                        {
                            ["name"] = "Khß╗ƒi ─æß╗Öng",
                            ["reps"] = "5 ph├║t",
                            ["rest"] = "0",
                            ["note"] = "",
                        },
                    },
                    ["assignedTo"] = new System.Text.Json.Nodes.JsonArray
                    {
                        new System.Text.Json.Nodes.JsonObject
                        {
                            ["type"] = "class",
                            ["id"] = "cls-yoga",
                            ["name"] = "Yoga C╞í Bß║ún ΓÇô Lß╗¢p A",
                        },
                    },
                },
            };

        public static void MapCoachEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/coach");
            MapDashboardAndMemberEndpoints(group);
            MapAttendanceEndpoints(group);
            MapCurriculumEndpoints(group);
            MapNotificationAndAssessmentEndpoints(group);

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
                    new { id = "s1", classId = "cls-yoga", className = "Yoga C╞í Bß║ún ΓÇô Lß╗¢p A", sport = "Yoga", level = "C╞í bß║ún", date = today.ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:00", room = "Studio 2", coachName = "HLV Demo", capacity = 10, registeredMemberIds = new[] { "m1", "m3", "m5" }, status = "ho├án th├ánh" },
                    new { id = "s2", classId = "cls-gym", className = "Gym Group BodyCombat", sport = "Gym", level = "N├óng cao", date = today.ToString("yyyy-MM-dd"), startTime = "09:00", endTime = "10:30", room = "Khu Tß║í Tß╗▒ Do", coachName = "HLV Demo", capacity = 8, registeredMemberIds = new[] { "m2", "m3", "m4" }, status = "─æang diß╗àn ra" },
                    new { id = "s3", classId = "cls-zumba", className = "Zumba Dance", sport = "Zumba", level = "Trung b├¼nh", date = today.ToString("yyyy-MM-dd"), startTime = "17:00", endTime = "18:00", room = "Studio 1", coachName = "HLV Demo", capacity = 20, registeredMemberIds = new[] { "m1", "m2", "m5", "m6" }, status = "sß║»p diß╗àn ra" },
                    new { id = "s4", classId = "cls-boxing", className = "Boxing C╞í Bß║ún", sport = "Boxing", level = "C╞í bß║ún", date = today.AddDays(1).ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:30", room = "V├╡ ─É├ái", coachName = "HLV Demo", capacity = 6, registeredMemberIds = new[] { "m4", "m1" }, status = "sß║»p diß╗àn ra" },
                    new { id = "s5", classId = "cls-yoga", className = "Yoga Phß╗Ñc Hß╗ôi", sport = "Yoga", level = "C╞í bß║ún", date = today.AddDays(-1).ToString("yyyy-MM-dd"), startTime = "19:00", endTime = "20:00", room = "Studio 2", coachName = "HLV Demo", capacity = 15, registeredMemberIds = new[] { "m1", "m5", "m2" }, status = "ho├án th├ánh" },
                    new { id = "s6", classId = "cls-gym", className = "Pilates N├óng Cao", sport = "Pilates", level = "N├óng cao", date = today.AddDays(2).ToString("yyyy-MM-dd"), startTime = "14:00", endTime = "15:00", room = "Studio 1", coachName = "HLV Demo", capacity = 12, registeredMemberIds = new[] { "m2", "m5" }, status = "sß║»p diß╗àn ra" },
                    new { id = "s7", classId = "cls-swim", className = "B╞íi Lß╗Öi S├íng Mß╗¢m", sport = "Swimming", level = "Trung b├¼nh", date = today.AddDays(1).ToString("yyyy-MM-dd"), startTime = "06:00", endTime = "07:00", room = "Hß╗ô B╞íi", coachName = "HLV Demo", capacity = 15, registeredMemberIds = new[] { "m3" }, status = "sß║»p diß╗àn ra" },
                };
                return Results.Ok(mockResult);
            });

            // 3. Class/Session Detail
            group.MapGet("/sessions/{sessionId}", (string sessionId) =>
            {
                return Results.Ok(new { id = sessionId, classId = "cls-yoga", className = "Yoga C╞í Bß║ún ΓÇô Lß╗¢p A", sport = "Yoga", level = "C╞í bß║ún", date = DateTime.Now.ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:00", room = "Studio 2", coachName = "HLV Demo", capacity = 10, registeredMemberIds = new[] { "m1", "m3", "m5" }, status = "sß║»p diß╗àn ra" });
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
                    goal = "Giß║úm c├ón",
                    level = "C╞í bß║ún",
                    sport = "Yoga",
                    phone = u.PhoneNumber ?? "0900000000",
                    email = u.Email ?? "",
                    classIds = new string[] { sessionId }
                }).ToList();

                if (members.Count == 0)
                {
                    return Results.Ok(new object[]
                    {
                        new { id = "m1", name = "Nguyß╗àn V─ân An", code = "MB001", avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80", goal = "T─âng c╞í giß║úm mß╗í", level = "C╞í bß║ún", sport = "Gym", phone = "0912345678", email = "an.nguyen@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m2", name = "L├¬ Thu H├á", code = "MB002", avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80", goal = "Cß║úi thiß╗çn v├│c d├íng", level = "Trung b├¼nh", sport = "Yoga", phone = "0987654321", email = "ha.le@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m3", name = "Phß║ím Tuß║Ñn Kiß╗çt", code = "MB003", avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80", goal = "Sß╗⌐c bß╗ün tim mß║ích", level = "N├óng cao", sport = "Gym", phone = "0903332211", email = "kiet.pham@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m4", name = "Trß║ºn Minh ─Éß╗⌐c", code = "MB004", avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80", goal = "T─âng c╞í ngß╗▒c & vai", level = "C╞í bß║ún", sport = "Gym", phone = "0977889900", email = "duc.tran@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m5", name = "Ho├áng Thu Uy├¬n", code = "MB005", avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80", goal = "Cß║úi thiß╗çn t╞░ thß║┐", level = "C╞í bß║ún", sport = "Pilates", phone = "0933112233", email = "uyen.hoang@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m6", name = "─Éß╗ù Quß╗æc Bß║úo", code = "MB006", avatar = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80", goal = "B╞íi sß║úi thß╗â lß╗▒c", level = "Trung b├¼nh", sport = "Swimming", phone = "0909123456", email = "bao.do@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m7", name = "V┼⌐ Mai Chi", code = "MB007", avatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80", goal = "Giß║úm mß╗í to├án th├ón", level = "C╞í bß║ún", sport = "Zumba", phone = "0922334455", email = "chi.vu@gmail.com", classIds = new[] { sessionId } },
                        new { id = "m8", name = "B├╣i Ho├áng Nam", code = "MB008", avatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80", goal = "T─âng sß╗⌐c mß║ính & Siß║┐t c╞í", level = "N├óng cao", sport = "Boxing", phone = "0911223344", email = "nam.bui@gmail.com", classIds = new[] { sessionId } }
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
                    goal = "Sß╗⌐c khß╗Åe",
                    level = "C╞í bß║ún",
                    sport = "─Éa m├┤n",
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
                var attendance = members.Select(m => new { sessionId, memberId = m.Id.ToString(), status = "ch╞░a ─æiß╗âm danh", note = "" }).Cast<object>().ToList();
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
                        var st = record.TryGetProperty("status", out var sProp) ? sProp.GetString() : "ch╞░a ─æiß╗âm danh";
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
                return Results.Ok(new { success = true, message = "─É├ú l╞░u nh├íp th├ánh c├┤ng!" });
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
                        var st = record.TryGetProperty("status", out var sProp) ? sProp.GetString() : "ch╞░a ─æiß╗âm danh";
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
                return Results.Ok(new { success = true, message = "─É├ú chß╗æt ─æiß╗âm danh!" });
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
                        _mockCurricula[i]["status"] = "─É├ú giao";
                        break;
                    }
                }
                return Results.Ok(new { success = true });
            });

            // 11. Notifications Get
            group.MapGet("/notifications", () =>
            {
                var notifs = new[] {
                    new { id = "n1", title = "Nhß║»c nhß╗ƒ buß╗òi yoga ng├áy mai", content = "C├íc bß║ín nhß╗¢ mang thß║úm nh├⌐!", type = "Th├┤ng b├ío", sentAt = "2023-10-24T08:00:00", targetType = "class", targetId = "cls-yoga", targetName = "Yoga C╞í Bß║ún" }
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
                    new { id = "as1", sessionId = "s1", memberId = "m1", completion = 90, metrics = new[] { new { label = "Thß╗¥i gian", value = "25", unit = "s" } }, comment = "Tß╗æt", nextStep = "Tiß║┐p tß╗Ñc", createdAt = "2023-10-20T08:30:00" }
                };
                return Results.Ok(assessments);
            });

            // 14. Assessment Save
            group.MapPost("/assessments", ([FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true });
            });

            // 15. Schedule Requests (─Éß╗òi lß╗ïch / Dß║íy thay / B├ío vß║»ng)
            var mockRequests = new System.Collections.Generic.List<object>
            {
                new {
                    id = "req-1",
                    sessionId = "s5",
                    className = "Yoga Phß╗Ñc Hß╗ôi",
                    requestType = "dß║íy thay",
                    substituteCoachName = "HLV Trß║ºn Minh Tuß║Ñn",
                    reason = "Bß║¡n viß╗çc gia ─æ├¼nh ─æß╗Öt xuß║Ñt",
                    status = "─æ├ú duyß╗çt",
                    createdAt = DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd HH:mm"),
                    managerNote = "─É├ú ph├ón c├┤ng lß║íi cho HLV Tuß║Ñn"
                },
                new {
                    id = "req-2",
                    sessionId = "s4",
                    className = "Boxing C╞í Bß║ún",
                    requestType = "dß╗¥i lß╗ïch",
                    newDate = DateTime.Now.AddDays(2).ToString("yyyy-MM-dd"),
                    newTime = "08:00 - 09:30",
                    reason = "Ph├▓ng v├╡ ─æ├ái bß║úo tr├¼ thiß║┐t bß╗ï",
                    status = "chß╗¥ duyß╗çt",
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
                    className = req.TryGetProperty("className", out var cN) ? cN.GetString() : "Lß╗¢p hß╗ìc",
                    requestType = req.TryGetProperty("requestType", out var rT) ? rT.GetString() : "dß╗¥i lß╗ïch",
                    substituteCoachName = req.TryGetProperty("substituteCoachName", out var sC) ? sC.GetString() : "",
                    newDate = req.TryGetProperty("newDate", out var nD) ? nD.GetString() : "",
                    newTime = req.TryGetProperty("newTime", out var nT) ? nT.GetString() : "",
                    reason = req.TryGetProperty("reason", out var rS) ? rS.GetString() : "",
                    status = "chß╗¥ duyß╗çt",
                    createdAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                    managerNote = ""
                };
                mockRequests.Insert(0, newReq);
                return Results.Ok(new { success = true, data = newReq });
            });

            // 16. PT 1-1 Availability Slots
            var mockSlots = new System.Collections.Generic.List<object>
            {
                new { id = "slot-1", dayOfWeek = 1, period = "S├íng", startTime = "07:00", endTime = "08:30", isOpen = true, bookedMemberName = "Nguyß╗àn V─ân An", bookedMemberPhone = "0912345678", goal = "T─âng c╞í giß║úm mß╗í" },
                new { id = "slot-2", dayOfWeek = 1, period = "Chiß╗üu", startTime = "15:00", endTime = "16:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-3", dayOfWeek = 2, period = "S├íng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "L├¬ Thu H├á", bookedMemberPhone = "0987654321", goal = "Cß║úi thiß╗çn v├│c d├íng" },
                new { id = "slot-4", dayOfWeek = 3, period = "Tß╗æi", startTime = "18:00", endTime = "19:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-5", dayOfWeek = 4, period = "Chiß╗üu", startTime = "14:30", endTime = "16:00", isOpen = false, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
                new { id = "slot-6", dayOfWeek = 5, period = "S├íng", startTime = "07:30", endTime = "09:00", isOpen = true, bookedMemberName = "Phß║ím Tuß║Ñn Kiß╗çt", bookedMemberPhone = "0903332211", goal = "Sß╗⌐c bß╗ün tim mß║ích" },
                new { id = "slot-7", dayOfWeek = 6, period = "S├íng", startTime = "08:00", endTime = "09:30", isOpen = true, bookedMemberName = "", bookedMemberPhone = "", goal = "" },
            };

            group.MapGet("/availability", () => Results.Ok(mockSlots));

            // 17. Coach Chat Conversations
            group.MapGet("/chat/conversations", (string? coachId) => Results.Ok(_chatConversations));
            group.MapGet("/{coachId}/chat/conversations", (string coachId) => Results.Ok(_chatConversations));

            // 18. Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (string conversationId) =>
            {
                var conv = _chatConversations.FirstOrDefault(c => c.Id == conversationId);
                if (conv == null) return Results.NotFound(new { message = "Kh├┤ng t├¼m thß║Ñy hß╗Öi thoß║íi" });
                return Results.Ok(conv.Messages);
            });

            // 19. Coach Chat Send Message
            group.MapPost("/chat/messages", ([FromBody] SendCoachChatMessageRequest req) =>
            {
                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nß╗Öi dung tin nhß║»n kh├┤ng ─æ╞░ß╗úc rß╗ùng" });
                }

                var conv = _chatConversations.FirstOrDefault(c => c.Id == req.ConversationId);
                if (conv == null)
                {
                    return Results.NotFound(new { message = "Kh├┤ng t├¼m thß║Ñy hß╗Öi thoß║íi" });
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
                Title = "Nguyß╗àn V─ân An",
                Subtitle = "Hß╗ìc vi├¬n PT 1-1 (Mß╗Ñc ti├¬u: T─âng c╞í)",
                Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Thß║ºy ╞íi, buß╗òi tß║¡p s├íng mai 7h em ─æß║┐n sß╗¢m 10 ph├║t khß╗ƒi ─æß╗Öng tr╞░ß╗¢c nh├⌐ ß║í!",
                LastTime = "14:20",
                UnreadCount = 1,
                Online = true,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m1", Sender = "coach", Text = "Ch├áo An, tuß║ºn n├áy em cß║úm thß║Ñy c╞í bß║»p phß╗Ñc hß╗ôi thß║┐ n├áo rß╗ôi?", Timestamp = "09:15" },
                    new() { Id = "m2", Sender = "member", Text = "Dß║í c╞í ─æ├╣i sau h├┤m tß║¡p ch├ón h╞íi mß╗Åi nh╞░ng ─æß╗í nhiß╗üu rß╗ôi thß║ºy ß║í.", Timestamp = "09:30" },
                    new() { Id = "m3", Sender = "coach", Text = "Tß╗æt lß║»m, nhß╗¢ bß╗ò sung ─æß╗º 2 l├¡t n╞░ß╗¢c v├á ─ân ─æß╗º ─æß║ím sau buß╗òi tß║¡p nh├⌐.", Timestamp = "09:35" },
                    new() { Id = "m4", Sender = "member", Text = "Thß║ºy ╞íi, buß╗òi tß║¡p s├íng mai 7h em ─æß║┐n sß╗¢m 10 ph├║t khß╗ƒi ─æß╗Öng tr╞░ß╗¢c nh├⌐ ß║í!", Timestamp = "14:20" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-2",
                Type = "class",
                Title = "Lß╗¢p Yoga C╞í Bß║ún ΓÇô Lß╗¢p A",
                Subtitle = "Nh├│m lß╗¢p ΓÇó 10 hß╗ìc vi├¬n",
                LastMessage = "Coach: Nhß║»c cß║ú lß╗¢p chiß╗üu nay mang theo thß║úm c├í nh├ón nh├⌐!",
                LastTime = "11:45",
                UnreadCount = 0,
                Online = true,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m20", Sender = "member", Text = "Em ch├áo thß║ºy v├á cß║ú lß╗¢p ß║í!", Timestamp = "08:00" },
                    new() { Id = "m21", Sender = "coach", Text = "Ch├áo cß║ú lß╗¢p, chiß╗üu nay ch├║ng ta sß║╜ hß╗ìc kß╗╣ thuß║¡t thß╗ƒ bß╗Ñng s├óu v├á t╞░ thß║┐ chiß║┐n binh.", Timestamp = "11:40" },
                    new() { Id = "m22", Sender = "coach", Text = "Nhß║»c cß║ú lß╗¢p chiß╗üu nay mang theo thß║úm c├í nh├ón v├á kh─ân lau nh├⌐!", Timestamp = "11:45" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-3",
                Type = "direct",
                Title = "L├¬ Thu H├á",
                Subtitle = "Hß╗ìc vi├¬n k├¿m 1-1 (Mß╗Ñc ti├¬u: Giß║úm mß╗í)",
                Avatar = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
                LastMessage = "Em ─æ├ú ho├án th├ánh b├ái tß║¡p vß╗ü nh├á h├┤m qua rß╗ôi ß║í.",
                LastTime = "H├┤m qua",
                UnreadCount = 0,
                Online = false,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m30", Sender = "coach", Text = "Ch├áo H├á, gi├ío ├ín tuß║ºn 2 thß║ºy ─æ├ú giao tr├¬n hß╗ç thß╗æng rß╗ôi nh├⌐.", Timestamp = "H├┤m qua 10:00" },
                    new() { Id = "m31", Sender = "member", Text = "Em ─æ├ú ho├án th├ánh b├ái tß║¡p vß╗ü nh├á h├┤m qua rß╗ôi ß║í. Cß║úm gi├íc rß║Ñt khß╗Åe!", Timestamp = "H├┤m qua 17:30" },
                    new() { Id = "m32", Sender = "coach", Text = "Tuyß╗çt vß╗¥i, tiß║┐p tß╗Ñc duy tr├¼ phong ─æß╗Ö nh├⌐!", Timestamp = "H├┤m qua 18:00" }
                }
            },
            new CoachChatConversation
            {
                Id = "conv-4",
                Type = "class",
                Title = "Gym Group BodyCombat",
                Subtitle = "Nh├│m lß╗¢p ΓÇó 8 hß╗ìc vi├¬n",
                LastMessage = "Phß║ím Kiß╗çt: Ca h├┤m nay tß║¡p sung qu├í mß╗ìi ng╞░ß╗¥i!",
                LastTime = "H├┤m qua",
                UnreadCount = 0,
                Online = true,
                Messages = new System.Collections.Generic.List<CoachChatMessage>
                {
                    new() { Id = "m40", Sender = "coach", Text = "H├┤m nay cß║ú lß╗¢p tß║¡p rß║Ñt tß╗æt, nhß╗ïp ─æß╗Ö cardio rß║Ñt ─æß╗üu.", Timestamp = "H├┤m qua 10:45" },
                    new() { Id = "m41", Sender = "member", Text = "Ca h├┤m nay tß║¡p sung qu├í mß╗ìi ng╞░ß╗¥i! Cß║úm ╞ín Coach nhiß╗üu ß║í.", Timestamp = "H├┤m qua 11:00" }
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
