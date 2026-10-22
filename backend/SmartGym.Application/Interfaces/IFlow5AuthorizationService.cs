using System;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using SmartGym.Application.DTOs.WorkoutPlans;

namespace SmartGym.Application.Interfaces;

public sealed record Flow5CoachContext(Guid UserId, Guid CoachId, string Role);

public sealed record Flow5AuthorizationResult(
    bool IsAllowed,
    string ErrorCode,
    string ErrorMessage,
    Flow5CoachContext? Context = null)
{
    public static Flow5AuthorizationResult Unauthorized() => new(
        false,
        "unauthorized",
        "Vui lòng đăng nhập bằng tài khoản hợp lệ.");

    public static Flow5AuthorizationResult Forbidden(string message) => new(
        false,
        "forbidden",
        message);

    public static Flow5AuthorizationResult NotFound(string message) => new(
        false,
        "not_found",
        message);

    public static Flow5AuthorizationResult Allowed(Flow5CoachContext context) => new(
        true,
        string.Empty,
        string.Empty,
        context);
}

public interface IFlow5AuthorizationService
{
    Flow5CoachContext? ResolveCoach(ClaimsPrincipal principal);

    Task<Flow5AuthorizationResult> AuthorizeTargetAsync(
        ClaimsPrincipal principal,
        Flow5TargetDto target,
        CancellationToken cancellationToken = default);
}
