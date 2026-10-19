using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartGym.Application.DTOs.Classes;
using SmartGym.Application.Services;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints;

public static class LegacyScheduleEndpoints
{
    private sealed class PersistentMemberPtSlotRow
    {
        public Guid Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CoachName { get; set; } = "Personal Trainer";
    }

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
        async (HttpContext httpContext, ClassService service, SmartGymDbContext db, ILoggerFactory loggerFactory) =>
        {
            var userIdClaim = httpContext
                .User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)
                ?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            try
            {
                var schedule = await service.GetMemberScheduleAsync(userId);
                var persistentPtSlots = await db.Database.SqlQueryRaw<PersistentMemberPtSlotRow>(
                    @"SELECT s.id AS ""Id"", s.start_time AS ""StartTime"", s.end_time AS ""EndTime"",
                             s.status AS ""Status"", COALESCE(u.full_name, 'Personal Trainer') AS ""CoachName""
                      FROM coach_availability_slots s
                      INNER JOIN coaches c ON c.id = s.coach_id
                      LEFT JOIN users u ON u.id = c.user_id
                      WHERE s.booked_member_id = {0} AND s.status = 'booked'
                      ORDER BY s.start_time",
                    userId).ToListAsync();

                schedule.PtSessions.AddRange(persistentPtSlots.Select(slot => new MemberPtSessionDto
                {
                    SessionId = slot.Id,
                    CoachName = slot.CoachName,
                    ScheduleTime = slot.StartTime,
                    DurationMinutes = Math.Max(1, (int)(slot.EndTime - slot.StartTime).TotalMinutes),
                    Status = "confirmed"
                }));
                schedule.PtSessions = schedule.PtSessions.OrderBy(session => session.ScheduleTime).ToList();
                return Results.Ok(schedule);
            }
            catch (Exception exception)
            {
                var logger = loggerFactory.CreateLogger("LegacyScheduleEndpoints");
                logger.LogError(exception, "Không thể tải lịch cá nhân của hội viên {UserId}.", userId);
                return Results.Problem(
                    title: "Không thể tải lịch học",
                    detail: "Database hiện không khả dụng. Vui lòng kiểm tra kết nối máy chủ rồi thử lại.",
                    statusCode: StatusCodes.Status503ServiceUnavailable
                );
            }
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
                bookingId = b.BookingId,
                className = b.ClassName,
                sportType = b.SportName,
                roomName = b.FacilityName,
                coachId = b.CoachId,
                coachName = b.CoachName,
                coachAvatar = b.CoachAvatar,
                coachSpecialty = b.CoachSpecialty,
                coachPhone = b.CoachPhone,
                coachBio = b.CoachBio,
                coachRating = b.CoachRating,
                coachExperienceYears = b.CoachExperienceYears,
                price = b.Price,
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
