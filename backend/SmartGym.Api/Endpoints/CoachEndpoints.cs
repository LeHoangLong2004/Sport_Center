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
        public static void MapCoachEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/coach");

            MapDashboardAndMemberEndpoints(group);
            MapAttendanceEndpoints(group);
            MapCurriculumEndpoints(group);
            MapNotificationAndAssessmentEndpoints(group);
            MapInteractiveCoachFeatures(group);
            MapMemberProfileEndpoints(group);
        }
    }
}
