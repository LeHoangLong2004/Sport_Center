using System.Globalization;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class CoachScheduleRequestManagerEndpoints
{
    public static void MapCoachScheduleRequestManagerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/manager/coach-schedule-requests")
            .WithTags("Coach Schedule Requests")
            .RequireAuthorization(policy => policy.RequireRole(
                "manager", "admin", "center_manager", "centermanager"));

        group.MapGet("/", async (SmartGymDbContext db, string? status) =>
        {
            var rows = await LoadRequestsAsync(db);
            if (!string.IsNullOrWhiteSpace(status))
                rows = rows.Where(row => string.Equals(row.Status, status, StringComparison.OrdinalIgnoreCase)).ToList();

            return Results.Ok(rows.Select(ToResponse));
        });

        group.MapGet("/available-coaches", async (
            SmartGymDbContext db,
            [FromQuery] string? sessionTime,
            [FromQuery] string? scheduleTime,
            [FromQuery] int? durationMinutes,
            [FromQuery] Guid? excludeCoachId) =>
        {
            DateTime? startUtc = null;
            int effectiveDuration = durationMinutes.GetValueOrDefault(60);
            if (effectiveDuration <= 0) effectiveDuration = 60;

            if (!string.IsNullOrWhiteSpace(scheduleTime) && DateTime.TryParse(scheduleTime, CultureInfo.InvariantCulture, out var dt))
            {
                startUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            }
            else if (TryParseSessionTimeString(sessionTime, out var parsedUtc, out var parsedDur))
            {
                startUtc = parsedUtc;
                if (parsedDur > 0) effectiveDuration = parsedDur;
            }

            if (startUtc == null)
            {
                var allQuery = @"
                    SELECT c.id AS ""Id"", u.full_name AS ""FullName"", c.specialty AS ""Specialty""
                    FROM coaches c
                    JOIN users u ON u.id = c.user_id
                    WHERE ({0}::uuid IS NULL OR c.id <> {0})
                    ORDER BY u.full_name";
                var allCoaches = await db.Database.SqlQueryRaw<AvailableCoachModel>(allQuery, excludeCoachId).ToListAsync();
                return Results.Ok(allCoaches);
            }

            var endUtc = startUtc.Value.AddMinutes(effectiveDuration);

            var sql = @"
                SELECT c.id AS ""Id"", u.full_name AS ""FullName"", c.specialty AS ""Specialty""
                FROM coaches c
                JOIN users u ON u.id = c.user_id
                WHERE ({0}::uuid IS NULL OR c.id <> {0})
                  AND NOT EXISTS (
                      SELECT 1 FROM classes cl
                      WHERE cl.coach_id = c.id
                        AND cl.status = true
                        AND COALESCE(cl.approval_status, 'approved') <> 'rejected'
                        AND cl.schedule_time < {1}
                        AND cl.schedule_time + (COALESCE(cl.duration_minutes, 60) * INTERVAL '1 minute') > {2}
                  )
                ORDER BY u.full_name";

            var coaches = await db.Database.SqlQueryRaw<AvailableCoachModel>(sql, excludeCoachId, endUtc, startUtc).ToListAsync();
            return Results.Ok(coaches);
        });

        group.MapPut("/{id:guid}/approve", async (
            Guid id,
            SmartGymDbContext db,
            IGroupClassRepository classRepository,
            [FromBody] JsonElement body) =>
        {
            var request = (await LoadRequestsAsync(db)).FirstOrDefault(row => row.Id == id);
            if (request is null || !IsPending(request.Status))
                return Results.BadRequest(new { message = "Yêu cầu không tồn tại hoặc đã được xử lý." });

            var managerNote = ReadString(body, "managerNote") ?? "Yêu cầu đã được Manager duyệt.";
            var substituteCoachIdStr = ReadString(body, "substituteCoachId");
            Guid? substituteCoachId = Guid.TryParse(substituteCoachIdStr, out var sid) ? sid : null;

            var result = await ApplyApprovalAsync(db, request, managerNote, substituteCoachId);
            if (!result.Success)
                return Results.BadRequest(new { message = result.Error });

            if (substituteCoachId.HasValue)
            {
                request.SubstituteCoachId = substituteCoachId.Value;
            }

            await NotifyApprovalAsync(classRepository, request, managerNote);
            return Results.Ok(new { message = "Đã duyệt yêu cầu điều chỉnh ca dạy." });
        });

        group.MapPut("/{id:guid}/reject", async (
            Guid id,
            SmartGymDbContext db,
            IGroupClassRepository classRepository,
            [FromBody] JsonElement body) =>
        {
            try
            {
                var request = (await LoadRequestsAsync(db)).FirstOrDefault(row => row.Id == id);
                if (request is null || !IsPending(request.Status))
                    return Results.BadRequest(new { message = "Yêu cầu không tồn tại hoặc đã được xử lý." });

                var managerNote = ReadString(body, "managerNote") ?? "Yêu cầu đã bị Manager từ chối.";
                var affected = await db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE coach_schedule_requests
                    SET status = 'rejected', manager_note = {managerNote}
                    WHERE id = {id} AND LOWER(TRIM(status)) IN ('pending', 'substitute_accepted')");
                if (affected == 0)
                    return Results.BadRequest(new { message = "Yêu cầu đã được xử lý trước đó." });

                await classRepository.NotifyCoachAsync(
                    request.CoachId,
                    "Yêu cầu điều chỉnh ca dạy bị từ chối",
                    managerNote,
                    "schedule_request",
                    id);

                if (request.SubstituteCoachId.HasValue && request.SubstituteCoachId != request.CoachId)
                {
                    await classRepository.NotifyCoachAsync(
                        request.SubstituteCoachId.Value,
                        "Yêu cầu dạy thay bị từ chối",
                        $"Yêu cầu dạy thay cho lớp {request.ClassName} đã bị Quản lý từ chối.",
                        "schedule_request",
                        id);
                }

                return Results.Ok(new { message = "Đã từ chối yêu cầu điều chỉnh ca dạy." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Reject Request Error] {ex}");
                return Results.BadRequest(new { message = $"Không thể từ chối yêu cầu: {ex.Message}" });
            }
        });
    }

    private static async Task<List<ManagerScheduleRequestRow>> LoadRequestsAsync(SmartGymDbContext db)
    {
        return await db.Database.SqlQueryRaw<ManagerScheduleRequestRow>(@"
            SELECT r.id AS ""Id"", r.session_id AS ""SessionId"", r.coach_id AS ""CoachId"",
                   r.substitute_coach_id AS ""SubstituteCoachId"", r.request_type AS ""RequestType"",
                   r.new_date AS ""NewDate"", r.new_time AS ""NewTime"", r.reason AS ""Reason"",
                   r.status AS ""Status"", r.manager_note AS ""ManagerNote"", r.created_at AS ""CreatedAt"",
                   COALESCE(r.class_name, c.class_name, 'Lớp học') AS ""ClassName"",
                   COALESCE(r.sport_name, sp.name, 'Thể hình') AS ""SportName"",
                   COALESCE(r.room_name, fc.name, 'Khu tập luyện') AS ""RoomName"",
                   COALESCE(source_user.full_name, 'Coach') AS ""CoachName"",
                   substitute_user.full_name AS ""SubstituteCoachName"",
                   c.coach_id AS ""CurrentCoachId"", c.facility_id AS ""FacilityId"",
                   c.schedule_time AS ""ScheduleTime"", COALESCE(c.duration_minutes, 60) AS ""DurationMinutes"",
                   COALESCE(r.session_time, TO_CHAR(c.schedule_time, 'YYYY-MM-DD HH24:MI')) AS ""SessionTime""
            FROM coach_schedule_requests r
            LEFT JOIN classes c ON c.id = r.session_id
            LEFT JOIN sports sp ON sp.id = c.sport_id
            LEFT JOIN facilities fc ON fc.id = c.facility_id
            LEFT JOIN coaches source_coach ON source_coach.id = r.coach_id
            LEFT JOIN users source_user ON source_user.id = source_coach.user_id
            LEFT JOIN coaches substitute_coach ON substitute_coach.id = r.substitute_coach_id
            LEFT JOIN users substitute_user ON substitute_user.id = substitute_coach.user_id
            ORDER BY r.created_at DESC").ToListAsync();
    }

    private static async Task<(bool Success, string? Error)> ApplyApprovalAsync(
        SmartGymDbContext db,
        ManagerScheduleRequestRow request,
        string managerNote,
        Guid? substituteCoachIdFromManager = null)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                var type = (request.RequestType ?? string.Empty).Trim().ToLowerInvariant();
                if (type is "dời lịch" or "doi lich" or "reschedule" || type.Contains("dời") || type.Contains("doi"))
                {
                    if (request.SessionId is null)
                        return (false, "Yêu cầu dời lịch chưa gắn với ca dạy hợp lệ.");

                    if (request.NewDate is null || !TryBuildLocalSchedule(request.NewDate.Value, request.NewTime, request.DurationMinutes, out var scheduleTime, out var duration))
                        return (false, "Yêu cầu dời lịch chưa có ngày hoặc khung giờ hợp lệ.");

                    var conflict = await FindScheduleConflictAsync(db, request, scheduleTime, duration, request.CurrentCoachId, request.FacilityId, isSubstitute: false);
                    if (conflict is not null) return (false, conflict);

                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE classes SET schedule_time = {scheduleTime}, duration_minutes = {duration}
                        WHERE id = {request.SessionId.Value}");
                }
                else if (type is "dạy thay" or "day thay" or "substitute" || type.Contains("thay"))
                {
                    var finalSubstituteId = substituteCoachIdFromManager ?? request.SubstituteCoachId;
                    if (finalSubstituteId is null)
                        return (false, "Vui lòng chọn Huấn luyện viên thay thế cho ca dạy này trước khi duyệt.");

                    var effectiveScheduleTime = request.ScheduleTime;
                    var effectiveDuration = request.DurationMinutes > 0 ? request.DurationMinutes : 60;
                    if (effectiveScheduleTime is null && TryParseSessionTimeString(request.SessionTime, out var parsedUtc, out var parsedDur))
                    {
                        effectiveScheduleTime = parsedUtc;
                        effectiveDuration = parsedDur;
                    }

                    if (effectiveScheduleTime.HasValue)
                    {
                        var conflict = await FindScheduleConflictAsync(db, request, effectiveScheduleTime, effectiveDuration, finalSubstituteId, null, isSubstitute: true);
                        if (conflict is not null) return (false, conflict);
                    }

                    if (request.SessionId.HasValue)
                    {
                        await db.Database.ExecuteSqlInterpolatedAsync($@"
                            UPDATE classes SET coach_id = {finalSubstituteId.Value}
                            WHERE id = {request.SessionId.Value}");
                    }

                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE coach_schedule_requests SET substitute_coach_id = {finalSubstituteId.Value}
                        WHERE id = {request.Id}");
                }
                else if (type is "báo vắng" or "bao vang" or "leave" || type.Contains("vắng") || type.Contains("vang"))
                {
                    if (request.SessionId.HasValue)
                    {
                        await db.Database.ExecuteSqlInterpolatedAsync($@"
                            UPDATE classes SET status = false WHERE id = {request.SessionId.Value}");
                    }
                }

                var affected = await db.Database.ExecuteSqlInterpolatedAsync($@"
                    UPDATE coach_schedule_requests
                    SET status = 'approved', manager_note = {managerNote}
                    WHERE id = {request.Id} AND LOWER(TRIM(status)) IN ('pending', 'substitute_accepted')");
                if (affected == 0) return (false, "Yêu cầu đã được xử lý trước đó.");

                await transaction.CommitAsync();
                return (true, (string?)null);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[ApplyApprovalAsync Error] {ex}");
                return (false, (string?)$"Không thể cập nhật lịch dạy: {ex.Message}");
            }
        });
    }

    private static async Task<string?> FindScheduleConflictAsync(
        SmartGymDbContext db,
        ManagerScheduleRequestRow request,
        DateTime? start,
        int duration,
        Guid? coachId,
        Guid? facilityId,
        bool isSubstitute = false)
    {
        if (start is null || coachId is null) return "Không xác định được Coach hoặc thời gian của lớp.";
        var effectiveDuration = duration > 0 ? duration : 60;
        var scheduleStart = DateTime.SpecifyKind(start.Value, DateTimeKind.Utc);
        var end = DateTime.SpecifyKind(start.Value.AddMinutes(effectiveDuration), DateTimeKind.Utc);
        var sessionId = request.SessionId ?? Guid.Empty;

        // Kiểm tra trùng lịch ca dạy của HLV
        var coachConflict = await db.Database.SqlQueryRaw<int>(@"
            SELECT 1 AS ""Value"" FROM classes
            WHERE id <> {0} AND status = true AND COALESCE(approval_status, 'approved') <> 'rejected'
              AND coach_id = {1}
              AND schedule_time < {2}
              AND schedule_time + (COALESCE(duration_minutes, 60) * INTERVAL '1 minute') > {3}
            LIMIT 1", sessionId, coachId.Value, end, scheduleStart).AnyAsync();
        if (coachConflict) return "Coach đã có lịch khác trùng thời gian.";

        // Nếu là dời lịch và có chọn phòng, kiểm tra phòng tập có bị trùng không
        if (!isSubstitute && facilityId.HasValue && facilityId.Value != Guid.Empty)
        {
            var facilityConflict = await db.Database.SqlQueryRaw<int>(@"
                SELECT 1 AS ""Value"" FROM classes
                WHERE id <> {0} AND status = true AND COALESCE(approval_status, 'approved') <> 'rejected'
                  AND facility_id = {1}
                  AND schedule_time < {2}
                  AND schedule_time + (COALESCE(duration_minutes, 60) * INTERVAL '1 minute') > {3}
                LIMIT 1", sessionId, facilityId.Value, end, scheduleStart).AnyAsync();
            if (facilityConflict) return "Phòng tập đã có lịch khác trùng thời gian.";
        }

        return null;
    }

    private static bool TryParseSessionTimeString(string? text, out DateTime utc, out int duration)
    {
        utc = default;
        duration = 60;
        if (string.IsNullOrWhiteSpace(text)) return false;

        var match = System.Text.RegularExpressions.Regex.Match(text, @"(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})\s*(?:-\s*(\d{1,2}:\d{2}))?");
        if (!match.Success) return false;

        if (!DateTime.TryParse(match.Groups[1].Value, out var date)) return false;
        if (!TimeOnly.TryParse(match.Groups[2].Value, out var start)) return false;

        if (match.Groups[3].Success && TimeOnly.TryParse(match.Groups[3].Value, out var end))
        {
            var diff = (int)(end - start).TotalMinutes;
            if (diff > 0) duration = diff;
        }

        var local = DateTime.SpecifyKind(date.Date.Add(start.ToTimeSpan()), DateTimeKind.Unspecified);
        try
        {
            var zone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            utc = TimeZoneInfo.ConvertTimeToUtc(local, zone);
        }
        catch
        {
            utc = DateTime.SpecifyKind(local, DateTimeKind.Utc);
        }
        return true;
    }

    private static bool TryBuildLocalSchedule(DateTime date, string? text, int fallbackDuration, out DateTime utc, out int duration)
    {
        utc = default;
        duration = fallbackDuration;
        var parts = (text ?? string.Empty).Split('-', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
        if (!TimeOnly.TryParse(parts.FirstOrDefault(), CultureInfo.InvariantCulture, out var start)) return false;
        var local = DateTime.SpecifyKind(date.Date.Add(start.ToTimeSpan()), DateTimeKind.Unspecified);
        if (parts.Length > 1 && TimeOnly.TryParse(parts[1], CultureInfo.InvariantCulture, out var end))
        {
            duration = (int)(end - start).TotalMinutes;
            if (duration <= 0) return false;
        }
        var zone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
        utc = TimeZoneInfo.ConvertTimeToUtc(local, zone);
        return true;
    }

    private static async Task NotifyApprovalAsync(IGroupClassRepository repository, ManagerScheduleRequestRow request, string note)
    {
        await repository.NotifyCoachAsync(request.CoachId, "Yêu cầu điều chỉnh ca dạy đã được duyệt", note, "schedule_request", request.Id);
        if (request.SubstituteCoachId is not null && request.SubstituteCoachId != request.CoachId)
            await repository.NotifyCoachAsync(request.SubstituteCoachId.Value, "Bạn được phân công dạy thay", request.ClassName, "schedule_request", request.Id);
        if (request.SessionId is not null)
            await repository.NotifyAffectedMembersAsync(request.SessionId.Value, "Lịch lớp học đã được cập nhật", note);
    }

    private static object ToResponse(ManagerScheduleRequestRow row) => new
    {
        id = row.Id.ToString(), sessionId = row.SessionId?.ToString() ?? "", row.ClassName,
        row.CoachName, coachId = row.CoachId.ToString(), substituteCoachName = row.SubstituteCoachName ?? "",
        substituteCoachId = row.SubstituteCoachId?.ToString() ?? "", requestType = row.RequestType,
        newDate = row.NewDate?.ToString("yyyy-MM-dd") ?? "", newTime = row.NewTime ?? "",
        sessionTime = row.SessionTime ?? (row.ScheduleTime?.ToString("yyyy-MM-dd HH:mm") ?? ""),
        sportName = row.SportName ?? "",
        roomName = row.RoomName ?? "",
        row.Reason, row.Status, managerNote = row.ManagerNote ?? "",
        createdAt = row.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
        scheduleTime = row.ScheduleTime?.ToString("yyyy-MM-dd HH:mm") ?? "",
        durationMinutes = row.DurationMinutes
    };

    private static string? ReadString(JsonElement body, string name) =>
        body.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;

    private static bool IsPending(string? status) =>
        string.Equals(status, "pending", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(status, "substitute_accepted", StringComparison.OrdinalIgnoreCase);

    private sealed class ManagerScheduleRequestRow
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public Guid CoachId { get; set; }
        public Guid? SubstituteCoachId { get; set; }
        public Guid? CurrentCoachId { get; set; }
        public Guid? FacilityId { get; set; }
        public DateTime? ScheduleTime { get; set; }
        public DateTime? NewDate { get; set; }
        public int DurationMinutes { get; set; }
        public string ClassName { get; set; } = "Lớp học";
        public string? SessionTime { get; set; }
        public string? SportName { get; set; }
        public string? RoomName { get; set; }
        public string CoachName { get; set; } = "Coach";
        public string? SubstituteCoachName { get; set; }
        public string RequestType { get; set; } = "dời lịch";
        public string? NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public sealed class AvailableCoachModel
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Specialty { get; set; }
    }
}
