using System.Text.Json;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Domain.Entities;
namespace SmartGym.Application.Services;
/// <summary>
/// Persists Flow 5 lifecycle changes using the existing workout-plan tables.
/// Assignment is intentionally kept for the next Flow 5 step.
/// </summary>
public sealed class Flow5WorkoutPlanService : IFlow5WorkoutPlanService
{
    private readonly IWorkoutPlanRepository _repository;
    private readonly IFlow5WorkoutPlanValidator _validator;
    public Flow5WorkoutPlanService(
        IWorkoutPlanRepository repository,
        IFlow5WorkoutPlanValidator validator)
    {
        _repository = repository;
        _validator = validator;
    }
    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CreateDraftAsync(
        Guid coachId,
        CreateFlow5DraftRequest request,
        CancellationToken cancellationToken = default)
    {
        var validation = _validator.ValidateDraft(request);
        if (!validation.IsValid)
            return Invalid(validation);
        if (!IsSupportedSource(request.Source))
            return Failure("source_invalid", "Source must be manual or ai_recommendation.");

        var plan = BuildPlan(coachId, request, DateTime.UtcNow);
        var created = await _repository.CreateAsync(plan);
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(created));
    }

    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> UpdateDraftAsync(
        Guid coachId,
        Guid planId,
        UpdateFlow5DraftRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await GetOwnedPlanAsync(coachId, planId);
        if (plan is null)
            return Failure("not_found", "Workout plan was not found.");
        if (!Flow5PlanStatus.IsDraft(plan.Status))
            return Failure("plan_not_editable", "Only draft plans can be edited.");
        if (plan.Version != request.ExpectedVersion)
            return Failure("version_conflict", "The plan version is stale.");
        var validation = _validator.ValidateDraft(request);
        if (!validation.IsValid)
            return Invalid(validation);
        if (!IsSupportedSource(request.Source))
            return Failure("source_invalid", "Source must be manual or ai_recommendation.");

        ApplyDraft(plan, request);
        plan.Version++;
        plan.UpdatedAt = DateTime.UtcNow;
        var updated = await _repository.UpdateAsync(plan);
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(updated));
    }
    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ApproveAsync(
        Guid coachId,
        Guid planId,
        ApproveFlow5PlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await GetOwnedPlanAsync(coachId, planId);
        if (plan is null)
            return Failure("not_found", "Workout plan was not found.");
        if (!Flow5PlanStatus.IsDraft(plan.Status))
            return Failure("plan_not_draft", "Only draft plans can be approved.");
        if (plan.Version != request.ExpectedVersion)
            return Failure("version_conflict", "The plan version is stale.");

        var validation = _validator.ValidateDraft(ToDraftRequest(plan));
        if (!validation.IsValid)
            return Invalid(validation);

        plan.Status = Flow5PlanStatuses.Approved;
        plan.ApprovedAt = DateTime.UtcNow;
        plan.ApprovedBy = coachId;
        plan.ApprovalNote = request.Note;
        plan.Version++;
        plan.UpdatedAt = DateTime.UtcNow;
        var approved = await _repository.UpdateAsync(plan);
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(approved));
    }

    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CloneAsync(
        Guid coachId,
        Guid planId,
        CloneFlow5PlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await GetOwnedPlanAsync(coachId, planId);
        if (plan is null)
            return Failure("not_found", "Workout plan was not found.");
        if (Flow5PlanStatus.Is(plan.Status, Flow5PlanStatuses.Archived))
            return Failure("plan_archived", "Archived plans cannot be cloned.");
        if (plan.Version != request.ExpectedVersion)
            return Failure("version_conflict", "The plan version is stale.");

        var now = DateTime.UtcNow;
        var clone = new WorkoutPlan
        {
            Id = Guid.NewGuid(),
            CoachId = coachId,
            SportId = plan.SportId,
            PlanName = string.IsNullOrWhiteSpace(request.PlanName)
                ? $"{plan.PlanName} - v{plan.Version + 1}"
                : request.PlanName.Trim(),
            Description = plan.Description,
            Goal = plan.Goal,
            Level = plan.Level,
            DurationMinutes = plan.DurationMinutes,
            Status = Flow5PlanStatuses.Draft,
            Source = plan.Source,
            Version = plan.Version + 1,
            ParentPlanId = plan.Id,
            RecommendationTargetType = plan.RecommendationTargetType,
            RecommendationTargetId = plan.RecommendationTargetId,
            AiMetadataJson = plan.AiMetadataJson,
            CreatedAt = now,
            UpdatedAt = now,
            Exercises = new List<WorkoutPlanExercise>()
        };

        clone.Exercises = CloneExercises(plan.Exercises, clone.Id);

        if (clone.PlanName.Length > 160)
            return Failure("plan_name_too_long", "The cloned plan name is too long.");

        var created = await _repository.CreateAsync(clone);
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(created));
    }

    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ArchiveAsync(
        Guid coachId,
        Guid planId,
        ApproveFlow5PlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await GetOwnedPlanAsync(coachId, planId);
        if (plan is null)
            return Failure("not_found", "Workout plan was not found.");
        if (Flow5PlanStatus.Is(plan.Status, Flow5PlanStatuses.Archived))
            return Failure("already_archived", "Workout plan is already archived.");
        if (plan.Version != request.ExpectedVersion)
            return Failure("version_conflict", "The plan version is stale.");

        plan.Status = Flow5PlanStatuses.Archived;
        plan.ArchivedAt = DateTime.UtcNow;
        plan.ArchivedBy = coachId;
        plan.Version++;
        plan.UpdatedAt = DateTime.UtcNow;
        var archived = await _repository.UpdateAsync(plan);
        return Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(archived));
    }

    public async Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> GetAsync(
        Guid coachId,
        Guid planId,
        CancellationToken cancellationToken = default)
    {
        var plan = await GetOwnedPlanAsync(coachId, planId);
        return plan is null
            ? Failure("not_found", "Workout plan was not found.")
            : Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Success(Map(plan));
    }

    private async Task<WorkoutPlan?> GetOwnedPlanAsync(Guid coachId, Guid planId) =>
        (await _repository.GetByIdAsync(planId)) is { } plan && plan.CoachId == coachId
            ? plan
            : null;

    private static WorkoutPlan BuildPlan(Guid coachId, CreateFlow5DraftRequest request, DateTime now)
    {
        var plan = new WorkoutPlan
        {
            Id = Guid.NewGuid(),
            CoachId = coachId,
            SportId = request.SportId,
            PlanName = request.PlanName.Trim(),
            Description = request.Description,
            Goal = request.Goal,
            Level = request.Level,
            DurationMinutes = request.DurationMinutes,
            Status = Flow5PlanStatuses.Draft,
            Source = request.Source,
            RecommendationTargetType = request.Target?.Type,
            RecommendationTargetId = request.Target?.Id,
            AiMetadataJson = request.AiMetadata is null ? null : JsonSerializer.Serialize(request.AiMetadata),
            Version = 1,
            CreatedAt = now,
            UpdatedAt = now,
            Exercises = new List<WorkoutPlanExercise>()
        };

        plan.Exercises = ToExercises(request.Exercises, plan.Id);
        return plan;
    }

    private static void ApplyDraft(WorkoutPlan plan, CreateFlow5DraftRequest request)
    {
        plan.PlanName = request.PlanName.Trim();
        plan.SportId = request.SportId;
        plan.Description = request.Description;
        plan.Goal = request.Goal;
        plan.Level = request.Level;
        plan.DurationMinutes = request.DurationMinutes;
        plan.Source = request.Source;
        plan.RecommendationTargetType = request.Target?.Type ?? plan.RecommendationTargetType;
        plan.RecommendationTargetId = request.Target?.Id ?? plan.RecommendationTargetId;
        if (request.AiMetadata is not null)
            plan.AiMetadataJson = JsonSerializer.Serialize(request.AiMetadata);
        plan.Exercises = ToExercises(request.Exercises, plan.Id);
    }

    private static CreateFlow5DraftRequest ToDraftRequest(WorkoutPlan plan) => new()
    {
        PlanName = plan.PlanName,
        SportId = plan.SportId,
        Description = plan.Description,
        Goal = plan.Goal,
        Level = plan.Level,
        DurationMinutes = plan.DurationMinutes,
        Source = plan.Source,
        Target = plan.RecommendationTargetId.HasValue
            ? new Flow5TargetDto { Type = plan.RecommendationTargetType ?? Flow5TargetTypes.Member, Id = plan.RecommendationTargetId.Value }
            : null,
        Exercises = plan.Exercises.OrderBy(e => e.Order).Select(ToExerciseDto).ToList()
    };

    private static List<WorkoutPlanExercise> ToExercises(IEnumerable<Flow5ExerciseDto>? source, Guid planId) =>
        (source ?? Array.Empty<Flow5ExerciseDto>()).Select((exercise, index) => new WorkoutPlanExercise
        {
            Id = Guid.NewGuid(),
            PlanId = planId,
            Name = exercise.Name.Trim(),
            Sets = exercise.Sets,
            Reps = exercise.Reps,
            Duration = exercise.Duration,
            Rest = exercise.Rest,
            Note = exercise.Note,
            Order = exercise.Order > 0 ? exercise.Order : index + 1
        }).ToList();

    private static List<WorkoutPlanExercise> CloneExercises(
        IEnumerable<WorkoutPlanExercise>? source,
        Guid planId) =>
        (source ?? Array.Empty<WorkoutPlanExercise>()).OrderBy(e => e.Order).Select((exercise, index) => new WorkoutPlanExercise
        {
            Id = Guid.NewGuid(),
            PlanId = planId,
            Name = exercise.Name,
            Sets = exercise.Sets,
            Reps = exercise.Reps,
            Duration = exercise.Duration,
            Rest = exercise.Rest,
            Note = exercise.Note,
            Order = exercise.Order > 0 ? exercise.Order : index + 1
        }).ToList();

    private static Flow5ExerciseDto ToExerciseDto(WorkoutPlanExercise exercise) => new()
    {
        Id = exercise.Id,
        Name = exercise.Name,
        Sets = exercise.Sets,
        Reps = exercise.Reps,
        Duration = exercise.Duration,
        Rest = exercise.Rest,
        Note = exercise.Note,
        Order = exercise.Order
    };

    private static Flow5WorkoutPlanResponse Map(WorkoutPlan plan) => new()
    {
        Id = plan.Id,
        CoachId = plan.CoachId ?? Guid.Empty,
        SportId = plan.SportId,
        PlanName = plan.PlanName,
        Description = plan.Description,
        Goal = plan.Goal,
        Level = plan.Level,
        DurationMinutes = plan.DurationMinutes,
        Status = Flow5PlanStatus.Normalize(plan.Status),
        Source = IsSupportedSource(plan.Source) ? plan.Source : Flow5PlanSources.Manual,
        Version = plan.Version,
        RecommendationTarget = plan.RecommendationTargetId.HasValue
            ? new Flow5TargetDto { Type = plan.RecommendationTargetType ?? Flow5TargetTypes.Member, Id = plan.RecommendationTargetId.Value }
            : null,
        AiMetadata = DeserializeMetadata(plan.AiMetadataJson),
        CreatedAt = ToOffset(plan.CreatedAt),
        UpdatedAt = ToOffset(plan.UpdatedAt),
        ApprovedAt = plan.ApprovedAt.HasValue ? ToOffset(plan.ApprovedAt.Value) : null,
        ApprovedBy = plan.ApprovedBy,
        Exercises = plan.Exercises.OrderBy(e => e.Order).Select(ToExerciseDto).ToList()
    };

    private static Flow5AiMetadataDto? DeserializeMetadata(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        try { return JsonSerializer.Deserialize<Flow5AiMetadataDto>(value); }
        catch (JsonException) { return null; }
    }

    private static DateTimeOffset ToOffset(DateTime value) =>
        new(DateTime.SpecifyKind(value, DateTimeKind.Utc));

    private static bool IsSupportedSource(string? source) =>
        string.Equals(source, Flow5PlanSources.Manual, StringComparison.OrdinalIgnoreCase)
        || string.Equals(source, Flow5PlanSources.AiRecommendation, StringComparison.OrdinalIgnoreCase);

    private static Flow5PlanServiceResult<Flow5WorkoutPlanResponse> Invalid(Flow5ValidationResult validation) =>
        Failure("validation_error", "The workout plan is invalid.", validation.Issues);

    private static Flow5PlanServiceResult<Flow5WorkoutPlanResponse> Failure(
        string code,
        string message,
        IReadOnlyList<Flow5ValidationIssueDto>? issues = null) =>
        Flow5PlanServiceResult<Flow5WorkoutPlanResponse>.Failure(code, message, issues);
}
