using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.BodyMetrics;
using SmartGym.Application.Interfaces;
using System;
using System.Security.Claims;

namespace SmartGym.Api.Endpoints;

public static class BodyMetricEndpoints
{
    public static void MapBodyMetricEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/body-metrics").RequireAuthorization();

        group.MapPost("/", async (HttpContext context, [FromBody] CreateBodyMetricRequest request, IBodyMetricService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.CreateAsync(userId, request);
            return Results.Ok(result);
        })
        .WithTags("Body Metrics")
        .WithSummary("Log body metrics for the logged-in user");

        group.MapGet("/me", async (HttpContext context, IBodyMetricService service) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var result = await service.GetByUserIdAsync(userId);
            return Results.Ok(result);
        })
        .WithTags("Body Metrics")
        .WithSummary("Get body metrics history for the logged-in user");

        group.MapGet("/member/{memberId:guid}", async (Guid memberId, HttpContext context, IBodyMetricService service) =>
        {
            // Only coaches and managers should be able to view a specific member's metrics.
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim != "coach" && roleClaim != "manager")
            {
                return Results.Forbid();
            }

            var result = await service.GetByUserIdAsync(memberId);
            return Results.Ok(result);
        })
        .WithTags("Body Metrics")
        .WithSummary("Get body metrics of a specific member (Coach/Manager only)");
    }
}
