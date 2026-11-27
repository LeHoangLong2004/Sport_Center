using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SmartGym.Application.DTOs.WorkoutPlans;
using SmartGym.Application.Interfaces;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Giáo án tập luyện (Workout Plans & Exercise Curriculums).
/// Cho phép Huấn luyện viên tạo giáo án, cấu hình danh sách bài tập (sets, reps, trọng lượng),
/// cập nhật và theo dõi các giáo án do mình phụ trách.
/// </summary>
public static class WorkoutPlanEndpoints
{
    /// <summary>
    /// Đăng ký các route giáo án vào hệ thống.
    /// Nhóm route gốc: /api/workout-plans
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapWorkoutPlanEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/workout-plans").RequireAuthorization();

        // Coach creates a new workout plan
        /// <summary>
        /// POST /api/workout-plans
        /// Huấn luyện viên tạo giáo án mới kèm danh sách các bài tập con.
        /// Quyền hạn yêu cầu: Coach hoặc Manager.
        /// </summary>
        group
            .MapPost(
                "/",
                async (
                    HttpContext context,
                    [FromBody] CreateWorkoutPlanRequest request,
                    IWorkoutPlanService service,
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

                    var coachId = await ResolveCoachIdAsync(db, userId);
                    if (coachId == null)
                        return Results.BadRequest(new { message = "Coach profile not found." });

                    if (string.IsNullOrWhiteSpace(request.PlanName))
                        return Results.BadRequest(new { message = "Tên giáo án không được để trống." });

                    var isDraft = Flow5PlanStatus.IsDraft(request.Status);
                    if ((request.Exercises == null || request.Exercises.Count == 0) && !isDraft)
                        return Results.BadRequest(new { message = "Kế hoạch chưa có bài tập phải được lưu ở trạng thái Nháp." });
                    if (request.Exercises?.Any(e => string.IsNullOrWhiteSpace(e.Name)) == true)
                        return Results.BadRequest(new { message = "Vui lòng nhập tên cho tất cả bài tập hoặc xóa bài chưa dùng." });

                    try
                    {
                        var result = await service.CreatePlanAsync(coachId.Value, request);
                        return Results.Ok(result);
                    }
                    catch (DbUpdateException ex)
                    {
                        return Results.Problem(
                            title: "Không thể lưu giáo án",
                            detail: GetDatabaseError(ex),
                            statusCode: StatusCodes.Status400BadRequest);
                    }
                    catch (Exception ex)
                    {
                        return Results.Problem(
                            title: "Không thể lưu giáo án",
                            detail: ex.InnerException?.Message ?? ex.Message,
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .WithTags("Workout Plans")
            .WithSummary("Create a new workout plan (Coach/Manager only)");

        // Get a specific plan by ID
        /// <summary>
        /// PUT /api/workout-plans/{id}
        /// Chỉnh sửa giáo án đã tạo (chỉ HLV tạo ra giáo án hoặc Manager mới có quyền sửa).
        /// </summary>
        group
            .MapPut(
                "/{id:guid}",
                async (
                    Guid id,
                    HttpContext context,
                    [FromBody] CreateWorkoutPlanRequest request,
                    IWorkoutPlanService service,
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

                    var coachId = await ResolveCoachIdAsync(db, userId);
                    if (coachId == null)
                        return Results.BadRequest(new { message = "Coach profile not found." });

                    if (string.IsNullOrWhiteSpace(request.PlanName))
                        return Results.BadRequest(new { message = "Tên giáo án không được để trống." });

                    try
                    {
                        var result = await service.UpdatePlanAsync(coachId.Value, id, request);
                        return result == null ? Results.NotFound() : Results.Ok(result);
                    }
                    catch (DbUpdateException ex)
                    {
                        return Results.Problem(
                            title: "Không thể cập nhật giáo án",
                            detail: GetDatabaseError(ex),
                            statusCode: StatusCodes.Status400BadRequest);
                    }
                    catch (Exception ex)
                    {
                        return Results.Problem(
                            title: "Không thể cập nhật giáo án",
                            detail: ex.InnerException?.Message ?? ex.Message,
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .WithTags("Workout Plans")
            .WithSummary("Update a workout plan owned by the logged-in coach");

        group.MapDelete("/{id:guid}", async (
            Guid id,
            HttpContext context,
            SmartGymDbContext db) =>
        {
            var role = context.User.FindFirst(ClaimTypes.Role)?.Value;
            if (role != "coach" && role != "manager")
                return Results.Forbid();

            var query = db.WorkoutPlans.Where(plan => plan.Id == id);
            if (role == "coach")
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!Guid.TryParse(userIdClaim, out var userId))
                    return Results.Unauthorized();

                var coachId = await ResolveCoachIdAsync(db, userId);
                if (coachId == null)
                    return Results.BadRequest(new { message = "Không tìm thấy hồ sơ HLV." });
                query = query.Where(plan => plan.CoachId == coachId.Value);
            }

            var executionStrategy = db.Database.CreateExecutionStrategy();
            return await executionStrategy.ExecuteAsync(async () =>
            {
                await using var transaction = await db.Database.BeginTransactionAsync(
                    System.Data.IsolationLevel.Serializable,
                    context.RequestAborted);

                var planToDelete = await query.FirstOrDefaultAsync(context.RequestAborted);
                if (planToDelete == null)
                    return Results.NotFound(new { message = "Không tìm thấy kế hoạch hoặc bạn không có quyền truy cập." });

                // Coach-side delete is a soft delete: keep the plan and homework history
                // so members who already received it can continue viewing/completing it.
                planToDelete.Status = Flow5PlanStatuses.Archived;
                planToDelete.UpdatedAt = DateTime.UtcNow;
                planToDelete.Version++;
                await db.SaveChangesAsync(context.RequestAborted);
                await transaction.CommitAsync(context.RequestAborted);
                return Results.Ok(new { success = true, message = "Đã ẩn kế hoạch khỏi thư viện HLV. Học viên đã nhận vẫn xem được kế hoạch." });
            });
        })
        .WithTags("Workout Plans")
        .WithSummary("Hide a workout plan from the coach library while preserving member history");

        /// <summary>
        /// GET /api/workout-plans/{id}
        /// Xem thông tin chi tiết một giáo án theo ID.
        /// </summary>
        group
            .MapGet(
                "/{id:guid}",
                async (Guid id, HttpContext context, IWorkoutPlanService service, SmartGymDbContext db) =>
                {
                    var result = await service.GetPlanByIdAsync(id);
                    if (result == null)
                        return Results.NotFound();

                    // A coach can only inspect plans created by that coach.
                    // Managers retain access to plans for operational support.
                    if (context.User.FindFirst(ClaimTypes.Role)?.Value == "coach")
                    {
                        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                        if (
                            string.IsNullOrEmpty(userIdClaim)
                            || !Guid.TryParse(userIdClaim, out var userId)
                        )
                        {
                            return Results.Unauthorized();
                        }

                        var coachId = await ResolveCoachIdAsync(db, userId);
                        if (coachId == null || result.CoachId != coachId)
                            return Results.Forbid();
                    }

                    return Results.Ok(result);
                }
            )
            .WithTags("Workout Plans")
            .WithSummary("Get a specific workout plan by ID");

        // Get all plans created by a specific coach (or the logged-in coach)
        /// <summary>
        /// GET /api/workout-plans/coach
        /// Lấy toàn bộ danh sách giáo án do Huấn luyện viên đang đăng nhập tạo ra.
        /// </summary>
        group
            .MapGet(
                "/coach",
                async (HttpContext context, IWorkoutPlanService service, SmartGymDbContext db) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (
                        string.IsNullOrEmpty(userIdClaim)
                        || !Guid.TryParse(userIdClaim, out var userId)
                    )
                    {
                        return Results.Unauthorized();
                    }

                    var coachId = await ResolveCoachIdAsync(db, userId);
                    if (coachId == null)
                        return Results.Ok(System.Array.Empty<WorkoutPlanResponse>());

                    try
                    {
                        var result = (await service.GetPlansByCoachIdAsync(coachId.Value))
                            .Where(plan => !string.Equals(plan.PlanType, "homework", StringComparison.OrdinalIgnoreCase))
                            .Where(plan => !Flow5PlanStatus.Is(plan.Status, Flow5PlanStatuses.Archived))
                            .ToList();
                        try
                        {
                            var planIds = result.Select(plan => plan.Id).ToArray();
                            if (planIds.Length > 0)
                            {
                                var assignedMembers = await db.HomeworkProgresses
                                    .Where(progress => planIds.Contains(progress.PlanId))
                                    .Select(progress => new { progress.PlanId, progress.MemberId })
                                    .Distinct()
                                    .ToListAsync();
                                var memberIds = assignedMembers.Select(assignment => assignment.MemberId).Distinct().ToArray();
                                var memberNames = await db.Users
                                    .Where(user => memberIds.Contains(user.Id))
                                    .Select(user => new { user.Id, user.FullName })
                                    .ToDictionaryAsync(user => user.Id, user => user.FullName);

                                foreach (var plan in result)
                                {
                                    var targets = assignedMembers
                                        .Where(assignment => assignment.PlanId == plan.Id)
                                        .Select(assignment => new WorkoutPlanAssignedTargetDto
                                        {
                                            Id = assignment.MemberId.ToString(),
                                            Name = memberNames.GetValueOrDefault(assignment.MemberId) ?? "Học viên",
                                        })
                                        .ToList();
                                    plan.AssignedCount = targets.Count;
                                    plan.AssignedTo = targets;
                                }
                            }
                        }
                        catch (Exception)
                        {
                            // Assignment details are optional; a failure must not hide saved plans.
                        }

                        return Results.Ok(result);
                    }
                    catch (Exception)
                    {
                        // Return empty list if tables or records are not ready yet
                        return Results.Ok(System.Array.Empty<WorkoutPlanResponse>());
                    }
                }
            )
            .WithTags("Workout Plans")
            .WithSummary("Get all workout plans created by the logged-in coach");

        app.MapFlow5WorkoutPlanEndpoints();
    }

    private static async Task<Guid?> ResolveCoachIdAsync(SmartGymDbContext db, Guid userId)
    {
        return await CoachProfileResolver.FindByUserIdAsync(db, userId);
    }

    private static string GetDatabaseError(DbUpdateException exception)
    {
        if (exception.InnerException is PostgresException postgres)
            return postgres.MessageText;
        return exception.InnerException?.Message ?? exception.Message;
    }
}
