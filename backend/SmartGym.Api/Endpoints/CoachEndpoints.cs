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
            group.MapGet("/sessions/{sessionId}/members", (string sessionId) =>
            {
                var members = new[]
                {
                    new { id = "m1", name = "Nguyễn Lan Anh", code = "MB001", avatar = "https://i.pravatar.cc/80?u=lananh", goal = "Giảm cân", level = "Cơ bản", sport = "Yoga", phone = "0901234001", email = "lananh@demo.vn", classIds = new[] { "s1", "s3" } },
                    new { id = "m3", name = "Vũ Thu Trang", code = "MB003", avatar = "https://i.pravatar.cc/80?u=thutrang", goal = "Sức khỏe", level = "Trung cấp", sport = "Bơi", phone = "0901234003", email = "thutrang@demo.vn", classIds = new[] { "s1", "s2" } }
                };
                return Results.Ok(members);
            });

            // 4b. All Members
            group.MapGet("/members", () =>
            {
                var allMembers = new[]
                {
                    new { id = "m1", name = "Nguyễn Lan Anh", code = "MB001", avatar = "https://i.pravatar.cc/80?u=lananh", goal = "Giảm cân", level = "Cơ bản", sport = "Yoga", phone = "0901234001", email = "lananh@demo.vn", classIds = new[] { "s1", "s3" } },
                    new { id = "m2", name = "Lê Minh Triết", code = "MB002", avatar = "https://i.pravatar.cc/80?u=minhtri", goal = "Tăng cơ", level = "Nâng cao", sport = "Gym", phone = "0901234002", email = "minhtri@demo.vn", classIds = new[] { "s2", "s4" } },
                    new { id = "m3", name = "Vũ Thu Trang", code = "MB003", avatar = "https://i.pravatar.cc/80?u=thutrang", goal = "Sức khỏe", level = "Trung cấp", sport = "Bơi", phone = "0901234003", email = "thutrang@demo.vn", classIds = new[] { "s1", "s2" } },
                    new { id = "m4", name = "Trần Minh Khoa", code = "MB004", avatar = "https://i.pravatar.cc/80?u=minhkhoa", goal = "CrossFit", level = "Nâng cao", sport = "CrossFit", phone = "0901234004", email = "minhkhoa@demo.vn", classIds = new[] { "s2", "s3" } },
                    new { id = "m5", name = "Phạm Quỳnh Anh", code = "MB005", avatar = "https://i.pravatar.cc/80?u=quynhanh", goal = "Yoga", level = "Cơ bản", sport = "Yoga", phone = "0901234005", email = "quynhanh@demo.vn", classIds = new[] { "s1" } }
                };
                return Results.Ok(allMembers);
            });

            // 5. Attendance Get
            group.MapGet("/sessions/{sessionId}/attendance", (string sessionId) =>
            {
                return Results.Ok(new[] {
                    new { sessionId, memberId = "m1", status = "chưa điểm danh", note = "" },
                    new { sessionId, memberId = "m3", status = "chưa điểm danh", note = "" }
                });
            });

            // 6. Attendance Draft
            group.MapPost("/sessions/{sessionId}/attendance/draft", (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true, message = "Đã lưu nháp thành công!" });
            });

            // 7. Attendance Finalize
            group.MapPost("/sessions/{sessionId}/attendance/finalize", (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true, message = "Đã chốt điểm danh!" });
            });

            // 8. Curriculum Get
            group.MapGet("/curricula", () =>
            {
                var curricula = new[] {
                    new { id = "cur1", name = "Yoga Cơ Bản – Tuần 1", sport = "Yoga", goal = "Linh hoạt", level = "Cơ bản", duration = 60, status = "Đã giao", updatedAt = "2023-10-20", description = "Giáo án tuần đầu", exercises = new[] { new { name = "Khởi động", reps = "5 phút", rest = "0", note = "" } }, assignedTo = new[] { new { type = "class", id = "cls-yoga", name = "Yoga Cơ Bản – Lớp A" } } }
                };
                return Results.Ok(curricula);
            });

            // 9. Curriculum Save
            group.MapPost("/curricula", ([FromBody] System.Text.Json.JsonElement request) =>
            {
                return Results.Ok(new { success = true });
            });

            // 10. Curriculum Assign
            group.MapPost("/curricula/{id}/assign", (string id, [FromBody] System.Text.Json.JsonElement request) =>
            {
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
