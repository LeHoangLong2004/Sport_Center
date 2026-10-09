using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using SmartGym.Application.Services;
using SmartGym.Application.DTOs.Classes;
using System.Security.Claims;

namespace SmartGym.Api.Endpoints;

public static class ClassEndpoints
{
    public static void MapClassEndpoints(this IEndpointRouteBuilder app)
    {
        var classGroup = app.MapGroup("/api/classes").WithTags("Classes");

        classGroup.MapPost("/", async ([FromBody] CreateClassRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.CreateClassAsync(request);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class created successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("manager"));

        classGroup.MapGet("/available", async (ClassService service) =>
        {
            var classes = await service.GetAvailableClassesAsync();
            return Results.Ok(classes);
        });

        classGroup.MapGet("/{id:guid}", async (Guid id, ClassService service) =>
        {
            var classDetail = await service.GetClassDetailAsync(id);
            if (classDetail == null) return Results.NotFound(new { message = "Class not found" });
            return Results.Ok(classDetail);
        });

        classGroup.MapPost("/{id:guid}/book", async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var (isSuccess, errorMessage) = await service.BookClassAsync(userId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully booked the class!" });
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        classGroup.MapPost("/{id:guid}/book-for-member", async (Guid id, [FromBody] BookForMemberRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.BookClassAsync(request.MemberId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully booked the class for member!" });
        }).RequireAuthorization(policy => policy.RequireRole("receptionist", "manager", "admin"));

        classGroup.MapPost("/{id:guid}/cancel-booking", async (Guid id, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var (isSuccess, errorMessage) = await service.CancelBookingAsync(userId, id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            
            return Results.Ok(new { message = "Successfully cancelled the booking!" });
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager", "receptionist"));

        classGroup.MapPut("/{id:guid}", async (Guid id, [FromBody] CreateClassRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateClassAsync(id, request);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class updated successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        classGroup.MapPost("/{id:guid}/cancel", async (Guid id, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.CancelClassAsync(id);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Class cancelled successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

        classGroup.MapPost("/{id:guid}/attendance", async (Guid id, [FromBody] UpdateAttendanceRequest request, ClassService service) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateAttendanceAsync(id, request);
            if (!isSuccess) return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Attendance updated successfully" });
        }).RequireAuthorization(policy => policy.RequireRole("coach", "receptionist", "manager", "admin"));


        var scheduleGroup = app.MapGroup("/api/schedule").WithTags("Schedules");

        scheduleGroup.MapGet("/member", async (HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var schedule = await service.GetMemberScheduleAsync(userId);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

        scheduleGroup.MapGet("/coach", async (DateTime? date, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                return Results.Unauthorized();

            var schedule = await service.GetCoachScheduleAsync(userId, date);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("coach", "manager", "admin"));

        scheduleGroup.MapGet("/manager", async (Guid? facilityId, Guid? coachId, Guid? sportId, DateTime? date, ClassService service) =>
        {
            var schedule = await service.GetManagerScheduleAsync(facilityId, coachId, sportId, date);
            return Results.Ok(schedule);
        }).RequireAuthorization(policy => policy.RequireRole("manager", "admin"));
    }
}
