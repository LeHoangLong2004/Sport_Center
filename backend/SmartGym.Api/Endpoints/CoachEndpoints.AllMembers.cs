using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Services;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints;

public static partial class CoachEndpoints
{
    private static void MapAllMembersEndpoint(RouteGroupBuilder group)
    {
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

                // Legacy class records may store either the Coach profile ID
                // or the authenticated account/user ID. Use both forms here,
                // matching the Coach schedule endpoint, so booked members are
                // not omitted from the responsibility list.
                var coachClasses = await db.Database.SqlQueryRaw<ClassSqlRawModel>(
                    "SELECT id, sport_id, facility_id, coach_id, class_name, schedule_time, duration_minutes, capacity, current_enrolled, status, approval_status FROM classes WHERE (coach_id = {0} OR coach_id = {1}) AND status = TRUE",
                    coachProfileId.Value,
                    coachUserId
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
                    "SELECT id, user_id, coach_id FROM pt_enrollments WHERE (coach_id = {0} OR coach_id = {1}) AND payment_status = 'completed' AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE",
                    coachProfileId.Value,
                    coachUserId
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
                        "SELECT session_id, member_id, status, note FROM class_attendance_records"
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

