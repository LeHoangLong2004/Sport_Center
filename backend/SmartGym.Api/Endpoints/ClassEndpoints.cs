using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Services;
using SmartGym.Api.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static partial class ClassEndpoints
{
    public static void MapClassEndpoints(this IEndpointRouteBuilder app)
    {
        var classGroup = app.MapGroup("/api/classes").WithTags("Classes");

        // 1. Create Class (Admin/Manager)
        classGroup
            .MapPost(
                "/",
                async ([FromBody] CreateClassRequest request, ClassService service) =>
                {
                    var (isSuccess, errorMessage) = await service.CreateClassAsync(request, "approved");
                    if (!isSuccess)
                        return Results.BadRequest(new { message = errorMessage });
                    return Results.Ok(new { message = "Class created successfully" });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        // 2. Propose Class (Coach)
        classGroup
            .MapPost(
                "/proposals",
                async (
                    [FromBody] CreateClassProposalRequest request,
                    HttpContext context,
                    SmartGymDbContext db,
                    ClassService service) =>
                {
                    var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;
                    if (!Guid.TryParse(userIdValue, out var userId))
                        return Results.Unauthorized();

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                    if (coachId == null)
                        return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                    if (request.SportId != Guid.Empty)
                    {
                        try
                        {
                            await db.Database.ExecuteSqlInterpolatedAsync(
                                $@"INSERT INTO coach_sports (coach_id, sport_id)
                                   VALUES ({coachId.Value}, {request.SportId})
                                   ON CONFLICT (coach_id, sport_id) DO NOTHING"
                            );
                        }
                        catch { }
                    }

                    var createRequest = new CreateClassRequest
                    {
                        SportId = request.SportId,
                        FacilityId = request.FacilityId,
                        CoachId = coachId.Value,
                        ClassName = request.ClassName,
                        ScheduleTime = request.ScheduleTime,
                        DurationMinutes = request.DurationMinutes,
                        Capacity = request.Capacity,
                    };
                    var (isSuccess, errorMessage) = await service.CreateClassAsync(createRequest, "pending");
                    if (!isSuccess)
                        return Results.BadRequest(new { message = errorMessage });

                    return Results.Ok(new { message = "Đề xuất lớp học đã được gửi và đang chờ Manager duyệt." });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        // 3. Approve Class Proposal
        classGroup
            .MapPut(
                "/{id:guid}/approve",
                async (Guid id, ClassService service, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var (isSuccess, errorMessage) = await service.ApproveClassAsync(id);
                        return isSuccess
                            ? Results.Ok(new { message = "Đã duyệt lớp học." })
                            : Results.BadRequest(new { message = errorMessage });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể duyệt lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể duyệt lớp học",
                            detail: "Máy chủ gặp lỗi khi kiểm tra xung đột hoặc cập nhật trạng thái lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4. Reject Class Proposal
        classGroup
            .MapPut(
                "/{id:guid}/reject",
                async (Guid id, ClassService service, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var (isSuccess, errorMessage) = await service.RejectClassAsync(id);
                        return isSuccess
                            ? Results.Ok(new { message = "Đã từ chối đề xuất lớp học." })
                            : Results.BadRequest(new { message = errorMessage });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể từ chối lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể từ chối lớp học",
                            detail: "Máy chủ gặp lỗi khi cập nhật trạng thái lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 5. Available Classes
        classGroup.MapGet(
            "/available",
            async (ClassService service, ILoggerFactory loggerFactory) =>
            {
                try
                {
                    var classes = await service.GetAvailableClassesAsync();
                    return Results.Ok(classes);
                }
                catch (Exception exception)
                {
                    var logger = loggerFactory.CreateLogger("ClassEndpoints");
                    logger.LogError(exception, "Không thể tải danh sách lớp học khả dụng.");
                    return Results.Problem(
                        title: "Không thể tải lịch học",
                        detail: "Database hiện không khả dụng. Vui lòng kiểm tra kết nối máy chủ rồi thử lại.",
                        statusCode: StatusCodes.Status503ServiceUnavailable
                    );
                }
            }
        );

        // 6. Class Detail
        classGroup.MapGet(
            "/{id:guid}",
            async (Guid id, ClassService service) =>
            {
                var classDetail = await service.GetClassDetailAsync(id);
                if (classDetail == null)
                    return Results.NotFound(new { message = "Không tìm thấy lớp học" });
                return Results.Ok(classDetail);
            }
        );

        // 7. Booking & Cancellation Endpoints
        MapClassBookingEndpoints(classGroup);
    }
}

