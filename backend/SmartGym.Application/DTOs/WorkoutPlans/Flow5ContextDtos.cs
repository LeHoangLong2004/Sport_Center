using System;
using System.Collections.Generic;

namespace SmartGym.Application.DTOs.WorkoutPlans;

public sealed class Flow5WorkoutContextDto
{
    public string SchemaVersion { get; set; } = "flow5.context.v1";
    public Flow5ContextCoachDto Coach { get; set; } = new();
    public Flow5SportContextDto RequestedSport { get; set; } = new();
    public Flow5TargetDto Target { get; set; } = new();
    public Flow5MemberContextDto? Member { get; set; }
    public Flow5ClassContextDto? Class { get; set; }
    public Flow5AttendanceContextDto Attendance { get; set; } = new();
    public List<Flow5PlanHistoryDto> RecentPlans { get; set; } = new();
}

public sealed class Flow5ContextCoachDto
{
    public Guid CoachId { get; set; }
    public string? Specialties { get; set; }
    public string? Certifications { get; set; }
    public int? ExperienceYears { get; set; }
}

public sealed class Flow5SportContextDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

public sealed class Flow5MemberContextDto
{
    public Guid MemberId { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public Flow5BodyMetricContextDto? LatestBodyMetrics { get; set; }
    public bool HasPtEnrollment { get; set; }
    public int AssignedClassCount { get; set; }
}

public sealed class Flow5BodyMetricContextDto
{
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? BodyFat { get; set; }
    public decimal? MuscleMass { get; set; }
    public decimal? Bmi { get; set; }
    public DateTime RecordedAt { get; set; }
}

public sealed class Flow5ClassContextDto
{
    public Guid ClassId { get; set; }
    public Guid SportId { get; set; }
    public string ClassName { get; set; } = string.Empty;
    public DateTime ScheduleTime { get; set; }
    public int DurationMinutes { get; set; }
    public int Capacity { get; set; }
    public int EnrolledCount { get; set; }
    public string ApprovalStatus { get; set; } = string.Empty;
}

public sealed class Flow5AttendanceContextDto
{
    public int TotalRecords { get; set; }
    public int PresentCount { get; set; }
    public int NoShowCount { get; set; }
    public decimal? AttendanceRate { get; set; }
}

public sealed class Flow5PlanHistoryDto
{
    public Guid PlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Goal { get; set; }
    public int? DurationMinutes { get; set; }
    public decimal ProgressPct { get; set; }
    public DateTime AssignedDate { get; set; }
    public DateTime? CompletedAt { get; set; }
}
