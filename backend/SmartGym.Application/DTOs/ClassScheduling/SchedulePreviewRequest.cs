namespace SmartGym.Application.DTOs.ClassScheduling;

public sealed class SchedulePreviewRequest
{
    public string ScheduleType { get; init; } = "ONE_TIME";
    public DateOnly StartDate { get; init; }
    public TimeOnly StartTime { get; init; }
    public int DurationMinutes { get; init; }
    public IReadOnlyCollection<DayOfWeek>? DaysOfWeek { get; init; }
    public string? EndMode { get; init; }
    public int? Weeks { get; init; }
    public DateOnly? EndDate { get; init; }
    public int? TotalSessions { get; init; }
}

public sealed record ScheduledSessionPreview(
    int SessionNumber,
    DateTimeOffset StartAt,
    DateTimeOffset EndAt);

public sealed record SchedulePreviewResult(
    bool IsValid,
    IReadOnlyList<string> Errors,
    IReadOnlyList<ScheduledSessionPreview> Sessions,
    DateOnly? CalculatedEndDate,
    int TotalSessions);

public sealed class CreateClassCourseRequest
{
    public Guid SportId { get; init; }
    public Guid FacilityId { get; init; }
    public Guid? CoachId { get; init; }
    public string ClassName { get; init; } = string.Empty;
    public int Capacity { get; init; }
    public decimal Fee { get; init; }
    public SchedulePreviewRequest Schedule { get; init; } = new();
}

public sealed record CreateClassCourseResult(
    Guid CourseId,
    string ApprovalStatus,
    int TotalSessions,
    decimal PricePerSession,
    decimal CourseFee);

public sealed class UpsertSportClassPricingRequest
{
    public decimal PricePerSession { get; init; }
    public DateOnly EffectiveFrom { get; init; }
}

public sealed record SportClassPricingResponse(
    Guid SportId,
    string SportName,
    decimal PricePerSession,
    DateOnly EffectiveFrom,
    DateOnly? EffectiveTo,
    bool IsActive);

public sealed record ClassCoursePriceQuote(
    Guid SportId,
    decimal PricePerSession,
    int TotalSessions,
    decimal CourseFee);

public sealed class EnrollClassCourseRequest
{
    public string IdempotencyKey { get; init; } = string.Empty;
}

public sealed record EnrollClassCourseResult(
    Guid CourseId,
    Guid? EnrollmentId,
    Guid? WaitlistId,
    string Status,
    decimal QuotedAmount,
    DateTimeOffset? HeldUntil);
