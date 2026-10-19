using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        private static void MapDashboardScheduleEndpoints(RouteGroupBuilder group)
        {
            // 1. Dashboard Summary
            group.MapGet(
                "/dashboard",
                async (HttpContext context, SmartGymDbContext db) =>
                {
                    var coachIdValue = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachIdValue, out var coachId))
                        return Results.Ok(new { totalSessions = 0, completedSessions = 0, totalMembers = 0, upcomingClasses = 0 });

                    var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, coachId);
                    var coachKey = coachProfileId ?? coachId;
                    var classes = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                        "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes WHERE coach_id = {0} OR coach_id = {1}",
                        coachKey,
                        coachId).ToListAsync();
                    var classIds = classes.Select(c => c.Id).ToHashSet();
                    var bookings = classIds.Count == 0
                        ? new List<ClassBookingRawModel>()
                        : await db.Database.SqlQueryRaw<ClassBookingRawModel>(
                            "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE status NOT IN ('cancelled', 'rejected', 'class_cancelled')").ToListAsync();
                    var now = DateTime.UtcNow;
                    var coachBookings = bookings.Where(b => classIds.Contains(b.ClassId)).ToList();
                    var reviews = await db.Reviews
                        .Where(r => r.CoachId == coachKey || r.CoachId == coachId)
                        .ToListAsync();

                    return Results.Ok(
                        new
                        {
                            totalSessions = classes.Count,
                            completedSessions = classes.Count(c => c.ScheduleTime.AddMinutes(c.DurationMinutes) < now),
                            totalMembers = coachBookings.Select(b => b.UserId).Distinct().Count(),
                            upcomingClasses = classes.Count(c => c.Status && c.ScheduleTime > now),
                            averageRating = reviews.Count == 0 ? (double?)null : reviews.Average(r => r.Rating),
                            reviewCount = reviews.Count,
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
                    var coachUserIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachUserIdClaim, out var coachUserId))
                        return Results.Unauthorized();

                    try
                    {
                        var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, coachUserId);
                        var coachProfileKey = coachProfileId ?? coachUserId;

                        var coachUser = await db.Database.SqlQueryRaw<UserSqlRawModel>(
                            "SELECT id, full_name, phone_number, avatar_url FROM users WHERE id = {0}",
                            coachUserId
                        ).FirstOrDefaultAsync();

                        var query = db.Database.SqlQueryRaw<ClassSqlRawModel>(
                            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes WHERE coach_id = {0} OR coach_id = {1}",
                            coachProfileKey,
                            coachUserId
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

                                var localScheduleTime = CenterTime.ToLocal(c.ScheduleTime);
                                var endT = localScheduleTime.AddMinutes(c.DurationMinutes);
                                string statusStr = "sắp diễn ra";
                                if (!c.Status) statusStr = "đã hủy";
                                else if (now >= c.ScheduleTime && now <= c.ScheduleTime.AddMinutes(c.DurationMinutes)) statusStr = "đang diễn ra";
                                else if (now > c.ScheduleTime.AddMinutes(c.DurationMinutes)) statusStr = "hoàn thành";

                                return new
                                {
                                    id = c.Id.ToString(),
                                    classId = c.Id.ToString(),
                                    className = c.ClassName,
                                    sport = sport?.Name ?? "Thể thao",
                                    level = "Cơ bản",
                                    type = "group",
                                    date = localScheduleTime.ToString("yyyy-MM-dd"),
                                    startTime = localScheduleTime.ToString("HH:mm"),
                                    endTime = endT.ToString("HH:mm"),
                                    room = facility?.Name ?? "Studio 1",
                                    coachName = coachUser?.FullName ?? "HLV SportCenter",
                                    capacity = c.Capacity,
                                    registeredCount = registeredIds.Length,
                                    registeredMemberIds = registeredIds,
                                    status = statusStr,
                                    approvalStatus = c.ApprovalStatus,
                                    attendanceStatus = "chưa điểm danh",
                                    coachNote = "",
                                };
                            }).ToList();

                            if (!string.IsNullOrWhiteSpace(startDate) && DateTime.TryParse(startDate, out var sDate))
                                result = result.Where(r => DateTime.Parse(r.date) >= sDate.Date).ToList();
                            if (!string.IsNullOrWhiteSpace(endDate) && DateTime.TryParse(endDate, out var eDate))
                                result = result.Where(r => DateTime.Parse(r.date) <= eDate.Date).ToList();

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
                            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes WHERE id = {0}",
                            classGuid
                        ).FirstOrDefaultAsync();

                        if (cls != null)
                        {
                            var sports = await db.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports WHERE id = {0}", cls.SportId).ToListAsync();
                            var facilities = await db.Database.SqlQueryRaw<FacilitySqlRawModel>("SELECT id, name FROM facilities WHERE id = {0}", cls.FacilityId).ToListAsync();
                            var allBookings = await db.Database.SqlQueryRaw<ClassBookingRawModel>("SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE class_id = {0}", classGuid).ToListAsync();

                            var localScheduleTime = CenterTime.ToLocal(cls.ScheduleTime);
                            var endT = localScheduleTime.AddMinutes(cls.DurationMinutes);
                            var now = DateTime.UtcNow;
                            string statusStr = "sắp diễn ra";
                            if (!cls.Status) statusStr = "đã hủy";
                            else if (now >= cls.ScheduleTime && now <= cls.ScheduleTime.AddMinutes(cls.DurationMinutes)) statusStr = "đang diễn ra";
                            else if (now > cls.ScheduleTime.AddMinutes(cls.DurationMinutes)) statusStr = "hoàn thành";

                            return Results.Ok(new
                            {
                                id = cls.Id.ToString(),
                                classId = cls.Id.ToString(),
                                className = cls.ClassName,
                                sport = sports.FirstOrDefault()?.Name ?? "Thể thao",
                                level = "Cơ bản",
                                date = localScheduleTime.ToString("yyyy-MM-dd"),
                                startTime = localScheduleTime.ToString("HH:mm"),
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
                    if (!Guid.TryParse(sessionId, out _))
                        return Results.Ok(Array.Empty<object>());

                    var memberIds = await LoadSessionMemberIdsAsync(db, sessionId);
                    var users = await db
                        .Users.Include(u => u.Role)
                        .Where(u => u.Role != null && u.Role.Name == "member")
                        .Where(u => memberIds.Contains(u.Id))
                        .ToListAsync();

                    var members = users
                        .Select(u => new
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
                            classIds = new string[] { sessionId },
                        })
                        .ToList();

                    return Results.Ok(members);
                }
            );
        }
    }
}
