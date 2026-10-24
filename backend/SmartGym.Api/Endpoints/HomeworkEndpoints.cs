using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
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
                    IFlow5AssignmentService assignmentService,
                    IFlow5AuthorizationService authorization,
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
                        var assignmentTarget = new Flow5TargetDto
                        {
                            Type = isClass ? Flow5TargetTypes.Class : Flow5TargetTypes.Member,
                            Id = targetClassId
                        };
                        if (string.Equals(roleClaim, "coach", StringComparison.OrdinalIgnoreCase))
                        {
                            var targetAccess = await authorization.AuthorizeTargetAsync(
                                context.User,
                                assignmentTarget,
                                context.RequestAborted);
                            if (!targetAccess.IsAllowed)
                            {
                                return targetAccess.ErrorCode == "unauthorized"
                                    ? Results.Unauthorized()
                                    : Results.Forbid();
                            }
                        }

                        var plan = await db.WorkoutPlans.FirstOrDefaultAsync(p => p.Id == request.PlanId);
                        if (plan != null && !Flow5PlanStatus.CanBeAssigned(plan.Status))
                        {
                            if (plan.CoachId == null || plan.CoachId == coachId.Value)
                            {
                                plan.Status = Flow5PlanStatuses.Approved;
                                plan.ApprovedAt = DateTime.UtcNow;
                                plan.ApprovedBy = coachId.Value;
                                plan.UpdatedAt = DateTime.UtcNow;
                                await db.SaveChangesAsync();
                            }
                        }

                        if (isClass)
                        {
                            var result = await assignmentService.AssignAsync(
                                coachId.Value,
                                request.PlanId,
                                new AssignFlow5PlanRequest
                                {
                                    Target = assignmentTarget,
                                    DueDate = request.DueDate.HasValue
                                        ? new DateTimeOffset(request.DueDate.Value)
                                        : null,
                                    Notes = request.Notes
                                },
                                context.RequestAborted);
                            return ToAssignmentResult(result);
                        }

                        // Single member assignment: ensure user exists
                        var userExists = await db.Users.AnyAsync(u => u.Id == request.MemberId);
                        if (!userExists)
                        {
                            return Results.BadRequest(new { message = "Không tìm thấy học viên hoặc lớp học tương ứng trong hệ thống." });
                        }

                        var memberResult = await assignmentService.AssignAsync(
                            coachId.Value,
                            request.PlanId,
                            new AssignFlow5PlanRequest
                            {
                                    Target = assignmentTarget,
                                DueDate = request.DueDate.HasValue
                                    ? new DateTimeOffset(request.DueDate.Value)
                                    : null,
                                Notes = request.Notes
                            },
                            context.RequestAborted);
                        return ToAssignmentResult(memberResult);
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

        // Coach verifies or rejects a member's workout progress
        group
            .MapPut(
                "/{id:guid}/verify",
                async (
                    Guid id,
                    HttpContext context,
                    [FromBody] VerifyHomeworkProgressRequest request,
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

                    var success = await service.VerifyProgressAsync(coachId.Value, id, request);
                    if (!success)
                        return Results.BadRequest(
                            new { message = "Không tìm thấy bài tập hoặc không thể nghiệm thu." }
                        );

                    return Results.Ok(new { message = "Nghiệm thu giáo án thành công!" });
                }
            )
            .WithTags("Homework")
            .WithSummary("Coach verifies or rejects a member's workout progress");
    }

    private static IResult ToAssignmentResult(
        Flow5PlanServiceResult<AssignFlow5PlanResponse> result)
    {
        if (result.IsSuccess)
        {
            return Results.Ok(new
            {
                success = true,
                assignedCount = result.Data?.AssignedCount ?? 0,
                skippedCount = result.Data?.SkippedCount ?? 0,
                data = result.Data?.Assignments ?? new List<Flow5AssignmentItemDto>()
            });
        }

        var status = result.ErrorCode switch
        {
            "not_found" => StatusCodes.Status404NotFound,
            "forbidden" => StatusCodes.Status403Forbidden,
            "plan_not_approved" or "version_conflict" => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status400BadRequest
        };
        return Results.Json(new
        {
            success = false,
            code = result.ErrorCode,
            message = result.ErrorMessage
        }, statusCode: status);
    }

}
