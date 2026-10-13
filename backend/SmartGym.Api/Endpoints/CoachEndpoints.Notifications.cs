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
        private static void MapNotificationAndAssessmentEndpoints(RouteGroupBuilder group)
        {
            // 11. Notifications Get
            group.MapGet(
                "/notifications",
                () =>
                {
                    var notifs = new[]
                    {
                        new
                        {
                            id = "n1",
                            title = "Nhắc nhở buổi yoga ngày mai",
                            content = "Các bạn nhớ mang thảm nhé!",
                            type = "Thông báo",
                            sentAt = "2023-10-24T08:00:00",
                            targetType = "class",
                            targetId = "cls-yoga",
                            targetName = "Yoga Cơ Bản",
                        },
                    };
                    return Results.Ok(notifs);
                }
            );

            // 12. Notifications Send
            group.MapPost(
                "/notifications",
                ([FromBody] System.Text.Json.JsonElement request) =>
                {
                    return Results.Ok(new { success = true });
                }
            );

            // 13. Assessments Get
            group.MapGet(
                "/assessments",
                () =>
                {
                    if (_mockAssessments.IsEmpty)
                    {
                        var defaultAssessment = new
                        {
                            id = "as1",
                            sessionId = "s1",
                            memberId = "m1",
                            completion = 90,
                            metrics = new[]
                            {
                                new
                                {
                                    label = "Thời gian",
                                    value = "25",
                                    unit = "s",
                                },
                            },
                            comment = "Tập luyện hăng say, đúng form bài tập.",
                            nextStep = "Tiếp tục nâng khối lượng tạ tuần tới.",
                            createdAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        };
                        _mockAssessments["as1"] = defaultAssessment;
                    }
                    return Results.Ok(_mockAssessments.Values);
                }
            );

            // 14. Assessment Save
            group.MapPost(
                "/assessments",
                ([FromBody] System.Text.Json.JsonElement request) =>
                {
                    var id = request.TryGetProperty("id", out var idProp) && !string.IsNullOrWhiteSpace(idProp.GetString())
                        ? idProp.GetString()!
                        : $"as_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";

                    var sessionId = request.TryGetProperty("sessionId", out var sProp) ? sProp.GetString() ?? "" : "";
                    var memberId = request.TryGetProperty("memberId", out var mProp) ? mProp.GetString() ?? "" : "";
                    var completion = request.TryGetProperty("completion", out var compProp) && compProp.TryGetInt32(out var compVal) ? compVal : 0;
                    var comment = request.TryGetProperty("comment", out var commProp) ? commProp.GetString() ?? "" : "";
                    var nextStep = request.TryGetProperty("nextStep", out var nextProp) ? nextProp.GetString() ?? "" : "";
                    var createdAt = request.TryGetProperty("createdAt", out var crProp) ? crProp.GetString() ?? DateTime.UtcNow.ToString("o") : DateTime.UtcNow.ToString("o");

                    var metricsList = new System.Collections.Generic.List<object>();
                    if (request.TryGetProperty("metrics", out var metProp) && metProp.ValueKind == System.Text.Json.JsonValueKind.Array)
                    {
                        foreach (var m in metProp.EnumerateArray())
                        {
                            var lbl = m.TryGetProperty("label", out var lp) ? lp.GetString() ?? "" : "";
                            var val = m.TryGetProperty("value", out var vp) ? vp.GetString() ?? "" : "";
                            var un = m.TryGetProperty("unit", out var up) ? up.GetString() ?? "" : "";
                            metricsList.Add(new { label = lbl, value = val, unit = un });
                        }
                    }

                    var record = new
                    {
                        id,
                        sessionId,
                        memberId,
                        completion,
                        metrics = metricsList,
                        comment,
                        nextStep,
                        createdAt
                    };

                    _mockAssessments[id] = record;
                    return Results.Ok(new { success = true, data = record });
                }
            );
        }
    }
}
