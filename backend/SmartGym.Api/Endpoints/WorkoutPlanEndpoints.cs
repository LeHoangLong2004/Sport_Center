using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using System;
using System.Security.Claims;

namespace SmartGym.Api.Endpoints;

public static class WorkoutPlanEndpoints
{
    public static void MapWorkoutPlanEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workout-plans").RequireAuthorization();

        // Coach creates a new workout plan
        group.MapPost("/", async (HttpContext context, [FromBody] CreateWorkoutPlanRequest request, IWorkoutPlanService service) =>
        {
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim != "coach" && roleClaim != "manager")
            {
                return Results.Forbid();
            }

            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var coachId))
            {
                return Results.Unauthorized();
            }

            var result = await service.CreatePlanAsync(coachId, request);
            return Results.Ok(result);
        })
        .WithTags("Workout Plans")
        .WithSummary("Create a new workout plan (Coach/Manager only)");

        // Get a specific plan by ID
        group.MapGet("/{id:guid}", async (Guid id, IWorkoutPlanService service) =>
        {
            var result = await service.GetPlanByIdAsync(id);
            if (result == null) return Results.NotFound();
            return Results.Ok(result);
        })
        .WithTags("Workout Plans")
        .WithSummary("Get a specific workout plan by ID");

        // Get all plans created by a specific coach (or the logged-in coach)
        group.MapGet("/coach", async (HttpContext context, IWorkoutPlanService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var coachId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetPlansByCoachIdAsync(coachId);
            return Results.Ok(result);
        })
        .WithTags("Workout Plans")
        .WithSummary("Get all workout plans created by the logged-in coach");
    }
}
