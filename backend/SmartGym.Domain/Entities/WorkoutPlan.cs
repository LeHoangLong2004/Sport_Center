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
    public string Status { get; set; } = "draft";
    public string Source { get; set; } = "manual";
    public int Version { get; set; } = 1;
    public Guid? ParentPlanId { get; set; }
    public string? RecommendationTargetType { get; set; }
    public Guid? RecommendationTargetId { get; set; }
    public string? AiMetadataJson { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public string? ApprovalNote { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public Guid? ArchivedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public List<WorkoutPlanExercise> Exercises { get; set; } = new();
}

public class WorkoutPlanExercise
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Sets { get; set; }
    public string? Reps { get; set; }
    public string? Duration { get; set; }
    public string? Rest { get; set; }
    public string? Note { get; set; }
    public int Order { get; set; }

    public WorkoutPlan? Plan { get; set; }
}
