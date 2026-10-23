using System;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.Tasks;
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

public static partial class CoachEndpoints
{
    private static void MapCurriculumEndpoints(RouteGroupBuilder group)
    {
        group.MapGet(
            "/curricula",
            async (HttpContext context, SmartGymDbContext db, IWorkoutPlanService service) =>
            {
                var coachId = await ResolveCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Ok(Array.Empty<object>());

                var plans = await service.GetPlansByCoachIdAsync(coachId.Value);
                return Results.Ok(plans.Select(ToLegacyCurriculumResponse));
            }
        );

        group.MapPost(
            "/curricula",
            async (HttpContext context, SmartGymDbContext db, IWorkoutPlanService service, [FromBody] JsonElement request) =>
            {
                var coachId = await ResolveCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Unauthorized();

                var payload = ToCreateRequest(request);
                WorkoutPlanResponse? result;
                var rawId = GetString(request, "id");
                if (Guid.TryParse(rawId, out var existingId))
                    result = await service.UpdatePlanAsync(coachId.Value, existingId, payload);
                else
                    result = await service.CreatePlanAsync(coachId.Value, payload);

                return result == null
                    ? Results.NotFound(new { message = "Không tìm thấy giáo án." })
                    : Results.Ok(new { success = true, data = ToLegacyCurriculumResponse(result) });
            }
        );

        group.MapPost(
            "/curricula/{id:guid}/approve",
            async (Guid id, HttpContext context, SmartGymDbContext db) =>
            {
                var coachId = await ResolveCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Unauthorized();

                var plan = await db.WorkoutPlans.FirstOrDefaultAsync(p => p.Id == id);
                if (plan == null)
                    return Results.NotFound(new { message = "Không tìm thấy giáo án." });

                if (plan.CoachId == null)
                {
                    plan.CoachId = coachId.Value;
                }

                plan.Status = Flow5PlanStatuses.Approved;
                plan.ApprovedAt = DateTime.UtcNow;
                plan.ApprovedBy = coachId.Value;
                plan.UpdatedAt = DateTime.UtcNow;
                await db.SaveChangesAsync();

                return Results.Ok(new { success = true, message = "Giáo án đã sẵn sàng giao!", status = "approved" });
            }
        );

        group.MapPost(
            "/curricula/{id:guid}/assign",
            async (Guid id, HttpContext context, SmartGymDbContext db, IWorkoutPlanService planService, IFlow5AssignmentService assignmentService, IFlow5AuthorizationService authorization, [FromBody] JsonElement request) =>
            {
                var coachId = await ResolveCoachIdAsync(context, db);
                if (coachId == null)
                    return Results.Unauthorized();

                var rawTargetId = GetString(request, "memberId") ?? GetString(request, "classId") ?? GetString(request, "id");
                if (!Guid.TryParse(rawTargetId, out var targetId))
                    return Results.BadRequest(new { message = "Đối tượng nhận giáo án không hợp lệ." });
                var plan = await planService.GetPlanByIdAsync(id);
                if (plan == null)
                    return Results.NotFound(new { message = "Không tìm thấy giáo án." });

                if (!Flow5PlanStatus.CanBeAssigned(plan.Status))
                {
                    // If the coach owns the plan (or seeded without coach), auto-promote to approved
                    if (plan.CoachId == null || plan.CoachId == coachId.Value)
                    {
                        var dbPlan = await db.WorkoutPlans.FirstOrDefaultAsync(p => p.Id == id);
                        if (dbPlan != null)
                        {
                            dbPlan.Status = Flow5PlanStatuses.Approved;
                            dbPlan.ApprovedAt = DateTime.UtcNow;
                            dbPlan.ApprovedBy = coachId.Value;
                            dbPlan.UpdatedAt = DateTime.UtcNow;
                            await db.SaveChangesAsync();
                            plan = await planService.GetPlanByIdAsync(id) ?? plan;
                        }
                    }
                }

                if (!Flow5PlanStatus.CanBeAssigned(plan.Status))
                {
                    return Results.Conflict(new
                    {
                        code = "plan_not_approved",
                        message = "Only approved workout plans can be assigned."
                    });
                }

                var type = GetString(request, "type");
                var note = GetString(request, "note") ?? GetString(request, "notes") ?? "Vui lòng hoàn thành đúng tiến độ";
                DateTime? dueDate = null;
                var rawDeadline = GetString(request, "deadline") ?? GetString(request, "dueDate");
                if (!string.IsNullOrWhiteSpace(rawDeadline) && DateTime.TryParse(rawDeadline, out var parsedDeadline))
                {
                    dueDate = parsedDeadline;
                }

                var isExplicitClass = string.Equals(type, "class", StringComparison.OrdinalIgnoreCase);
                var isClassInDb = (await db.Database.SqlQueryRaw<Guid>(
                    "SELECT id FROM classes WHERE id = {0} LIMIT 1",
                    targetId
                ).ToListAsync()).Any();
                var isClass = isExplicitClass || (!await db.Users.AnyAsync(u => u.Id == targetId) && isClassInDb);
                var assignmentTarget = new Flow5TargetDto
                {
                    Type = isClass ? Flow5TargetTypes.Class : Flow5TargetTypes.Member,
                    Id = targetId
                };
                var targetAccess = await authorization.AuthorizeTargetAsync(
                    context.User,
                    assignmentTarget,
                    context.RequestAborted);
                if (!targetAccess.IsAllowed || targetAccess.Context?.CoachId != coachId.Value)
                {
                    return targetAccess.ErrorCode == "unauthorized"
                        ? Results.Unauthorized()
                        : Results.Forbid();
                }

                if (isClass)
                {
                    var studentUserIds = await db.Database.SqlQueryRaw<Guid>(
                        @"SELECT DISTINCT user_id FROM class_bookings 
                          WHERE class_id = {0} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                        targetId
                    ).ToListAsync();

                    if (studentUserIds.Count == 0)
                    {
                        return Results.BadRequest(new { message = "Lớp học này hiện chưa có học viên nào đăng ký để giao giáo án." });
                    }

                    var classAssignment = await assignmentService.AssignAsync(
                        coachId.Value,
                        id,
                        new AssignFlow5PlanRequest
                        {
                            Target = assignmentTarget,
                            DueDate = dueDate.HasValue ? new DateTimeOffset(dueDate.Value) : null,
                            Notes = note,
                            ExpectedVersion = plan.Version
                        },
                        context.RequestAborted);
                    return ToLegacyAssignmentResult(classAssignment);
                }

                // Member assignment
                var userExists = await db.Users.AnyAsync(u => u.Id == targetId);
                if (!userExists)
                {
                    return Results.BadRequest(new { message = "Không tìm thấy học viên hoặc lớp học tương ứng trong hệ thống." });
                }

                var memberAssignment = await assignmentService.AssignAsync(
                    coachId.Value,
                    id,
                    new AssignFlow5PlanRequest
                    {
                        Target = assignmentTarget,
                        DueDate = dueDate.HasValue ? new DateTimeOffset(dueDate.Value) : null,
                        Notes = note,
                        ExpectedVersion = plan.Version
                    },
                    context.RequestAborted);
                return ToLegacyAssignmentResult(memberAssignment);
            }
        );
    }

    private static async Task<Guid?> ResolveCoachIdAsync(HttpContext context, SmartGymDbContext db)
    {
        var rawUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? context.User.FindFirstValue("sub");
        return Guid.TryParse(rawUserId, out var userId)
            ? await CoachProfileResolver.FindByUserIdAsync(db, userId)
            : null;
    }

    private static CreateWorkoutPlanRequest ToCreateRequest(JsonElement request)
    {
        var exercises = request.TryGetProperty("exercises", out var exerciseArray)
            && exerciseArray.ValueKind == JsonValueKind.Array
            ? exerciseArray.EnumerateArray().Select(e => new ExerciseDto
            {
                Name = GetString(e, "name") ?? string.Empty,
                Reps = GetString(e, "reps"),
                Rest = GetString(e, "rest"),
                Note = GetString(e, "note")
            }).ToList()
            : new System.Collections.Generic.List<ExerciseDto>();

        return new CreateWorkoutPlanRequest
        {
            PlanName = GetString(request, "planName") ?? GetString(request, "name") ?? "Giáo án mới",
            SportId = Guid.TryParse(GetString(request, "sportId"), out var sportId) ? sportId : null,
            Description = GetString(request, "description"),
            Goal = GetString(request, "goal"),
            Level = GetString(request, "level"),
            DurationMinutes = GetInt(request, "durationMinutes") ?? GetInt(request, "duration"),
            Status = GetString(request, "status"),
            Exercises = exercises
        };
    }

    private static object ToLegacyCurriculumResponse(WorkoutPlanResponse plan)
    {
        var assignedTo = plan.RecommendationTargetId.HasValue
            ? new object[] { new { type = plan.RecommendationTargetType ?? "class", id = plan.RecommendationTargetId.Value.ToString(), name = plan.PlanName } }
            : Array.Empty<object>();

        return new
        {
            id = plan.Id.ToString(),
            name = plan.PlanName,
            sportId = plan.SportId?.ToString(),
            sport = string.Empty,
            goal = plan.Goal ?? string.Empty,
            level = plan.Level ?? string.Empty,
            duration = plan.DurationMinutes ?? 60,
            status = plan.Status,
            updatedAt = plan.UpdatedAt.ToString("yyyy-MM-dd"),
            description = plan.Description ?? string.Empty,
            exercises = plan.Exercises.Select(e => new { name = e.Name, reps = e.Reps ?? "", rest = e.Rest ?? "", note = e.Note ?? "" }),
            recommendationTargetType = plan.RecommendationTargetType,
            recommendationTargetId = plan.RecommendationTargetId?.ToString(),
            assignedTo = assignedTo
        };
    }

    private static IResult ToLegacyAssignmentResult(
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

    private static string? GetString(JsonElement request, string property)
    {
        return request.TryGetProperty(property, out var value)
            && value.ValueKind != JsonValueKind.Null
            ? value.GetString()
            : null;
    }

    private static int? GetInt(JsonElement request, string property)
    {
        return request.TryGetProperty(property, out var value) && value.TryGetInt32(out var result)
            ? result
            : null;
    }
}
