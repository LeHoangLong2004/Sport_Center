using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");

        // Reviews are written to PostgreSQL through IReviewService. There is no
        // local JSON fallback, so a successful response means the DB write succeeded.
        group
            .MapPost(
                "/",
                async (
                    HttpContext context,
                    [FromBody] CreateReviewRequest request,
                    IReviewService service,
                    IGroupClassRepository classRepository,
                    SmartGymDbContext db
                ) =>
                {
                    var memberIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(memberIdValue, out var memberId))
                    {
                        return Results.Unauthorized();
                    }

                    if (request.CoachId == Guid.Empty)
                    {
                        return Results.BadRequest(new { message = "CoachId không hợp lệ." });
                    }

                    try
                    {
                        request.CoachId = await ResolveCoachIdAsync(db, request.CoachId);
                        var stored = await service.CreateReviewAsync(memberId, request);

                        await classRepository.NotifyCoachAsync(
                            request.CoachId,
                            "Bạn nhận được đánh giá mới",
                            $"Hội viên đã gửi đánh giá {request.Rating}/5 cho bạn.",
                            "review"
                        );

                        return Results.Ok(new
                        {
                            success = true,
                            id = stored.Id,
                            coachId = stored.CoachId,
                            rating = stored.Rating,
                            comment = stored.Comment,
                            tags = stored.Tags,
                            sessionId = stored.SessionId,
                            sessionName = stored.SessionName,
                            createdAt = stored.CreatedAt.ToString("o")
                        });
                    }
                    catch (ArgumentException ex)
                    {
                        return Results.BadRequest(new { message = ex.Message });
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member"))
            .WithTags("Reviews")
            .WithSummary("Review a coach and persist it in the database");

        // Anyone can view a coach's anonymous reviews. The UI may send users.id,
        // while group-class data uses coaches.id, so resolve both representations.
        group
            .MapGet(
                "/coach/{coachId}",
                async (string coachId, IReviewService service, SmartGymDbContext db) =>
                {
                    if (!Guid.TryParse(coachId, out var requestedCoachId))
                    {
                        return Results.Ok(Array.Empty<object>());
                    }

                    var resolvedCoachId = await ResolveCoachIdAsync(db, requestedCoachId);
                    var reviews = await service.GetCoachReviewsAsync(resolvedCoachId);

                    var anonymized = reviews.Select(review => new
                    {
                        id = review.Id,
                        memberId = string.Empty,
                        memberName = BuildAnonymousName(review.MemberId),
                        rating = review.Rating,
                        comment = review.Comment,
                        tags = review.Tags,
                        createdAt = review.CreatedAt.ToString("o"),
                        sessionId = review.SessionId,
                        sessionName = review.SessionName
                    });

                    return Results.Ok(anonymized);
                }
            )
            .WithTags("Reviews")
            .WithSummary("Get anonymous reviews from the database for a coach");

        group
            .MapGet(
                "/my",
                async (HttpContext context, IReviewService service) =>
                {
                    var memberIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(memberIdValue, out var memberId))
                    {
                        return Results.Unauthorized();
                    }

                    return Results.Ok(await service.GetMemberReviewsAsync(memberId));
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member"))
            .WithTags("Reviews")
            .WithSummary("Get reviews submitted by the logged-in member from the database");
    }

    private static async Task<Guid> ResolveCoachIdAsync(SmartGymDbContext db, Guid requestedCoachId)
    {
        try
        {
            var coachId = await CoachProfileResolver.FindByIdOrUserIdAsync(db, requestedCoachId);
            return coachId ?? requestedCoachId;
        }
        catch (PostgresException)
        {
            // Older EF-only databases do not have the legacy coaches table. In
            // that schema reviews.coach_id already stores the user id.
            return requestedCoachId;
        }
    }

    private static string BuildAnonymousName(Guid memberId)
    {
        var compactId = memberId.ToString("N");
        return $"Học viên ẩn danh #{compactId[^3..].ToUpperInvariant()}";
    }

}
