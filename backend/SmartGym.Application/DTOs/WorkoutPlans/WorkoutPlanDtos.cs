using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public class ExerciseDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Reps { get; set; }
    public string? Rest { get; set; }
    public string? Note { get; set; }
}

public class CreateWorkoutPlanRequest
{
    public Guid? SportId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    
    public List<ExerciseDto> Exercises { get; set; } = new();
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
    public string Status { get; set; } = string.Empty;
    public int Version { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<ExerciseDto> Exercises { get; set; } = new();
}
