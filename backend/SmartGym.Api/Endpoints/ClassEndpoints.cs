using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Services;
using SmartGym.Api.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class ClassEndpoints
{
    public static void MapClassEndpoints(this IEndpointRouteBuilder app)
    {
        var classGroup = app.MapGroup("/api/classes").WithTags("Classes");

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

                    // The coach identity must come from the authenticated account,
                    // never from a client-controlled coachId field.
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

        /* classGroup.MapGet("/all", async (ClassService service) =>
        {
            var classes = await service.GetAllClassesAsync();
            return Results.Ok(classes);
        }); */

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

        classGroup.MapPost(
                "/{id:guid}/book",
                async (Guid id, HttpContext context, ClassService service) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(userIdClaim, out var userId))
                        return Results.Unauthorized();

                    var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
                    if (!isSuccess)
                    {
                        if (errorMessage != null && (errorMessage.Contains("đã đặt chỗ") || errorMessage.Contains("đã đăng ký")))
                        {
                            ClassDetailResponse? existingDetail = null;
                            try { existingDetail = await service.GetClassDetailAsync(id); } catch { }
                            return Results.Ok(new 
                            { 
                                success = true,
                                alreadyBooked = true,
                                message = "Bạn đã đăng ký lớp học này trước đó rồi.",
                                classInfo = existingDetail
                            });
                        }
                        return Results.BadRequest(new { message = errorMessage });
                    }

                    ClassDetailResponse? classDetail = null;
                    try
                    {
                        classDetail = await service.GetClassDetailAsync(id);
                    }
                    catch
                    {
                        // Safe fallback so transient fetch error doesn't break response
                    }

                    return Results.Ok(new 
                    { 
                        message = "Đặt lớp thành công.",
                        classInfo = classDetail
                    });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        classGroup.MapPost(
                "/{id:guid}/pay-and-book",
                async (Guid id, [FromBody] PayAndBookClassRequest? request, HttpContext context, ClassService service, SmartGym.Infrastructure.Persistence.EF.SmartGymDbContext db) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(userIdClaim, out var userId))
                        return Results.Unauthorized();

                    var method = request?.PaymentMethod ?? "qr";
                    var amount = request?.Amount ?? 150000m;

                    var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
                    if (!isSuccess)
                    {
                        if (errorMessage != null && (errorMessage.Contains("đã đặt chỗ") || errorMessage.Contains("đã đăng ký")))
                        {
                            ClassDetailResponse? existingDetail = null;
                            try { existingDetail = await service.GetClassDetailAsync(id); } catch { }
                            return Results.Ok(new
                            {
                                success = true,
                                alreadyBooked = true,
                                message = "Bạn đã hoàn tất đặt chỗ lớp học này trước đó rồi.",
                                classInfo = existingDetail
                            });
                        }
                        return Results.BadRequest(new { message = errorMessage });
                    }

                    var invoice = new SmartGym.Domain.Entities.Invoice
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId,
                        TotalAmount = amount,
                        PaymentMethod = method.ToLower() switch
                        {
                            "card" or "creditcard" or "credit_card" => SmartGym.Domain.Enums.PaymentMethod.CreditCard,
                            "counter" or "cashatcounter" => SmartGym.Domain.Enums.PaymentMethod.CashAtCounter,
                            "wallet" or "ewallet" => SmartGym.Domain.Enums.PaymentMethod.EWallet,
                            "bank_transfer" or "banktransfer" => SmartGym.Domain.Enums.PaymentMethod.BankTransfer,
                            _ => SmartGym.Domain.Enums.PaymentMethod.QRCode
                        },
                        Status = SmartGym.Domain.Enums.PaymentStatus.Completed,
                        PaidAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    };
                    await db.Invoices.AddAsync(invoice);
                    await db.SaveChangesAsync();

                    ClassDetailResponse? classDetail = null;
                    try
                    {
                        classDetail = await service.GetClassDetailAsync(id);
                    }
                    catch
                    {
                        // Safe fallback so transient fetch error doesn't break payment response
                    }

                    return Results.Ok(new
                    {
                        success = true,
                        message = "Thanh toán với giá gốc và đặt lịch thành công!",
                        invoiceId = invoice.Id,
                        amount = amount,
                        classInfo = classDetail
                    });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        classGroup.MapPost(
                "/{id:guid}/cancel-booking",
                async (Guid id, HttpContext context, ClassService service) =>
                {
                    var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (!Guid.TryParse(userIdClaim, out var userId))
                        return Results.Unauthorized();

                    var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
                    return isSuccess
                        ? Results.Ok(new { message = "Hủy đặt lớp thành công." })
                        : Results.BadRequest(new { message = errorMessage });
                }
            )
            .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        /* classGroup.MapPost("/{id:guid}/book", async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully booked the class!" });
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager")); */

        /* classGroup.MapPost("/{id:guid}/book-for-member", async (Guid id, [FromBody] BookForMemberRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.BookClassAsync(request.MemberId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully booked the class for member!" });
        }).RequireAuthorization(policy => policy.RequireRole("receptionist", "manager", "admin")); */

        /* classGroup.MapPost("/{id:guid}/cancel-booking", async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully cancelled the booking!" });
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager", "receptionist")); */

        /* classGroup.MapPut("/{id:guid}", async (Guid id, [FromBody] CreateClassRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateClassAsync(id, request);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class updated successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin")); */

        /* classGroup.MapPost("/{id:guid}/cancel", async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.CancelClassAsync(id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class cancelled successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin")); */

        /* classGroup.MapPost("/{id:guid}/attendance", async (Guid id, [FromBody] UpdateAttendanceRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateAttendanceAsync(id, request);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Attendance updated successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("coach", "receptionist", "manager", "admin")); */

        var scheduleGroup = app.MapGroup("/api/schedule").WithTags("Schedules");

        /* scheduleGroup.MapGet("/member", async (HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var schedule = await service.GetMemberScheduleAsync(userId);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager")); */

        /* scheduleGroup.MapGet("/coach", async (DateTime? date, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var schedule = await service.GetCoachScheduleAsync(userId, date);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("coach", "manager", "admin")); */

        /* scheduleGroup.MapGet("/manager", async (Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date, ClassService service) =>
        {
            var schedule = await service.GetManagerScheduleAsync(facilityId, coachId, sportId, date);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin")); */
    }
}

public record PayAndBookClassRequest(string? PaymentMethod = "qr", decimal Amount = 150000);
