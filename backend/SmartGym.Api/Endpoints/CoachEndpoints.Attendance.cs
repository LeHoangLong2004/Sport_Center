using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

namespace SmartGym.Api.Endpoints
{
        public static partial class CoachEndpoints
    {
        private static void MapAttendanceEndpoints(RouteGroupBuilder group)
        {
            // 5. Attendance Get
            group.MapGet(
                "/sessions/{sessionId}/attendance",
                async (string sessionId, SmartGymDbContext db) =>
                {
                    if (_mockAttendance.TryGetValue(sessionId, out var savedAttendance))
                    {
                        return Results.Ok(savedAttendance);
                    }

                    var members = await db
                        .Users.Include(u => u.Role)
                        .Where(u => u.Role.Name == "member")
                        .Take(2)
                        .ToListAsync();
                    var attendance = members
                        .Select(m => new
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

            // 6. Attendance Draft
            group.MapPost(
                "/sessions/{sessionId}/attendance/draft",
                (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
                {
                    if (
                        request.TryGetProperty("records", out var recordsElement)
                        && recordsElement.ValueKind == System.Text.Json.JsonValueKind.Array
                    )
                    {
                        var list = new System.Collections.Generic.List<object>();
                        foreach (var record in recordsElement.EnumerateArray())
                        {
                            var mId = record.TryGetProperty("memberId", out var mProp)
                                ? mProp.GetString()
                                : "";
                            var st = record.TryGetProperty("status", out var sProp)
                                ? sProp.GetString()
                                : "chưa điểm danh";
                            var nt = record.TryGetProperty("note", out var nProp)
                                ? nProp.GetString()
                                : "";
                            list.Add(
                                new
                                {
                                    sessionId = sessionId,
                                    memberId = mId,
                                    status = st,
                                    note = nt,
                                }
                            );
                        }
                        _mockAttendance[sessionId] = list;
                    }
                    return Results.Ok(new { success = true, message = "Đã lưu nháp thành công!" });
                }
            );

            // 7. Attendance Finalize
            group.MapPost(
                "/sessions/{sessionId}/attendance/finalize",
                (string sessionId, [FromBody] System.Text.Json.JsonElement request) =>
                {
                    if (
                        request.TryGetProperty("records", out var recordsElement)
                        && recordsElement.ValueKind == System.Text.Json.JsonValueKind.Array
                    )
                    {
                        var list = new System.Collections.Generic.List<object>();
                        foreach (var record in recordsElement.EnumerateArray())
                        {
                            var mId = record.TryGetProperty("memberId", out var mProp)
                                ? mProp.GetString()
                                : "";
                            var st = record.TryGetProperty("status", out var sProp)
                                ? sProp.GetString()
                                : "chưa điểm danh";
                            var nt = record.TryGetProperty("note", out var nProp)
                                ? nProp.GetString()
                                : "";
                            list.Add(
                                new
                                {
                                    sessionId = sessionId,
                                    memberId = mId,
                                    status = st,
                                    note = nt,
                                }
                            );
                        }
                        _mockAttendance[sessionId] = list;
                    }
                    return Results.Ok(new { success = true, message = "Đã chốt điểm danh!" });
                }
            );

        }
    }
}
