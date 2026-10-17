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
using SmartGym.Api.Services;
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
                async (HttpContext context, SmartGymDbContext db) =>
                {
                    var coachIdValue = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachIdValue, out var coachId))
                        return Results.Ok(new { totalSessions = 0, completedSessions = 0, totalMembers = 0, upcomingClasses = 0 });

                    var classes = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                        "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE coach_id = {0}",
                        coachId).ToListAsync();
                    var classIds = classes.Select(c => c.Id).ToHashSet();
                    var bookings = classIds.Count == 0
                        ? new System.Collections.Generic.List<ClassBookingRawModel>()
                        : await db.Database.SqlQueryRaw<ClassBookingRawModel>(
                            "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE status NOT IN ('cancelled', 'rejected', 'class_cancelled')").ToListAsync();
                    var now = DateTime.UtcNow;
                    var coachBookings = bookings.Where(b => classIds.Contains(b.ClassId)).ToList();
                    var reviews = await db.Reviews.Where(r => r.CoachId == coachId).ToListAsync();

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
                    SmartGymDbContext db,
                    ScheduleStoreService scheduleStore
                ) =>
                {
                    var coachUserIdClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachUserIdClaim, out var coachUserId))
                        return Results.Unauthorized();

                    try
                    {
                        // classes.coach_id references coaches.id, while the JWT contains users.id.
                        var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, coachUserId);

                        if (coachProfileId == null)
                            return Results.Ok(Array.Empty<object>());

                        var coachUser = await db.Database.SqlQueryRaw<UserSqlRawModel>(
                            "SELECT id, full_name, phone_number, avatar_url FROM users WHERE id = {0}",
                            coachUserId
                        ).FirstOrDefaultAsync();

                        // Query real classes from DB
                        var query = db.Database.SqlQueryRaw<ClassSqlRawModel>(
                            "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE coach_id = {0}",
                            coachProfileId.Value
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
                                    attendanceStatus = "chưa điểm danh",
                                    coachNote = "",
                                };
                            }).ToList();

                            // Also append in-memory store sessions (e.g. 1-1 PT booked)
                            var storeSessions = scheduleStore.GetSessionsForCoach(coachUserId.ToString());
                            foreach (var s in storeSessions)
                            {
                                if (!result.Any(r => r.id == s.Id))
                                {
                                    result.Add(new
                                    {
                                        id = s.Id,
                                        classId = s.ClassId ?? "",
                                        className = s.ClassName,
                                        sport = s.Sport,
                                        level = s.Level,
                                        type = s.Type,
                                        date = s.Date,
                                        startTime = s.StartTime,
                                        endTime = s.EndTime,
                                        room = s.Room,
                                        coachName = s.CoachName,
                                        capacity = s.Capacity,
                                        registeredCount = s.RegisteredCount,
                                        registeredMemberIds = new string[] { s.MemberId ?? "m1" },
                                        status = s.Status,
                                        attendanceStatus = s.AttendanceStatus,
                                        coachNote = s.CoachNote,
                                    });
                                }
                            }

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

                    // Fallback to ScheduleStoreService and default sessions
                    var fallbackStoreSessions = scheduleStore.GetSessionsForCoach(coachUserId.ToString());
                    var list = new List<object>();

                    foreach (var s in fallbackStoreSessions)
                    {
                        list.Add(new
                        {
                            id = s.Id,
                            classId = s.ClassId ?? "",
                            className = s.ClassName,
                            sport = s.Sport,
                            level = s.Level,
                            type = s.Type,
                            date = s.Date,
                            startTime = s.StartTime,
                            endTime = s.EndTime,
                            room = s.Room,
                            coachName = s.CoachName,
                            capacity = s.Capacity,
                            registeredCount = s.RegisteredCount,
                            registeredMemberIds = new string[] { s.MemberId ?? "m1" },
                            status = s.Status,
                            attendanceStatus = s.AttendanceStatus,
                            coachNote = s.CoachNote,
                            memberName = s.MemberName,
                            memberPhone = s.MemberPhone,
                            memberEmail = s.MemberEmail,
                            goal = s.Goal,
                            cancelReason = s.CancelReason
                        });
                    }

                    return Results.Ok(list);
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
                async (HttpContext context, SmartGymDbContext db) =>
                {
                    var coachUserIdValue = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachUserIdValue, out var coachUserId))
                        return Results.Unauthorized();

                    // JWT stores users.id while classes/pt_enrollments store coaches.id.
                    var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, coachUserId, activeOnly: true);

                    if (coachProfileId == null)
                        return Results.Ok(Array.Empty<object>());

                    var coachClasses = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                        "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status FROM classes WHERE coach_id = {0} AND status = TRUE",
                        coachProfileId.Value
                    ).ToListAsync();

                    var classIds = coachClasses.Select(c => c.Id).ToHashSet();
                    var classBookings = classIds.Count == 0
                        ? new List<ClassBookingRawModel>()
                        : await db.Database.SqlQueryRaw<ClassBookingRawModel>(
                            "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE status NOT IN ('cancelled', 'rejected', 'class_cancelled')"
                        ).ToListAsync();

                    classBookings = classBookings.Where(b => classIds.Contains(b.ClassId)).ToList();

                    // PT ownership is stored directly on pt_enrollments.
                    var ptEnrollments = await db.Database.SqlQueryRaw<PtEnrollmentRawModel>(
                        "SELECT id, user_id, coach_id FROM pt_enrollments WHERE coach_id = {0} AND payment_status = 'completed' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE",
                        coachProfileId.Value
                    ).ToListAsync();

                    var memberIds = classBookings
                        .Select(b => b.UserId)
                        .Concat(ptEnrollments.Select(e => e.UserId))
                        .ToHashSet();

                    if (memberIds.Count == 0)
                        return Results.Ok(Array.Empty<object>());

                    var users = await db
                        .Users.Include(u => u.Role)
                        .Where(u => u.Role != null && u.Role.Name == "member")
                        .Where(u => memberIds.Contains(u.Id))
                        .ToListAsync();

                    var sports = await db.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
                    var sportNames = sports.ToDictionary(s => s.Id, s => s.Name);

                    var classIdsByMember = classBookings
                        .GroupBy(b => b.UserId)
                        .ToDictionary(
                            g => g.Key,
                            g => g.Select(b => b.ClassId).Distinct().ToHashSet()
                        );

                    var sportsByMember = classBookings
                        .GroupBy(b => b.UserId)
                        .ToDictionary(
                            g => g.Key,
                            g => g
                                .SelectMany(b => coachClasses.Where(c => c.Id == b.ClassId).Select(c => c.SportId))
                                .Where(sportNames.ContainsKey)
                                .Select(sportId => sportNames[sportId])
                                .Distinct()
                                .ToList()
                        );

                    var attendanceRecords = classIds.Count == 0
                        ? new List<AttendanceRecordRawModel>()
                        : await db.Database.SqlQueryRaw<AttendanceRecordRawModel>(
                            "SELECT session_id, member_id, status FROM class_attendance_records"
                        ).ToListAsync();

                    var attendanceByMember = attendanceRecords
                        .Where(r => classIds.Contains(r.SessionId) && memberIds.Contains(r.MemberId))
                        .GroupBy(r => r.MemberId)
                        .ToDictionary(g => g.Key, g => g.ToList());

                    var result = users
                        .Select(u =>
                        {
                            classIdsByMember.TryGetValue(u.Id, out var memberClassIds);
                            sportsByMember.TryGetValue(u.Id, out var memberSports);
                            attendanceByMember.TryGetValue(u.Id, out var memberAttendance);

                            var attendance = memberAttendance ?? new List<AttendanceRecordRawModel>();
                            var totalSessions = memberClassIds?.Count ?? 0;
                            var attendedSessions = attendance.Count(r =>
                                string.Equals(r.Status, "present", StringComparison.OrdinalIgnoreCase)
                                || string.Equals(r.Status, "attended", StringComparison.OrdinalIgnoreCase)
                                || string.Equals(r.Status, "late", StringComparison.OrdinalIgnoreCase)
                            );

                            return new
                            {
                                id = u.Id.ToString(),
                                name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                                code = "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                                avatar = string.IsNullOrWhiteSpace(u.AvatarUrl)
                                    ? "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User")
                                    : u.AvatarUrl,
                                goal = "Sức khỏe",
                                level = "Cơ bản",
                                sport = memberSports is { Count: > 0 } ? string.Join(", ", memberSports) : "PT 1-1",
                                phone = u.PhoneNumber ?? "",
                                email = u.Email ?? "",
                                classIds = memberClassIds?.Select(id => id.ToString()).ToArray() ?? Array.Empty<string>(),
                                attendanceRate = totalSessions == 0 ? (double?)null : Math.Round(attendedSessions * 100d / totalSessions),
                                attendedSessions,
                                totalSessions,
                            };
                        })
                        .OrderBy(m => m.name)
                        .ToList();

                    return Results.Ok(result);

                    /*
                     * This endpoint intentionally derives responsibility from existing
                     * class bookings and PT enrollments. No coach_members table is needed.
                     */
                    /*
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
                    */
                }
            );

        }
    }
}

public class AttendanceRecordRawModel
{
    [System.ComponentModel.DataAnnotations.Schema.Column("session_id")]
    public Guid SessionId { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("member_id")]
    public Guid MemberId { get; set; }

    [System.ComponentModel.DataAnnotations.Schema.Column("status")]
    public string? Status { get; set; }
}
