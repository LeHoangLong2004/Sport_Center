using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class CoachEndpoints
{
    private static void MapNotificationAndAssessmentEndpoints(RouteGroupBuilder group)
    {
        group.MapPost(
            "/notifications",
            async (HttpContext context, SmartGymDbContext db, [FromBody] JsonElement request) =>
            {
                var rawUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? context.User.FindFirstValue("sub");
                if (!Guid.TryParse(rawUserId, out var userId))
                    return Results.Unauthorized();

                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null)
                    return Results.BadRequest(new { message = "Không tìm thấy hồ sơ Coach." });

                var title = AssessmentGetString(request, "title");
                var content = AssessmentGetString(request, "content") ?? AssessmentGetString(request, "message");
                var targetType = AssessmentGetString(request, "targetType")?.ToLowerInvariant();
                var targetIdText = AssessmentGetString(request, "targetId");
                if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
                    return Results.BadRequest(new { message = "Tiêu đề và nội dung không được để trống." });
                if (!Guid.TryParse(targetIdText, out var targetId))
                    return Results.BadRequest(new { message = "Đối tượng nhận thông báo không hợp lệ." });

                var recipients = new List<Guid>();
                if (targetType == "member")
                {
                    recipients.Add(targetId);
                }
                else if (targetType == "class")
                {
                    recipients = await db.Database
                        .SqlQueryRaw<Guid>(
                            "SELECT user_id AS \"Value\" FROM class_bookings WHERE class_id = {0} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                            targetId)
                        .ToListAsync();
                }
                else
                {
                    return Results.BadRequest(new { message = "Loại đối tượng nhận không hợp lệ." });
                }

                if (recipients.Count == 0)
                    return Results.BadRequest(new { message = "Không tìm thấy học viên nhận thông báo." });

                var type = AssessmentGetString(request, "type") ?? "Thông báo";
                DateTime? deadline = null;
                var deadlineText = AssessmentGetString(request, "deadline");
                if (DateTime.TryParse(deadlineText, out var parsedDeadline))
                    deadline = parsedDeadline;

                foreach (var recipientId in recipients.Distinct())
                {
                    await db.Database.ExecuteSqlInterpolatedAsync($@"
                        INSERT INTO notifications (sender_id, user_id, target_type, target_id, type, title, message, deadline)
                        VALUES ({coachId.Value}, {recipientId}, {targetType}, {targetId}, {type}, {title}, {content}, {deadline})");
                }

                return Results.Ok(new { success = true, recipientCount = recipients.Distinct().Count() });
            }
        );

        group.MapGet(
            "/assessments",
            async (HttpContext context, SmartGymDbContext db) =>
            {
                var coachId = await ResolveAuthenticatedCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Ok(Array.Empty<object>());

                var rows = await db.Database.SqlQueryRaw<CoachAssessmentRow>(
                    @"SELECT id, coach_id, session_id, member_id, completion,
                             metrics_json::text AS ""MetricsJson"", comment, next_step,
                             created_at AS ""CreatedAt""
                      FROM coach_assessments
                      WHERE coach_id = {0}
                      ORDER BY created_at DESC",
                    coachId.Value).ToListAsync();

                return Results.Ok(rows.Select(ToAssessmentResponse));
            }
        );

        group.MapPost(
            "/assessments",
            async (HttpContext context, SmartGymDbContext db, [FromBody] JsonElement request) =>
            {
                var coachId = await ResolveAuthenticatedCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Unauthorized();

                if (!Guid.TryParse(AssessmentGetString(request, "memberId"), out var memberId))
                    return Results.BadRequest(new { message = "Học viên không hợp lệ." });

                Guid? sessionId = Guid.TryParse(AssessmentGetString(request, "sessionId"), out var parsedSessionId)
                    ? parsedSessionId
                    : null;
                var completion = AssessmentGetInt(request, "completion") ?? 0;
                completion = Math.Clamp(completion, 0, 100);
                var metricsJson = request.TryGetProperty("metrics", out var metrics)
                    && metrics.ValueKind == JsonValueKind.Array
                    ? metrics.GetRawText()
                    : "[]";
                var comment = AssessmentGetString(request, "comment");
                var nextStep = AssessmentGetString(request, "nextStep");
                var assessmentId = Guid.NewGuid();

                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO coach_assessments (id, coach_id, session_id, member_id, completion, metrics_json, comment, next_step)
                    VALUES ({assessmentId}, {coachId.Value}, {sessionId}, {memberId}, {completion}, CAST({metricsJson} AS jsonb), {comment}, {nextStep})");

                return Results.Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = assessmentId,
                        sessionId,
                        memberId,
                        completion,
                        metrics = JsonSerializer.Deserialize<object>(metricsJson) ?? Array.Empty<object>(),
                        comment = comment ?? string.Empty,
                        nextStep = nextStep ?? string.Empty,
                        createdAt = DateTime.UtcNow.ToString("o")
                    }
                });
            }
        );
    }

    private static async Task<Guid?> ResolveAuthenticatedCoachIdAsync(HttpContext context, SmartGymDbContext db)
    {
        var rawUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId)
            ? await CoachProfileResolver.FindByUserIdAsync(db, userId)
            : null;
    }

    private static string? AssessmentGetString(JsonElement request, string property)
    {
        return request.TryGetProperty(property, out var value)
            && value.ValueKind != JsonValueKind.Null
            ? value.GetString()
            : null;
    }

    private static int? AssessmentGetInt(JsonElement request, string property)
    {
        return request.TryGetProperty(property, out var value) && value.TryGetInt32(out var result)
            ? result
            : null;
    }

    private static object ToAssessmentResponse(CoachAssessmentRow row)
    {
        object metrics;
        try
        {
            metrics = JsonSerializer.Deserialize<object>(row.MetricsJson ?? "[]") ?? Array.Empty<object>();
        }
        catch
        {
            metrics = Array.Empty<object>();
        }

        return new
        {
            id = row.Id.ToString(),
            sessionId = row.SessionId?.ToString() ?? string.Empty,
            memberId = row.MemberId.ToString(),
            completion = row.Completion,
            metrics,
            comment = row.Comment ?? string.Empty,
            nextStep = row.NextStep ?? string.Empty,
            createdAt = row.CreatedAt.ToString("o")
        };
    }

    private sealed class CoachAssessmentRow
    {
        public Guid Id { get; set; }
        public Guid CoachId { get; set; }
        public Guid? SessionId { get; set; }
        public Guid MemberId { get; set; }
        public int Completion { get; set; }
        public string? MetricsJson { get; set; }
        public string? Comment { get; set; }
        public string? NextStep { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
