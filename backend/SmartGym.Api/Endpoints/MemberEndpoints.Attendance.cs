using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class MemberEndpoints
{
    private static void MapMemberAttendanceEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("/attendance", async (
            HttpContext context,
            SmartGymDbContext db,
            ICheckInRepository checkInRepo) =>
        {
            Guid memberGuid;
            var qMemberId = context.Request.Query["memberId"].ToString();
            var role = context.User.FindFirstValue(ClaimTypes.Role) ?? context.User.FindFirst("role")?.Value;
            var isStaff = string.Equals(role, "receptionist", StringComparison.OrdinalIgnoreCase)
                       || string.Equals(role, "admin", StringComparison.OrdinalIgnoreCase)
                       || string.Equals(role, "manager", StringComparison.OrdinalIgnoreCase);

            if (!string.IsNullOrEmpty(qMemberId) && Guid.TryParse(qMemberId, out var parsedTargetId) && isStaff)
            {
                memberGuid = parsedTargetId;
            }
            else
            {
                var userIdStr = GetUserId(context);
                if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out memberGuid))
                {
                    return Results.Unauthorized();
                }
            }

            // 0. Get member's active subscriptions to synchronize package information
            var activeSubs = await db.Subscriptions
                .Include(s => s.Package)
                .Where(s => s.UserId == memberGuid && (s.PaymentStatus == SmartGym.Domain.Enums.PaymentStatus.Completed || (int)s.PaymentStatus == 1))
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            // 1. Get class attendance records
            List<MemberClassAttendanceRow> classRows = new();
            try
            {
                classRows = await db.Database.SqlQueryRaw<MemberClassAttendanceRow>(
                    @"SELECT c.id AS ""SessionId"",
                             c.class_name AS ""ClassName"",
                             COALESCE(s.name, '') AS ""Sport"",
                             c.sport_id AS ""SportId"",
                             b.subscription_id AS ""SubscriptionId"",
                             COALESCE(f.name, '') AS ""Room"",
                             c.schedule_time AS ""ScheduleTime"",
                             c.duration_minutes AS ""DurationMinutes"",
                             COALESCE(u.full_name, 'HLV Trung tâm') AS ""CoachName"",
                             COALESCE(u.avatar_url, '') AS ""CoachAvatar"",
                             CASE 
                                 WHEN c.schedule_time > NOW() THEN 'chưa diễn ra'
                                 ELSE COALESCE(car.status, 'chưa điểm danh')
                             END AS ""AttendanceStatus"",
                             CASE 
                                 WHEN c.schedule_time > NOW() THEN ''
                                 ELSE COALESCE(car.note, '')
                             END AS ""CoachNote""
                      FROM class_bookings b
                      INNER JOIN classes c ON c.id = b.class_id
                      LEFT JOIN sports s ON s.id = c.sport_id
                      LEFT JOIN facilities f ON f.id = c.facility_id
                      LEFT JOIN coaches co ON co.id = c.coach_id
                      LEFT JOIN users u ON u.id = co.user_id
                      LEFT JOIN class_attendance_records car
                             ON car.session_id = c.id AND car.member_id = b.user_id
                      WHERE b.user_id = {0}
                        AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                      ORDER BY c.schedule_time DESC",
                    memberGuid).ToListAsync();
            }
            catch
            {
                // Fallback to empty if query fails
            }

            // 2. Get PT sessions
            List<MemberPtAttendanceRow> ptRows = new();
            try
            {
                ptRows = await db.Database.SqlQueryRaw<MemberPtAttendanceRow>(
                    @"SELECT s.id AS ""SessionId"",
                             COALESCE(s.sport, 'Gym') AS ""Sport"",
                             COALESCE(s.room, 'Khu vực PT 1-1') AS ""Room"",
                             s.start_time AS ""ScheduleTime"",
                             COALESCE(CAST(EXTRACT(EPOCH FROM (s.end_time - s.start_time))/60 AS integer), 60) AS ""DurationMinutes"",
                             COALESCE(u.full_name, 'HLV Cá nhân') AS ""CoachName"",
                             COALESCE(u.avatar_url, '') AS ""CoachAvatar"",
                             COALESCE(s.goal, '') AS ""Goal"",
                             s.status AS ""Status""
                      FROM coach_availability_slots s
                      INNER JOIN coaches c ON c.id = s.coach_id
                      LEFT JOIN users u ON u.id = c.user_id
                      WHERE s.booked_member_id = {0} AND s.status = 'booked'
                      ORDER BY s.start_time DESC",
                    memberGuid).ToListAsync();
            }
            catch
            {
                // Fallback if table doesn't have slot
            }

            // 3. Get Gate Check-in history
            IReadOnlyList<SmartGym.Domain.Entities.CheckInRecord> gateRecords = Array.Empty<SmartGym.Domain.Entities.CheckInRecord>();
            try
            {
                gateRecords = await checkInRepo.GetByMemberAsync(memberGuid);
            }
            catch
            {
            }

            // 4. Get Coach Assessments for this Member
            List<MemberAssessmentDbRow> assessmentRows = new();
            try
            {
                assessmentRows = await db.Database.SqlQueryRaw<MemberAssessmentDbRow>(@"
                    SELECT id AS ""Id"",
                           session_id AS ""SessionId"",
                           coach_id AS ""CoachId"",
                           completion AS ""Completion"",
                           metrics_json::text AS ""MetricsJson"",
                           comment AS ""Comment"",
                           next_step AS ""NextStep"",
                           created_at AS ""CreatedAt""
                    FROM coach_assessments
                    WHERE member_id = {0}
                    ORDER BY created_at DESC", memberGuid).ToListAsync();
            }
            catch
            {
            }

            var assessmentBySession = assessmentRows
                .Where(a => a.SessionId.HasValue)
                .GroupBy(a => a.SessionId!.Value)
                .ToDictionary(g => g.Key, g => g.First());

            static object ParseMetricsJson(string? rawJson)
            {
                if (string.IsNullOrWhiteSpace(rawJson)) return Array.Empty<object>();
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<object>(rawJson) ?? Array.Empty<object>();
                }
                catch
                {
                    return Array.Empty<object>();
                }
            }

            // Helper for Vietnam Time (GMT+7)
            static DateTime ToVnTime(DateTime utcTime)
            {
                var dt = DateTime.SpecifyKind(utcTime, DateTimeKind.Utc);
                return dt.AddHours(7);
            }

            // Format class attendance items
            var nowUtc = DateTime.UtcNow;
            var classItems = classRows.Select(r =>
            {
                var localTime = ToVnTime(r.ScheduleTime);
                var isFuture = r.ScheduleTime > nowUtc;

                // Synchronize package name from member active packages (prioritize matching sport)
                var matchedSub = activeSubs.FirstOrDefault(s => !string.IsNullOrWhiteSpace(r.Sport) && (
                        (s.SportId.HasValue && r.SportId.HasValue && s.SportId.Value == r.SportId.Value) ||
                        (s.Package != null && s.Package.Name.Contains(r.Sport, StringComparison.OrdinalIgnoreCase)) ||
                        (!string.IsNullOrWhiteSpace(s.PackageId) && s.PackageId.Contains(r.Sport, StringComparison.OrdinalIgnoreCase))
                    ))
                    ?? activeSubs.FirstOrDefault(s => r.SubscriptionId.HasValue && s.Id == r.SubscriptionId.Value)
                    ?? activeSubs.FirstOrDefault(s => s.Package != null && s.Package.PackageType == "sport")
                    ?? activeSubs.FirstOrDefault();

                var pkgName = matchedSub?.Package?.Name
                    ?? (matchedSub?.PackageId switch
                    {
                        "yoga_pack" => "Gói Tập Yoga",
                        "sport-gym-self" => "Gym tự tập",
                        "sport-boxing-coach" => "Boxing Coach 1–1",
                        "membership-plus" => "Hội viên Plus",
                        "membership-basic" => "Hội viên Basic",
                        "membership-premium" => "Hội viên Premium",
                        _ => matchedSub?.PackageId
                    })
                    ?? (string.IsNullOrWhiteSpace(r.Sport) ? "Gói môn tập" : $"Gói Tập {r.Sport}");

                var hasAsm = assessmentBySession.TryGetValue(r.SessionId, out var asm);
                var asmObj = hasAsm && asm != null ? new
                {
                    id = asm.Id.ToString(),
                    completion = asm.Completion,
                    metrics = ParseMetricsJson(asm.MetricsJson),
                    comment = asm.Comment ?? string.Empty,
                    nextStep = asm.NextStep ?? string.Empty,
                    createdAt = asm.CreatedAt.ToString("o")
                } : null;

                return new
                {
                    id = r.SessionId.ToString(),
                    className = r.ClassName,
                    sport = string.IsNullOrWhiteSpace(r.Sport) ? "Gym" : r.Sport,
                    packageName = pkgName,
                    coachName = r.CoachName,
                    coachAvatar = r.CoachAvatar,
                    room = string.IsNullOrWhiteSpace(r.Room) ? "Studio Sport Center" : r.Room,
                    date = localTime.ToString("yyyy-MM-dd"),
                    startTime = localTime.ToString("HH:mm"),
                    endTime = localTime.AddMinutes(r.DurationMinutes).ToString("HH:mm"),
                    status = isFuture ? "chưa diễn ra" : NormalizeAttendanceStatus(r.AttendanceStatus),
                    coachNote = isFuture ? string.Empty : r.CoachNote,
                    assessment = asmObj,
                    type = "group"
                };
            }).ToList();

            // Format PT items
            var ptSub = activeSubs.FirstOrDefault(s => s.Package != null && (s.Package.Name.Contains("Coach", StringComparison.OrdinalIgnoreCase) || s.Package.Name.Contains("PT", StringComparison.OrdinalIgnoreCase)))
                ?? activeSubs.FirstOrDefault();
            var ptPackageName = ptSub?.Package?.Name ?? "Gói kèm 1-1 PT";

            var ptItems = ptRows.Select(r =>
            {
                var localTime = ToVnTime(r.ScheduleTime);
                var isFuture = r.ScheduleTime > nowUtc;

                var hasPtAsm = assessmentBySession.TryGetValue(r.SessionId, out var ptAsm);
                var ptAsmObj = hasPtAsm && ptAsm != null ? new
                {
                    id = ptAsm.Id.ToString(),
                    completion = ptAsm.Completion,
                    metrics = ParseMetricsJson(ptAsm.MetricsJson),
                    comment = ptAsm.Comment ?? string.Empty,
                    nextStep = ptAsm.NextStep ?? string.Empty,
                    createdAt = ptAsm.CreatedAt.ToString("o")
                } : null;

                return new
                {
                    id = r.SessionId.ToString(),
                    className = $"Kèm 1-1 ({r.Sport})",
                    sport = r.Sport,
                    packageName = ptPackageName,
                    coachName = r.CoachName,
                    coachAvatar = r.CoachAvatar,
                    room = r.Room,
                    date = localTime.ToString("yyyy-MM-dd"),
                    startTime = localTime.ToString("HH:mm"),
                    endTime = localTime.AddMinutes(r.DurationMinutes).ToString("HH:mm"),
                    status = isFuture ? "chưa diễn ra" : (r.ScheduleTime <= nowUtc ? "có mặt" : "chưa diễn ra"),
                    coachNote = isFuture ? string.Empty : (string.IsNullOrWhiteSpace(r.Goal) ? "Buổi tập cá nhân theo mục tiêu" : $"Mục tiêu: {r.Goal}"),
                    assessment = ptAsmObj,
                    type = "pt"
                };
            }).ToList();

            var allSessionItems = classItems.Concat(ptItems).OrderByDescending(x => x.date).ThenByDescending(x => x.startTime).ToList();

            // Format gate check-in items with synchronized active package
            var gateSub = activeSubs.FirstOrDefault(s => s.Package != null && (s.Package.PackageType == "membership" || s.Package.Name.Contains("Gym", StringComparison.OrdinalIgnoreCase)))
                ?? activeSubs.FirstOrDefault();
            var gatePackageName = gateSub?.Package?.Name ?? "Thẻ hội viên Sport Center";

            var gateItems = gateRecords.Select(g => new
            {
                id = g.Id.ToString(),
                checkInTime = g.CheckInTime,
                checkOutTime = g.CheckOutTime,
                durationMinutes = g.CheckOutTime.HasValue
                    ? Math.Max(0, (int)Math.Round((g.CheckOutTime.Value - g.CheckInTime).TotalMinutes))
                    : (int?)null,
                gate = "Cổng chính Sport Center",
                packageName = gatePackageName,
                status = g.CheckOutTime.HasValue ? "CHECKED_OUT" : "APPROVED"
            }).ToList();

            // Calculate metrics
            var attendedCount = allSessionItems.Count(s => s.status == "có mặt");
            var absentCount = allSessionItems.Count(s => s.status == "vắng");
            var lateCount = allSessionItems.Count(s => s.status == "đi muộn");
            var completedOrPastCount = allSessionItems.Count(s => s.status != "chưa diễn ra");
            double? attendanceRate = completedOrPastCount > 0
                ? Math.Round((double)attendedCount / completedOrPastCount * 100, 0)
                : null;

            var totalGateMinutes = gateItems.Where(g => g.durationMinutes.HasValue).Sum(g => g.durationMinutes!.Value);
            var totalHours = Math.Round((double)totalGateMinutes / 60, 1);

            // Active packages for UI synchronization
            var activePackagesDto = activeSubs.Select(s => new
            {
                id = s.Id.ToString(),
                packageName = s.Package?.Name ?? s.PackageId ?? "Gói tập",
                packageType = s.Package?.PackageType ?? "sport",
                startDate = s.StartDate.ToString("yyyy-MM-dd"),
                endDate = s.EndDate.ToString("yyyy-MM-dd"),
                daysLeft = Math.Max(0, (int)Math.Ceiling((s.EndDate - DateTime.UtcNow).TotalDays))
            }).ToList();

            var formattedAssessments = assessmentRows.Select(a => new
            {
                id = a.Id.ToString(),
                sessionId = a.SessionId?.ToString() ?? string.Empty,
                coachId = a.CoachId.ToString(),
                completion = a.Completion,
                metrics = ParseMetricsJson(a.MetricsJson),
                comment = a.Comment ?? string.Empty,
                nextStep = a.NextStep ?? string.Empty,
                createdAt = a.CreatedAt.ToString("o")
            }).ToList();

            return Results.Ok(new
            {
                summary = new
                {
                    attendanceRate,
                    totalSessions = allSessionItems.Count,
                    attendedCount,
                    absentCount,
                    lateCount,
                    gateCheckInsCount = gateItems.Count,
                    currentStreak = Math.Min(attendedCount + gateItems.Count, 7),
                    totalHoursTrained = totalHours > 0 ? totalHours : (attendedCount * 1.5),
                    activePackages = activePackagesDto
                },
                sessions = allSessionItems,
                gateCheckIns = gateItems,
                activePackages = activePackagesDto,
                assessments = formattedAssessments
            });
        })
        .WithTags("Member Portal")
        .WithSummary("Get member attendance history (classes, PT sessions, gate check-ins, and statistics)");

        group.MapGet("/assessments", async (HttpContext context, SmartGymDbContext db) =>
        {
            var userIdStr = GetUserId(context);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var memberGuid))
            {
                return Results.Unauthorized();
            }

            var rows = await db.Database.SqlQueryRaw<MemberFullAssessmentRow>(@"
                SELECT ca.id AS ""Id"",
                       ca.session_id AS ""SessionId"",
                       ca.coach_id AS ""CoachId"",
                       ca.completion AS ""Completion"",
                       ca.metrics_json::text AS ""MetricsJson"",
                       ca.comment AS ""Comment"",
                       ca.next_step AS ""NextStep"",
                       ca.created_at AS ""CreatedAt"",
                       COALESCE(c.class_name, 'Buổi tập với HLV') AS ""ClassName"",
                       COALESCE(u.full_name, 'Huấn luyện viên') AS ""CoachName"",
                       COALESCE(u.avatar_url, '') AS ""CoachAvatar"",
                       COALESCE(s.name, 'Thể thao') AS ""SportName"",
                       c.schedule_time AS ""ScheduleTime""
                FROM coach_assessments ca
                LEFT JOIN classes c ON c.id = ca.session_id
                LEFT JOIN sports s ON s.id = c.sport_id
                LEFT JOIN coaches co ON co.id = ca.coach_id
                LEFT JOIN users u ON u.id = co.user_id
                WHERE ca.member_id = {0}
                ORDER BY ca.created_at DESC", memberGuid).ToListAsync();

            return Results.Ok(rows.Select(r => new
            {
                id = r.Id.ToString(),
                sessionId = r.SessionId?.ToString() ?? string.Empty,
                coachId = r.CoachId.ToString(),
                coachName = r.CoachName,
                coachAvatar = r.CoachAvatar,
                className = r.ClassName,
                sportName = r.SportName,
                scheduleTime = r.ScheduleTime,
                completion = r.Completion,
                metrics = ParseMetrics(r.MetricsJson),
                comment = r.Comment ?? string.Empty,
                nextStep = r.NextStep ?? string.Empty,
                createdAt = r.CreatedAt.ToString("o")
            }));
        })
        .WithTags("Member Portal")
        .WithSummary("Get member evaluation and progress assessments by coaches");
    }

    private static object ParseMetrics(string? rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson)) return Array.Empty<object>();
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<object>(rawJson) ?? Array.Empty<object>();
        }
        catch
        {
            return Array.Empty<object>();
        }
    }

    private static string NormalizeAttendanceStatus(string raw)
    {
        var s = (raw ?? "").Trim().ToLower();
        if (s == "có mặt" || s == "present" || s == "attended" || s == "hoàn thành") return "có mặt";
        if (s == "vắng" || s == "absent" || s == "missed") return "vắng";
        if (s == "đi muộn" || s == "late") return "đi muộn";
        if (s == "chưa diễn ra" || s == "upcoming") return "chưa diễn ra";
        return "chưa điểm danh";
    }

    private sealed class MemberAssessmentDbRow
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public Guid CoachId { get; set; }
        public int Completion { get; set; }
        public string? MetricsJson { get; set; }
        public string? Comment { get; set; }
        public string? NextStep { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    private sealed class MemberFullAssessmentRow
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public Guid CoachId { get; set; }
        public int Completion { get; set; }
        public string? MetricsJson { get; set; }
        public string? Comment { get; set; }
        public string? NextStep { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string CoachName { get; set; } = string.Empty;
        public string CoachAvatar { get; set; } = string.Empty;
        public string SportName { get; set; } = string.Empty;
        public DateTime? ScheduleTime { get; set; }
    }

    private sealed class MemberClassAttendanceRow
    {
        public Guid SessionId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Sport { get; set; } = string.Empty;
        public Guid? SportId { get; set; }
        public Guid? SubscriptionId { get; set; }
        public string Room { get; set; } = string.Empty;
        public DateTime ScheduleTime { get; set; }
        public int DurationMinutes { get; set; }
        public string CoachName { get; set; } = string.Empty;
        public string CoachAvatar { get; set; } = string.Empty;
        public string AttendanceStatus { get; set; } = string.Empty;
        public string CoachNote { get; set; } = string.Empty;
    }

    private sealed class MemberPtAttendanceRow
    {
        public Guid SessionId { get; set; }
        public string Sport { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public DateTime ScheduleTime { get; set; }
        public int DurationMinutes { get; set; }
        public string CoachName { get; set; } = string.Empty;
        public string CoachAvatar { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
