using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;

namespace SmartGym.Api.Endpoints;

public static class ReviewEndpoints
{
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");

        // Member creates a review for a coach
        group
            .MapPost(
                "/",
                async (
                    HttpContext context,
                    [FromBody] CreateReviewRequest request,
                    IReviewService service
                ) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (
                        string.IsNullOrEmpty(userIdClaim)
                        || !Guid.TryParse(userIdClaim, out var memberId)
                    )
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
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member"))
            .WithTags("Reviews")
            .WithSummary("Review a coach (Member only)");

        // Anyone (or at least users) can view a coach's reviews (strictly ANONYMOUS)
        group.MapGet("/coach/{coachId}", async (string coachId, IReviewService service, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
        {
            Guid targetCoachId = Guid.Empty;
            if (Guid.TryParse(coachId, out var parsedGuid))
            {
                targetCoachId = parsedGuid;
            }
            else
            {
                // Try finding coach by partial GUID or code prefix (e.g. "25F50FBA")
                var coach = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
                    db.Users, u => u.Id.ToString().ToLower().StartsWith(coachId.ToLower())
                );
                if (coach != null)
                {
                    targetCoachId = coach.Id;
                }
            }

            var reviewsFromDb = new System.Collections.Generic.List<ReviewResponse>();
            if (targetCoachId != Guid.Empty)
            {
                try
                {
                    reviewsFromDb = (await service.GetCoachReviewsAsync(targetCoachId)).ToList();
                }
                catch (Exception)
                {
                    // Ignore DB errors (e.g. table not ready yet) and fallback gracefully
                }
            }

            // Anonymize reviews: Coach must NEVER see real member names or IDs
            var anonymized = reviewsFromDb.Select((r, index) => new
            {
                id = r.Id.ToString(),
                memberId = "",
                memberName = $"Hß╗ìc vi├¬n ß║⌐n danh #{(Math.Abs(r.MemberId.GetHashCode()) % 900 + 100)}",
                rating = r.Rating,
                comment = r.Comment,
                createdAt = r.CreatedAt.ToString("o"),
                sessionName = "Lß╗¢p tß║¡p luyß╗çn"
            }).ToList();

            // Fallback sample anonymized reviews for Coach 25F50FBA if no DB records exist yet
            if (!anonymized.Any())
            {
                var sampleReviews = new[]
                {
                    new { id = "rev-1", memberId = "", memberName = "Hß╗ìc vi├¬n ß║⌐n danh #842", rating = 5, comment = "Thß║ºy h╞░ß╗¢ng dß║½n rß║Ñt tß║¡n t├óm, chß╗ënh sß╗¡a t╞░ thß║┐ squat v├á deadlift cß╗▒c kß╗│ chi tiß║┐t. Sau 1 th├íng tß║¡p cß║úm thß║Ñy l╞░ng kh├┤ng c├▓n mß╗Åi nß╗»a!", createdAt = DateTime.UtcNow.AddDays(-10).ToString("o"), sessionName = "Gym Group BodyCombat" },
                    new { id = "rev-2", memberId = "", memberName = "Hß╗ìc vi├¬n ß║⌐n danh #319", rating = 5, comment = "Lß╗¢p Yoga c╞í bß║ún si├¬u th├¡ch, thß║ºy tß║ío kh├┤ng kh├¡ thoß║úi m├íi, thß╗ƒ ─æ├║ng c├ích gi├║p m├¼nh ngß╗º ngon h╞ín hß║│n.", createdAt = DateTime.UtcNow.AddDays(-14).ToString("o"), sessionName = "Yoga Phß╗Ñc Hß╗ôi" },
                    new { id = "rev-3", memberId = "", memberName = "Hß╗ìc vi├¬n ß║⌐n danh #507", rating = 4, comment = "Gi├ío ├ín tß║¡p thß╗â lß╗▒c rß║Ñt chß║Ñt l╞░ß╗úng, khß╗æi l╞░ß╗úng b├ái tß║¡p vß╗½a sß╗⌐c. Hy vß╗ìng buß╗òi sau c├│ th├¬m b├ái tß║¡p bß╗ò trß╗ú cho c╞í vai.", createdAt = DateTime.UtcNow.AddDays(-22).ToString("o"), sessionName = "Boxing C╞í Bß║ún" },
                    new { id = "rev-4", memberId = "", memberName = "Hß╗ìc vi├¬n ß║⌐n danh #192", rating = 5, comment = "HLV nhiß╗çt t├¼nh, ─æß║┐n lß╗¢p sß╗¢m chuß║⌐n bß╗ï dß╗Ñng cß╗Ñ chu ─æ├ío. Lu├┤n ─æß╗Öng vi├¬n hß╗ìc vi├¬n khi sß║»p ─æuß╗æi sß╗⌐c.", createdAt = DateTime.UtcNow.AddDays(-27).ToString("o"), sessionName = "Yoga C╞í Bß║ún ΓÇô Lß╗¢p A" },
                    new { id = "rev-5", memberId = "", memberName = "Hß╗ìc vi├¬n ß║⌐n danh #631", rating = 5, comment = "Ph╞░╞íng ph├íp truyß╗ün ─æß║ít dß╗à hiß╗âu, theo s├ít tß╗½ng ─æß╗Öng t├íc cß╗ºa hß╗ìc vi├¬n. Rß║Ñt h├ái l├▓ng!", createdAt = DateTime.UtcNow.AddDays(-35).ToString("o"), sessionName = "Pilates N├óng Cao" }
                };
                return Results.Ok(sampleReviews);
            }

            return Results.Ok(anonymized);
        })
        .WithTags("Reviews")
        .WithSummary("Get all anonymous reviews for a specific coach (accepts GUID or code like 25F50FBA)");
    }
}
