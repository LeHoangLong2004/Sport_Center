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
        }
    }
}
