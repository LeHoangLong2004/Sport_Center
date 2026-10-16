using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using SmartGym.Api.Services;
using SmartGym.Application.Interfaces.Repositories;

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

            group.MapGet("/available-pt-slots", (ScheduleStoreService scheduleStore) =>
            {
                return Results.Ok(scheduleStore.GetAvailablePtSlots());
            })
            .WithTags("Member Portal")
            .WithSummary("Get available PT slots for booking");

            group.MapPost("/bookings", async (HttpContext context, ScheduleStoreService scheduleStore, IGroupClassRepository classRepository, [FromBody] JsonElement body) =>
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

                var bookedSession = scheduleStore.BookPtSlot(req);

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
            group.MapDelete("/bookings/{id}", async (string id, [FromQuery] string? reason, HttpContext context, ScheduleStoreService scheduleStore, IGroupClassRepository classRepository) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                var cancelledList = _memberCancelledBookings.GetOrAdd(userId, _ => new List<object>());

                var cancelledSession = scheduleStore.GetAllSessions().FirstOrDefault(s => s.Id == id);

                scheduleStore.CancelBooking(id, reason ?? "Học viên tự hủy");

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
    }
}
