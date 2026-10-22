using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

public static class Flow5WorkoutPlanEndpoints
{
    public static void MapFlow5WorkoutPlanEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workout-plans").RequireAuthorization();

        group.MapPost("/ai-recommendation", async (
            HttpContext http,
            [FromBody] GenerateFlow5RecommendationRequest request,
            IFlow5RecommendationService recommendationService,
            IFlow5AuthorizationService authorization,
            IFlow5ContextService contextService,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();

            var access = await authorization.AuthorizeTargetAsync(
                http.User,
                request.Target,
                http.RequestAborted);
            if (!access.IsAllowed || access.Context?.CoachId != coach.CoachId)
            {
                var status = access.ErrorCode switch
                {
                    "unauthorized" => StatusCodes.Status401Unauthorized,
                    "not_found" => StatusCodes.Status404NotFound,
                    _ => StatusCodes.Status403Forbidden
                };
                return Error(access.ErrorCode, access.ErrorMessage, statusCode: status);
            }

            var contextResult = await contextService.BuildAsync(
                access.Context!,
                request.Target,
                request.SportId,
                http.RequestAborted);
            if (!contextResult.IsSuccess || contextResult.Context is null)
                return Error(contextResult.ErrorCode, contextResult.ErrorMessage);

            var result = await recommendationService.GenerateDraftAsync(
                coach.CoachId,
                request,
                contextResult.Context,
                http.RequestAborted);
            return ToResult(result, StatusCodes.Status201Created);
        }).WithTags("Flow 5 - Workout Plans")
          .WithSummary("Generate and save an AI workout-plan recommendation as a draft");

        group.MapPost("/drafts", async (
            HttpContext http,
            [FromBody] CreateFlow5DraftRequest request,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            IFlow5ContextService contextService,
            IFlow5WorkoutPlanValidator validator,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();

            var contextCheck = await ValidateTargetContextAsync(
                http, request, coach, authorization, contextService, validator);
            if (contextCheck is not null) return contextCheck;

            var result = await service.CreateDraftAsync(coach.CoachId, request, http.RequestAborted);
            return ToResult(result, StatusCodes.Status201Created);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapPatch("/{id:guid}", async (
            Guid id,
            HttpContext http,
            [FromBody] UpdateFlow5DraftRequest request,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            IFlow5ContextService contextService,
            IFlow5WorkoutPlanValidator validator,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            var contextCheck = await ValidateTargetContextAsync(
                http, request, coach, authorization, contextService, validator);
            if (contextCheck is not null) return contextCheck;
            var result = await service.UpdateDraftAsync(coach.CoachId, id, request, http.RequestAborted);
            return ToResult(result);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapGet("/{id:guid}/flow5", async (
            Guid id,
            HttpContext http,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            var result = await service.GetAsync(coach.CoachId, id, http.RequestAborted);
            return ToResult(result);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapPost("/{id:guid}/approve", async (
            Guid id,
            HttpContext http,
            [FromBody] ApproveFlow5PlanRequest request,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            var result = await service.ApproveAsync(coach.CoachId, id, request, http.RequestAborted);
            return ToResult(result);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapPost("/{id:guid}/clone", async (
            Guid id,
            HttpContext http,
            [FromBody] CloneFlow5PlanRequest request,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            var result = await service.CloneAsync(coach.CoachId, id, request, http.RequestAborted);
            return ToResult(result, StatusCodes.Status201Created);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapPost("/{id:guid}/archive", async (
            Guid id,
            HttpContext http,
            [FromBody] ApproveFlow5PlanRequest request,
            IFlow5WorkoutPlanService service,
            IFlow5AuthorizationService authorization,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            var result = await service.ArchiveAsync(coach.CoachId, id, request, http.RequestAborted);
            return ToResult(result);
        }).WithTags("Flow 5 - Workout Plans");

        group.MapPost("/{id:guid}/assign", async (
            Guid id,
            HttpContext http,
            [FromBody] AssignFlow5PlanRequest request,
            IFlow5AssignmentService assignmentService,
            IFlow5AuthorizationService authorization,
            SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            var coach = await ResolveCoachAsync(http, authorization, db);
            if (coach is null) return Results.Unauthorized();
            if (request.Target is null)
                return Error("target_invalid", "A valid member or class target is required.");

            var access = await authorization.AuthorizeTargetAsync(
                http.User,
                request.Target,
                http.RequestAborted);
            if (!access.IsAllowed || access.Context?.CoachId != coach.CoachId)
            {
                var status = access.ErrorCode switch
                {
                    "unauthorized" => StatusCodes.Status401Unauthorized,
                    "not_found" => StatusCodes.Status404NotFound,
                    _ => StatusCodes.Status403Forbidden
                };
                return Error(access.ErrorCode, access.ErrorMessage, statusCode: status);
            }

            var result = await assignmentService.AssignAsync(
                coach.CoachId,
                id,
                request,
                http.RequestAborted);
            return ToResult(result);
        }).WithTags("Flow 5 - Workout Plans");
    }

    private static async Task<Flow5CoachContext?> ResolveCoachAsync(
        HttpContext http,
        IFlow5AuthorizationService authorization,
        SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db)
    {
        var parsed = authorization.ResolveCoach(http.User);
        if (parsed is null) return null;
        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, parsed.UserId);
        return coachId.HasValue ? parsed with { CoachId = coachId.Value } : null;
    }

    private static async Task<IResult?> ValidateTargetContextAsync(
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

    private static IResult ToResult<T>(
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

    private static IResult Error(
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
