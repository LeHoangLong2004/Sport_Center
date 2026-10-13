using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

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
                async (
                    [FromQuery] string? startDate,
                    [FromQuery] string? endDate,
                    HttpContext context,
                    SmartGymDbContext db
                ) =>
                {
                    try
                    {
                        var coachUserIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                            ?? context.User.FindFirst("sub")?.Value;

                        // Query real classes from DB
                        var query = db.Database.SqlQueryRaw<ClassSqlRawModel>(
                            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes"
                        );

                        var dbClasses = await query.ToListAsync();

                        if (dbClasses.Any())
                        {
                            var sports = await db.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
                            var facilities = await db.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities").ToListAsync();
                            var allBookings = await db.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status, created_at FROM class_bookings").ToListAsync();

                            var now = DateTime.UtcNow;

                            var result = dbClasses.Select(c =>
                            {
                                var sport = sports.FirstOrDefault(s => s.Id == c.SportId);
                                var facility = facilities.FirstOrDefault(f => f.Id == c.FacilityId);
                                var registeredIds = allBookings
                                    .Where(b => b.ClassId == c.Id && b.Status != "cancelled")
                                    .Select(b => b.UserId.ToString())
                                    .ToArray();

                                var endT = c.ScheduleTime.AddMinutes(c.DurationMinutes);
                                string statusStr = "sắp diễn ra";
                                if (!c.Status) statusStr = "đã hủy";
                                else if (now >= c.ScheduleTime && now <= endT) statusStr = "đang diễn ra";
                                else if (now > endT) statusStr = "hoàn thành";

                                return new
                                {
                                    id = c.Id.ToString(),
                                    classId = c.Id.ToString(),
                                    className = c.ClassName,
                                    sport = sport?.Name ?? "Thể thao",
                                    level = "Cơ bản",
                                    date = c.ScheduleTime.ToString("yyyy-MM-dd"),
                                    startTime = c.ScheduleTime.ToString("HH:mm"),
                                    endTime = endT.ToString("HH:mm"),
                                    room = facility?.Name ?? "Studio 1",
                                    coachName = "HLV",
                                    capacity = c.Capacity,
                                    registeredMemberIds = registeredIds,
                                    status = statusStr,
                                };
                            }).ToList();

                            if (!string.IsNullOrWhiteSpace(startDate) && DateTime.TryParse(startDate, out var sDate))
                            {
                                result = result.Where(r => DateTime.Parse(r.date) >= sDate.Date).ToList();
                            }
                            if (!string.IsNullOrWhiteSpace(endDate) && DateTime.TryParse(endDate, out var eDate))
                            {
                                result = result.Where(r => DateTime.Parse(r.date) <= eDate.Date).ToList();
                            }

                            return Results.Ok(result);
                        }
                    }
                    catch { }

                    return Results.Ok(Array.Empty<object>());
                }
            );

            // 3. Class/Session Detail
            group.MapGet(
                "/sessions/{sessionId}",
                async (string sessionId, SmartGymDbContext db) =>
                {
                    if (Guid.TryParse(sessionId, out var classGuid))
                    {
                        var cls = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE id = {0}",
                            classGuid
                        ).FirstOrDefaultAsync();

                        if (cls != null)
                        {
                            var sports = await db.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports WHERE id = {0}", cls.SportId).ToListAsync();
                            var facilities = await db.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities WHERE id = {0}", cls.FacilityId).ToListAsync();
                            var allBookings = await db.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE class_id = {0}", classGuid).ToListAsync();

                            var endT = cls.ScheduleTime.AddMinutes(cls.DurationMinutes);
                            var now = DateTime.UtcNow;
                            string statusStr = "sắp diễn ra";
                            if (!cls.Status) statusStr = "đã hủy";
                            else if (now >= cls.ScheduleTime && now <= endT) statusStr = "đang diễn ra";
                            else if (now > endT) statusStr = "hoàn thành";

                            return Results.Ok(new
                            {
                                id = cls.Id.ToString(),
                                classId = cls.Id.ToString(),
                                className = cls.ClassName,
                                sport = sports.FirstOrDefault()?.Name ?? "Thể thao",
                                level = "Cơ bản",
                                date = cls.ScheduleTime.ToString("yyyy-MM-dd"),
                                startTime = cls.ScheduleTime.ToString("HH:mm"),
                                endTime = endT.ToString("HH:mm"),
                                room = facilities.FirstOrDefault()?.Name ?? "Studio 1",
                                coachName = "HLV",
                                capacity = cls.Capacity,
                                registeredMemberIds = allBookings.Where(b => b.Status != "cancelled").Select(b => b.UserId.ToString()).ToArray(),
                                status = statusStr,
                            });
                        }
                    }

                    return Results.NotFound(new { message = "Không tìm thấy buổi học" });
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
