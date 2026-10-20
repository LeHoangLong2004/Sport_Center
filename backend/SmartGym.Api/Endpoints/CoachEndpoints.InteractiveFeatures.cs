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

namespace SmartGym.Api.Endpoints;

public static partial class CoachEndpoints
{
        private static void MapInteractiveCoachFeatures(RouteGroupBuilder group)
        {
            // 1. Schedule Requests (Đổi lịch / Dạy thay / Báo vắng)
            group.MapGet("/schedule-requests", async (HttpContext context, SmartGymDbContext db) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.Ok(Array.Empty<object>());

                var rows = await db.Database.SqlQueryRaw<CoachScheduleRequestSqlModel>(
                    @"SELECT r.id, r.session_id AS ""SessionId"", COALESCE(c.class_name, 'Lớp học') AS ""ClassName"",
                             r.request_type AS ""RequestType"", r.new_date::text AS ""NewDate"", r.new_time AS ""NewTime"",
                             r.reason AS ""Reason"", r.status AS ""Status"", r.manager_note AS ""ManagerNote"",
                             r.created_at AS ""CreatedAt""
                      FROM coach_schedule_requests r
                      LEFT JOIN classes c ON c.id = r.session_id
                      WHERE r.coach_id = {0}
                      ORDER BY r.created_at DESC", coachId.Value).ToListAsync();

                return Results.Ok(rows.Select(r => new
                {
                    id = r.Id.ToString(),
                    sessionId = r.SessionId?.ToString() ?? string.Empty,
                    r.ClassName,
                    requestType = r.RequestType,
                    newDate = r.NewDate ?? string.Empty,
                    newTime = r.NewTime ?? string.Empty,
                    r.Reason,
                    r.Status,
                    createdAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    managerNote = r.ManagerNote ?? string.Empty
                }));
            });

            group.MapPost("/schedule-requests", async (HttpContext context, SmartGymDbContext db, [FromBody] System.Text.Json.JsonElement req) =>
            {
                var rawUserId = context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? context.User.FindFirst("sub")?.Value;
                if (!Guid.TryParse(rawUserId, out var userId)) return Results.Unauthorized();
                var coachId = await CoachProfileResolver.FindByUserIdAsync(db, userId);
                if (coachId == null) return Results.BadRequest(new { message = "Không tìm thấy hồ sơ Coach." });

                var sessionId = Guid.TryParse(req.TryGetProperty("sessionId", out var sessionProp) ? sessionProp.GetString() : null, out var parsedSessionId)
                    ? parsedSessionId : (Guid?)null;
                var reason = req.TryGetProperty("reason", out var reasonProp) ? reasonProp.GetString() : null;
                if (string.IsNullOrWhiteSpace(reason)) return Results.BadRequest(new { message = "Vui lòng nhập lý do." });
                var requestType = req.TryGetProperty("requestType", out var typeProp) ? typeProp.GetString() : "dời lịch";
                var newDate = req.TryGetProperty("newDate", out var dateProp) && DateTime.TryParse(dateProp.GetString(), out var parsedDate)
                    ? parsedDate.Date : (DateTime?)null;
                var newTime = req.TryGetProperty("newTime", out var timeProp) ? timeProp.GetString() : null;

                var id = Guid.NewGuid();
                await db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO coach_schedule_requests (id, coach_id, session_id, request_type, new_date, new_time, reason)
                    VALUES ({id}, {coachId.Value}, {sessionId}, {requestType}, {newDate}, {newTime}, {reason})");

                var className = req.TryGetProperty("className", out var classProp) ? classProp.GetString() : "Lớp học";
                return Results.Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = id.ToString(),
                        sessionId = sessionId?.ToString() ?? string.Empty,
                        className,
                        requestType,
                        newDate = newDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                        newTime = newTime ?? string.Empty,
                        reason,
                        status = "chờ duyệt",
                        createdAt = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                        managerNote = string.Empty
                    }
                });
            });

            // 2. PT 1-1 Availability Slots
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

            // 3. Coach Chat Conversations (Persistent via ChatStoreService)
            group.MapGet("/chat/conversations", (ChatStoreService chatStore, HttpContext context) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                return coachUserId == null ? Results.Unauthorized() : Results.Ok(chatStore.GetConversationsForCoach(coachUserId));
            });

            group.MapPost("/chat/conversations/start", (ChatStoreService chatStore, HttpContext context, [FromBody] StartCoachMemberConversationRequest req) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();
                if (string.IsNullOrWhiteSpace(req.MemberId))
                    return Results.BadRequest(new { message = "Thiếu học viên cần nhắn tin" });

                var conversation = chatStore.StartOrGetCoachMemberConversation(req.MemberId, coachUserId);
                return conversation == null
                    ? Results.NotFound(new { message = "Học viên không thuộc danh sách phụ trách của bạn" })
                    : Results.Ok(new { success = true, conversation });
            });

            group.MapGet("/{coachId}/chat/conversations", (ChatStoreService chatStore, HttpContext context, string coachId) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                return coachUserId == null ? Results.Unauthorized() : Results.Ok(chatStore.GetConversationsForCoach(coachUserId));
            });

            // 4. Coach Chat Messages for a Conversation
            group.MapGet("/chat/messages/{conversationId}", (ChatStoreService chatStore, HttpContext context, string conversationId) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();

                var messages = chatStore.GetMessagesForCoach(conversationId, coachUserId);
                if (messages == null) return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                return Results.Ok(messages);
            });

            // 5. Coach Chat Send Message
            group.MapPost("/chat/messages", (ChatStoreService chatStore, HttpContext context, [FromBody] SendCoachChatMessageRequest req) =>
            {
                var coachUserId = GetAuthenticatedCoachUserId(context);
                if (coachUserId == null) return Results.Unauthorized();

                if (string.IsNullOrWhiteSpace(req.Text))
                {
                    return Results.BadRequest(new { message = "Nội dung tin nhắn không được rỗng" });
                }

                var newMsg = chatStore.AddMessage(req.ConversationId, req.Text, "coach", req.CoachName, coachUserId);
                if (newMsg == null)
                {
                    return Results.NotFound(new { message = "Không tìm thấy hội thoại" });
                }

                return Results.Ok(new { success = true, data = newMsg });
            });
        }
}

