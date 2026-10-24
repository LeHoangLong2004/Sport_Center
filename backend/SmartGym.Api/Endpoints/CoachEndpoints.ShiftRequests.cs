using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    internal sealed class CoachScheduleRequestSqlModel
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public Guid? SubstituteCoachId { get; set; }
        public string? SubstituteCoachName { get; set; }
        public string ClassName { get; set; } = "Lớp học";
        public string RequestType { get; set; } = "dời lịch";
        public string? NewDate { get; set; }
        public string? NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "chờ duyệt";
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    internal sealed class CoachSubstituteInvitationSqlModel
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public Guid CoachId { get; set; }
        public string? CoachName { get; set; }
        public string ClassName { get; set; } = "Lớp học";
        public DateTime? ScheduleTime { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public string? FacilityName { get; set; }
        public string RequestType { get; set; } = "dạy thay";
        public string? NewDate { get; set; }
        public string? NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    internal sealed class CoachScheduleRequestDetailSqlModel
    {
        public Guid Id { get; set; }
        public Guid CoachId { get; set; }
        public Guid? SessionId { get; set; }
        public Guid? SubstituteCoachId { get; set; }
        public string Status { get; set; } = "pending";
        public string ClassName { get; set; } = "Lớp học";
        public DateTime? ScheduleTime { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public Guid? FacilityId { get; set; }
        public string? SubstituteCoachName { get; set; }
    }

    public static partial class CoachEndpoints
    {
        private static void MapCoachShiftRequestEndpoints(RouteGroupBuilder group)
        {
            group.MapGet("/schedule-requests", async (HttpContext context, SmartGymDbContext db) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.Ok(Array.Empty<object>());

                var rows = await db.Database.SqlQueryRaw<CoachScheduleRequestSqlModel>(
                    @"SELECT r.id, r.session_id AS ""SessionId"", r.substitute_coach_id AS ""SubstituteCoachId"",
                             substitute_user.full_name AS ""SubstituteCoachName"", COALESCE(c.class_name, 'Lớp học') AS ""ClassName"",
                             r.request_type AS ""RequestType"", r.new_date::text AS ""NewDate"", r.new_time AS ""NewTime"",
                             r.reason AS ""Reason"", r.status AS ""Status"", r.manager_note AS ""ManagerNote"",
                             r.created_at AS ""CreatedAt""
                      FROM coach_schedule_requests r
                      LEFT JOIN classes c ON c.id = r.session_id
                      LEFT JOIN coaches substitute_coach ON substitute_coach.id = r.substitute_coach_id
                      LEFT JOIN users substitute_user ON substitute_user.id = substitute_coach.user_id
                      WHERE r.coach_id = {0}
                      ORDER BY r.created_at DESC", coachId.Value).ToListAsync();

                return Results.Ok(rows.Select(r => new
                {
                    id = r.Id.ToString(),
                    sessionId = r.SessionId?.ToString() ?? string.Empty,
                    substituteCoachId = r.SubstituteCoachId?.ToString() ?? string.Empty,
                    substituteCoachName = r.SubstituteCoachName ?? string.Empty,
                    r.ClassName,
                    requestType = r.RequestType,
                    newDate = r.NewDate ?? string.Empty,
                    newTime = r.NewTime ?? string.Empty,
                    r.Reason,
                    r.Status,
                    createdAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    managerNote = r.ManagerNote ?? string.Empty
                }));
            });

            group.MapPost("/schedule-requests", async (HttpContext context, SmartGymDbContext db, IGroupClassRepository classRepository, [FromBody] System.Text.Json.JsonElement req) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.BadRequest(new { message = "Không tìm thấy hồ sơ Coach." });

                var sessionId = Guid.TryParse(req.TryGetProperty("sessionId", out var sessionProp) ? sessionProp.GetString() : null, out var parsedSessionId)
                    ? parsedSessionId : (Guid?)null;
                var reason = req.TryGetProperty("reason", out var reasonProp) ? reasonProp.GetString() : null;
                if (string.IsNullOrWhiteSpace(reason)) return Results.BadRequest(new { message = "Vui lòng nhập lý do." });
                var requestType = req.TryGetProperty("requestType", out var typeProp) ? typeProp.GetString() : "dời lịch";
                Guid? substituteCoachId = Guid.TryParse(
                    req.TryGetProperty("substituteCoachId", out var substituteIdProp) ? substituteIdProp.GetString() : null,
                    out var parsedSubstituteId) ? parsedSubstituteId : null;
                if (substituteCoachId == null && string.Equals(requestType, "dạy thay", StringComparison.OrdinalIgnoreCase)
                    && req.TryGetProperty("substituteCoachName", out var substituteNameProp))
                {
                    var substituteName = substituteNameProp.GetString();
                    if (!string.IsNullOrWhiteSpace(substituteName))
                        substituteCoachId = await db.Database.SqlQueryRaw<Guid?>(
                            "SELECT c.id AS \"Value\" FROM coaches c INNER JOIN users u ON u.id = c.user_id WHERE LOWER(u.full_name) = LOWER({0}) LIMIT 1",
                            substituteName.Trim()).FirstOrDefaultAsync();
                }
                if (string.Equals(requestType, "dạy thay", StringComparison.OrdinalIgnoreCase) && substituteCoachId == null)
                    return Results.BadRequest(new { message = "Vui lòng chọn một Coach thay thế hợp lệ." });
                var newDate = req.TryGetProperty("newDate", out var dateProp) && DateTime.TryParse(dateProp.GetString(), out var parsedDate)
                    ? parsedDate.Date : (DateTime?)null;
                var newTime = req.TryGetProperty("newTime", out var timeProp) ? timeProp.GetString() : null;

                var id = Guid.NewGuid();
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO coach_schedule_requests (id, coach_id, session_id, request_type, substitute_coach_id, new_date, new_time, reason)
                    VALUES ({id}, {coachId.Value}, {sessionId}, {requestType}, {substituteCoachId}, {newDate}, {newTime}, {reason})");

                var className = req.TryGetProperty("className", out var classProp) ? classProp.GetString() : "Lớp học";
                await classRepository.NotifyManagersAsync(
                    "Yêu cầu điều chỉnh ca dạy mới",
                    $"Coach đã gửi yêu cầu cho lớp {className ?? "Lớp học"}.",
                    "schedule_request",
                    id);

                if (string.Equals(requestType, "dạy thay", StringComparison.OrdinalIgnoreCase) && substituteCoachId.HasValue)
                {
                    await classRepository.NotifyCoachAsync(
                        substituteCoachId.Value,
                        "Lời mời dạy thay",
                        $"Bạn nhận được lời mời dạy thay lớp {className ?? "Lớp học"}. Vui lòng kiểm tra mục Lời mời dạy thay.",
                        "schedule_request",
                        id);
                }

                return Results.Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = id.ToString(),
                        sessionId = sessionId?.ToString() ?? string.Empty,
                        substituteCoachId = substituteCoachId?.ToString() ?? string.Empty,
                        className,
                        requestType,
                        newDate = newDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                        newTime = newTime ?? string.Empty,
                        reason,
                        status = "chờ duyệt",
                        createdAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                        managerNote = string.Empty
                    }
                });
            });

            // GET /api/coach/substitute-invitations — Danh sách lời mời dạy thay gửi đến Coach hiện tại
            group.MapGet("/substitute-invitations", async (HttpContext context, SmartGymDbContext db) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.Ok(Array.Empty<object>());

                var rows = await db.Database.SqlQueryRaw<CoachSubstituteInvitationSqlModel>(
                    @"SELECT r.id, r.session_id AS ""SessionId"", r.coach_id AS ""CoachId"",
                             source_user.full_name AS ""CoachName"",
                             COALESCE(c.class_name, 'Lớp học') AS ""ClassName"",
                             c.schedule_time AS ""ScheduleTime"",
                             COALESCE(c.duration_minutes, 60) AS ""DurationMinutes"",
                             COALESCE(f.name, 'Phòng tập') AS ""FacilityName"",
                             r.request_type AS ""RequestType"",
                             r.new_date::text AS ""NewDate"",
                             r.new_time AS ""NewTime"",
                             r.reason AS ""Reason"",
                             r.status AS ""Status"",
                             r.manager_note AS ""ManagerNote"",
                             r.created_at AS ""CreatedAt""
                      FROM coach_schedule_requests r
                      LEFT JOIN classes c ON c.id = r.session_id
                      LEFT JOIN facilities f ON f.id = c.facility_id
                      LEFT JOIN coaches source_coach ON source_coach.id = r.coach_id
                      LEFT JOIN users source_user ON source_user.id = source_coach.user_id
                      WHERE r.substitute_coach_id = {0}
                      ORDER BY r.created_at DESC", coachId.Value).ToListAsync();

                return Results.Ok(rows.Select(r => new
                {
                    id = r.Id.ToString(),
                    sessionId = r.SessionId?.ToString() ?? string.Empty,
                    coachId = r.CoachId.ToString(),
                    coachName = r.CoachName ?? "HLV",
                    className = r.ClassName,
                    scheduleTime = r.ScheduleTime?.ToString("yyyy-MM-dd HH:mm") ?? string.Empty,
                    durationMinutes = r.DurationMinutes,
                    facilityName = r.FacilityName ?? "Phòng tập",
                    requestType = r.RequestType,
                    newDate = r.NewDate ?? string.Empty,
                    newTime = r.NewTime ?? string.Empty,
                    reason = r.Reason,
                    status = r.Status,
                    createdAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    managerNote = r.ManagerNote ?? string.Empty
                }));
            });

            // PUT /api/coach/substitute-invitations/{id}/respond — Phản hồi lời mời dạy thay (accept/reject)
            group.MapPut("/substitute-invitations/{id:guid}/respond", async (
                Guid id,
                HttpContext context,
                SmartGymDbContext db,
                IGroupClassRepository classRepository,
                [FromBody] System.Text.Json.JsonElement body) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.BadRequest(new { message = "Không tìm thấy hồ sơ Coach." });

                var action = body.TryGetProperty("action", out var actionProp) ? actionProp.GetString()?.ToLowerInvariant() : null;
                var note = body.TryGetProperty("note", out var noteProp) ? noteProp.GetString() : null;

                if (action != "accept" && action != "reject")
                    return Results.BadRequest(new { message = "Hành động không hợp lệ (chỉ chấp nhận 'accept' hoặc 'reject')." });

                var req = await db.Database.SqlQueryRaw<CoachScheduleRequestDetailSqlModel>(
                    @"SELECT r.id, r.coach_id AS ""CoachId"", r.session_id AS ""SessionId"",
                             r.substitute_coach_id AS ""SubstituteCoachId"", r.status AS ""Status"",
                             COALESCE(c.class_name, 'Lớp học') AS ""ClassName"",
                             c.schedule_time AS ""ScheduleTime"", COALESCE(c.duration_minutes, 60) AS ""DurationMinutes"",
                             c.facility_id AS ""FacilityId"",
                             substitute_user.full_name AS ""SubstituteCoachName""
                      FROM coach_schedule_requests r
                      LEFT JOIN classes c ON c.id = r.session_id
                      LEFT JOIN coaches substitute_coach ON substitute_coach.id = r.substitute_coach_id
                      LEFT JOIN users substitute_user ON substitute_user.id = substitute_coach.user_id
                      WHERE r.id = {0} AND r.substitute_coach_id = {1}
                      LIMIT 1", id, coachId.Value).FirstOrDefaultAsync();

                if (req == null)
                    return Results.NotFound(new { message = "Không tìm thấy lời mời dạy thay này." });

                if (action == "accept")
                {
                    if (req.ScheduleTime != null && req.SessionId != null)
                    {
                        var end = req.ScheduleTime.Value.AddMinutes(req.DurationMinutes);
                        var conflict = await db.Database.SqlQueryRaw<int>(@"
                            SELECT 1 AS ""Value"" FROM classes
                            WHERE id <> {0} AND status = true AND COALESCE(approval_status, 'approved') <> 'rejected'
                              AND coach_id = {1}
                              AND schedule_time < {2}
                              AND schedule_time + (duration_minutes * INTERVAL '1 minute') > {3}
                            LIMIT 1", req.SessionId.Value, coachId.Value, end, req.ScheduleTime.Value).AnyAsync();

                        if (conflict)
                            return Results.BadRequest(new { message = "Bạn đã có ca dạy khác trùng vào khung giờ này!" });
                    }

                    var newStatus = "substitute_accepted";
                    var updateNote = string.IsNullOrWhiteSpace(note) ? "Coach thay thế đã đồng ý tiếp nhận ca dạy." : $"Coach thay thế đã đồng ý: {note}";

                    if (string.Equals(req.Status, "approved", StringComparison.OrdinalIgnoreCase))
                    {
                        if (req.SessionId != null)
                        {
                            await db.Database.ExecuteSqlInterpolatedAsync($@"
                                UPDATE classes SET coach_id = {coachId.Value}
                                WHERE id = {req.SessionId.Value}");
                        }
                        updateNote = "Coach thay thế đã xác nhận nhận lớp đã được Manager duyệt.";
                    }

                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE coach_schedule_requests
                        SET status = {newStatus},
                            manager_note = COALESCE(manager_note || ' | ', '') || {updateNote}
                        WHERE id = {id}");

                    await classRepository.NotifyCoachAsync(
                        req.CoachId,
                        "HLV đã đồng ý dạy thay",
                        $"{req.SubstituteCoachName ?? "HLV đồng nghiệp"} đã đồng ý nhận dạy thay lớp {req.ClassName}.",
                        "schedule_request",
                        id);

                    await classRepository.NotifyManagersAsync(
                        "HLV đã đồng ý dạy thay",
                        $"{req.SubstituteCoachName ?? "HLV"} đã đồng ý nhận dạy thay lớp {req.ClassName}. Đang chờ quản lý phê duyệt cuối cùng.",
                        "schedule_request",
                        id);

                    return Results.Ok(new { success = true, message = "Bạn đã đồng ý nhận dạy thay ca này!" });
                }
                else
                {
                    var declineNote = string.IsNullOrWhiteSpace(note) ? "Coach thay thế đã từ chối nhận ca dạy này." : $"Coach từ chối: {note}";
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        UPDATE coach_schedule_requests
                        SET status = 'substitute_declined',
                            manager_note = COALESCE(manager_note || ' | ', '') || {declineNote}
                        WHERE id = {id}");

                    if (req.SessionId != null && string.Equals(req.Status, "approved", StringComparison.OrdinalIgnoreCase))
                    {
                        await db.Database.ExecuteSqlInterpolatedAsync($@"
                            UPDATE classes SET coach_id = {req.CoachId}
                            WHERE id = {req.SessionId.Value}");
                    }

                    await classRepository.NotifyCoachAsync(
                        req.CoachId,
                        "HLV từ chối dạy thay",
                        $"{req.SubstituteCoachName ?? "HLV đồng nghiệp"} không thể nhận dạy thay lớp {req.ClassName}.",
                        "schedule_request",
                        id);

                    return Results.Ok(new { success = true, message = "Bạn đã từ chối lời mời dạy thay." });
                }
            });
        }
    }
}
