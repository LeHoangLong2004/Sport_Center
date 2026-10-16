using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using SmartGym.Application.Services;

namespace SmartGym.Api.Endpoints;

public static class LegacyClassEndpoints
{
    public static void MapLegacyClassEndpoints(this WebApplication app)
    {
app.MapGet(
    "/api/classes/all",
    async (ClassService service) =>
    {
        var classes = await service.GetAllClassesAsync();
        return Results.Ok(classes);
    }
);
app.MapGet(
        "/api/bookings/all",
        async (ClassService service) =>
        {
            var bookings = await service.GetAllBookingsForManagerAsync();
            return Results.Ok(bookings);
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapPut(
        "/api/bookings/{id}/approve",
        async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.ApproveBookingAsync(id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Đã duyệt đơn đặt lớp thành công" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapPut(
        "/api/bookings/{id}/reject",
        async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.RejectBookingAsync(id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Đã từ chối đơn đặt lớp" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));

app.MapGet(
    "/api/classes/{id}",
    async (Guid id, ClassService service) =>
    {
        var classDetail = await service.GetClassDetailAsync(id);
        if (classDetail == null)
            return Results.NotFound(new { message = "Class not found" });
        return Results.Ok(classDetail);
    }
);

app.MapPost(
        "/api/classes/{id}/book",
        async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });

            return Results.Ok(new { message = "Successfully booked the class!" });
        }
    )
    .RequireAuthorization(policy =>
        policy.RequireRole("Member", "Admin", "Manager", "member", "admin", "manager")
    );

// Giai đoạn D: Receptionist đặt hộ
app.MapPost(
        "/api/classes/{id}/book-for-member",
        async (
            Guid id,
            [Microsoft.AspNetCore.Mvc.FromBody]
                SmartGym.Application.DTOs.Classes.BookForMemberRequest request,
            ClassService service
        ) =>
        {
            var (isSuccess, errorMessage) = await service.BookClassAsync(request.MemberId, id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });

            return Results.Ok(new { message = "Successfully booked the class for member!" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("receptionist", "manager", "admin"));

// Giai đoạn E: Hủy đăng ký (Hội viên / Lễ tân)
app.MapPost(
        "/api/classes/{id}/cancel-booking",
        async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });

            return Results.Ok(new { message = "Successfully cancelled the booking!" });
        }
    )
    .RequireAuthorization(policy =>
        policy.RequireRole("member", "admin", "manager", "receptionist")
    );

// Giai đoạn F: Thay đổi thông tin lớp học
app.MapPut(
        "/api/classes/{id}",
        async (
            Guid id,
            [Microsoft.AspNetCore.Mvc.FromBody]
                SmartGym.Application.DTOs.Classes.CreateClassRequest request,
            ClassService service
        ) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateClassAsync(id, request);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class updated successfully" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

// Giai đoạn F: Hủy lớp học (Quản lý)
app.MapPost(
        "/api/classes/{id}/cancel",
        async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.CancelClassAsync(id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class cancelled successfully" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

app.MapPost(
        "/api/classes/{id}/restore",
        async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.RestoreClassAsync(id);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class restored successfully" });
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

// ── GIAI ĐOẠN G: ĐIỂM DANH VÀ XEM LỊCH ──

// Điểm danh theo lớp (HLV / Receptionist / Manager / Admin)

    }
}
