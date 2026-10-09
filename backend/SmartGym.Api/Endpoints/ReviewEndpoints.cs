using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;
using System;
using System.Security.Claims;

namespace SmartGym.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");

        // Member creates a review for a coach
        group.MapPost("/", async (HttpContext context, [FromBody] CreateReviewRequest request, IReviewService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var memberId))
            {
                return Results.Unauthorized();
            }

            try
            {
                var result = await service.CreateReviewAsync(memberId, request);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { message = ex.Message });
            }
        })
        .RequireAuthorization(policy => policy.RequireRole("member"))
        .WithTags("Reviews")
        .WithSummary("Review a coach (Member only)");

        // Anyone (or at least users) can view a coach's reviews
        group.MapGet("/coach/{coachId:guid}", async (Guid coachId, IReviewService service) =>
        {
            var result = await service.GetCoachReviewsAsync(coachId);
            return Results.Ok(result);
        })
        .WithTags("Reviews")
        .WithSummary("Get all reviews for a specific coach");
    }
}
