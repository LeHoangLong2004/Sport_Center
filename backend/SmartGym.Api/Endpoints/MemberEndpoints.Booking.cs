using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Api.Services;
using SmartGym.Application.Common;
using SmartGym.Application.Interfaces.Repositories;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private static void MapMemberBookingEndpoints(RouteGroupBuilder group)
        {
            // 2. GET & POST /api/member/bookings - Book Class or PT Slot
            group.MapGet("/bookings", (HttpContext context, ScheduleStoreService scheduleStore) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var defaultBookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                var storeSessions = scheduleStore.GetSessionsForMember(userId);

                var merged = new List<object>();
                foreach (var s in storeSessions)
                {
                    merged.Add(new
                    {
                        id = s.Id,
                        name = s.ClassName,
                        sport = s.Sport,
                        level = s.Level,
                        type = s.Type,
                        date = s.Date,
                        startTime = s.StartTime,
                        endTime = s.EndTime,
                        room = s.Room,
                        coachName = s.CoachName,
                        coachId = s.CoachId,
                        status = s.Status,
                        attendanceStatus = s.AttendanceStatus,
                        coachNote = s.CoachNote,
                        goal = s.Goal
                    });
                }
                foreach (var b in defaultBookings)
                {
                    var bId = ((dynamic)b).id;
                    if (!storeSessions.Any(s => s.Id == bId))
                    {
                        merged.Add(b);
                    }
                }
                return Results.Ok(merged);
            })
            .WithTags("Member Portal")
            .WithSummary("Get all member active bookings");

            group.MapGet("/available-pt-slots", async (SmartGymDbContext db) =>
            {
                var persistentSlots = await db.Database.SqlQueryRaw<CoachAvailabilitySlotSqlModel>(
                    @"SELECT s.id AS ""Id"", s.coach_id AS ""CoachId"", s.start_time AS ""StartTime"",
                             s.end_time AS ""EndTime"", s.sport AS ""Sport"", s.room AS ""Room"",
                             s.note AS ""Note"", s.status AS ""Status"", s.booked_member_id AS ""BookedMemberId"",
                             s.booked_member_name AS ""BookedMemberName"", s.booked_member_phone AS ""BookedMemberPhone"",
                             s.goal AS ""Goal"", u.full_name AS ""CoachName""
                      FROM coach_availability_slots s
                      INNER JOIN coaches c ON c.id = s.coach_id
                      LEFT JOIN users u ON u.id = c.user_id
                      WHERE s.status = 'open' AND s.start_time > now()
                      ORDER BY s.start_time")
                    .ToListAsync();

                var persistentResponses = persistentSlots.Select(CoachEndpoints.ToAvailabilityResponse);
                return Results.Ok(persistentResponses);
            })
            .WithTags("Member Portal")
            .WithSummary("Get available PT slots for booking");

            group.MapPost("/bookings", async (HttpContext context, ScheduleStoreService scheduleStore, SmartGymDbContext db, IGroupClassRepository classRepository, IPtSessionRepository ptSessionRepository, [FromBody] JsonElement body) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());

                var slotId = body.TryGetProperty("slotId", out var sId) ? sId.GetString() : null;
                var req = new BookPtSessionRequest
                {
                    SlotId = slotId,
                    Name = body.TryGetProperty("name", out var n) ? n.GetString() : "Kèm 1-1 PT",
                    Sport = body.TryGetProperty("sport", out var sp) ? sp.GetString() : "Gym",
                    Level = body.TryGetProperty("level", out var lv) ? lv.GetString() : "1-1 PT",
                    Date = body.TryGetProperty("date", out var dt) ? dt.GetString() : DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    StartTime = body.TryGetProperty("startTime", out var st) ? st.GetString() : "08:00",
                    EndTime = body.TryGetProperty("endTime", out var et) ? et.GetString() : "09:00",
                    Room = body.TryGetProperty("room", out var rm) ? rm.GetString() : "Khu PT 1-1",
                    CoachName = body.TryGetProperty("coachName", out var cn) && !string.IsNullOrWhiteSpace(cn.GetString()) ? cn.GetString()! : "HLV Trung tâm",
                    CoachId = body.TryGetProperty("coachId", out var cId) && !string.IsNullOrWhiteSpace(cId.GetString()) ? cId.GetString()! : "",
                    MemberId = userId,
                    MemberName = body.TryGetProperty("memberName", out var mn) && !string.IsNullOrWhiteSpace(mn.GetString()) ? mn.GetString()! : (context.User.Identity?.Name ?? "Hội viên"),
                    MemberPhone = body.TryGetProperty("memberPhone", out var mp) && !string.IsNullOrWhiteSpace(mp.GetString()) ? mp.GetString()! : "",
                    MemberEmail = body.TryGetProperty("memberEmail", out var me) && !string.IsNullOrWhiteSpace(me.GetString()) ? me.GetString()! : "",
                    Goal = body.TryGetProperty("goal", out var gl) ? gl.GetString() : "Rèn luyện thể lực",
                    CoachNote = body.TryGetProperty("coachNote", out var nt) ? nt.GetString() : ""
                };

                CoachAvailabilitySlotSqlModel? persistentSlot = null;
                if (Guid.TryParse(slotId, out var requestedSlotId))
                {
                    persistentSlot = await db.Database.SqlQueryRaw<CoachAvailabilitySlotSqlModel>(
                        @"SELECT s.id AS ""Id"", s.coach_id AS ""CoachId"", s.start_time AS ""StartTime"",
                                 s.end_time AS ""EndTime"", s.sport AS ""Sport"", s.room AS ""Room"",
                                 s.note AS ""Note"", s.status AS ""Status"", s.booked_member_id AS ""BookedMemberId"",
                                 s.booked_member_name AS ""BookedMemberName"", s.booked_member_phone AS ""BookedMemberPhone"",
                                 s.goal AS ""Goal"", u.full_name AS ""CoachName""
                          FROM coach_availability_slots s
                          INNER JOIN coaches c ON c.id = s.coach_id
                          LEFT JOIN users u ON u.id = c.user_id
                          WHERE s.id = {0} AND s.status = 'open'",
                        requestedSlotId)
                        .FirstOrDefaultAsync();
                }

                if (persistentSlot != null)
                {
                    var localStart = CenterTime.ToLocal(persistentSlot.StartTime);
                    var localEnd = CenterTime.ToLocal(persistentSlot.EndTime);
                    req.Date = localStart.ToString("yyyy-MM-dd");
                    req.StartTime = localStart.ToString("HH:mm");
                    req.EndTime = localEnd.ToString("HH:mm");
                    req.Sport = persistentSlot.Sport;
                    req.Room = persistentSlot.Room;
                    req.CoachId = persistentSlot.CoachId.ToString();
                    req.CoachName = persistentSlot.CoachName ?? req.CoachName;
                }

                if (!TryBuildInterval(req.Date, req.StartTime, req.EndTime, out var start, out var end))
                {
                    return Results.BadRequest(new { message = "Ngày hoặc thời gian đặt lịch PT không hợp lệ." });
                }

                if (Guid.TryParse(req.CoachId, out var requestedCoachId))
                {
                    var coachClasses = await classRepository.GetClassesByCoachAndDateAsync(requestedCoachId, start);
                    if (coachClasses.Any(c => c.Status && Overlaps(start, end, c.ScheduleTime, c.DurationMinutes)))
                    {
                        return Results.Conflict(new { message = "Huấn luyện viên đã có lớp học khác trùng thời gian." });
                    }

                    var coachPtSessions = await ptSessionRepository.GetSessionsByCoachAndDateAsync(requestedCoachId, start);
                    if (coachPtSessions.Any(p => IsBlockingStatus(p.Status) && Overlaps(start, end, p.ScheduleTime, p.DurationMinutes)))
                    {
                        return Results.Conflict(new { message = "Huấn luyện viên đã có buổi PT khác trùng thời gian." });
                    }
                }

                if (Guid.TryParse(userId, out var memberId))
                {
                    var memberSchedule = await classRepository.GetMemberScheduleAsync(memberId);
                    if (memberSchedule.ClassBookings.Any(c => IsBlockingMemberStatus(c.Status) && Overlaps(start, end, c.ScheduleTime, c.DurationMinutes)))
                    {
                        return Results.Conflict(new { message = "Bạn đã có lớp học khác trùng thời gian." });
                    }

                    if (memberSchedule.PtSessions.Any(p => IsBlockingStatus(p.Status) && Overlaps(start, end, p.ScheduleTime, p.DurationMinutes)))
                    {
                        return Results.Conflict(new { message = "Bạn đã có buổi PT khác trùng thời gian." });
                    }
                }

                if (persistentSlot != null)
                {
                    var bookedMemberId = Guid.TryParse(userId, out var parsedMemberId)
                        ? parsedMemberId
                        : (Guid?)null;
                    var changed = await db.Database.ExecuteSqlInterpolatedAsync($@"UPDATE coach_availability_slots SET status = 'booked', booked_member_id = {bookedMemberId}, booked_member_name = {req.MemberName}, booked_member_phone = {req.MemberPhone}, goal = {req.Goal} WHERE id = {persistentSlot.Id} AND status = 'open'");
                    if (changed == 0)
                        return Results.Conflict(new { message = "Khung giờ PT này vừa được người khác đặt." });

                    var persistentBooking = new
                    {
                        id = persistentSlot.Id.ToString(),
                        name = $"Kèm 1-1: {req.Sport}",
                        sport = req.Sport,
                        level = "1-1 PT",
                        type = "pt",
                        date = req.Date,
                        startTime = req.StartTime,
                        endTime = req.EndTime,
                        room = req.Room,
                        coachName = req.CoachName ?? "HLV SportCenter",
                        coachId = req.CoachId,
                        status = "confirmed",
                        attendanceStatus = "chưa điểm danh",
                        coachNote = req.CoachNote,
                        bookedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    };
                    bookings.Insert(0, persistentBooking);
                    return Results.Ok(new { message = "Đặt lịch thành công!", booking = persistentBooking });
                }

                if (!scheduleStore.TryBookPtSlot(req, out var bookedSession, out var conflictMessage) || bookedSession == null)
                    return Results.Conflict(new { message = conflictMessage ?? "Khung giờ này không còn khả dụng." });

                if (Guid.TryParse(bookedSession.CoachId, out var coachId))
                {
                    await classRepository.NotifyCoachAsync(
                        coachId,
                        "Có lịch PT 1-1 mới",
                        $"{req.MemberName ?? "Hội viên"} vừa đặt lịch PT 1-1 vào {bookedSession.Date} {bookedSession.StartTime} - {bookedSession.EndTime}.",
                        "pt"
                    );
                }

                var newBooking = new
                {
                    id = bookedSession.Id,
                    name = bookedSession.ClassName,
                    sport = bookedSession.Sport,
                    level = bookedSession.Level,
                    type = bookedSession.Type,
                    date = bookedSession.Date,
                    startTime = bookedSession.StartTime,
                    endTime = bookedSession.EndTime,
                    room = bookedSession.Room,
                    coachName = bookedSession.CoachName,
                    coachId = bookedSession.CoachId,
                    status = bookedSession.Status,
                    attendanceStatus = bookedSession.AttendanceStatus,
                    coachNote = bookedSession.CoachNote,
                    bookedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };

                bookings.Insert(0, newBooking);
                return Results.Ok(new { message = "Đặt lịch thành công!", booking = newBooking });
            })
            .WithTags("Member Portal")
            .WithSummary("Create new booking for group class or 1-on-1 PT slot");

            // 3. DELETE /api/member/bookings/{id} - Cancel Booking with Reason
            group.MapDelete("/bookings/{id}", async (string id, [FromQuery] string? reason, HttpContext context, ScheduleStoreService scheduleStore, SmartGymDbContext db, IGroupClassRepository classRepository) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                var cancelledList = _memberCancelledBookings.GetOrAdd(userId, _ => new List<object>());

                var cancelledSession = scheduleStore.GetAllSessions().FirstOrDefault(s => s.Id == id);
                var reopenedPersistentSlot = false;
                if (Guid.TryParse(userId, out var memberId) && Guid.TryParse(id, out var persistentSlotId))
                {
                    reopenedPersistentSlot = await db.Database.ExecuteSqlInterpolatedAsync($@"UPDATE coach_availability_slots SET status = 'open', booked_member_id = NULL, booked_member_name = NULL, booked_member_phone = NULL, goal = NULL WHERE id = {persistentSlotId} AND booked_member_id = {memberId} AND status = 'booked'") > 0;
                }

                if (!reopenedPersistentSlot)
                {
                    scheduleStore.CancelBooking(id, reason ?? "Học viên tự hủy");
                }

                if (cancelledSession != null && Guid.TryParse(cancelledSession.CoachId, out var coachId))
                {
                    await classRepository.NotifyCoachAsync(
                        coachId,
                        "Lịch PT 1-1 đã bị hủy",
                        $"{cancelledSession.MemberName ?? "Hội viên"} đã hủy lịch PT 1-1 vào {cancelledSession.Date} {cancelledSession.StartTime}.",
                        "pt"
                    );
                }

                var found = bookings.FirstOrDefault(b => ((dynamic)b).id == id);
                if (found != null)
                {
                    bookings.Remove(found);
                    cancelledList.Insert(0, new
                    {
                        id = ((dynamic)found).id,
                        name = ((dynamic)found).name,
                        date = ((dynamic)found).date,
                        startTime = ((dynamic)found).startTime,
                        coachName = ((dynamic)found).coachName,
                        cancelReason = string.IsNullOrWhiteSpace(reason) ? "Học viên tự hủy" : reason,
                        cancelledAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    });
                }

                return Results.Ok(new { message = "Hủy lịch thành công!", id });
            })
            .WithTags("Member Portal")
            .WithSummary("Cancel a booked session with reason");

            // 4. GET /api/member/cancelled-bookings
            group.MapGet("/cancelled-bookings", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var cancelledList = _memberCancelledBookings.GetOrAdd(userId, _ => new List<object>());
                return Results.Ok(cancelledList);
            })
            .WithTags("Member Portal")
            .WithSummary("Get member cancelled bookings history");
        }

        private static bool TryBuildInterval(string? date, string? startText, string? endText, out DateTime start, out DateTime end)
        {
            start = default;
            end = default;
            var formats = new[] { "yyyy-MM-dd HH:mm", "yyyy-MM-dd H:mm" };
            if (!DateTime.TryParseExact($"{date} {startText}", formats, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out start)
                || !DateTime.TryParseExact($"{date} {endText}", formats, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out end))
            {
                return false;
            }

            return end > start;
        }

        private static bool Overlaps(DateTime start, DateTime end, DateTime otherStart, int otherDurationMinutes)
            => start < otherStart.AddMinutes(Math.Max(1, otherDurationMinutes)) && otherStart < end;

        private static bool IsBlockingStatus(string? status)
            => status?.Trim().ToLowerInvariant() is "scheduled" or "pending" or "confirmed" or "sắp diễn ra";

        private static bool IsBlockingMemberStatus(string? status)
            => status?.Trim().ToLowerInvariant() is "pending" or "confirmed" or "approved";
    }
}
