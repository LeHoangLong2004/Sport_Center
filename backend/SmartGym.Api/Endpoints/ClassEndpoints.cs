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
using SmartGym.Application.Common;
using SmartGym.Api.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

/// <summary>
/// Endpoint quản lý Lớp học thể thao (Group Classes & Scheduling).
/// Hỗ trợ: Tạo lớp học mới (Quản lý/Admin), HLV gửi đề xuất mở lớp,
/// lấy danh sách lớp đang mở đăng ký và xem thông tin chi tiết lớp học.
/// </summary>
public static partial class ClassEndpoints
{
    /// <summary>
    /// Đăng ký các route quản lý lớp học vào hệ thống định tuyến.
    /// Nhóm route gốc: /api/classes
    /// </summary>
    /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
    public static void MapClassEndpoints(this IEndpointRouteBuilder app)
    {
        var classGroup = app.MapGroup("/api/classes").WithTags("Classes");

        // 1. Create Class (Admin/Manager)
        /// <summary>
        /// POST /api/classes
        /// Tạo mới một lớp học thể thao (trực tiếp được duyệt - approved).
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
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
        /// <summary>
        /// POST /api/classes/proposals
        /// Huấn luyện viên đề xuất mở lớp học mới (chờ quản lý phê duyệt).
        /// - Yêu cầu thời gian mở lớp phải trước tối thiểu 24 giờ.
        /// Quyền hạn yêu cầu: Coach.
        /// </summary>
        classGroup
            .MapPost(
                "/proposals",
                async (
                    [FromBody] CreateClassProposalRequest request,
                    HttpContext context,
                    SmartGymDbContext db,
                    ClassService service,
                    ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? context.User.FindFirst("sub")?.Value;
                        if (!Guid.TryParse(userIdValue, out var userId))
                            return Results.Unauthorized();

                        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                        if (coachId == null)
                            return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                        var scheduleTimeUtc = request.ScheduleTime.Kind == DateTimeKind.Utc
                            ? request.ScheduleTime
                            : request.ScheduleTime.ToUniversalTime();

                        if (scheduleTimeUtc < DateTime.UtcNow.AddHours(24))
                        {
                            return Results.BadRequest(new { message = "Thời gian bắt đầu lớp học đề xuất phải cách thời điểm hiện tại ít nhất 24 giờ để Ban quản lý kịp phê duyệt và hội viên đăng ký." });
                        }

                        if (request.SportId != Guid.Empty)
                        {
                            var isAssignedSport = await db.Database.SqlQueryRaw<int>(
                                @"SELECT 1 AS ""Value"" FROM coach_sports WHERE coach_id = {0} AND sport_id = {1}",
                                coachId.Value, request.SportId
                            ).AnyAsync();

                            if (!isAssignedSport)
                            {
                                return Results.BadRequest(new { message = "Bạn chưa được phân công phụ trách bộ môn này. Vui lòng liên hệ Quản lý để được cấp quyền chuyên môn trước khi đề xuất mở lớp." });
                            }
                        }

                        var createRequest = new CreateClassRequest
                        {
                            SportId = request.SportId,
                            FacilityId = request.FacilityId,
                            CoachId = coachId.Value,
                            ClassName = request.ClassName,
                            ScheduleTime = scheduleTimeUtc,
                            DurationMinutes = request.DurationMinutes,
                            Capacity = request.Capacity,
                            DaysOfWeek = request.DaysOfWeek,
                            Weeks = request.Weeks,
                            TotalSessions = request.TotalSessions
                        };
                        var (isSuccess, errorMessage) = await service.CreateClassAsync(createRequest, "pending");
                        if (!isSuccess)
                            return Results.BadRequest(new { message = errorMessage });

                        return Results.Ok(new { message = "Đề xuất lớp học đã được gửi và đang chờ Manager duyệt." });
                    }
                    catch (Exception ex)
                    {
                        loggerFactory.CreateLogger("ClassProposal").LogError(ex, "Failed to create recurring class proposal for the current coach.");
                        return Results.Problem(
                            title: "Không thể gửi đề xuất mở lớp.",
                            detail: ex.InnerException?.Message ?? ex.Message,
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        /// <summary>
        /// GET /api/classes/proposals/my
        /// Lấy danh sách các đề xuất mở lớp học do chính Huấn luyện viên hiện tại gửi (bao gồm pending, approved, rejected).
        /// </summary>
        classGroup
            .MapGet(
                "/proposals/my",
                async (
                    HttpContext context,
                    SmartGymDbContext db) =>
                {
                    var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? context.User.FindFirst("sub")?.Value;
                    if (!Guid.TryParse(userIdValue, out var userId))
                        return Results.Unauthorized();

                    var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                    if (coachId == null)
                        return Results.Ok(Array.Empty<object>());

                    var effectiveDate = DateOnly.FromDateTime(CenterTime.ToLocal(DateTime.UtcNow));
                    var sql = @"
                        SELECT c.id, c.class_name, c.schedule_time, c.duration_minutes, c.capacity,
                               c.status, c.approval_status, c.sport_id, s.name AS sport_name, f.name AS facility_name,
                               COALESCE(
                                   c.course_fee_snapshot,
                                   current_price.price_per_session * GREATEST(COALESCE(c.total_sessions, 1), 1)
                               ) AS price,
                               c.parent_id, c.session_number, c.total_sessions
                        FROM classes c
                        LEFT JOIN sports s ON c.sport_id = s.id
                        LEFT JOIN facilities f ON c.facility_id = f.id
                        LEFT JOIN LATERAL (
                            SELECT p.price_per_session
                            FROM sport_class_pricing p
                            WHERE p.sport_id = c.sport_id
                              AND p.is_active = TRUE
                              AND p.effective_from <= {2}
                              AND (p.effective_to IS NULL OR p.effective_to >= {2})
                            ORDER BY p.effective_from DESC, p.created_at DESC
                            LIMIT 1
                        ) current_price ON TRUE
                        WHERE (c.coach_id = {0} OR c.coach_id = {1})
                          AND c.approval_status IN ('pending', 'approved', 'rejected')
                          AND (c.parent_id IS NULL OR c.session_number = 1)
                        ORDER BY c.schedule_time DESC";

                    var proposals = await db.Database.SqlQueryRaw<CoachClassProposalRow>(sql, coachId.Value, userId, effectiveDate).ToListAsync();
                    return Results.Ok(proposals.Select(p => new
                    {
                        id = p.id,
                        className = p.class_name,
                        scheduleTime = (p.schedule_time.Kind == DateTimeKind.Local
                            ? p.schedule_time.ToUniversalTime()
                            : DateTime.SpecifyKind(p.schedule_time, DateTimeKind.Utc)).ToString("o"),
                        durationMinutes = p.duration_minutes,
                        capacity = p.capacity,
                        sportId = p.sport_id,
                        sportName = p.sport_name ?? "Bộ môn",
                        facilityName = p.facility_name ?? "Phòng tập",
                        price = p.price,
                        status = p.approval_status ?? (p.status ? "approved" : "cancelled"),
                        totalSessions = p.total_sessions ?? 1,
                        sessionNumber = p.session_number ?? 1
                    }));
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        /// <summary>
        /// DELETE /api/classes/proposals/{id:guid}
        /// Huấn luyện viên tự thu hồi / hủy đề xuất mở lớp học khi đang ở trạng thái pending.
        /// </summary>
        classGroup
            .MapDelete(
                "/proposals/{id:guid}",
                async (
                    Guid id,
                    HttpContext context,
                    SmartGymDbContext db,
                    ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var userIdValue = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                            ?? context.User.FindFirst("sub")?.Value;
                        if (!Guid.TryParse(userIdValue, out var userId))
                            return Results.Unauthorized();

                        var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId, activeOnly: true);
                        if (coachId == null)
                            return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                        var affected = await db.Database.ExecuteSqlInterpolatedAsync($@"
                            DELETE FROM classes
                            WHERE (id = {id} OR parent_id = {id})
                              AND (coach_id = {coachId.Value} OR coach_id = {userId}) 
                              AND approval_status = 'pending'");

                        if (affected == 0)
                        {
                            return Results.BadRequest(new { message = "Không tìm thấy đề xuất lớp học hoặc đề xuất không ở trạng thái chờ duyệt." });
                        }

                        return Results.Ok(new { success = true, message = "Đã thu hồi đề xuất mở lớp học thành công." });
                    }
                    catch (Exception ex)
                    {
                        var logger = loggerFactory.CreateLogger("ClassEndpoints");
                        logger.LogError(ex, "Lỗi khi thu hồi đề xuất lớp học {ClassId}", id);
                        return Results.Problem(detail: ex.Message, statusCode: 500);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("coach"));

        // 3. Approve Class Proposal
        /// <summary>
        /// PUT /api/classes/{id}/approve
        /// Quản lý phê duyệt đề xuất mở lớp của Huấn luyện viên.
        /// Kiểm tra xung đột phòng tập, HLV trước khi chuyển trạng thái thành Approved.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
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
        /// <summary>
        /// PUT /api/classes/{id}/reject
        /// Từ chối đề xuất mở lớp học của Huấn luyện viên.
        /// Quyền hạn yêu cầu: Manager hoặc Admin.
        /// </summary>
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

        // 4b. Cancel Class (Manager/Admin)
        /// <summary>
        /// POST /api/classes/{id}/cancel
        /// Quản lý hủy lớp học.
        /// Đánh dấu status = false và cập nhật trạng thái đơn đặt của học viên.
        /// </summary>
        classGroup
            .MapPost(
                "/{id:guid}/cancel",
                async (Guid id, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                            $"UPDATE classes SET status = FALSE WHERE id = {id}");

                        if (affected == 0)
                            return Results.BadRequest(new { message = "Không tìm thấy lớp học để hủy." });

                        try
                        {
                            await db.Database.ExecuteSqlInterpolatedAsync(
                                $"UPDATE class_bookings SET status = 'class_cancelled' WHERE class_id = {id} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')");
                        }
                        catch { }

                        return Results.Ok(new { success = true, message = "Đã hủy lớp học thành công." });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể hủy lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể hủy lớp học",
                            detail: "Máy chủ gặp lỗi khi cập nhật trạng thái hủy lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4c. Restore Class (Manager/Admin)
        /// <summary>
        /// POST /api/classes/{id}/restore
        /// Quản lý khôi phục lớp học đã bị hủy.
        /// </summary>
        classGroup
            .MapPost(
                "/{id:guid}/restore",
                async (Guid id, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                            $"UPDATE classes SET status = TRUE WHERE id = {id}");

                        if (affected == 0)
                            return Results.BadRequest(new { message = "Không tìm thấy lớp học để khôi phục." });

                        return Results.Ok(new { success = true, message = "Đã khôi phục lớp học thành công." });
                    }
                    catch (Exception exception)
                    {
                        loggerFactory.CreateLogger("ClassEndpoints").LogError(exception, "Không thể khôi phục lớp học {ClassId}.", id);
                        return Results.Problem(
                            title: "Không thể khôi phục lớp học",
                            detail: "Máy chủ gặp lỗi khi khôi phục lớp học.",
                            statusCode: StatusCodes.Status500InternalServerError);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 4d. All Classes (Manager/Admin/Coach schedule view)
        /// <summary>
        /// GET /api/classes/all & GET /api/classes
        /// Lấy toàn bộ danh sách lớp học thể thao (Manager/Admin quản lý lịch trình và phân công).
        /// </summary>
        classGroup.MapGet(
            "/all",
            async (ClassService service) =>
            {
                try
                {
                    return Results.Ok(await service.GetAllClassesAsync());
                }
                catch (Exception ex)
                {
                    return Results.Problem(detail: ex.ToString(), statusCode: 500);
                }
            }
        );

        // 5. Available Classes
        /// <summary>
        /// DELETE /api/classes/by-date/{date}
        /// Xóa tất cả các lớp học nhóm (không phải PT 1-1) theo ngày đã cho.
        /// Định dạng ngày: yyyy-MM-dd (UTC). Không xóa các PT session vì chúng nằm trong bảng pt_sessions.
        /// </summary>
        classGroup
            .MapDelete(
                "/by-date/{date:datetime}",
                async (DateTime date, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
                {
                    try
                    {
                        var start = date.Date;
                        var end = start.AddDays(1);
                        var affected = await db.Database.ExecuteSqlInterpolatedAsync($"""
                            DELETE FROM classes
                            WHERE schedule_time >= {start} AND schedule_time < {end}
                        """);
                        return Results.Ok(new { success = true, deleted = affected, message = $"Đã xóa {affected} lớp vào ngày {start:yyyy-MM-dd}." });
                    }
                    catch (Exception ex)
                    {
                        var logger = loggerFactory.CreateLogger("ClassEndpoints");
                        logger.LogError(ex, "Lỗi khi xóa lớp theo ngày {Date}", date);
                        return Results.Problem(detail: ex.Message, statusCode: 500);
                    }
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("manager", "admin", "center_manager", "centermanager"));

        // 5. Available Classes
        /// <summary>
        /// GET /api/classes/available
        /// Lấy danh sách các lớp học đang mở và khả dụng cho hội viên đăng ký.
        /// </summary>
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
        /// <summary>
        /// GET /api/classes/{id}
        /// Lấy chi tiết thông tin lớp học (HLV phụ trách, thời gian, số chỗ, danh sách học viên tham gia).
        /// </summary>
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

    public class CoachClassProposalRow
    {
        public Guid id { get; set; }
        public string class_name { get; set; } = "";
        public DateTime schedule_time { get; set; }
        public int duration_minutes { get; set; }
        public int capacity { get; set; }
        public bool status { get; set; }
        public string? approval_status { get; set; }
        public Guid sport_id { get; set; }
        public string? sport_name { get; set; }
        public string? facility_name { get; set; }
        public decimal? price { get; set; }
        public Guid? parent_id { get; set; }
        public int? session_number { get; set; }
        public int? total_sessions { get; set; }
    }
}
