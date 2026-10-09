using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using System;
using System.Security.Claims;

namespace SmartGym.Api.Endpoints;

public static class HomeworkEndpoints
{
    public static void MapHomeworkEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/homework").RequireAuthorization();

        // Coach assigns homework to a member
        group.MapPost("/assign", async (HttpContext context, [FromBody] AssignHomeworkRequest request, IHomeworkProgressService service) =>
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

            try
            {
                var result = await service.AssignHomeworkAsync(coachId, request);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .WithTags("Homework")
        .WithSummary("Assign a workout plan to a member (Coach/Manager only)");

        // Member gets their assigned homework
        group.MapGet("/my", async (HttpContext context, IHomeworkProgressService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var memberId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetMemberHomeworksAsync(memberId);
            return Results.Ok(result);
        })
        .WithTags("Homework")
        .WithSummary("Get all homework assigned to the logged-in member");

        // Member updates their homework progress
        group.MapPut("/{id:guid}/progress", async (Guid id, HttpContext context, [FromBody] UpdateHomeworkProgressRequest request, IHomeworkProgressService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var memberId))
            {
                return Results.Unauthorized();
            }

            var success = await service.UpdateProgressAsync(memberId, id, request);
            if (!success) return Results.BadRequest(new { message = "Failed to update progress or you don't have permission." });
            
            return Results.Ok(new { message = "Progress updated successfully" });
        })
        .WithTags("Homework")
        .WithSummary("Update progress status of a homework (Member only)");
    }
}
