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
            var result = await ApplyApprovalAsync(db, request, managerNote);
            if (!result.Success)
                return Results.BadRequest(new { message = result.Error });

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
                   COALESCE(c.class_name, 'Lớp học') AS ""ClassName"",
                   COALESCE(source_user.full_name, 'Coach') AS ""CoachName"",
                   substitute_user.full_name AS ""SubstituteCoachName"",
                   c.coach_id AS ""CurrentCoachId"", c.facility_id AS ""FacilityId"",
                   c.schedule_time AS ""ScheduleTime"", COALESCE(c.duration_minutes, 60) AS ""DurationMinutes""
            FROM coach_schedule_requests r
            LEFT JOIN classes c ON c.id = r.session_id
            LEFT JOIN coaches source_coach ON source_coach.id = r.coach_id
            LEFT JOIN users source_user ON source_user.id = source_coach.user_id
            LEFT JOIN coaches substitute_coach ON substitute_coach.id = r.substitute_coach_id
            LEFT JOIN users substitute_user ON substitute_user.id = substitute_coach.user_id
            ORDER BY r.created_at DESC").ToListAsync();
    }

    private static async Task<(bool Success, string? Error)> ApplyApprovalAsync(
        SmartGymDbContext db,
        ManagerScheduleRequestRow request,
        string managerNote)
    {
        if (request.SessionId is null)
            return (false, "Yêu cầu chưa gắn với ca dạy hợp lệ.");

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync();
            try
            {
                var type = (request.RequestType ?? string.Empty).Trim().ToLowerInvariant();
                if (type is "dời lịch" or "doi lich")
                {
                    if (request.NewDate is null || !TryBuildLocalSchedule(request.NewDate.Value, request.NewTime, request.DurationMinutes, out var scheduleTime, out var duration))
                        return (false, "Yêu cầu dời lịch chưa có ngày hoặc khung giờ hợp lệ.");

                    var conflict = await FindScheduleConflictAsync(db, request, scheduleTime, duration, request.CurrentCoachId, request.FacilityId, isSubstitute: false);
                    if (conflict is not null) return (false, conflict);

                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE classes SET schedule_time = {scheduleTime}, duration_minutes = {duration}
                        WHERE id = {request.SessionId.Value}");
                }
                else if (type is "dạy thay" or "day thay")
                {
                    if (request.SubstituteCoachId is null)
                        return (false, "Yêu cầu dạy thay chưa có Coach thay thế hợp lệ.");

                    var conflict = await FindScheduleConflictAsync(db, request, request.ScheduleTime, request.DurationMinutes, request.SubstituteCoachId, null, isSubstitute: true);
                    if (conflict is not null) return (false, conflict);

                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE classes SET coach_id = {request.SubstituteCoachId.Value}
                        WHERE id = {request.SessionId.Value}");
                }
                else if (type is "báo vắng" or "bao vang")
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE classes SET status = false WHERE id = {request.SessionId.Value}");
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
        var sessionId = request.SessionId!.Value;

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
        row.CoachName, substituteCoachName = row.SubstituteCoachName ?? "", requestType = row.RequestType,
        newDate = row.NewDate?.ToString("yyyy-MM-dd") ?? "", newTime = row.NewTime ?? "",
        row.Reason, row.Status, managerNote = row.ManagerNote ?? "",
        createdAt = row.CreatedAt.ToString("yyyy-MM-dd HH:mm")
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
        public string CoachName { get; set; } = "Coach";
        public string? SubstituteCoachName { get; set; }
        public string RequestType { get; set; } = "dời lịch";
        public string? NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
