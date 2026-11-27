using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public class AssignHomeworkRequest
{
    public Guid MemberId { get; set; }
    public Guid? ClassId { get; set; }
    public string? Type { get; set; } // "class" | "member"
    public Guid PlanId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
}

public class CreateManualHomeworkRequest
{
    public Flow5TargetDto Target { get; set; } = new();
    public string PlanName { get; set; } = string.Empty;
    public Guid? SportId { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
    public List<Flow5ExerciseDto> Exercises { get; set; } = new();
}

public class UpdateHomeworkProgressRequest
{
    public string? Status { get; set; } // "in_progress", "pending_review", "completed"
    public decimal? ProgressPct { get; set; }
    public string? Notes { get; set; }
    public List<Guid>? CompletedExerciseIds { get; set; }
}

public class VerifyHomeworkProgressRequest
{
    public string Status { get; set; } = "completed"; // "completed" | "rejected" | "in_progress"
    public string? Notes { get; set; }
}

public class HomeworkProgressResponse
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public Guid PlanId { get; set; }
    public Guid? AssignedBy { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? ProgressPct { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public List<Guid> CompletedExerciseIds { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    
    // We can include the plan details to make it easier for the frontend
    public WorkoutPlanResponse? Plan { get; set; }
}
