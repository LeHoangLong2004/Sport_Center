using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SmartGym.Application.DTOs.WorkoutPlans;

/// <summary>
/// Stable string values used by the Flow 5 API. Keep these values backward-compatible
/// because they are persisted or sent to the Frontend.
/// </summary>
public static class Flow5TargetTypes
{
    public const string Member = "member";
    public const string Class = "class";
}

public static class Flow5PlanStatuses
{
    public const string Draft = "draft";
    public const string Approved = "approved";
    public const string Assigned = "assigned";
    public const string Archived = "archived";
}

public static class Flow5PlanSources
{
    public const string Manual = "manual";
    public const string AiRecommendation = "ai_recommendation";
}

public static class Flow5WorkoutPlanRoutes
{
    public const string Base = "/api/workout-plans";
    public const string AiRecommendation = Base + "/ai-recommendation";
    public const string Drafts = Base + "/drafts";
    public const string Detail = Base + "/{id:guid}";
    public const string Approve = Base + "/{id:guid}/approve";
    public const string Clone = Base + "/{id:guid}/clone";
    public const string Archive = Base + "/{id:guid}/archive";
    public const string Assign = Base + "/{id:guid}/assign";
    public const string Assignments = Base + "/{id:guid}/assignments";
}

public sealed class Flow5TargetDto
{
    [Required]
    public string Type { get; set; } = Flow5TargetTypes.Member;

    [Required]
    public Guid Id { get; set; }
}

public sealed class Flow5ExerciseDto
{
    public Guid? Id { get; set; }

    [Required, StringLength(160, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    [StringLength(80)]
    public string? Sets { get; set; }

    [StringLength(80)]
    public string? Reps { get; set; }

    [StringLength(80)]
    public string? Duration { get; set; }

    [StringLength(80)]
    public string? Rest { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }

    public int Order { get; set; }
}

/// <summary>
/// Request used by Coach/Manager to ask the Backend for a structured AI recommendation.
/// The AI provider must never be called directly by the Frontend.
/// </summary>
public sealed class GenerateFlow5RecommendationRequest
{
    [Required]
    public Flow5TargetDto Target { get; set; } = new();

    [Required]
    public Guid SportId { get; set; }

    [Required, StringLength(80)]
    public string Level { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Goal { get; set; }

    [MaxLength(20)]
    public List<string> Equipment { get; set; } = new();

    [Range(5, 240)]
    public int DurationMinutes { get; set; } = 60;

    [Range(1, 20)]
    public int? ExerciseCount { get; set; }

    /// <summary>
    /// Client-generated key used to safely retry the same request without duplicate drafts.
    /// </summary>
    [StringLength(100)]
    public string? IdempotencyKey { get; set; }
}

public class CreateFlow5DraftRequest
{
    [Required, StringLength(160, MinimumLength = 1)]
    public string PlanName { get; set; } = string.Empty;

    public Guid? SportId { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(500)]
    public string? Goal { get; set; }

    [StringLength(80)]
    public string? Level { get; set; }

    [Range(5, 240)]
    public int? DurationMinutes { get; set; }

    public string Source { get; set; } = Flow5PlanSources.Manual;
    public Guid? AiRequestId { get; set; }
    public Flow5TargetDto? Target { get; set; }
    public Flow5AiMetadataDto? AiMetadata { get; set; }
    public List<Flow5ExerciseDto> Exercises { get; set; } = new();
}

public sealed class UpdateFlow5DraftRequest : CreateFlow5DraftRequest
{
    /// <summary>
    /// Version read by the client. The Backend rejects stale updates with 409 Conflict.
    /// </summary>
    [Range(1, int.MaxValue)]
    public int ExpectedVersion { get; set; }
}

public sealed class ApproveFlow5PlanRequest
{
    [Range(1, int.MaxValue)]
    public int ExpectedVersion { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }
}

public sealed class CloneFlow5PlanRequest
{
    [Range(1, int.MaxValue)]
    public int ExpectedVersion { get; set; }

    [StringLength(160, MinimumLength = 1)]
    public string? PlanName { get; set; }
}

public sealed class AssignFlow5PlanRequest
{
    [Required]
    public Flow5TargetDto Target { get; set; } = new();

    [StringLength(100)]
    public string? IdempotencyKey { get; set; }

    public DateTimeOffset? DueDate { get; set; }

    [StringLength(1000)]
    public string? Notes { get; set; }

    [Range(1, int.MaxValue)]
    public int ExpectedVersion { get; set; }
}

public sealed class Flow5AiMetadataDto
{
    public string Provider { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string PromptVersion { get; set; } = string.Empty;
    public string SchemaVersion { get; set; } = "flow5.v1";
    public DateTimeOffset? GeneratedAt { get; set; }
    public int? InputTokens { get; set; }
    public int? OutputTokens { get; set; }
}

public sealed class Flow5WorkoutPlanResponse
{
    public Guid Id { get; set; }
    public Guid CoachId { get; set; }
    public Guid? SportId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Goal { get; set; }
    public string? Level { get; set; }
    public int? DurationMinutes { get; set; }
    public string Status { get; set; } = Flow5PlanStatuses.Draft;
    public string Source { get; set; } = Flow5PlanSources.Manual;
    public int Version { get; set; }
    public Flow5TargetDto? RecommendationTarget { get; set; }
    public Flow5AiMetadataDto? AiMetadata { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? ApprovedAt { get; set; }
    public Guid? ApprovedBy { get; set; }
    public List<Flow5ExerciseDto> Exercises { get; set; } = new();
}

public sealed class Flow5AssignmentItemDto
{
    public Guid Id { get; set; }
    public Guid PlanId { get; set; }
    public string TargetType { get; set; } = Flow5TargetTypes.Member;
    public Guid TargetId { get; set; }
    public Guid MemberId { get; set; }
    public string Status { get; set; } = "assigned";
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset? DueDate { get; set; }
}

public sealed class AssignFlow5PlanResponse
{
    public Guid PlanId { get; set; }
    public int AssignedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<Flow5AssignmentItemDto> Assignments { get; set; } = new();
}

public sealed class Flow5ValidationIssueDto
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Field { get; set; }
}

public sealed class Flow5ApiErrorDto
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public List<Flow5ValidationIssueDto> Issues { get; set; } = new();
}
