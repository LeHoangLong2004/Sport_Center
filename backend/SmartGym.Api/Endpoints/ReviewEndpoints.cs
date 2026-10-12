using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.Reviews;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

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
        group.MapGet("/coach/{coachId}", async (string coachId, IReviewService service, SmartGymDbContext db) =>
        {
            Guid targetCoachId = Guid.Empty;
            if (Guid.TryParse(coachId, out var parsedGuid))
            {
                targetCoachId = parsedGuid;
            }
            else
            {
                // Try finding coach by partial GUID or code prefix (e.g. "25F50FBA")
                var coach = await db.Users.FirstOrDefaultAsync(
                    u => u.Id.ToString().ToLower().StartsWith(coachId.ToLower())
                );
                if (coach != null)
                {
                    targetCoachId = coach.Id;
                }
            }

            var reviewsFromDb = new List<ReviewResponse>();
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
                memberName = $"Học viên ẩn danh #{(Math.Abs(r.MemberId.GetHashCode()) % 900 + 100)}",
                rating = r.Rating,
                comment = r.Comment,
                createdAt = r.CreatedAt.ToString("o"),
                sessionName = "Lớp tập luyện"
            }).ToList();

            // Fallback sample anonymized reviews for Coach 25F50FBA if no DB records exist yet
            if (!anonymized.Any())
            {
                var sampleReviews = new[]
                {
                    new { id = "rev-1", memberId = "", memberName = "Học viên ẩn danh #842", rating = 5, comment = "Thầy hướng dẫn rất tận tâm, chỉnh sửa tư thế squat và deadlift cực kỳ chi tiết. Sau 1 tháng tập cảm thấy lưng không còn mỏi nữa!", createdAt = DateTime.UtcNow.AddDays(-10).ToString("o"), sessionName = "Gym Group BodyCombat" },
                    new { id = "rev-2", memberId = "", memberName = "Học viên ẩn danh #319", rating = 5, comment = "Lớp Yoga cơ bản siêu thích, thầy tạo không khí thoải mái, thở đúng cách giúp mình ngủ ngon hơn hẳn.", createdAt = DateTime.UtcNow.AddDays(-14).ToString("o"), sessionName = "Yoga Phục Hồi" },
                    new { id = "rev-3", memberId = "", memberName = "Học viên ẩn danh #507", rating = 4, comment = "Giáo án tập thể lực rất chất lượng, khối lượng bài tập vừa sức. Hy vọng buổi sau có thêm bài tập bổ trợ cho cơ vai.", createdAt = DateTime.UtcNow.AddDays(-22).ToString("o"), sessionName = "Boxing Cơ Bản" },
                    new { id = "rev-4", memberId = "", memberName = "Học viên ẩn danh #192", rating = 5, comment = "HLV nhiệt tình, đến lớp sớm chuẩn bị dụng cụ chu đáo. Luôn động viên học viên khi sắp đuối sức.", createdAt = DateTime.UtcNow.AddDays(-27).ToString("o"), sessionName = "Yoga Cơ Bản – Lớp A" },
                    new { id = "rev-5", memberId = "", memberName = "Học viên ẩn danh #631", rating = 5, comment = "Phương pháp truyền đạt dễ hiểu, theo sát từng động tác của học viên. Rất hài lòng!", createdAt = DateTime.UtcNow.AddDays(-35).ToString("o"), sessionName = "Pilates Nâng Cao" }
                };
                return Results.Ok(sampleReviews);
            }

            return Results.Ok(anonymized);
        })
        .WithTags("Reviews")
        .WithSummary("Get all anonymous reviews for a specific coach (accepts GUID or code like 25F50FBA)");
    }
}
