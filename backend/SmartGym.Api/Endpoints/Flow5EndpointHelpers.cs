using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Shared helper methods for Flow 5 endpoints: Coach resolution, validation, and result mapping.
/// </summary>
public static class Flow5EndpointHelpers
{
    public static async Task<Flow5CoachContext?> ResolveCoachAsync(
        HttpContext http,
        IFlow5AuthorizationService authorization,
        SmartGymDbContext db)
    {
        var parsed = authorization.ResolveCoach(http.User);
        if (parsed is null) return null;
        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, parsed.UserId);
        return coachId.HasValue ? parsed with { CoachId = coachId.Value } : null;
    }

    public static async Task<IResult?> ValidateTargetContextAsync(
        HttpContext http,
        CreateFlow5DraftRequest request,
        Flow5CoachContext coach,
        IFlow5AuthorizationService authorization,
        IFlow5ContextService contextService,
        IFlow5WorkoutPlanValidator validator)
    {
        var target = request.Target;
        if (target is null) return null;
        var access = await authorization.AuthorizeTargetAsync(http.User, target, http.RequestAborted);
        if (!access.IsAllowed || access.Context?.CoachId != coach.CoachId)
            return Error("forbidden", access.ErrorMessage);
        if (!request.SportId.HasValue) return Error("validation_error", "SportId is required.");

        var contextResult = await contextService.BuildAsync(
            access.Context, target, request.SportId.Value, http.RequestAborted);
        if (!contextResult.IsSuccess)
            return Error(contextResult.ErrorCode, contextResult.ErrorMessage);

        var validation = validator.ValidateDraft(request, contextResult.Context);
        return validation.IsValid ? null : Error("validation_error", "The target context is invalid.", validation.Issues);
    }

    public static IResult ToResult<T>(
        Flow5PlanServiceResult<T> result,
        int successStatus = StatusCodes.Status200OK)
    {
        if (result.IsSuccess)
            return Results.Json(result.Data, statusCode: successStatus);

        var status = result.ErrorCode switch
        {
            "not_found" => StatusCodes.Status404NotFound,
            "version_conflict" or "plan_not_editable" or "plan_not_draft" or "plan_archived" or "already_archived" or "plan_not_approved" => StatusCodes.Status409Conflict,
            "forbidden" => StatusCodes.Status403Forbidden,
            "ai_output_invalid" or "ai_response_empty" or "ai_json_invalid" or "ai_json_not_found"
                or "ai_json_empty" or "ai_json_missing_plan_name" or "ai_json_missing_exercises"
                or "ai_json_invalid_exercise"
                => StatusCodes.Status422UnprocessableEntity,
            "ai_quota_exceeded" => StatusCodes.Status429TooManyRequests,
            "ai_provider_error" or "ai_provider_timeout" or "ai_provider_unavailable"
                or "ai_provider_invalid_response"
                => StatusCodes.Status502BadGateway,
            "ai_provider_not_configured" => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status400BadRequest
        };
        return Error(result.ErrorCode, result.ErrorMessage, result.Issues, status);
    }

    public static IResult Error(
        string code,
        string? message,
        IReadOnlyList<Flow5ValidationIssueDto>? issues = null,
        int statusCode = StatusCodes.Status400BadRequest) =>
        Results.Json(new Flow5ApiErrorDto
        {
            Code = code,
            Message = message ?? "Request failed.",
            TraceId = null,
            Issues = issues?.ToList() ?? new List<Flow5ValidationIssueDto>()
        }, statusCode: statusCode);
}
