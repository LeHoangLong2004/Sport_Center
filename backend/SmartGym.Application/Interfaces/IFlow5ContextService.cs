using System;
using System.Threading;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public sealed record Flow5ContextBuildResult(
    bool IsSuccess,
    string ErrorCode,
    string ErrorMessage,
    Flow5WorkoutContextDto? Context = null)
{
    public static Flow5ContextBuildResult Success(Flow5WorkoutContextDto context) => new(
        true,
        string.Empty,
        string.Empty,
        context);

    public static Flow5ContextBuildResult NotFound(string message) => new(
        false,
        "not_found",
        message);

    public static Flow5ContextBuildResult Invalid(string message) => new(
        false,
        "context_invalid",
        message);
}

public interface IFlow5ContextService
{
    Task<Flow5ContextBuildResult> BuildAsync(
        Flow5CoachContext coach,
        Flow5TargetDto target,
        Guid sportId,
        CancellationToken cancellationToken = default);
}
