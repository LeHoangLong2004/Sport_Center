using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        // Thread-safe in-memory collections for member-specific real-time operations
        private static readonly ConcurrentDictionary<string, List<object>> _memberBookings = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCancelledBookings = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberSupportTickets = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCustomMetrics = new();
        private static readonly ConcurrentDictionary<string, List<object>> _memberCustomReviews = new();

        public static void MapMemberEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/member");

            MapMemberDashboardEndpoints(group);
            MapMemberBookingEndpoints(group);
            MapMemberSupportEndpoints(group);
            MapMemberChatEndpoints(group);
            MapMemberWalletEndpoints(group);
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
