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
        private static void MapDashboardAndMemberEndpoints(RouteGroupBuilder group)
        {
            // 1. Dashboard
            group.MapGet(
                "/dashboard",
                () =>
                {
                    return Results.Ok(
                        new
                        {
                            totalSessions = 12,
                            completedSessions = 8,
                            totalMembers = 45,
                            upcomingClasses = 3,
                        }
                    );
                }
            );

            // 2. Schedule
            group.MapGet(
                "/schedule",
                ([FromQuery] string? startDate, [FromQuery] string? endDate) =>
                {
                    var mockResult = new[]
                    {
                        new
                        {
                            id = "s1",
                            classId = "cls-yoga",
                            className = "Yoga Cơ Bản – Lớp A",
                            sport = "Yoga",
                            level = "Cơ bản",
                            date = DateTime.Now.ToString("yyyy-MM-dd"),
                            startTime = "07:00",
                            endTime = "08:00",
                            room = "Studio 2",
                            coachName = "HLV Demo",
                            capacity = 10,
                            registeredMemberIds = new[] { "m1", "m3", "m5" },
                            status = "sắp diễn ra",
                        },
                        new
                        {
                            id = "s2",
                            classId = "cls-gym",
                            className = "Gym Group BodyCombat – Lớp B",
                            sport = "Gym",
                            level = "Nâng cao",
                            date = DateTime.Now.ToString("yyyy-MM-dd"),
                            startTime = "09:00",
                            endTime = "10:30",
                            room = "Khu Tạ Tự Do",
                            coachName = "HLV Demo",
                            capacity = 8,
                            registeredMemberIds = new[] { "m2", "m3", "m4" },
                            status = "đang diễn ra",
                        },
                    };
                    return Results.Ok(mockResult);
                }
            );

            // 3. Class/Session Detail
            group.MapGet(
                "/sessions/{sessionId}",
                (string sessionId) =>
                {
                    return Results.Ok(
                        new
                        {
                            id = sessionId,
                            classId = "cls-yoga",
                            className = "Yoga Cơ Bản – Lớp A",
                            sport = "Yoga",
                            level = "Cơ bản",
                            date = DateTime.Now.ToString("yyyy-MM-dd"),
                            startTime = "07:00",
                            endTime = "08:00",
                            room = "Studio 2",
                            coachName = "HLV Demo",
                            capacity = 10,
                            registeredMemberIds = new[] { "m1", "m3", "m5" },
                            status = "sắp diễn ra",
                        }
                    );
                }
            );

            // 4. Session Members
            group.MapGet(
                "/sessions/{sessionId}/members",
                async (string sessionId, SmartGymDbContext db) =>
                {
                    var users = await db
                        .Users.Include(u => u.Role)
                        .Where(u => u.Role != null && u.Role.Name == "member")
                        .Take(2)
                        .ToListAsync();

                    var members = users
                        .Select(u => new
                        {
                            id = u.Id.ToString(),
                            name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                            code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                            avatar = "https://ui-avatars.com/api/?name="
                                + Uri.EscapeDataString(u.FullName ?? "User"),
                            goal = "Giảm cân",
                            level = "Cơ bản",
                            sport = "Yoga",
                            phone = u.PhoneNumber ?? "0900000000",
                            email = u.Email ?? "",
                            classIds = new string[] { sessionId },
                        })
                        .ToList();

                    return Results.Ok(members);
                }
            );

            // 4b. All Members
            group.MapGet(
                "/members",
                async (SmartGymDbContext db) =>
                {
                    var users = await db
                        .Users.Include(u => u.Role)
                        .Where(u => u.Role != null && u.Role.Name == "member")
                        .ToListAsync();

                    var allMembers = users
                        .Select(u => new
                        {
                            id = u.Id.ToString(),
                            name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                            code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                            avatar = "https://ui-avatars.com/api/?name="
                                + Uri.EscapeDataString(u.FullName ?? "User"),
                            goal = "Sức khỏe",
                            level = "Cơ bản",
                            sport = "Đa môn",
                            phone = u.PhoneNumber ?? "0900000000",
                            email = u.Email ?? "",
                            classIds = new string[] { },
                        })
                        .ToList();

                    return Results.Ok(allMembers);
                }
            );

        }
    }
}
