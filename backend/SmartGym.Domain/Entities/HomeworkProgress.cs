using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGym.Domain.Entities;

public class HomeworkProgress
{
    public Guid Id { get; set; }
    public Guid MemberId { get; set; }
    public Guid PlanId { get; set; }
    public Guid? AssignedBy { get; set; }
    public string Status { get; set; } = "assigned";
    public decimal? ProgressPct { get; set; } = 0;
    public DateTime AssignedDate { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Member { get; set; }
    public WorkoutPlan? Plan { get; set; }
}
