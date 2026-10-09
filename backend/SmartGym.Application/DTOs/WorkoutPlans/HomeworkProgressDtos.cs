using System;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public class AssignHomeworkRequest
{
    public Guid MemberId { get; set; }
    public Guid PlanId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Notes { get; set; }
}

public class UpdateHomeworkProgressRequest
{
    public string? Status { get; set; } // "in_progress", "completed"
    public decimal? ProgressPct { get; set; }
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
    public DateTime CreatedAt { get; set; }
    
    // We can include the plan details to make it easier for the frontend
    public WorkoutPlanResponse? Plan { get; set; }
}
