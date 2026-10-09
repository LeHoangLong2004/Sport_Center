using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Domain.Entities;

public class WorkoutPlan
{
    public Guid Id { get; set; }
    public Guid? CoachId { get; set; }
    public Guid? SportId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    public string Status { get; set; } = "Nháp";
    public int Version { get; set; } = 1;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<WorkoutPlanExercise> Exercises { get; set; } = new();
}

public class WorkoutPlanExercise
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Reps { get; set; }
    public string? Rest { get; set; }
    public string? Note { get; set; }

    public WorkoutPlan? Plan { get; set; }
}
