using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Infrastructure.Context;

/// <summary>
/// Reads Flow 5 context from existing tables only. This service does not create or
/// mutate any database object and intentionally excludes direct contact PII.
/// </summary>
public sealed class Flow5ContextService : IFlow5ContextService
{
    private readonly SmartGymDbContext _db;

    public Flow5ContextService(SmartGymDbContext db)
    {
        _db = db;
    }

    public async Task<Flow5ContextBuildResult> BuildAsync(
        Flow5CoachContext coach,
        Flow5TargetDto target,
        Guid sportId,
        CancellationToken cancellationToken = default)
    {
        if (coach.CoachId == Guid.Empty || sportId == Guid.Empty || target.Id == Guid.Empty)
            return Flow5ContextBuildResult.Invalid("Coach, môn học hoặc target không hợp lệ.");

        var sportName = await FindSportNameAsync(sportId, cancellationToken);
        if (sportName is null)
            return Flow5ContextBuildResult.NotFound("Không tìm thấy môn học được chọn.");

        var coachProfile = await _db.CoachProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == coach.UserId, cancellationToken);

        var context = new Flow5WorkoutContextDto
        {
            Coach = new Flow5ContextCoachDto
            {
                CoachId = coach.CoachId,
                Specialties = coachProfile?.Specialties,
                Certifications = coachProfile?.Certifications,
                ExperienceYears = coachProfile?.ExperienceYears
            },
            RequestedSport = new Flow5SportContextDto { Id = sportId, Name = sportName },
            Target = new Flow5TargetDto { Type = target.Type, Id = target.Id }
        };

        if (string.Equals(target.Type, Flow5TargetTypes.Member, StringComparison.OrdinalIgnoreCase))
            return await BuildMemberContextAsync(context, coach, target.Id, cancellationToken);

        if (string.Equals(target.Type, Flow5TargetTypes.Class, StringComparison.OrdinalIgnoreCase))
            return await BuildClassContextAsync(context, coach, target.Id, cancellationToken);

        return Flow5ContextBuildResult.Invalid("Target phải là member hoặc class.");
    }

    private async Task<Flow5ContextBuildResult> BuildMemberContextAsync(
        Flow5WorkoutContextDto context,
        Flow5CoachContext coach,
        Guid memberId,
        CancellationToken cancellationToken)
    {
        var member = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == memberId && u.Status, cancellationToken);
        if (member is null)
            return Flow5ContextBuildResult.NotFound("Không tìm thấy học viên đang hoạt động.");

        var classRows = await FindCoachClassesForMemberAsync(
            coach,
            memberId,
            cancellationToken);
        var latestMetric = await _db.BodyMetrics
            .AsNoTracking()
            .Where(metric => metric.UserId == memberId)
            .OrderByDescending(metric => metric.RecordedAt)
            .FirstOrDefaultAsync(cancellationToken);

        context.Member = new Flow5MemberContextDto
        {
            MemberId = memberId,
            Age = CalculateAge(member.DateOfBirth),
            Gender = member.Gender,
            HasPtEnrollment = await HasActivePtEnrollmentAsync(coach, memberId, cancellationToken),
            AssignedClassCount = classRows.Count,
            LatestBodyMetrics = latestMetric is null
                ? null
                : new Flow5BodyMetricContextDto
                {
                    Weight = latestMetric.Weight,
                    Height = latestMetric.Height,
                    BodyFat = latestMetric.BodyFat,
                    MuscleMass = latestMetric.MuscleMass,
                    Bmi = latestMetric.Bmi,
                    RecordedAt = latestMetric.RecordedAt
                }
        };

        context.Attendance = await BuildAttendanceAsync(
            classRows.Select(row => row.Id).ToHashSet(),
            memberId,
            cancellationToken);
        context.RecentPlans = await LoadRecentPlansAsync(memberId, cancellationToken);

        return Flow5ContextBuildResult.Success(context);
    }

    private async Task<Flow5ContextBuildResult> BuildClassContextAsync(
        Flow5WorkoutContextDto context,
        Flow5CoachContext coach,
        Guid classId,
        CancellationToken cancellationToken)
    {
        var classRow = await FindCoachClassAsync(coach, classId, cancellationToken);
        if (classRow is null)
            return Flow5ContextBuildResult.NotFound("Không tìm thấy lớp học thuộc phạm vi của Coach.");

        var memberIds = await _db.Database.SqlQueryRaw<Guid>(
                @"SELECT DISTINCT user_id AS ""Value""
                  FROM class_bookings
                  WHERE class_id = {0}
                    AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                classId)
            .ToListAsync(cancellationToken);

        context.Class = new Flow5ClassContextDto
        {
            ClassId = classRow.Id,
            SportId = classRow.SportId,
            ClassName = classRow.ClassName,
            ScheduleTime = classRow.ScheduleTime,
            DurationMinutes = classRow.DurationMinutes,
            Capacity = classRow.Capacity,
            EnrolledCount = memberIds.Count,
            ApprovalStatus = classRow.ApprovalStatus
        };
        context.Attendance = await BuildAttendanceAsync(
            new HashSet<Guid> { classId },
            null,
            cancellationToken);

        return Flow5ContextBuildResult.Success(context);
    }

    private async Task<List<Flow5PlanHistoryDto>> LoadRecentPlansAsync(
        Guid memberId,
        CancellationToken cancellationToken)
    {
        var records = await _db.HomeworkProgresses
            .AsNoTracking()
            .Include(progress => progress.Plan)
            .Where(progress => progress.MemberId == memberId && progress.Plan != null)
            .OrderByDescending(progress => progress.AssignedDate)
            .Take(10)
            .ToListAsync(cancellationToken);

        return records.Select(progress => new Flow5PlanHistoryDto
        {
            PlanId = progress.PlanId,
            PlanName = progress.Plan?.PlanName ?? string.Empty,
            Status = progress.Status,
            Goal = progress.Plan?.Goal,
            DurationMinutes = progress.Plan?.DurationMinutes,
            ProgressPct = progress.ProgressPct ?? 0,
            AssignedDate = progress.AssignedDate,
            CompletedAt = progress.CompletedAt
        }).ToList();
    }

    private async Task<List<ClassContextRow>> FindCoachClassesForMemberAsync(
        Flow5CoachContext coach,
        Guid memberId,
        CancellationToken cancellationToken)
    {
        return await _db.Database.SqlQueryRaw<ClassContextRow>(
                @"SELECT DISTINCT c.id AS ""Id"", c.sport_id AS ""SportId"",
                         c.class_name AS ""ClassName"", c.schedule_time AS ""ScheduleTime"",
                         c.duration_minutes AS ""DurationMinutes"", c.capacity AS ""Capacity"",
                         c.current_enrolled AS ""CurrentEnrolled"",
                         COALESCE(c.approval_status, 'approved') AS ""ApprovalStatus""
                  FROM classes c
                  INNER JOIN class_bookings b ON b.class_id = c.id
                  WHERE b.user_id = {0}
                    AND c.status = TRUE
                    AND LOWER(COALESCE(c.approval_status, 'approved')) <> 'rejected'
                    AND (c.coach_id = {1} OR c.coach_id = {2})
                    AND LOWER(COALESCE(b.status, '')) NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                memberId,
                coach.CoachId,
                coach.UserId)
            .ToListAsync(cancellationToken);
    }

    private async Task<ClassContextRow?> FindCoachClassAsync(
        Flow5CoachContext coach,
        Guid classId,
        CancellationToken cancellationToken)
    {
        var rows = await _db.Database.SqlQueryRaw<ClassContextRow>(
                @"SELECT c.id AS ""Id"", c.sport_id AS ""SportId"",
                         c.class_name AS ""ClassName"", c.schedule_time AS ""ScheduleTime"",
                         c.duration_minutes AS ""DurationMinutes"", c.capacity AS ""Capacity"",
                         c.current_enrolled AS ""CurrentEnrolled"",
                         COALESCE(c.approval_status, 'approved') AS ""ApprovalStatus""
                  FROM classes c
                  WHERE c.id = {0}
                    AND c.status = TRUE
                    AND LOWER(COALESCE(c.approval_status, 'approved')) <> 'rejected'
                    AND (c.coach_id = {1} OR c.coach_id = {2})
                  LIMIT 1",
                classId,
                coach.CoachId,
                coach.UserId)
            .ToListAsync(cancellationToken);

        return rows.FirstOrDefault();
    }

    private async Task<bool> HasActivePtEnrollmentAsync(
        Flow5CoachContext coach,
        Guid memberId,
        CancellationToken cancellationToken)
    {
        try
        {
            var rows = await _db.Database.SqlQueryRaw<bool>(
                    @"SELECT EXISTS (
                        SELECT 1 FROM pt_enrollments p
                        WHERE p.user_id = {0}
                          AND (p.coach_id = {1} OR p.coach_id = {2})
                          AND LOWER(COALESCE(p.payment_status, '')) = 'completed'
                          AND p.start_date <= CURRENT_DATE
                          AND p.end_date >= CURRENT_DATE
                    ) AS ""Value""",
                    memberId,
                    coach.CoachId,
                    coach.UserId)
                .ToListAsync(cancellationToken);
            return rows.FirstOrDefault();
        }
        catch (Exception)
        {
            return false;
        }
    }

    private async Task<Flow5AttendanceContextDto> BuildAttendanceAsync(
        HashSet<Guid> classIds,
        Guid? memberId,
        CancellationToken cancellationToken)
    {
        if (classIds.Count == 0)
            return new Flow5AttendanceContextDto();

        try
        {
            var rows = await _db.Database.SqlQueryRaw<AttendanceContextRow>(
                    "SELECT session_id AS \"SessionId\", member_id AS \"MemberId\", status AS \"Status\" FROM class_attendance_records")
                .ToListAsync(cancellationToken);
            var filtered = rows.Where(row => classIds.Contains(row.SessionId)
                && (!memberId.HasValue || row.MemberId == memberId.Value)).ToList();
            var present = filtered.Count(row => IsPresent(row.Status));
            var noShow = filtered.Count(row => string.Equals(row.Status, "no_show", StringComparison.OrdinalIgnoreCase)
                || string.Equals(row.Status, "absent", StringComparison.OrdinalIgnoreCase));

            return new Flow5AttendanceContextDto
            {
                TotalRecords = filtered.Count,
                PresentCount = present,
                NoShowCount = noShow,
                AttendanceRate = filtered.Count == 0 ? null : Math.Round(present * 100m / filtered.Count, 2)
            };
        }
        catch (Exception)
        {
            return new Flow5AttendanceContextDto();
        }
    }

    private async Task<string?> FindSportNameAsync(Guid sportId, CancellationToken cancellationToken)
    {
        var rows = await _db.Database.SqlQueryRaw<string>(
                "SELECT name AS \"Value\" FROM sports WHERE id = {0} LIMIT 1",
                sportId)
            .ToListAsync(cancellationToken);
        return rows.FirstOrDefault();
    }

    private static int? CalculateAge(DateTime? dateOfBirth)
    {
        if (!dateOfBirth.HasValue)
            return null;

        var today = DateTime.UtcNow.Date;
        var age = today.Year - dateOfBirth.Value.Year;
        if (dateOfBirth.Value.Date > today.AddYears(-age))
            age--;
        return age is >= 0 and <= 120 ? age : null;
    }

    private static bool IsPresent(string? status) =>
        string.Equals(status, "present", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "attended", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "late", StringComparison.OrdinalIgnoreCase);

    private sealed class ClassContextRow
    {
        public Guid Id { get; set; }
        public Guid SportId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public DateTime ScheduleTime { get; set; }
        public int DurationMinutes { get; set; }
        public int Capacity { get; set; }
        public int CurrentEnrolled { get; set; }
        public string ApprovalStatus { get; set; } = string.Empty;
    }

    private sealed class AttendanceContextRow
    {
        public Guid SessionId { get; set; }
        public Guid MemberId { get; set; }
        public string? Status { get; set; }
    }
}
