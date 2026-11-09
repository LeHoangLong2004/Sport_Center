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

/// <summary>
/// Endpoint quản lý Đánh giá & Nhận xét Huấn luyện viên (Coach Reviews & Ratings).
/// Cho phép hội viên gửi đánh giá số sao (Rating 1-5), kèm nhận xét sau buổi tập hoặc lớp học,
/// và hỗ trợ hiển thị phản hồi chất lượng đào tạo của HLV.
/// </summary>
public static class ReviewEndpoints
{
    /// <summary>
    /// Đăng ký các route đánh giá vào hệ thống.
    /// Nhóm route gốc: /api/reviews
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapReviewEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/reviews");

        // Reviews are written to PostgreSQL through IReviewService. There is no
        // local JSON fallback, so a successful response means the DB write succeeded.
        /// <summary>
        /// POST /api/reviews
        /// Hội viên gửi đánh giá mới cho Huấn luyện viên (kèm xếp hạng sao và nội dung góp ý).
        /// Yêu cầu xác thực JWT (Member).
        /// </summary>
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

                    if (request.CoachId == Guid.Empty && !string.IsNullOrWhiteSpace(request.CoachName))
                    {
                        var cleanedName = request.CoachName
                            .Replace("Coach", "", StringComparison.OrdinalIgnoreCase)
                            .Replace("HLV", "", StringComparison.OrdinalIgnoreCase)
                            .Replace(":", "")
                            .Trim();
                        var matchedUser = await db.Users
                            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.FullName, $"%{cleanedName}%"));
                        if (matchedUser != null)
                        {
                            var resolvedFromUser = await CoachProfileResolver.FindByUserIdAsync(db, matchedUser.Id);
                            request.CoachId = resolvedFromUser ?? matchedUser.Id;
                        }
                    }

                    if (request.CoachId == Guid.Empty)
                    {
                        return Results.BadRequest(new { message = "CoachId không hợp lệ." });
                    }

                    try
                    {
                        request.CoachId = await ResolveCoachIdAsync(db, request.CoachId);
                        var stored = await service.CreateReviewAsync(memberId, request);

                        var sessionLabel = !string.IsNullOrWhiteSpace(request.SessionName)
                            ? $" cho ca tập {request.SessionName}"
                            : "";

                        await classRepository.NotifyCoachAsync(
                            request.CoachId,
                            "Bạn nhận được đánh giá mới",
                            $"Hội viên đã gửi đánh giá {request.Rating}/5{sessionLabel}.",
                            "review",
                            stored.Id
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
        /// <summary>
        /// GET /api/reviews/coach/{coachId}
        /// Lấy danh sách các bài đánh giá công khai của một HLV (tên học viên được ẩn danh bảo mật).
        /// </summary>
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

        /// <summary>
        /// GET /api/reviews/{id}
        /// Lấy thông tin chi tiết một bài đánh giá theo ID.
        /// </summary>
        group
            .MapGet(
                "/{id:guid}",
                async (Guid id, SmartGymDbContext db) =>
                {
                    var review = await db.Reviews
                        .Include(r => r.Member)
                        .FirstOrDefaultAsync(r => r.Id == id);

                    if (review == null)
                    {
                        return Results.NotFound(new { message = "Không tìm thấy đánh giá." });
                    }

                    var parsedTags = new System.Collections.Generic.List<string>();
                    if (!string.IsNullOrWhiteSpace(review.TagsJson))
                    {
                        try
                        {
                            parsedTags = System.Text.Json.JsonSerializer.Deserialize<System.Collections.Generic.List<string>>(review.TagsJson)
                                ?? new System.Collections.Generic.List<string>();
                        }
                        catch {}
                    }

                    return Results.Ok(new
                    {
                        id = review.Id,
                        coachId = review.CoachId,
                        memberId = string.Empty,
                        memberName = BuildAnonymousName(review.MemberId),
                        rating = review.Rating,
                        comment = review.Comment,
                        tags = parsedTags,
                        createdAt = review.CreatedAt.ToString("o"),
                        sessionId = review.SessionId,
                        sessionName = review.SessionName
                    });
                }
            )
            .WithTags("Reviews")
            .WithSummary("Get a specific review details by ID");

        /// <summary>
        /// GET /api/reviews/my
        /// Lấy toàn bộ danh sách các đánh giá do hội viên hiện tại đã gửi.
        /// </summary>
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
