using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    internal sealed class CoachAvailabilitySlotSqlModel
    {
        public Guid Id { get; set; }
        public Guid CoachId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Sport { get; set; } = string.Empty;
        public string Room { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string Status { get; set; } = string.Empty;
        public Guid? BookedMemberId { get; set; }
        public string? BookedMemberName { get; set; }
        public string? BookedMemberPhone { get; set; }
        public string? Goal { get; set; }
        public string? CoachName { get; set; }
    }

    internal sealed class CoachScheduleWindowSqlModel
    {
        public DateTime StartTime { get; set; }
        public int DurationMinutes { get; set; }
    }

    internal sealed class AvailabilityWindowSqlModel
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public static partial class CoachEndpoints
    {
        public record CreateCoachAvailabilityRequest(
            string Date,
            string StartTime,
            string EndTime,
            string Sport,
            string Room,
            string? Note
        );

        private static void MapCoachAvailabilityEndpoints(RouteGroupBuilder group)
        {
            group.MapGet("/availability", async (HttpContext context, SmartGymDbContext db) =>
            {
                var coachUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;

                if (!Guid.TryParse(coachUserId, out var parsedCoachUserId))
                    return Results.Unauthorized();

                var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, parsedCoachUserId);
                if (coachProfileId == null)
                    return Results.Ok(Array.Empty<object>());

                var rows = await LoadAvailabilitySlotsAsync(db, coachProfileId.Value);
                return Results.Ok(rows.Select(ToAvailabilityResponse));
            });

            group.MapPost("/availability", async (
                HttpContext context,
                SmartGymDbContext db,
                [FromBody] CreateCoachAvailabilityRequest request) =>
            {
                var coachUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(coachUserId, out var parsedCoachUserId))
                    return Results.Unauthorized();

                if (!TryBuildCenterInterval(request.Date, request.StartTime, request.EndTime, out var startUtc, out var endUtc))
                    return Results.BadRequest(new { message = "Ngày hoặc khung giờ đăng lịch không hợp lệ." });

                if (startUtc <= DateTime.UtcNow)
                    return Results.BadRequest(new { message = "Không thể đăng lịch trống trong quá khứ." });

                if (string.IsNullOrWhiteSpace(request.Sport) || string.IsNullOrWhiteSpace(request.Room))
                    return Results.BadRequest(new { message = "Vui lòng chọn bộ môn và phòng/khu vực." });

                var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, parsedCoachUserId, activeOnly: true);
                if (coachProfileId == null)
                    return Results.BadRequest(new { message = "Tài khoản Coach chưa có hồ sơ hoạt động." });

                var executionStrategy = db.Database.CreateExecutionStrategy();
                return await executionStrategy.ExecuteAsync(async () =>
                {
                    await using var transaction = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
                    var advisoryKey = $"coach-availability:{coachProfileId.Value}";
                    await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtext({advisoryKey}))");

                    var classConflicts = await db.Database.SqlQueryRaw<CoachScheduleWindowSqlModel>(
                        @"SELECT schedule_time AS ""StartTime"", COALESCE(duration_minutes, 60) AS ""DurationMinutes""
                          FROM classes
                          WHERE coach_id = {0}
                            AND status = TRUE
                            AND schedule_time < {1}
                            AND schedule_time + (COALESCE(duration_minutes, 60) * INTERVAL '1 minute') > {2}",
                        coachProfileId.Value,
                        endUtc,
                        startUtc
                    ).ToListAsync();
                    if (classConflicts.Count > 0)
                        return Results.Conflict(new { message = "Bạn đã có lớp học khác trùng hoặc chồng lấn khung giờ này." });

                    var ptConflicts = await db.Database.SqlQueryRaw<CoachScheduleWindowSqlModel>(
                        @"SELECT ps.schedule_time AS ""StartTime"", COALESCE(ps.duration_minutes, 60) AS ""DurationMinutes""
                          FROM pt_sessions ps
                          INNER JOIN pt_enrollments pe ON pe.id = ps.enrollment_id
                          WHERE pe.coach_id = {0}
                            AND ps.status IN ('scheduled', 'pending', 'confirmed', 'sắp diễn ra')
                            AND ps.schedule_time < {1}
                            AND ps.schedule_time + (COALESCE(ps.duration_minutes, 60) * INTERVAL '1 minute') > {2}",
                        coachProfileId.Value,
                        endUtc,
                        startUtc
                    ).ToListAsync();
                    if (ptConflicts.Count > 0)
                        return Results.Conflict(new { message = "Bạn đã có buổi PT khác trùng hoặc chồng lấn khung giờ này." });

                    var openSlotConflicts = await db.Database.SqlQueryRaw<AvailabilityWindowSqlModel>(
                        @"SELECT start_time AS ""StartTime"", end_time AS ""EndTime""
                          FROM coach_availability_slots
                          WHERE coach_id = {0}
                            AND status IN ('open', 'booked')
                            AND start_time < {1}
                            AND end_time > {2}",
                        coachProfileId.Value,
                        endUtc,
                        startUtc
                    ).ToListAsync();
                    if (openSlotConflicts.Count > 0)
                        return Results.Conflict(new { message = "Bạn đã có lịch trống hoặc lịch PT khác trùng khung giờ này." });

                    var slotId = Guid.NewGuid();
                    await db.Database.ExecuteSqlInterpolatedAsync($@"INSERT INTO coach_availability_slots (id, coach_id, start_time, end_time, sport, room, note, status) VALUES ({slotId}, {coachProfileId.Value}, {startUtc}, {endUtc}, {request.Sport.Trim()}, {request.Room.Trim()}, {request.Note}, 'open')");
                    await transaction.CommitAsync();

                    return Results.Created($"/api/coach/availability/{slotId}", new
                    {
                        id = slotId,
                        date = request.Date,
                        startTime = request.StartTime,
                        endTime = request.EndTime,
                        sport = request.Sport.Trim(),
                        room = request.Room.Trim(),
                        note = request.Note?.Trim() ?? string.Empty,
                        isOpen = true,
                        bookedMemberName = "",
                        bookedMemberPhone = "",
                        goal = ""
                    });
                });
            });

            group.MapPost("/availability/toggle/{slotId:guid}", async (Guid slotId, HttpContext context, SmartGymDbContext db) =>
            {
                var coachUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(coachUserId, out var parsedCoachUserId))
                    return Results.Unauthorized();

                var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, parsedCoachUserId, activeOnly: true);
                if (coachProfileId == null)
                    return Results.Unauthorized();

                var changed = await db.Database.ExecuteSqlInterpolatedAsync($@"UPDATE coach_availability_slots SET status = CASE WHEN status = 'open' THEN 'closed' ELSE 'open' END WHERE id = {slotId} AND coach_id = {coachProfileId.Value} AND status IN ('open', 'closed')");
                return changed == 0
                    ? Results.NotFound(new { message = "Không tìm thấy lịch trống hoặc lịch đã được đặt." })
                    : Results.Ok(new { success = true, message = "Đã cập nhật trạng thái lịch trống." });
            });

            group.MapDelete("/availability/{slotId:guid}", async (Guid slotId, HttpContext context, SmartGymDbContext db) =>
            {
                var coachUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(coachUserId, out var parsedCoachUserId))
                    return Results.Unauthorized();

                var coachProfileId = await CoachProfileResolver.FindByUserIdAsync(db, parsedCoachUserId, activeOnly: true);
                if (coachProfileId == null)
                    return Results.Unauthorized();

                var changed = await db.Database.ExecuteSqlInterpolatedAsync($@"UPDATE coach_availability_slots SET status = 'cancelled' WHERE id = {slotId} AND coach_id = {coachProfileId.Value} AND status = 'open'");
                return changed == 0
                    ? Results.NotFound(new { message = "Không tìm thấy lịch trống hoặc lịch đã có người đặt." })
                    : Results.Ok(new { success = true, message = "Đã đóng lịch trống." });
            });
        }

        private static async Task<List<CoachAvailabilitySlotSqlModel>> LoadAvailabilitySlotsAsync(
            SmartGymDbContext db,
            Guid coachId)
        {
            return await db.Database.SqlQueryRaw<CoachAvailabilitySlotSqlModel>(
                @"SELECT s.id AS ""Id"", s.coach_id AS ""CoachId"", s.start_time AS ""StartTime"",
                         s.end_time AS ""EndTime"", s.sport AS ""Sport"", s.room AS ""Room"",
                         s.note AS ""Note"", s.status AS ""Status"", s.booked_member_id AS ""BookedMemberId"",
                         s.booked_member_name AS ""BookedMemberName"", s.booked_member_phone AS ""BookedMemberPhone"",
                         s.goal AS ""Goal"", u.full_name AS ""CoachName""
                  FROM coach_availability_slots s
                  INNER JOIN coaches c ON c.id = s.coach_id
                  LEFT JOIN users u ON u.id = c.user_id
                  WHERE s.coach_id = {0} AND s.status <> 'cancelled'
                  ORDER BY s.start_time",
                coachId
            ).ToListAsync();
        }

        internal static object ToAvailabilityResponse(CoachAvailabilitySlotSqlModel slot)
        {
            var localStart = CenterTime.ToLocal(slot.StartTime);
            var localEnd = CenterTime.ToLocal(slot.EndTime);
            var period = localStart.Hour < 12 ? "Sáng" : localStart.Hour < 17 ? "Chiều" : "Tối";
            var isOpen = string.Equals(slot.Status, "open", StringComparison.OrdinalIgnoreCase);
            return new
            {
                id = slot.Id.ToString(),
                date = localStart.ToString("yyyy-MM-dd"),
                dayOfWeek = ((int)localStart.DayOfWeek + 6) % 7 + 1,
                period,
                startTime = localStart.ToString("HH:mm"),
                endTime = localEnd.ToString("HH:mm"),
                sport = slot.Sport,
                room = slot.Room,
                note = slot.Note ?? "",
                isOpen,
                status = slot.Status,
                bookedMemberId = slot.BookedMemberId?.ToString(),
                bookedMemberName = slot.BookedMemberName ?? "",
                bookedMemberPhone = slot.BookedMemberPhone ?? "",
                goal = slot.Goal ?? "",
                coachId = slot.CoachId.ToString(),
                coachName = slot.CoachName ?? "HLV SportCenter"
            };
        }

        private static bool TryBuildCenterInterval(
            string? date,
            string? startText,
            string? endText,
            out DateTime startUtc,
            out DateTime endUtc)
        {
            startUtc = default;
            endUtc = default;
            var formats = new[] { "yyyy-MM-dd HH:mm", "yyyy-MM-dd H:mm" };
            if (!DateTime.TryParseExact($"{date} {startText}", formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var localStart)
                || !DateTime.TryParseExact($"{date} {endText}", formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var localEnd))
                return false;

            TimeZoneInfo zone;
            try
            {
                zone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                zone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Bangkok");
            }
            var unspecifiedStart = DateTime.SpecifyKind(localStart, DateTimeKind.Unspecified);
            var unspecifiedEnd = DateTime.SpecifyKind(localEnd, DateTimeKind.Unspecified);
            startUtc = TimeZoneInfo.ConvertTimeToUtc(unspecifiedStart, zone);
            endUtc = TimeZoneInfo.ConvertTimeToUtc(unspecifiedEnd, zone);
            return endUtc > startUtc;
        }
    }
}
