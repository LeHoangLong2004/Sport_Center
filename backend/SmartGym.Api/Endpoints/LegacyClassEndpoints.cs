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
)
.RequireAuthorization(policy => policy.RequireRole("admin", "manager", "receptionist"));
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
