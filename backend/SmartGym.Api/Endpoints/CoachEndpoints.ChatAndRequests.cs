using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Application.Common;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Api.Services;
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

    internal sealed class CoachScheduleRequestSqlModel
    {
        public Guid Id { get; set; }
        public Guid? SessionId { get; set; }
        public string ClassName { get; set; } = "Lớp học";
        public string RequestType { get; set; } = "dời lịch";
        public string? NewDate { get; set; }
        public string? NewTime { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "chờ duyệt";
        public string? ManagerNote { get; set; }
        public DateTime CreatedAt { get; set; }
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

        public record SendCoachChatMessageRequest(string ConversationId, string Text, string? CoachId, string? CoachName = null);
        public record StartCoachMemberConversationRequest(string MemberId);

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

        private static string? GetAuthenticatedCoachUserId(HttpContext context) =>
            context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value;
    }
}


