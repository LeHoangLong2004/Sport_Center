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

        // Coach creates a one-off homework task without adding it to the training-plan library.
        group
            .MapPost(
                "/create",
                async (
                    HttpContext context,
                    [FromBody] CreateManualHomeworkRequest request,
                    SmartGymDbContext db,
                    IFlow5AssignmentService assignmentService,
                    IFlow5AuthorizationService authorization
                ) =>
                {
                    var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
                    if (role != "coach" && role != "manager")
                        return Results.Forbid();

                    if (!Guid.TryParse(context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
                        return Results.Unauthorized();

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                    if (coachId == null)
                        return Results.BadRequest(new { message = "Coach profile not found." });

                    if (string.IsNullOrWhiteSpace(request.PlanName))
                        return Results.BadRequest(new { message = "Vui lòng nhập tên bài tập về nhà." });
                    if (request.Exercises == null || request.Exercises.Count == 0 || request.Exercises.Any(exercise => string.IsNullOrWhiteSpace(exercise.Name)))
                        return Results.BadRequest(new { message = "Thêm ít nhất một bài tập và nhập tên cho từng bài." });
                    if (request.Target == null || request.Target.Id == Guid.Empty ||
                        (request.Target.Type != Flow5TargetTypes.Member && request.Target.Type != Flow5TargetTypes.Class))
                        return Results.BadRequest(new { message = "Vui lòng chọn học viên hoặc lớp nhận bài tập." });

                    if (string.Equals(role, "coach", StringComparison.OrdinalIgnoreCase))
                    {
                        var access = await authorization.AuthorizeTargetAsync(context.User, request.Target, context.RequestAborted);
                        if (!access.IsAllowed)
                            return access.ErrorCode == "unauthorized" ? Results.Unauthorized() : Results.Forbid();
                    }

                    await using var transaction = await db.Database.BeginTransactionAsync(context.RequestAborted);
                    try
                    {
                        var now = DateTime.UtcNow;
                        var plan = new SmartGym.Domain.Entities.WorkoutPlan
                        {
                            Id = Guid.NewGuid(),
                            CoachId = coachId.Value,
                            SportId = request.SportId,
                            PlanName = request.PlanName.Trim(),
                            Goal = request.Goal?.Trim(),
                            Level = request.Level?.Trim(),
                            DurationMinutes = request.DurationMinutes,
                            Status = Flow5PlanStatuses.Approved,
                            PlanType = "homework",
                            Source = Flow5PlanSources.Manual,
                            Version = 1,
                            ApprovedAt = now,
                            ApprovedBy = coachId.Value,
                            CreatedAt = now,
                            UpdatedAt = now,
                            Exercises = request.Exercises.Select((exercise, index) => new SmartGym.Domain.Entities.WorkoutPlanExercise
                            {
                                Id = Guid.NewGuid(),
                                Name = exercise.Name.Trim(),
                                Sets = exercise.Sets,
                                Reps = exercise.Reps,
                                Duration = exercise.Duration,
                                Rest = exercise.Rest,
                                Note = exercise.Note,
                                Order = index + 1
                            }).ToList()
                        };

                        db.WorkoutPlans.Add(plan);
                        await db.SaveChangesAsync(context.RequestAborted);

                        var result = await assignmentService.AssignAsync(
                            coachId.Value,
                            plan.Id,
                            new AssignFlow5PlanRequest
                            {
                                Target = request.Target,
                                DueDate = request.DueDate.HasValue ? new DateTimeOffset(request.DueDate.Value) : null,
                                Notes = request.Notes?.Trim()
                            },
                            context.RequestAborted);

                        if (!result.IsSuccess || result.Data == null)
                        {
                            await transaction.RollbackAsync(context.RequestAborted);
                            return Results.BadRequest(new { message = result.ErrorMessage });
                        }

                        await transaction.CommitAsync(context.RequestAborted);
                        return Results.Ok(new
                        {
                            planId = plan.Id,
                            assignedCount = result.Data.AssignedCount,
                            skippedCount = result.Data.SkippedCount
                        });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync(context.RequestAborted);
                        return Results.BadRequest(new { message = ex.InnerException?.Message ?? ex.Message });
                    }
                }
            )
            .WithTags("Homework")
            .WithSummary("Create and assign a one-off manual homework task");

        // Coach views homework assignments they created.
        group
            .MapGet(
                "/coach",
                async (HttpContext context, SmartGymDbContext db) =>
                {
                    var roleClaim = context.User.FindFirst(ClaimTypes.Role)?.Value;
                    if (roleClaim != "coach" && roleClaim != "manager")
                        return Results.Forbid();

                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(userIdClaim, out var userId))
                        return Results.Unauthorized();

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                    if (coachId == null)
                        return Results.Ok(Array.Empty<object>());

                    var assignments = await db.HomeworkProgresses
                        .AsNoTracking()
                        .Include(homework => homework.Plan)
                            .ThenInclude(plan => plan!.Exercises)
                        .Where(homework => homework.AssignedBy == coachId.Value ||
                            (homework.AssignedBy == null && homework.Plan != null && homework.Plan.CoachId == coachId.Value))
                        .OrderByDescending(homework => homework.CreatedAt)
                        .ToListAsync(context.RequestAborted);

                    return Results.Ok(assignments.Select(homework => new
                        {
                            id = homework.Id,
                            memberId = homework.MemberId,
                            memberName = homework.Member != null ? homework.Member.FullName : "Học viên",
                            memberCode = homework.Member != null ? homework.Member.MemberCode : null,
                            planId = homework.PlanId,
                            planName = homework.Plan != null ? homework.Plan.PlanName : "Kế hoạch đã lưu trữ",
                            status = homework.Status,
                            progressPct = homework.ProgressPct,
                            assignedDate = homework.AssignedDate,
                            dueDate = homework.DueDate,
                            completedAt = homework.CompletedAt,
                            notes = homework.Notes,
                            exerciseCount = homework.Plan != null ? homework.Plan.Exercises.Count : 0,
                            exercises = homework.Plan?.Exercises
                                .OrderBy(exercise => exercise.Order)
                                .Select(exercise => (object)new
                                {
                                    id = exercise.Id,
                                    name = exercise.Name,
                                    sets = exercise.Sets,
                                    reps = exercise.Reps,
                                    duration = exercise.Duration,
                                    rest = exercise.Rest,
                                    note = exercise.Note,
                                    order = exercise.Order
                                }).ToList() ?? new List<object>()
                        }));
                }
            )
            .WithTags("Homework")
            .WithSummary("Get homework assignments created by the logged-in coach");

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
                        if (plan == null)
                            return Results.NotFound(new { message = "Không tìm thấy kế hoạch tập luyện." });
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
