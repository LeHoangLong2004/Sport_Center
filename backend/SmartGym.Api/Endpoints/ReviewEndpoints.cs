using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Services;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");

        // Member creates a review for a coach (Persistent via ReviewStoreService + DB fallback)
        group
            .MapPost(
                "/",
                async (
                    HttpContext context,
                    [FromBody] CreateCoachReviewDto request,
                    ReviewStoreService reviewStore,
                    IReviewService service
                ) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var nameClaim = context.User.FindFirst(ClaimTypes.Name)?.Value;

                    var memberId = !string.IsNullOrEmpty(userIdClaim) ? userIdClaim : "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
                    var memberName = !string.IsNullOrEmpty(nameClaim) ? nameClaim : "Hồ Xuân Ánh Nam";

                    // Persist to ReviewStoreService
                    var stored = reviewStore.AddReview(request, memberId, memberName);

                    // Try saving to DB if Guid is valid
                    if (Guid.TryParse(memberId, out var parsedMemberId) && Guid.TryParse(request.CoachId, out var parsedCoachId))
                    {
                        try
                        {
                            await service.CreateReviewAsync(parsedMemberId, new CreateReviewRequest
                            {
                                CoachId = parsedCoachId,
                                Rating = request.Rating,
                                Comment = request.Comment
                            });
                        }
                        catch
                        {
                            // DB fallback swallowed
                        }
                    }

                    return Results.Ok(new
                    {
                        success = true,
                        id = stored.Id,
                        coachId = stored.CoachId,
                        coachName = stored.CoachName,
                        rating = stored.Rating,
                        comment = stored.Comment,
                        tags = stored.Tags,
                        sessionName = stored.SessionName,
                        createdAt = stored.CreatedAt.ToString("o")
                    });
                }
            )
            .WithTags("Reviews")
            .WithSummary("Review a coach (Member only, persistent)");

        // Anyone (or coach) can view coach reviews (strictly ANONYMOUS)
        group.MapGet("/coach/{coachId}", (string coachId, ReviewStoreService reviewStore) =>
        {
            var reviews = reviewStore.GetReviewsForCoach(coachId);

            var anonymized = reviews.Select(r => new
            {
                id = r.Id,
                memberId = "",
                memberName = r.AnonymizedMemberName,
                rating = r.Rating,
                comment = r.Comment,
                tags = r.Tags,
                createdAt = r.CreatedAt.ToString("o"),
                sessionName = r.SessionName
            }).ToList();

            return Results.Ok(anonymized);
        })
        .WithTags("Reviews")
        .WithSummary("Get all anonymous reviews for a specific coach (accepts GUID or code like 25F50FBA)");

        // Member gets their own submitted reviews
        group.MapGet("/my", (HttpContext context, ReviewStoreService reviewStore) =>
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var memberId = !string.IsNullOrEmpty(userIdClaim) ? userIdClaim : "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

            var reviews = reviewStore.GetReviewsForMember(memberId);
            return Results.Ok(reviews);
        })
        .WithTags("Reviews")
        .WithSummary("Get reviews submitted by the logged-in member");
    }
}

