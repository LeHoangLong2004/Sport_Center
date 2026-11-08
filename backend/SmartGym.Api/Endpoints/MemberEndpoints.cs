using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    /// <summary>
    /// Endpoint trung tâm quản lý các chức năng dành cho Hội viên (Member Portal APIs).
    /// Điều phối các module: Dashboard tổng quan, đặt lịch lớp học, gửi yêu cầu hỗ trợ,
    /// trò chuyện cùng AI Assistant & HLV, quản lý ví điểm thưởng / thanh toán, và lịch sử điểm danh.
    /// </summary>
    public static partial class MemberEndpoints
    {
        // Thread-safe in-memory collections for member-specific real-time operations
        private static readonly ConcurrentDictionary<string, List<object>> _memberBookings = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCancelledBookings = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberSupportTickets = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCustomMetrics = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCustomReviews = new();

        /// <summary>
        /// Đăng ký toàn bộ các route dành cho Hội viên vào ứng dụng.
        /// Nhóm route gốc: /api/member
        /// </summary>
        /// <param name="app">Đối tượng IEndpointRouteBuilder</param>
        public static void MapMemberEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/member");

            MapMemberDashboardEndpoints(group);
            MapMemberBookingEndpoints(group);
            MapMemberSupportEndpoints(group);
            MapMemberChatEndpoints(group);
            MapMemberWalletEndpoints(group);
            MapMemberAttendanceEndpoints(group);
        }

        private static string? GetUserId(HttpContext context)
        {
            return context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private static List<object> GetDefaultBookings()
        {
            return new List<object>();
        }

        private static List<object> GetDefaultTasks()
        {
            return new List<object>();
        }

        private static List<object> GetDefaultTickets()
        {
            return new List<object>();
        }
    }
}
