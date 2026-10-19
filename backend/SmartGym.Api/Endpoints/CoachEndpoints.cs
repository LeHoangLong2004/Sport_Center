using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class CoachEndpoints
    {
        public static void MapCoachEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/coach");

            MapDashboardScheduleEndpoints(group);
            MapCoachMemberEndpoints(group);
            MapAttendanceEndpoints(group);
            MapCurriculumEndpoints(group);
            MapNotificationAndAssessmentEndpoints(group);
            MapCoachAvailabilityEndpoints(group);
            MapCoachShiftRequestEndpoints(group);
            MapCoachChatEndpoints(group);
            MapMemberProfileEndpoints(group);
        }
    }
}
