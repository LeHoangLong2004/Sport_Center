using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs;
using SmartGym.Application.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SmartGym.Api.Endpoints;

public static class SubscriptionEndpoints
{
    public static void MapSubscriptionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/subscriptions").RequireAuthorization();

        group.MapGet("/me", async (HttpContext context, ISubscriptionService subscriptionService) =>
        {
            var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                return Results.Unauthorized();

            var subscriptions = await subscriptionService.GetMySubscriptionsAsync(userId);
            return Results.Ok(subscriptions);
        });

        group.MapPost("/", async (HttpContext context, [FromBody] CreateSubscriptionRequest request, ISubscriptionService subscriptionService) =>
        {
            try
            {
                var userIdString = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                    return Results.Unauthorized();

                var subscription = await subscriptionService.SubscribeToPackageAsync(userId, request);
                return Results.Created($"/api/subscriptions/{subscription.Id}", subscription);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });
    }
}
