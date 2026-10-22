using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Application.Services;

/// <summary>
/// Assigns an immutable approved plan to one member or to the current class roster.
/// Existing homework_progress rows are treated as idempotent assignments.
/// </summary>
public sealed class Flow5AssignmentService : IFlow5AssignmentService
{
    private readonly IWorkoutPlanRepository _planRepository;
    private readonly IHomeworkProgressRepository _progressRepository;
    private readonly IUserRepository _userRepository;

    public Flow5AssignmentService(
        IWorkoutPlanRepository planRepository,
        IHomeworkProgressRepository progressRepository,
        IUserRepository userRepository)
    {
        _planRepository = planRepository;
        _progressRepository = progressRepository;
        _userRepository = userRepository;
    }

    public async Task<Flow5PlanServiceResult<AssignFlow5PlanResponse>> AssignAsync(
        Guid coachId,
        Guid planId,
        AssignFlow5PlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var plan = await _planRepository.GetByIdAsync(planId);
        if (plan is null)
            return Failure("not_found", "Workout plan was not found.");
        if (plan.CoachId != coachId)
            return Failure("forbidden", "You can only assign plans that you created.");
        if (!Flow5PlanStatus.IsApproved(plan.Status))
            return Failure("plan_not_approved", "Only approved workout plans can be assigned.");
        if (request.ExpectedVersion > 0 && plan.Version != request.ExpectedVersion)
            return Failure("version_conflict", "The plan version is stale.");
        if (request.Target is null || request.Target.Id == Guid.Empty)
            return Failure("target_invalid", "A valid member or class target is required.");

        var targetType = request.Target.Type?.Trim().ToLowerInvariant();
        IReadOnlyList<Guid> memberIds;
        if (targetType == Flow5TargetTypes.Member)
        {
            var member = await _userRepository.GetByIdAsync(request.Target.Id);
            if (member is null || !member.Status)
                return Failure("member_not_found", "The selected member was not found or is inactive.");
            memberIds = new[] { request.Target.Id };
        }
        else if (targetType == Flow5TargetTypes.Class)
        {
            memberIds = await _progressRepository.GetEligibleMemberIdsByClassAsync(
                request.Target.Id,
                cancellationToken);
            if (memberIds.Count == 0)
                return Failure("target_empty", "The selected class has no eligible members.");
        }
        else
        {
            return Failure("target_invalid", "Target type must be member or class.");
        }

        var batch = await _progressRepository.AssignMissingBatchAsync(
            planId,
            coachId,
            memberIds,
            request.DueDate?.UtcDateTime,
            request.Notes,
            cancellationToken);

        var response = new AssignFlow5PlanResponse
        {
            PlanId = planId,
            AssignedCount = batch.CreatedMemberIds.Count,
            SkippedCount = memberIds.Count - batch.CreatedMemberIds.Count,
            Assignments = batch.Assignments.Select(progress => new Flow5AssignmentItemDto
            {
                Id = progress.Id,
                PlanId = progress.PlanId,
                TargetType = targetType!,
                TargetId = request.Target.Id,
                MemberId = progress.MemberId,
                Status = progress.Status,
                AssignedAt = new DateTimeOffset(DateTime.SpecifyKind(progress.CreatedAt, DateTimeKind.Utc)),
                DueDate = progress.DueDate.HasValue
                    ? new DateTimeOffset(DateTime.SpecifyKind(progress.DueDate.Value, DateTimeKind.Utc))
                    : null
            }).ToList()
        };

        return Flow5PlanServiceResult<AssignFlow5PlanResponse>.Success(response);
    }

    private static Flow5PlanServiceResult<AssignFlow5PlanResponse> Failure(
        string code,
        string message) =>
        Flow5PlanServiceResult<AssignFlow5PlanResponse>.Failure(code, message);
}
