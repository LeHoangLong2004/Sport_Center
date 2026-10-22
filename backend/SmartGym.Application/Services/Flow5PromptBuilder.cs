using System;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Application.Services;

/// <summary>
/// Builds a deterministic prompt and sends only fitness-relevant context to the provider.
/// Identifiers and direct contact information are intentionally excluded.
/// </summary>
public sealed class Flow5PromptBuilder : IFlow5PromptBuilder
{
    private const string PromptVersion = "flow5.prompt.v2";

    public string Build(
        GenerateFlow5RecommendationRequest request,
        Flow5WorkoutContextDto context)
    {
        var safeContext = new
        {
            schemaVersion = context.SchemaVersion,
            coach = new
            {
                specialties = context.Coach.Specialties,
                certifications = context.Coach.Certifications,
                experienceYears = context.Coach.ExperienceYears
            },
            targetType = context.Target.Type,
            sport = context.RequestedSport.Name,
            member = context.Member is null
                ? null
                : new
                {
                    age = context.Member.Age,
                    gender = context.Member.Gender,
                    latestBodyMetrics = context.Member.LatestBodyMetrics,
                    hasPtEnrollment = context.Member.HasPtEnrollment,
                    assignedClassCount = context.Member.AssignedClassCount
                },
            @class = context.Class is null
                ? null
                : new
                {
                    name = context.Class.ClassName,
                    scheduleTime = context.Class.ScheduleTime,
                    durationMinutes = context.Class.DurationMinutes,
                    capacity = context.Class.Capacity,
                    enrolledCount = context.Class.EnrolledCount,
                    approvalStatus = context.Class.ApprovalStatus
                },
            attendance = context.Attendance,
            recentPlans = context.RecentPlans.Select(plan => new
            {
                planName = plan.PlanName,
                status = plan.Status,
                goal = plan.Goal,
                durationMinutes = plan.DurationMinutes,
                progressPct = plan.ProgressPct,
                assignedDate = plan.AssignedDate,
                completedAt = plan.CompletedAt
            })
        };

        var contextJson = JsonSerializer.Serialize(safeContext, JsonOptions);
        var requestedEquipment = request.Equipment ?? new List<string>();
        var equipment = requestedEquipment.Count == 0
            ? "Không có thiết bị, ưu tiên bài tập dùng trọng lượng cơ thể."
            : string.Join(", ", requestedEquipment.Distinct(StringComparer.OrdinalIgnoreCase));
        var exerciseCount = request.ExerciseCount?.ToString() ?? "tự chọn hợp lý";
        var goal = string.IsNullOrWhiteSpace(request.Goal) ? "cải thiện sức khỏe tổng quát" : request.Goal;

        return $$"""
You are a sports training assistant for SportCenter.
Prompt version: {{PromptVersion}}

Create a safe, practical workout-plan recommendation for a Coach to review.
This is only a draft. Do not claim medical diagnosis, do not prescribe medication,
and do not invent personal data that is absent from the context.

User requirements:
- Sport: {{context.RequestedSport.Name}}
- Level: {{request.Level}}
- Goal: {{goal}}
- Available equipment: {{equipment}}
- Total duration in minutes: {{request.DurationMinutes}}
- Requested exercise count: {{exerciseCount}}

Context from the database (already minimized and without direct contact PII):
{contextJson}

Return ONLY one valid JSON object. Do not wrap it in Markdown fences and do not add
explanatory text before or after the JSON. Use exactly this shape:
{
  "planName": "string",
  "description": "string",
  "goal": "string",
  "level": "string",
  "durationMinutes": 60,
  "exercises": [
    {
      "name": "string",
      "sets": "string or null",
      "reps": "string or null",
      "duration": "string or null",
      "rest": "string or null",
      "note": "string or null",
      "order": 1
    }
  ]
}

Use the same language as the user's goal when possible. Keep dosage clear and
separate sets, reps, duration and rest. Follow these exact value rules so the
Coach can edit the draft safely:
- sets: use only a positive number such as "3" or a count format such as "3x10".
- reps: use only a positive count or range with an optional unit, such as "10",
  "10 reps", "10 lan" or "10-12 reps".
- duration and rest: use only "30s", "45 sec", "2 min", "2 phut", "1 h" or
  "00:30". Never use words such as "seconds", "minutes", "per set" or "each".
- Set fields that do not apply to an exercise to null, and ensure every exercise
  has at least one of sets, reps or duration. Use exactly {{exerciseCount}} exercises
  when a requested exercise count is provided, with order values 1 through {{exerciseCount}}.
A Coach must review the draft before it is approved or assigned.
""";
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}
