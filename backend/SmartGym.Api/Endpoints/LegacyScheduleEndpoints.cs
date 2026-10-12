using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using SmartGym.Application.Services;

namespace SmartGym.Api.Endpoints;

public static class LegacyScheduleEndpoints
{
    public static void MapLegacyScheduleEndpoints(this WebApplication app)
    {
app.MapPost(
        "/api/classes/{id}/attendance",
        async (
            Guid id,
            [Microsoft.AspNetCore.Mvc.FromBody]
                SmartGym.Application.DTOs.Classes.UpdateAttendanceRequest request,
            ClassService service
        ) =>
        {
            var (isSuccess, errorMessage) = await service.UpdateAttendanceAsync(id, request);
            if (!isSuccess)
                return Results.BadRequest(new { message = errorMessage });
            return Results.Ok(new { message = "Attendance updated successfully" });
        }
    )
    .RequireAuthorization(policy =>
        policy.RequireRole("coach", "receptionist", "manager", "admin")
    );

// Xem lịch dành cho Member (Lớp + Buổi PT)
app.MapGet(
        "/api/schedule/member",
        async (HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var schedule = await service.GetMemberScheduleAsync(userId);
            return Results.Ok(schedule);
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("member", "admin", "manager"));

// Endpoint lịch cá nhân dạng danh sách (MemberPortalV2)
app.MapGet(
        "/api/schedule/my",
        async (HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var schedule = await service.GetMemberScheduleAsync(userId);
            var entries = schedule.ClassBookings.Select(b => new
            {
                id = b.ClassId,
                className = b.ClassName,
                sportType = b.SportName,
                roomName = b.FacilityName,
                coachName = b.CoachName,
                startTime = b.ScheduleTime,
                endTime = b.ScheduleTime.AddMinutes(b.DurationMinutes),
                role = "Member",
                bookingStatus = b.Status,
            });

            return Results.Ok(entries);
        }
    )
    .RequireAuthorization();

// Xem lịch dành cho HLV (Các lớp phụ trách + danh sách học viên)
app.MapGet(
        "/api/schedule/coach",
        async (DateTime? date, HttpContext httpContext, ClassService service) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var schedule = await service.GetCoachScheduleAsync(userId, date);
            return Results.Ok(schedule);
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("coach", "manager", "admin"));

// Xem lịch tổng quan dành cho Manager (Lọc theo cơ sở, HLV, bộ môn, ngày)
app.MapGet(
        "/api/schedule/manager",
        async (
            Guid? facilityId,
            Guid? coachId,
            Guid? sportId,
            DateTime? date,
            ClassService service
        ) =>
        {
            var schedule = await service.GetManagerScheduleAsync(
                facilityId,
                coachId,
                sportId,
                date
            );
            return Results.Ok(schedule);
        }
    )
    .RequireAuthorization(policy => policy.RequireRole("manager", "admin"));

    }
}
