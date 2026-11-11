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

                    if (request.Exercises == null || request.Exercises.Count == 0 || request.Exercises.Any(e => string.IsNullOrWhiteSpace(e.Name)))
                        return Results.BadRequest(new { message = "Giáo án phải có ít nhất một bài tập hợp lệ." });

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
                        var result = await service.GetPlansByCoachIdAsync(coachId.Value);
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
