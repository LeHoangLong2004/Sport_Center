using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    /// <summary>
    /// Endpoint trung tâm quản lý các chức năng dành cho Huấn luyện viên (Coach Portal APIs).
    /// Điều phối các module: Lịch dạy tổng quan, danh sách học viên, điểm danh, giáo án (curriculum),
    /// đánh giá sau buổi tập, lịch rảnh cá nhân, yêu cầu đổi ca dạy, chat và xem hồ sơ sức khỏe học viên.
    /// </summary>
    public static partial class CoachEndpoints
    {
        /// <summary>
        /// Đăng ký toàn bộ các route dành cho Huấn luyện viên vào ứng dụng.
        /// Nhóm route gốc: /api/coach
        /// </summary>
        /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
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
