using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;
using SmartGym.Infrastructure.Persistence.Supabase.Repositories;

namespace SmartGym.Api.Endpoints;

public static partial class CoachEndpoints
{
    private static void MapAttendanceEndpoints(RouteGroupBuilder group)
    {
        group.MapGet(
            "/sessions/{sessionId}/attendance",
            async (string sessionId, SmartGymDbContext db) =>
            {
                if (!Guid.TryParse(sessionId, out var sessionGuid))
                    return Results.Ok(Array.Empty<object>());

                var memberIds = await LoadSessionMemberIdsAsync(db, sessionId);
                var members = await db.Users
                    .Include(u => u.Role)
                    .Where(u => u.Role != null && u.Role.Name == "member")
                    .Where(u => memberIds.Contains(u.Id))
                    .ToListAsync();

                var savedRecords = await db.Database
                    .SqlQueryRaw<AttendanceRecordRawModel>(
                        "SELECT session_id, member_id, status, note FROM class_attendance_records WHERE session_id = {0}",
                        sessionGuid)
                    .ToListAsync();
                var recordByMember = savedRecords.ToDictionary(r => r.MemberId);

                var attendance = members
                    .Select(m => recordByMember.TryGetValue(m.Id, out var record)
                        ? new
                        {
                            sessionId,
                            memberId = m.Id.ToString(),
                            status = record.Status ?? "chưa điểm danh",
                            note = record.Note ?? "",
                        }
                        : new
                        {
                            sessionId,
                            memberId = m.Id.ToString(),
                            status = "chưa điểm danh",
                            note = "",
                        })
                    .Cast<object>()
                    .ToList();

                return Results.Ok(attendance);
            }
        );

        group.MapPost(
            "/sessions/{sessionId}/attendance/draft",
            async (string sessionId, [FromBody] System.Text.Json.JsonElement request, SmartGymDbContext db) =>
                await SaveAttendanceAsync(sessionId, request, db, finalized: false, actorId: null)
        );

        group.MapPost(
            "/sessions/{sessionId}/attendance/finalize",
            async (string sessionId, [FromBody] System.Text.Json.JsonElement request, SmartGymDbContext db, HttpContext context) =>
            {
                var rawActorId = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? context.User.FindFirstValue("sub");
                Guid? actorId = Guid.TryParse(rawActorId, out var parsedActorId) ? parsedActorId : null;
                return await SaveAttendanceAsync(sessionId, request, db, finalized: true, actorId);
            }
        );
    }

    private static async Task<IResult> SaveAttendanceAsync(
        string sessionId,
        System.Text.Json.JsonElement request,
        SmartGymDbContext db,
        bool finalized,
        Guid? actorId)
    {
        if (!Guid.TryParse(sessionId, out var sessionGuid))
            return Results.BadRequest(new { message = "Buổi học không hợp lệ." });

        if (!request.TryGetProperty("records", out var recordsElement)
            || recordsElement.ValueKind != System.Text.Json.JsonValueKind.Array)
            return Results.BadRequest(new { message = "Thiếu danh sách điểm danh." });

        await using var transaction = await db.Database.BeginTransactionAsync();
        foreach (var record in recordsElement.EnumerateArray())
        {
            var memberIdText = record.TryGetProperty("memberId", out var memberProp)
                ? memberProp.GetString()
                : null;
            if (!Guid.TryParse(memberIdText, out var memberId))
                continue;

            var status = record.TryGetProperty("status", out var statusProp)
                ? statusProp.GetString()
                : null;
            var note = record.TryGetProperty("note", out var noteProp)
                ? noteProp.GetString()
                : null;

            await db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO class_attendance_records (session_id, member_id, status, note)
                VALUES ({sessionGuid}, {memberId}, {status}, {note})
                ON CONFLICT (session_id, member_id)
                DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note");
        }

        if (finalized)
        {
            await db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO class_attendance_sheets (session_id, state, version, finalized_at, finalized_by, updated_at)
                VALUES ({sessionGuid}, 'finalized', 1, now(), {actorId}, now())
                ON CONFLICT (session_id)
                DO UPDATE SET state = 'finalized', version = class_attendance_sheets.version + 1,
                              finalized_at = now(), finalized_by = {actorId}, updated_at = now()");
        }
        else
        {
            await db.Database.ExecuteSqlInterpolatedAsync($@"
                INSERT INTO class_attendance_sheets (session_id, state, version, updated_at)
                VALUES ({sessionGuid}, 'draft', 1, now())
                ON CONFLICT (session_id)
                DO UPDATE SET state = 'draft', version = class_attendance_sheets.version + 1, updated_at = now()");
        }

        await transaction.CommitAsync();
        return Results.Ok(new
        {
            success = true,
            message = finalized ? "Đã chốt điểm danh!" : "Đã lưu nháp thành công!"
        });
    }

    private static async Task<HashSet<Guid>> LoadSessionMemberIdsAsync(
        SmartGymDbContext db,
        string sessionId)
    {
        if (!Guid.TryParse(sessionId, out var classId))
            return [];

        var bookings = await db.Database
            .SqlQueryRaw<ClassBookingRawModel>(
                "SELECT id, user_id, class_id, status, created_at FROM class_bookings WHERE class_id = {0} AND status NOT IN ('cancelled', 'rejected', 'class_cancelled')",
                classId)
            .ToListAsync();

        return bookings.Select(booking => booking.UserId).ToHashSet();
    }
}
