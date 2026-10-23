using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using static SmartGym.Api.Endpoints.Flow5EndpointHelpers;

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
}
