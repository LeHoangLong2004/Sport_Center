using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class CoachEndpoints
{
    private static void MapMemberProfileEndpoints(RouteGroupBuilder group)
    {
        group.MapGet("/members/{memberId:guid}/profile", async (
            Guid memberId,
            HttpContext context,
            SmartGymDbContext db) =>
        {
            var coachId = await ResolveAuthenticatedCoachIdAsync(context, db);
            if (coachId == null)
                return Results.Unauthorized();

            var rawCoachUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.User.FindFirstValue("sub");
            if (!Guid.TryParse(rawCoachUserId, out var coachUserId))
                return Results.Unauthorized();

            var member = await db.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == memberId);
            if (member == null)
                return Results.NotFound(new { message = "Không tìm thấy học viên." });

            var attendance = await db.Database.SqlQueryRaw<MemberProfileAttendanceRow>(
                @"SELECT c.id AS ""SessionId"", c.class_name AS ""ClassName"",
                         COALESCE(s.name, '') AS ""Sport"", COALESCE(f.name, '') AS ""Room"",
                         c.schedule_time AS ""ScheduleTime"", c.duration_minutes AS ""DurationMinutes"",
                         COALESCE(car.status, 'unmarked') AS ""Status"", car.note AS ""Note""
                  FROM class_bookings b
                  INNER JOIN classes c ON c.id = b.class_id
                  LEFT JOIN sports s ON s.id = c.sport_id
                  LEFT JOIN facilities f ON f.id = c.facility_id
                  LEFT JOIN class_attendance_records car
                         ON car.session_id = c.id AND car.member_id = b.user_id
                  WHERE b.user_id = {0}
                    AND (c.coach_id = {1} OR c.coach_id = {2})
                    AND b.status NOT IN ('cancelled', 'rejected', 'class_cancelled')
                    AND c.schedule_time <= NOW()
                  ORDER BY c.schedule_time DESC", memberId, coachId.Value, coachUserId).ToListAsync();

            var totalSessions = attendance.Count;
            var attendedSessions = attendance.Count(x => IsAttendedStatus(x.Status));
            var attendanceRate = totalSessions == 0
                ? (decimal?)null
                : Math.Round(attendedSessions * 100m / totalSessions, 0);

            var bodyMetric = await db.BodyMetrics.AsNoTracking()
                .Where(x => x.UserId == memberId)
                .OrderByDescending(x => x.RecordedAt)
                .FirstOrDefaultAsync();

            var assessments = await db.Database.SqlQueryRaw<MemberProfileAssessmentRow>(
                @"SELECT id AS ""Id"", session_id AS ""SessionId"", completion AS ""Completion"",
                         metrics_json::text AS ""MetricsJson"", comment AS ""Comment"",
                         next_step AS ""NextStep"", created_at AS ""CreatedAt""
                  FROM coach_assessments
                  WHERE coach_id = {0} AND member_id = {1}
                  ORDER BY created_at DESC", coachId.Value, memberId).ToListAsync();

            var fitnessTestsList = new List<object>();
            try
            {
                var trainingResults = await db.Database.SqlQueryRaw<MemberProfileTrainingResultRow>(
                    @"SELECT metric_name AS ""MetricName"", value AS ""Value"", unit AS ""Unit"",
                             effort AS ""Effort"", comment AS ""Comment"", recorded_at AS ""RecordedAt""
                      FROM training_results
                      WHERE coach_id = {0} AND member_id = {1}
                      ORDER BY recorded_at DESC", coachId.Value, memberId).ToListAsync();

                fitnessTestsList.AddRange(trainingResults.Select(x => (object)new
                {
                    metricName = x.MetricName,
                    value = x.Value,
                    unit = x.Unit ?? string.Empty,
                    effort = x.Effort,
                    comment = x.Comment ?? string.Empty,
                    recordedAt = x.RecordedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                }));
            }
            catch
            {
                // Fallback gracefully if training_results table is not created
            }

            // Extract fitness tests from coach_assessments metrics_json (Zero new tables needed)
            foreach (var asm in assessments)
            {
                if (string.IsNullOrWhiteSpace(asm.MetricsJson) || asm.MetricsJson == "[]")
                    continue;
                try
                {
                    using var doc = JsonDocument.Parse(asm.MetricsJson);
                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var elem in doc.RootElement.EnumerateArray())
                        {
                            var mName = elem.TryGetProperty("metricName", out var mProp) ? mProp.GetString() : null;
                            if (string.IsNullOrWhiteSpace(mName)) continue;

                            decimal val = 0;
                            if (elem.TryGetProperty("value", out var vProp))
                            {
                                if (vProp.ValueKind == JsonValueKind.Number)
                                    val = vProp.GetDecimal();
                                else if (decimal.TryParse(vProp.GetString(), out var parsedVal))
                                    val = parsedVal;
                            }

                            var unit = elem.TryGetProperty("unit", out var uProp) ? uProp.GetString() : "";
                            int? effort = null;
                            if (elem.TryGetProperty("effort", out var efProp))
                            {
                                if (efProp.ValueKind == JsonValueKind.Number) effort = efProp.GetInt32();
                                else if (int.TryParse(efProp.GetString(), out var efParsed)) effort = efParsed;
                            }
                            var cmt = elem.TryGetProperty("comment", out var cProp) ? cProp.GetString() : asm.Comment;

                            fitnessTestsList.Add(new
                            {
                                metricName = mName,
                                value = val,
                                unit = unit ?? string.Empty,
                                effort = effort,
                                comment = cmt ?? string.Empty,
                                recordedAt = asm.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                            });
                        }
                    }
                }
                catch { }
            }

            var assignedPlans = await db.HomeworkProgresses.AsNoTracking()
                .Include(x => x.Plan)
                    .ThenInclude(x => x!.Exercises)
                .Where(x => x.MemberId == memberId && x.AssignedBy == coachId.Value)
                .OrderByDescending(x => x.AssignedDate)
                .ToListAsync();

            var sports = attendance
                .Select(x => x.Sport)
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            var averageHomeworkProgress = assignedPlans.Count == 0
                ? (decimal?)null
                : Math.Round(assignedPlans.Average(x => x.ProgressPct ?? 0), 0);

            var notes = assessments
                .Where(x => !string.IsNullOrWhiteSpace(x.Comment) || !string.IsNullOrWhiteSpace(x.NextStep))
                .Select(x => new
                {
                    id = x.Id,
                    comment = x.Comment ?? string.Empty,
                    nextStep = x.NextStep ?? string.Empty,
                    completion = x.Completion,
                    createdAt = x.CreatedAt
                })
                .ToList();

            return Results.Ok(new
            {
                member = new
                {
                    id = member.Id.ToString(),
                    name = member.FullName,
                    code = !string.IsNullOrWhiteSpace(member.MemberCode) ? member.MemberCode : "MB" + member.Id.ToString()[..4].ToUpperInvariant(),
                    avatar = member.AvatarUrl,
                    goal = !string.IsNullOrWhiteSpace(member.TrainingGoal) ? member.TrainingGoal : "Cải thiện thể lực & Sức khỏe",
                    level = !string.IsNullOrWhiteSpace(member.TrainingLevel) ? member.TrainingLevel : "Cơ bản",
                    sport = sports.Count > 0 ? string.Join(", ", sports) : null,
                    phone = member.PhoneNumber,
                    email = member.Email,
                    classIds = attendance.Select(x => x.SessionId.ToString()).Distinct().ToArray(),
                    attendanceRate,
                    attendedSessions,
                    totalSessions
                },
                stats = new
                {
                    attendanceRate,
                    attendedSessions,
                    totalSessions,
                    weight = bodyMetric?.Weight,
                    height = bodyMetric?.Height,
                    bodyFat = bodyMetric?.BodyFat,
                    muscleMass = bodyMetric?.MuscleMass,
                    bmi = bodyMetric?.Bmi,
                    latestSession = attendance.FirstOrDefault() is { } latest
                        ? new
                        {
                            className = latest.ClassName,
                            date = latest.ScheduleTime.ToString("yyyy-MM-dd"),
                            status = latest.Status,
                            completion = assessments.FirstOrDefault()?.Completion
                        }
                        : null,
                    goalProgress = averageHomeworkProgress
                },
                attendanceHistory = attendance.Select(x => new
                {
                    id = x.SessionId.ToString(),
                    className = x.ClassName,
                    sport = x.Sport,
                    date = x.ScheduleTime.ToString("dd/MM/yyyy"),
                    time = $"{x.ScheduleTime:HH:mm} - {x.ScheduleTime.AddMinutes(x.DurationMinutes):HH:mm}",
                    room = x.Room,
                    status = x.Status,
                    note = x.Note
                }),
                notes,
                assessments = assessments.Select(x => new
                {
                    id = x.Id,
                    sessionId = x.SessionId,
                    completion = x.Completion,
                    metrics = ParseMetrics(x.MetricsJson),
                    comment = x.Comment ?? string.Empty,
                    nextStep = x.NextStep ?? string.Empty,
                    createdAt = x.CreatedAt
                }),
                fitnessTests = fitnessTestsList,
                assignedWorkouts = assignedPlans.Select(x => new
                {
                    id = x.Id.ToString(),
                    name = x.Plan?.PlanName ?? string.Empty,
                    sport = sports.FirstOrDefault() ?? string.Empty,
                    level = x.Plan?.Level ?? string.Empty,
                    duration = x.Plan?.DurationMinutes ?? 0,
                    status = x.Status switch
                    {
                        "completed" => "Hoàn thành",
                        "pending_review" => "Chờ nghiệm thu",
                        "rejected" => "Chưa đạt",
                        "in_progress" => "Đang tập luyện",
                        _ => "Đã giao"
                    },
                    statusCode = x.Status,
                    assignedDate = x.AssignedDate.ToString("yyyy-MM-dd"),
                    dueDate = x.DueDate.HasValue ? x.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    notes = x.Notes,
                    progressPct = x.ProgressPct ?? 0,
                    exercises = x.Plan?.Exercises.Select(e => new
                    {
                        name = e.Name,
                        reps = e.Reps ?? string.Empty,
                        rest = e.Rest ?? string.Empty,
                        note = e.Note ?? string.Empty
                    }) ?? Enumerable.Empty<object>()
                })
            });
        });

        group.MapPost("/members/{memberId:guid}/notes", async (
            Guid memberId,
            HttpContext context,
            SmartGymDbContext db,
            JsonElement request) =>
        {
            var coachId = await ResolveAuthenticatedCoachIdAsync(context, db);
            if (coachId == null)
                return Results.Unauthorized();

            var comment = request.TryGetProperty("comment", out var value) ? value.GetString() : null;
            if (string.IsNullOrWhiteSpace(comment))
                return Results.BadRequest(new { message = "Ghi chú không được để trống." });

            var completion = request.TryGetProperty("completion", out var completionValue)
                && completionValue.TryGetInt32(out var parsedCompletion)
                ? Math.Clamp(parsedCompletion, 0, 100)
                : 0;
            Guid? sessionId = request.TryGetProperty("sessionId", out var sessionValue)
                && Guid.TryParse(sessionValue.GetString(), out var parsedSession)
                ? parsedSession
                : null;

            var id = Guid.NewGuid();
            await db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO coach_assessments (id, coach_id, session_id, member_id, completion, metrics_json, comment, next_step)
                VALUES ({id}, {coachId.Value}, {sessionId}, {memberId}, {completion}, '[]'::jsonb, {comment}, NULL)");

            return Results.Ok(new { id, comment, completion, createdAt = DateTime.UtcNow });
        });

        group.MapPost("/members/{memberId:guid}/fitness-test", async (
            Guid memberId,
            HttpContext context,
            SmartGymDbContext db,
            JsonElement request) =>
        {
            var coachId = await ResolveAuthenticatedCoachIdAsync(context, db);
            if (coachId == null)
                return Results.Unauthorized();

            var metricName = request.TryGetProperty("metricName", out var mnVal) ? mnVal.GetString() : null;
            if (string.IsNullOrWhiteSpace(metricName))
                return Results.BadRequest(new { message = "Tên chỉ số / bài kiểm tra không được để trống." });

            decimal val = 0;
            if (request.TryGetProperty("value", out var vVal))
            {
                if (vVal.ValueKind == JsonValueKind.Number) val = vVal.GetDecimal();
                else if (decimal.TryParse(vVal.GetString(), out var parsedNum)) val = parsedNum;
            }

            var unit = request.TryGetProperty("unit", out var uVal) ? uVal.GetString() : "";
            int? effort = null;
            if (request.TryGetProperty("effort", out var efVal))
            {
                if (efVal.ValueKind == JsonValueKind.Number) effort = efVal.GetInt32();
                else if (int.TryParse(efVal.GetString(), out var parsedEf)) effort = parsedEf;
            }

            var comment = request.TryGetProperty("comment", out var cVal) ? cVal.GetString() : "";
            var nextStep = request.TryGetProperty("nextStep", out var nsVal) ? nsVal.GetString() : "";
            Guid? sessionId = request.TryGetProperty("sessionId", out var sVal)
                && Guid.TryParse(sVal.GetString(), out var parsedSess)
                ? parsedSess
                : null;

            var metricArray = new[]
            {
                new
                {
                    metricName,
                    value = val,
                    unit = unit ?? "",
                    effort = effort,
                    comment = comment ?? ""
                }
            };
            var metricsJson = JsonSerializer.Serialize(metricArray);

            var id = Guid.NewGuid();
            await db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO coach_assessments (id, coach_id, session_id, member_id, completion, metrics_json, comment, next_step)
                VALUES ({id}, {coachId.Value}, {sessionId}, {memberId}, 100, {metricsJson}::jsonb, {comment}, {nextStep})");

            return Results.Ok(new
            {
                id,
                metricName,
                value = val,
                unit = unit ?? "",
                effort,
                comment = comment ?? "",
                nextStep = nextStep ?? "",
                recordedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            });
        });
    }

    private static bool IsAttendedStatus(string? status) =>
        string.Equals(status, "present", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "attended", StringComparison.OrdinalIgnoreCase)
        || string.Equals(status, "late", StringComparison.OrdinalIgnoreCase);

    private static object ParseMetrics(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return Array.Empty<object>();
        try
        {
            return JsonSerializer.Deserialize<object>(json) ?? Array.Empty<object>();
        }
        catch
        {
            return Array.Empty<object>();
        }
    }

    private sealed class MemberProfileAttendanceRow
    {
        public Guid SessionId { get; set; }
        public string ClassName { get; set; } = string.Empty;
        public string Sport { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public DateTime ScheduleTime { get; set; }
        public int DurationMinutes { get; set; }
        public string Status { get; set; } = "unmarked";
        public string? Note { get; set; }
    }

    private sealed class MemberProfileAssessmentRow
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public int Completion { get; set; }
        public string? MetricsJson { get; set; }
        public string? Comment { get; set; }
        public string? NextStep { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    private sealed class MemberProfileTrainingResultRow
    {
        public string MetricName { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string? Unit { get; set; }
        public int? Effort { get; set; }
        public string? Comment { get; set; }
        public DateTime RecordedAt { get; set; }
    }
}
