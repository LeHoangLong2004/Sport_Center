using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class HomeworkEndpoints
{
    public static void MapHomeworkEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/homework").RequireAuthorization();

        // Coach assigns homework to a member
        group
            .MapPost(
                "/assign",
                async (
                    HttpContext context,
                    [FromBody] AssignHomeworkRequest request,
                    IHomeworkProgressService service,
                    SmartGymDbContext db
                ) =>
                {
                    var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
                    if (roleClaim != "coach" && roleClaim != "manager")
                    {
                        return Results.Forbid();
                    }

                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (
                        string.IsNullOrEmpty(userIdClaim)
                        || !Guid.TryParse(userIdClaim, out var userId)
                    )
                    {
                        return Results.Unauthorized();
                    }

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                    if (coachId == null)
                        return Results.BadRequest(new { message = "Coach profile not found." });

                    try
                    {
                        var isExplicitClass = string.Equals(request.Type, "class", StringComparison.OrdinalIgnoreCase) || request.ClassId.HasValue;
                        var targetClassId = request.ClassId ?? request.MemberId;

                        var isClassInDb = (await db.Database.SqlQueryRaw<Guid>(
                            "SELECT id FROM classes WHERE id = {0} LIMIT 1",
                            targetClassId
                        ).ToListAsync()).Any();
                        var isClass = isExplicitClass || (!await db.Users.AnyAsync(u => u.Id == request.MemberId) && isClassInDb);

                        if (isClass)
                        {
                            var studentUserIds = await db.Database.SqlQueryRaw<Guid>(
                                @"SELECT DISTINCT user_id FROM class_bookings 
                                  WHERE class_id = {0} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                                targetClassId
                            ).ToListAsync();

                            if (studentUserIds.Count == 0)
                            {
                                return Results.BadRequest(new { message = "Lớp học này hiện chưa có học viên nào đăng ký để giao giáo án." });
                            }

                            var assignedList = new List<HomeworkProgressResponse>();
                            foreach (var studentId in studentUserIds)
                            {
                                var subRequest = new AssignHomeworkRequest
                                {
                                    MemberId = studentId,
                                    PlanId = request.PlanId,
                                    DueDate = request.DueDate,
                                    Notes = request.Notes
                                };
                                var res = await service.AssignHomeworkAsync(coachId.Value, subRequest);
                                assignedList.Add(res);
                            }

                            return Results.Ok(new { success = true, assignedCount = assignedList.Count, data = assignedList });
                        }

                        // Single member assignment: ensure user exists
                        var userExists = await db.Users.AnyAsync(u => u.Id == request.MemberId);
                        if (!userExists)
                        {
                            return Results.BadRequest(new { message = "Không tìm thấy học viên hoặc lớp học tương ứng trong hệ thống." });
                        }

                        var result = await service.AssignHomeworkAsync(coachId.Value, request);
                        return Results.Ok(result);
                    }
                    catch (Exception ex)
                    {
                        return Results.BadRequest(new { message = ex.Message });
                    }
                }
            )
            .WithTags("Homework")
            .WithSummary("Assign a workout plan to a member (Coach/Manager only)");

        // Member gets their assigned homework
        group
            .MapGet(
                "/my",
                async (HttpContext context, IHomeworkProgressService service) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (
                        string.IsNullOrEmpty(userIdClaim)
                        || !Guid.TryParse(userIdClaim, out var memberId)
                    )
                    {
                        return Results.Unauthorized();
                    }

                    var result = await service.GetMemberHomeworksAsync(memberId);
                    return Results.Ok(result);
                }
            )
            .WithTags("Homework")
            .WithSummary("Get all homework assigned to the logged-in member");

        // Member updates their homework progress
        group
            .MapPut(
                "/{id:guid}/progress",
                async (
                    Guid id,
                    HttpContext context,
                    [FromBody] UpdateHomeworkProgressRequest request,
                    IHomeworkProgressService service
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

                    var success = await service.UpdateProgressAsync(memberId, id, request);
                    if (!success)
                        return Results.BadRequest(
                            new
                            {
                                message = "Failed to update progress or you don't have permission.",
                            }
                        );

                    return Results.Ok(new { message = "Progress updated successfully" });
                }
            )
            .WithTags("Homework")
            .WithSummary("Update progress status of a homework (Member only)");
    }

}
