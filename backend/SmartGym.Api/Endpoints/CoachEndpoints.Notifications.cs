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
                    var assessments = new[]
                    {
                        new
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
                            comment = "Tốt",
                            nextStep = "Tiếp tục",
                            createdAt = "2023-10-20T08:30:00",
                        },
                    };
                    return Results.Ok(assessments);
                }
            );

            // 14. Assessment Save
            group.MapPost(
                "/assessments",
                ([FromBody] System.Text.Json.JsonElement request) =>
                {
                    return Results.Ok(new { success = true });
                }
            );
        }
    }
}
