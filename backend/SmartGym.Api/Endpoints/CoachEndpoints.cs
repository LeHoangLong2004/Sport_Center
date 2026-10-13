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
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<
            string,
            System.Collections.Generic.List<object>
        > _mockAttendance = new();
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<
            string,
            object
        > _mockAssessments = new();
        private static readonly System.Text.Json.Nodes.JsonArray _mockCurricula =
            new System.Text.Json.Nodes.JsonArray
            {
                new System.Text.Json.Nodes.JsonObject
                {
                    ["id"] = "cur1",
                    ["name"] = "Yoga Cơ Bản – Tuần 1",
                    ["sport"] = "Yoga",
                    ["goal"] = "Linh hoạt",
                    ["level"] = "Cơ bản",
                    ["duration"] = 60,
                    ["status"] = "Đã giao",
                    ["updatedAt"] = "2023-10-20",
                    ["description"] = "Giáo án tuần đầu",
                    ["exercises"] = new System.Text.Json.Nodes.JsonArray
                    {
                        new System.Text.Json.Nodes.JsonObject
                        {
                            ["name"] = "Khởi động",
                            ["reps"] = "5 phút",
                            ["rest"] = "0",
                            ["note"] = "",
                        },
                    },
                    ["assignedTo"] = new System.Text.Json.Nodes.JsonArray
                    {
                        new System.Text.Json.Nodes.JsonObject
                        {
                            ["type"] = "class",
                            ["id"] = "cls-yoga",
                            ["name"] = "Yoga Cơ Bản – Lớp A",
                        },
                    },
                },
            };

        public static void MapCoachEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/coach");

            MapDashboardAndMemberEndpoints(group);
            MapAttendanceEndpoints(group);
            MapCurriculumEndpoints(group);
            MapNotificationAndAssessmentEndpoints(group);
            MapInteractiveCoachFeatures(group);
        }
    }
}
