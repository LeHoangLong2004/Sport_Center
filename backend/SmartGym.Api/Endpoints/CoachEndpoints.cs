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
                    totalSessions = 12,
                    completedSessions = 8,
                    totalMembers = 45,
                    upcomingClasses = 3
                });
            });

            // 2. Schedule
            group.MapGet("/schedule", ([FromQuery] string? startDate, [FromQuery] string? endDate) =>
            {
                var mockResult = new[]
                {
                    new { id = "s1", classId = "cls-yoga", className = "Yoga Cơ Bản – Lớp A", sport = "Yoga", level = "Cơ bản", date = DateTime.Now.ToString("yyyy-MM-dd"), startTime = "07:00", endTime = "08:00", room = "Studio 2", coachName = "HLV Demo", capacity = 10, registeredMemberIds = new[] { "m1", "m3", "m5" }, status = "sắp diễn ra" },
                    new { id = "s2", classId = "cls-gym", className = "Gym Group BodyCombat – Lớp B", sport = "Gym", level = "Nâng cao", date = DateTime.Now.ToString("yyyy-MM-dd"), startTime = "09:00", endTime = "10:30", room = "Khu Tạ Tự Do", coachName = "HLV Demo", capacity = 8, registeredMemberIds = new[] { "m2", "m3", "m4" }, status = "đang diễn ra" }
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
                var members = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.Name == "member")
                    .Take(2)
                    .Select(u => new
                    {
                        id = u.Id.ToString(),
                        name = u.FullName ?? (u.Email != null ? u.Email.Split('@', StringSplitOptions.None)[0] : "User"),
                        code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                        avatar = "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User"),
                        goal = "Giảm cân",
                        level = "Cơ bản",
                        sport = "Yoga",
                        phone = u.PhoneNumber ?? "0900000000",
                        email = u.Email ?? "",
                        classIds = new string[] { sessionId }
                    }).ToListAsync();
                return Results.Ok(members);
            });

            // 4b. All Members
            group.MapGet("/members", async (SmartGymDbContext db) =>
            {
                var allMembers = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role.Name == "member")
                    .Select(u => new
                    {
                        id = u.Id.ToString(),
                        name = u.FullName ?? (u.Email != null ? u.Email.Split('@', StringSplitOptions.None)[0] : "User"),
                        code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                        avatar = "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User"),
                        goal = "Sức khỏe",
                        level = "Cơ bản",
                        sport = "Đa môn",
                        phone = u.PhoneNumber ?? "0900000000",
                        email = u.Email ?? "",
                        classIds = new string[] { }
                    }).ToListAsync();
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
        }
    }
}
