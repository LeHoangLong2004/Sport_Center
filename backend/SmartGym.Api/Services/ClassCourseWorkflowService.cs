using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.DTOs.ClassScheduling;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Services;

public sealed class ClassCourseWorkflowService(SmartGymDbContext db, ClassSchedulePolicy schedulePolicy)
{
    private static readonly TimeSpan EnrollmentHoldDuration = TimeSpan.FromMinutes(30);

    public async Task<(CreateClassCourseResult? Result, string? Error)> CreateAsync(
        CreateClassCourseRequest request,
        Guid actorId,
        Guid coachId,
        bool approveImmediately)
    {
        if (request.SportId == Guid.Empty || request.FacilityId == Guid.Empty || coachId == Guid.Empty)
            return (null, "Môn học, phòng tập và huấn luyện viên là bắt buộc.");
        if (string.IsNullOrWhiteSpace(request.ClassName) || request.ClassName.Trim().Length > 255)
            return (null, "Tên lớp là bắt buộc và không được vượt quá 255 ký tự.");
        if (request.Capacity is < 1 or > 500)
            return (null, "Sức chứa phải từ 1 đến 500.");

        var preview = schedulePolicy.Preview(request.Schedule, DateTimeOffset.UtcNow);
        if (!preview.IsValid)
            return (null, string.Join(" ", preview.Errors));

        var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
        var price = await FindActivePriceAsync(request.SportId, today);
        if (price == null)
            return (null, "Bộ môn chưa có bảng giá hiệu lực. Vui lòng yêu cầu Manager cấu hình giá trước khi tạo lớp.");
        var courseFee = price.PricePerSession * preview.TotalSessions;

        var coachCanTeach = await db.Database.SqlQueryRaw<int>(
            "SELECT 1 AS \"Value\" FROM coach_sports WHERE coach_id = {0} AND sport_id = {1}", coachId, request.SportId).AnyAsync();
        if (!coachCanTeach)
            return (null, "Huấn luyện viên chưa được phân công cho môn học này.");

        var status = approveImmediately ? "approved" : "pending";
        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            if (approveImmediately)
            {
                var conflict = await FindConflictAsync(coachId, request.FacilityId, request.Capacity, preview.Sessions);
                if (conflict != null)
                {
                    await transaction.RollbackAsync();
                    return (null, conflict);
                }
            }

            var courseId = Guid.NewGuid();
            var endDate = preview.CalculatedEndDate!.Value;
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO class_courses
                    (id, sport_id, coach_id, facility_id, class_name, schedule_type, start_date, start_time,
                     end_mode, end_date, weeks, total_sessions, duration_minutes, capacity, fee, approval_status, created_by)
                VALUES
                    ({courseId}, {request.SportId}, {coachId}, {request.FacilityId}, {request.ClassName.Trim()},
                     {request.Schedule.ScheduleType.Trim().ToUpperInvariant()}, {request.Schedule.StartDate}, {request.Schedule.StartTime},
                     {(request.Schedule.ScheduleType.Trim().ToUpperInvariant() == "RECURRING" ? "BY_WEEKS" : "ONE_TIME")}, {endDate}, {request.Schedule.Weeks}, {preview.TotalSessions},
                     {request.Schedule.DurationMinutes}, {request.Capacity}, {courseFee}, {status}, {actorId})
                """);

            foreach (var session in preview.Sessions)
            {
                var sessionStatus = approveImmediately ? "scheduled" : "planned";
                await db.Database.ExecuteSqlInterpolatedAsync($"""
                    INSERT INTO class_sessions
                        (id, course_id, session_number, start_at, end_at, actual_facility_id, actual_coach_id, status)
                    VALUES
                        ({Guid.NewGuid()}, {courseId}, {session.SessionNumber}, {session.StartAt.UtcDateTime}, {session.EndAt.UtcDateTime},
                         {request.FacilityId}, {coachId}, {sessionStatus})
                    """);
            }

            var auditAction = approveImmediately ? "course_created_approved" : "course_proposed";
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO class_audit_logs (course_id, actor_id, action, after_data)
                VALUES ({courseId}, {actorId}, {auditAction},
                        jsonb_build_object('total_sessions', {preview.TotalSessions}, 'approval_status', {status}))
                """);

            await transaction.CommitAsync();
            return (new CreateClassCourseResult(courseId, status, preview.TotalSessions, price.PricePerSession, courseFee), null);
        }
        catch (Exception exception)
        {
            await transaction.RollbackAsync();
            return (null, "Không thể tạo khóa học: " + exception.Message);
        }
    }

    public async Task<(bool Success, string? Error)> ApproveAsync(Guid courseId, Guid actorId)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var courseRows = await db.Database.SqlQueryRaw<CourseRow>(
                @"SELECT id, sport_id AS ""SportId"", total_sessions AS ""TotalSessions"", capacity, coach_id, facility_id, approval_status FROM class_courses WHERE id = {0} FOR UPDATE", courseId).ToListAsync();
            var course = courseRows.SingleOrDefault();
            if (course == null || !string.Equals(course.ApprovalStatus, "pending", StringComparison.OrdinalIgnoreCase))
                return (false, "Đề xuất không tồn tại hoặc không còn ở trạng thái chờ duyệt.");

            var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            var effectivePrice = await FindActivePriceAsync(course.SportId, effectiveDate);
            if (effectivePrice == null)
                return (false, "Bộ môn chưa có bảng giá hiệu lực. Vui lòng cấu hình giá trước khi duyệt khóa học.");

            var sessions = await db.Database.SqlQueryRaw<SessionRow>(
                @"SELECT id, session_number, start_at, end_at FROM class_sessions WHERE course_id = {0} ORDER BY session_number", courseId).ToListAsync();
            var preview = sessions.Select(s => new ScheduledSessionPreview(
                s.SessionNumber,
                new DateTimeOffset(DateTime.SpecifyKind(s.StartAt, DateTimeKind.Utc)),
                new DateTimeOffset(DateTime.SpecifyKind(s.EndAt, DateTimeKind.Utc)))).ToList();
            var conflict = await FindConflictAsync(course.CoachId, course.FacilityId, course.Capacity, preview, courseId);
            if (conflict != null)
            {
                await transaction.RollbackAsync();
                return (false, conflict);
            }

            var lockedFee = effectivePrice.PricePerSession * Math.Max(1, course.TotalSessions);
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_courses SET fee = {lockedFee}, approval_status = 'approved', updated_at = now() WHERE id = {courseId}");
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_sessions SET status = 'scheduled', updated_at = now() WHERE course_id = {courseId}");
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO class_audit_logs (course_id, actor_id, action) VALUES ({courseId}, {actorId}, 'course_approved')");
            await transaction.CommitAsync();
            return (true, null);
        }
        catch (Exception exception)
        {
            await transaction.RollbackAsync();
            return (false, "Không thể duyệt đề xuất: " + exception.Message);
        }
    }

    public async Task<(EnrollClassCourseResult? Result, string? Error)> EnrollAsync(
        Guid courseId,
        Guid userId,
        EnrollClassCourseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey) || request.IdempotencyKey.Length > 128)
            return (null, "Idempotency-Key là bắt buộc và không được vượt quá 128 ký tự.");

        await using var transaction = await db.Database.BeginTransactionAsync();
        try
        {
            var existingRows = await db.Database.SqlQueryRaw<EnrollmentRow>(
                "SELECT id, course_id, status, quoted_amount, held_until FROM course_enrollments WHERE user_id = {0} AND idempotency_key = {1} FOR UPDATE",
                userId, request.IdempotencyKey.Trim()).ToListAsync();
            var existing = existingRows.SingleOrDefault();
            if (existing != null)
            {
                await transaction.CommitAsync();
                return (new EnrollClassCourseResult(existing.CourseId, existing.Id, null, existing.Status, existing.QuotedAmount, existing.HeldUntil), null);
            }

            var courseRows = await db.Database.SqlQueryRaw<CourseEnrollmentRow>(
                "SELECT id, sport_id AS \"SportId\", total_sessions AS \"TotalSessions\", capacity, seats_taken, fee, approval_status, start_date FROM class_courses WHERE id = {0} FOR UPDATE", courseId).ToListAsync();
            var course = courseRows.SingleOrDefault();
            if (course == null || !string.Equals(course.ApprovalStatus, "approved", StringComparison.OrdinalIgnoreCase))
                return (null, "Khóa học không tồn tại hoặc chưa sẵn sàng để đăng ký.");
            var today = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
            if (course.StartDate < today)
                return (null, "Khóa học đã bắt đầu hoặc đã kết thúc, không thể đăng ký.");

            var releasedSeats = await db.Database.SqlQueryRaw<CountRow>(
                "UPDATE course_enrollments SET status = 'expired', updated_at = now() WHERE course_id = {0} AND status = 'held' AND held_until <= now() RETURNING 1 AS \"Value\"",
                courseId).ToListAsync();
            if (releasedSeats.Count > 0)
            {
                await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_courses SET seats_taken = GREATEST(0, seats_taken - {releasedSeats.Count}), updated_at = now() WHERE id = {courseId}");
                course.SeatsTaken = Math.Max(0, course.SeatsTaken - releasedSeats.Count);
            }

            var activeEnrollmentCount = await db.Database.SqlQueryRaw<CountRow>(
                "SELECT COUNT(*)::int AS \"Value\" FROM course_enrollments WHERE course_id = {0} AND (status = 'confirmed' OR (status = 'held' AND held_until > now()))",
                courseId).SingleAsync();
            if (activeEnrollmentCount.Value == 0)
            {
                var currentPrice = await FindActivePriceAsync(course.SportId, today);
                if (currentPrice == null)
                    return (null, "Bộ môn chưa có bảng giá hiệu lực. Vui lòng yêu cầu Manager cấu hình giá trước khi đăng ký.");

                course.Fee = currentPrice.PricePerSession * Math.Max(1, course.TotalSessions);
                await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_courses SET fee = {course.Fee}, updated_at = now() WHERE id = {courseId}");
            }


            var activeEnrollmentRows = await db.Database.SqlQueryRaw<EnrollmentRow>(
                "SELECT id, course_id, status, quoted_amount, held_until FROM course_enrollments WHERE course_id = {0} AND user_id = {1} AND status IN ('held', 'confirmed') FOR UPDATE",
                courseId, userId).ToListAsync();
            var activeEnrollment = activeEnrollmentRows.SingleOrDefault();
            if (activeEnrollment != null)
                return (new EnrollClassCourseResult(courseId, activeEnrollment.Id, null, activeEnrollment.Status, activeEnrollment.QuotedAmount, activeEnrollment.HeldUntil), null);

            var existingWaitlistRows = await db.Database.SqlQueryRaw<WaitlistRow>(
                "SELECT id, status FROM class_course_waitlist WHERE course_id = {0} AND user_id = {1} AND status IN ('waiting', 'offered') FOR UPDATE",
                courseId, userId).ToListAsync();
            var existingWaitlist = existingWaitlistRows.SingleOrDefault();
            if (existingWaitlist != null)
                return (new EnrollClassCourseResult(courseId, null, existingWaitlist.Id, existingWaitlist.Status, course.Fee, null), null);

            if (course.SeatsTaken >= course.Capacity)
            {
                var waitlistId = Guid.NewGuid();
                await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO class_course_waitlist (id, course_id, user_id, status) VALUES ({waitlistId}, {courseId}, {userId}, 'waiting')");
                await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO class_audit_logs (course_id, actor_id, action) VALUES ({courseId}, {userId}, 'course_waitlisted')");
                await transaction.CommitAsync();
                return (new EnrollClassCourseResult(courseId, null, waitlistId, "waiting", course.Fee, null), null);
            }

            var enrollmentId = Guid.NewGuid();
            var heldUntil = DateTimeOffset.UtcNow.Add(EnrollmentHoldDuration);
            await db.Database.ExecuteSqlInterpolatedAsync($"UPDATE class_courses SET seats_taken = seats_taken + 1, updated_at = now() WHERE id = {courseId} AND seats_taken < capacity");
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO course_enrollments (id, course_id, user_id, status, quoted_amount, idempotency_key, held_until) VALUES ({enrollmentId}, {courseId}, {userId}, 'held', {course.Fee}, {request.IdempotencyKey.Trim()}, {heldUntil.UtcDateTime})");
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO class_session_enrollments (session_id, enrollment_id) SELECT id, {enrollmentId} FROM class_sessions WHERE course_id = {courseId} AND status IN ('scheduled', 'rescheduled')");
            await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO class_audit_logs (course_id, actor_id, action, correlation_id) VALUES ({courseId}, {userId}, 'course_hold_created', {request.IdempotencyKey.Trim()})");
            await transaction.CommitAsync();
            return (new EnrollClassCourseResult(courseId, enrollmentId, null, "held", course.Fee, heldUntil), null);
        }
        catch (Exception exception)
        {
            await transaction.RollbackAsync();
            return (null, "Không thể đăng ký khóa học: " + exception.Message);
        }
    }

    private async Task<string?> FindConflictAsync(Guid coachId, Guid facilityId, int requestedCapacity, IReadOnlyList<ScheduledSessionPreview> sessions, Guid? excludedCourseId = null)
    {
        var settingsRows = await db.Database.SqlQueryRaw<FacilitySettingsRow>(
            "SELECT allow_concurrent_classes AS \"AllowConcurrentClasses\", max_concurrent_classes AS \"MaxConcurrentClasses\", total_capacity AS \"TotalCapacity\" FROM facilities WHERE id = {0}", facilityId).ToListAsync();
        var settings = settingsRows.SingleOrDefault();
        if (settings is null) return "Không tìm thấy cấu hình phòng tập.";
        var facilitySettings = new SmartGym.Domain.Entities.FacilitySchedulingSettings(
            settings.AllowConcurrentClasses, Math.Max(1, settings.MaxConcurrentClasses), settings.TotalCapacity);

        foreach (var session in sessions)
        {
            var coachConflictRows = await db.Database.SqlQueryRaw<ConflictRow>(
                """
                SELECT cs.session_number AS "SessionNumber", cc.class_name AS "ClassName"
                  FROM class_sessions cs INNER JOIN class_courses cc ON cc.id = cs.course_id
                  WHERE cc.approval_status = 'approved' AND cs.status IN ('scheduled', 'rescheduled')
                    AND cs.course_id <> {0}
                    AND cs.actual_coach_id = {1}
                    AND cs.start_at < {2} AND cs.end_at > {3}
                  LIMIT 1
                """,
                excludedCourseId ?? Guid.Empty, coachId, session.EndAt.UtcDateTime, session.StartAt.UtcDateTime).ToListAsync();
            var coachConflict = coachConflictRows.FirstOrDefault();
            if (coachConflict != null)
                return $"Buổi {session.SessionNumber} bị trùng HLV với lớp '{coachConflict.ClassName}' (buổi {coachConflict.SessionNumber}).";

            var facilityRows = await db.Database.SqlQueryRaw<FacilityOccupancyRow>(
                """
                SELECT COUNT(*)::int AS "ClassCount", COALESCE(SUM(cc.capacity), 0)::int AS "Capacity",
                       MIN(cc.class_name) AS "FirstConflictName"
                  FROM class_sessions cs INNER JOIN class_courses cc ON cc.id = cs.course_id
                  WHERE cc.approval_status = 'approved' AND cs.status IN ('scheduled', 'rescheduled')
                    AND cs.course_id <> {0} AND cs.actual_facility_id = {1}
                    AND cs.start_at < {2} AND cs.end_at > {3}
                """,
                excludedCourseId ?? Guid.Empty, facilityId, session.EndAt.UtcDateTime, session.StartAt.UtcDateTime).ToListAsync();
            var occupancy = facilityRows.Single();
            var facilityConflict = FacilityConflictValidator.Validate(
                facilitySettings, requestedCapacity, occupancy.ClassCount, occupancy.Capacity, occupancy.FirstConflictName);
            if (facilityConflict != null)
                return $"Buổi {session.SessionNumber}: {facilityConflict}";
        }
        return null;
    }

    private async Task<PricingRow?> FindActivePriceAsync(Guid sportId, DateOnly onDate)
    {
        var rows = await db.Database.SqlQueryRaw<PricingRow>(
            """
            SELECT price_per_session AS "PricePerSession"
            FROM sport_class_pricing
            WHERE sport_id = {0}
              AND is_active = TRUE
              AND effective_from <= {1}
              AND (effective_to IS NULL OR effective_to >= {1})
            ORDER BY effective_from DESC, created_at DESC
            LIMIT 1
            """, sportId, onDate).ToListAsync();
        return rows.SingleOrDefault();
    }

    private sealed class CourseRow { public Guid Id { get; set; } public Guid SportId { get; set; } public int TotalSessions { get; set; } public int Capacity { get; set; } public Guid CoachId { get; set; } public Guid FacilityId { get; set; } public string ApprovalStatus { get; set; } = ""; }
    private sealed class SessionRow { public Guid Id { get; set; } public int SessionNumber { get; set; } public DateTime StartAt { get; set; } public DateTime EndAt { get; set; } }
    private sealed class ConflictRow { public int SessionNumber { get; set; } public string ClassName { get; set; } = ""; }
    private sealed class EnrollmentRow { public Guid Id { get; set; } public Guid CourseId { get; set; } public string Status { get; set; } = ""; public decimal QuotedAmount { get; set; } public DateTimeOffset? HeldUntil { get; set; } }
    private sealed class CourseEnrollmentRow { public Guid Id { get; set; } public Guid SportId { get; set; } public int TotalSessions { get; set; } public int Capacity { get; set; } public int SeatsTaken { get; set; } public decimal Fee { get; set; } public string ApprovalStatus { get; set; } = ""; public DateOnly StartDate { get; set; } }
    private sealed class WaitlistRow { public Guid Id { get; set; } public string Status { get; set; } = ""; }
    private sealed class CountRow { public int Value { get; set; } }
    private sealed class PricingRow { public decimal PricePerSession { get; set; } }
    private sealed class FacilitySettingsRow { public bool AllowConcurrentClasses { get; set; } public int MaxConcurrentClasses { get; set; } public int? TotalCapacity { get; set; } }
    private sealed class FacilityOccupancyRow { public int ClassCount { get; set; } public int Capacity { get; set; } public string? FirstConflictName { get; set; } }
}
