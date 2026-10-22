using System.Threading;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public sealed record Flow5PlanServiceResult<T>(
    bool IsSuccess,
    string ErrorCode,
    string ErrorMessage,
    T? Data = default,
    IReadOnlyList<Flow5ValidationIssueDto>? Issues = null)
{
    public static Flow5PlanServiceResult<T> Success(T data) => new(true, string.Empty, string.Empty, data);

    public static Flow5PlanServiceResult<T> Failure(
        string code,
        string message,
        IReadOnlyList<Flow5ValidationIssueDto>? issues = null) =>
        new(false, code, message, default, issues);
}

public interface IFlow5WorkoutPlanService
{
    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CreateDraftAsync(
        Guid coachId,
        CreateFlow5DraftRequest request,
        CancellationToken cancellationToken = default);

    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> UpdateDraftAsync(
        Guid coachId,
        Guid planId,
        UpdateFlow5DraftRequest request,
        CancellationToken cancellationToken = default);

    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ApproveAsync(
        Guid coachId,
        Guid planId,
        ApproveFlow5PlanRequest request,
        CancellationToken cancellationToken = default);

    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> CloneAsync(
        Guid coachId,
        Guid planId,
        CloneFlow5PlanRequest request,
        CancellationToken cancellationToken = default);

    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> ArchiveAsync(
        Guid coachId,
        Guid planId,
        ApproveFlow5PlanRequest request,
        CancellationToken cancellationToken = default);

    Task<Flow5PlanServiceResult<Flow5WorkoutPlanResponse>> GetAsync(
        Guid coachId,
        Guid planId,
        CancellationToken cancellationToken = default);
}
