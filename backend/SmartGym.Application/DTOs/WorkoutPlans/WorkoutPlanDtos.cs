using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public class ExerciseDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sets { get; set; }
    public string? Reps { get; set; }
    public string? Duration { get; set; }
    public string? Rest { get; set; }
    public string? Note { get; set; }
    public int Order { get; set; }
}

public class CreateWorkoutPlanRequest
{
    public Guid? SportId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    public string? ProgramOutlineJson { get; set; }
    public string? Status { get; set; }
    
    public List<ExerciseDto> Exercises { get; set; } = new();
}

public class WorkoutPlanAssignedTargetDto
{
    public string Type { get; set; } = "member";
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class WorkoutPlanResponse
{
    public Guid Id { get; set; }
    public Guid? CoachId { get; set; }
    public Guid? SportId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    public string? ProgramOutlineJson { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PlanType { get; set; } = "training_plan";
    public int Version { get; set; }
    public string? RecommendationTargetType { get; set; }
    public Guid? RecommendationTargetId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<ExerciseDto> Exercises { get; set; } = new();
    public int AssignedCount { get; set; }
    public List<WorkoutPlanAssignedTargetDto> AssignedTo { get; set; } = new();
}
