using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Application.Common;
using SmartGym.Domain.Entities;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        private static void MapCoachMemberEndpoints(RouteGroupBuilder group)
        {
            // 1. All Assigned Members List
            group.MapGet(
                "/members",
                async (HttpContext context, SmartGymDbContext db) =>
                {
                    var coachUserIdValue = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachUserIdValue, out var coachUserId))
                        return Results.Unauthorized();

                    var (_, members, _) = await LoadCoachClassesAndMembersAsync(db, coachUserId);
                    return Results.Ok(members);
                }
            );

            // 2. Members & Classes Overview (Real-time summary)
            group.MapGet(
                "/members-overview",
                async (HttpContext context, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    var coachUserIdValue = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;

                    if (!Guid.TryParse(coachUserIdValue, out var coachUserId))
                        return Results.Unauthorized();

                    try
                    {
                        var (coachClasses, members, classesOverview) = await LoadCoachClassesAndMembersAsync(db, coachUserId);
                        return Results.Ok(new
                        {
                            totalClasses = classesOverview.Count,
                            totalMembers = members.Count,
                            classes = classesOverview,
                            members
                        });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("CoachMembers").LogError(
                            exception,
                            "Unable to load assigned members for coach {CoachUserId}",
                            coachUserId);
                        return Results.Problem(
                            statusCode: StatusCodes.Status500InternalServerError,
                            title: "Không thể tải học viên phụ trách",
                            detail: "Dữ liệu đăng ký lớp chưa thể đồng bộ. Vui lòng thử lại.");
                    }
                }
            );
        }

        private static async Task<(List<CoachMembersClassRawModel> CoachClasses, List<object> Members, List<object> ClassesOverview)>
            LoadCoachClassesAndMembersAsync(SmartGymDbContext db, Guid coachUserId)
        {
            // The token normally contains users.id, but some legacy coach
            // sessions contain coaches.id. Resolve both forms before matching
            // classes and bookings.
            var coachProfileId = await CoachProfileResolver.FindByIdOrUserIdAsync(db, coachUserId);
            var coachProfileKey = coachProfileId ?? coachUserId;

            // A class can contain either the coach profile id or the authenticated
            // user id because both formats exist in older records.
            var coachClasses = await db.Database.SqlQueryRaw<CoachMembersClassRawModel>(
                "SELECT c.id, c.sport_id, c.facility_id, c.coach_id, c.class_name, c.schedule_time, c.duration_minutes, c.capacity, c.current_enrolled, c.status, c.approval_status, c.parent_id, c.session_number, c.total_sessions, c.price_per_session_snapshot, c.course_fee_snapshot, COALESCE(cc.class_name, root.class_name, c.class_name) AS \"CourseName\" FROM classes c LEFT JOIN class_courses cc ON cc.id = c.parent_id LEFT JOIN classes root ON root.id = c.parent_id WHERE (c.coach_id = {0} OR c.coach_id = {1}) AND c.status = TRUE AND LOWER(COALESCE(c.approval_status, '')) = 'approved'",
                coachProfileKey,
                coachUserId
            ).ToListAsync();

            var classIds = coachClasses.Select(c => c.Id).ToHashSet();
            var classBookings = classIds.Count == 0
                ? new List<ClassBookingRawModel>()
                : await db.Database.SqlQueryRaw<ClassBookingRawModel>(
                    "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')"
                ).ToListAsync();

            classBookings = classBookings.Where(b => classIds.Contains(b.ClassId)).ToList();

            // Group-class bookings are the source of truth for this page. PT data
            // is supplementary, so a problem in the optional PT query must not
            // hide students who are already booked into a group class.
            var ptEnrollments = new List<PtEnrollmentRawModel>();
            try
            {
                ptEnrollments = await db.Database.SqlQueryRaw<PtEnrollmentRawModel>(
                    "SELECT id, user_id, coach_id FROM pt_enrollments WHERE (coach_id = {0} OR coach_id = {1}) AND LOWER(COALESCE(payment_status, '')) = 'completed'",
                    coachProfileKey,
                    coachUserId
                ).ToListAsync();
            }
            catch
            {
                // Keep class members visible even if an older PT schema is missing
                // one of the optional enrollment columns.
            }

            var sports = await db.Database.SqlQueryRaw<SportSqlRawModel>("SELECT id, name FROM sports").ToListAsync();
            var sportNames = sports.ToDictionary(s => s.Id, s => s.Name);

            var classesByCourse = coachClasses.GroupBy(c => c.ParentId ?? c.Id).ToList();
            var classIdToCourseId = coachClasses.ToDictionary(c => c.Id, c => c.ParentId ?? c.Id);
            var courseNameById = classesByCourse.ToDictionary(
                g => g.Key,
                g => g.Select(c => c.CourseName).FirstOrDefault(name => !string.IsNullOrWhiteSpace(name)) ?? g.First().ClassName
            );

            var classesOverview = classesByCourse.Select(course =>
            {
                var sessions = course.OrderBy(c => c.ScheduleTime).ToList();
                var firstSession = sessions[0];
                var sessionIds = sessions.Select(c => c.Id).ToHashSet();
                var enrolledCount = classBookings.Where(b => sessionIds.Contains(b.ClassId)).Select(b => b.UserId).Distinct().Count();
                sportNames.TryGetValue(firstSession.SportId, out var sName);
                var localTime = CenterTime.ToLocal(firstSession.ScheduleTime);
                return (object)new
                {
                    id = course.Key.ToString(),
                    sessionIds = sessions.Select(c => c.Id.ToString()).ToArray(),
                    sessionCount = sessions.Count,
                    className = courseNameById[course.Key],
                    sport = sName ?? "Thể thao",
                    scheduleTime = $"{localTime:dd/MM/yyyy HH:mm} · {sessions.Count} buổi",
                    durationMinutes = firstSession.DurationMinutes,
                    capacity = firstSession.Capacity,
                    enrolledCount,
                    status = sessions.Any(c => c.Status)
                };
            }).ToList();

            var memberIds = classBookings
                .Select(b => b.UserId)
                .Concat(ptEnrollments.Select(e => e.UserId))
                .ToHashSet();

            // Do not filter by Role.Name here. Attendance already proves that the
            // booking belongs to this user, and legacy databases may use a
            // different casing/label for the member role. Filtering by the
            // booking user ids prevents a valid student from disappearing.
            var users = memberIds.Count == 0
                ? new List<User>()
                : await db.Users.AsNoTracking().Where(u => memberIds.Contains(u.Id)).ToListAsync();

            var classNameMap = coachClasses.ToDictionary(c => c.Id, c => courseNameById[classIdToCourseId[c.Id]]);
            var classIdsByMember = classBookings
                .GroupBy(b => b.UserId)
                .ToDictionary(g => g.Key, g => g.Select(b => b.ClassId).Distinct().ToHashSet());
            var courseIdsByMember = classBookings
                .GroupBy(b => b.UserId)
                .ToDictionary(g => g.Key, g => g.Select(b => classIdToCourseId[b.ClassId]).Distinct().ToHashSet());

            var classNamesByMember = classBookings
                .GroupBy(b => b.UserId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(b => classNameMap.TryGetValue(b.ClassId, out var name) ? name : "Lớp học").Distinct().ToList()
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

            var attendanceRecords = new List<AttendanceRecordRawModel>();
            try
            {
                if (classIds.Count > 0)
                {
                    attendanceRecords = await db.Database.SqlQueryRaw<AttendanceRecordRawModel>(
                        "SELECT session_id, member_id, status FROM class_attendance_records"
                    ).ToListAsync();
                }
            }
            catch
            {
                // Attendance is only used for the percentage shown on the card;
                // it must not prevent the member itself from being returned.
            }

            var attendanceByMember = attendanceRecords
                .Where(r => classIds.Contains(r.SessionId) && memberIds.Contains(r.MemberId))
                .GroupBy(r => r.MemberId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var members = users
                .OrderBy(u => u.FullName ?? u.Email ?? "User")
                .Select(u =>
                {
                    classIdsByMember.TryGetValue(u.Id, out var memberClassIds);
                        courseIdsByMember.TryGetValue(u.Id, out var memberCourseIds);
                    classNamesByMember.TryGetValue(u.Id, out var memberClassNames);
                    sportsByMember.TryGetValue(u.Id, out var memberSports);
                    attendanceByMember.TryGetValue(u.Id, out var memberAttendance);

                    var attendance = memberAttendance ?? new List<AttendanceRecordRawModel>();
                    var totalSessions = memberClassIds?.Count ?? 0;
                    var attendedSessions = attendance.Count(r =>
                        string.Equals(r.Status, "present", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(r.Status, "attended", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(r.Status, "late", StringComparison.OrdinalIgnoreCase)
                    );

                    var cNames = memberClassNames ?? new List<string>();
                    var primaryClass = cNames.Count > 0 ? cNames[0] : (memberSports is { Count: > 0 } ? "PT 1-1" : "Học viên");

                    return (object)new
                    {
                        id = u.Id.ToString(),
                        name = u.FullName ?? (u.Email != null ? u.Email.Split('@')[0] : "User"),
                        code = !string.IsNullOrWhiteSpace(u.MemberCode) ? u.MemberCode : "MB" + u.Id.ToString().Substring(0, 4).ToUpper(),
                        avatar = string.IsNullOrWhiteSpace(u.AvatarUrl)
                            ? "https://ui-avatars.com/api/?name=" + Uri.EscapeDataString(u.FullName ?? "User")
                            : u.AvatarUrl,
                        goal = !string.IsNullOrWhiteSpace(u.TrainingGoal) ? u.TrainingGoal : "",
                        level = !string.IsNullOrWhiteSpace(u.TrainingLevel) ? u.TrainingLevel : "Cơ bản",
                        sport = memberSports is { Count: > 0 } ? string.Join(", ", memberSports) : "Thể thao",
                        className = primaryClass,
                        classNames = cNames.ToArray(),
                        phone = u.PhoneNumber ?? "",
                        email = u.Email ?? "",
                        classIds = memberClassIds?.Select(id => id.ToString()).ToArray() ?? Array.Empty<string>(),
                        courseIds = memberCourseIds?.Select(id => id.ToString()).ToArray() ?? Array.Empty<string>(),
                        attendanceRate = totalSessions == 0 ? (double?)null : Math.Round(attendedSessions * 100d / totalSessions),
                        attendedSessions,
                        totalSessions,
                    };
                })
                .ToList();

            return (coachClasses, members, classesOverview);
        }

        private sealed class CoachMembersClassRawModel : ClassSqlRawModel
        {
            public string? CourseName { get; set; }
        }
    }

    public class AttendanceRecordRawModel
    {
        [Column("session_id")]
        public Guid SessionId { get; set; }

        [Column("member_id")]
        public Guid MemberId { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [Column("note")]
        public string? Note { get; set; }
    }
}
