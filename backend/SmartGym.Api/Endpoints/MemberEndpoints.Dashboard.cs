using System;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static partial class MemberEndpoints
    {
        private static void MapMemberDashboardEndpoints(RouteGroupBuilder group)
        {
            // 1. GET /api/member/dashboard - Aggregated Dashboard Data
            group.MapGet("/dashboard", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                var tasks = GetDefaultTasks();
                var tickets = _memberSupportTickets.GetOrAdd(userId, _ => GetDefaultTickets());

                return Results.Ok(new
                {
                    memberId = userId,
                    activePackagesCount = 2,
                    upcomingBookingsCount = bookings.Count,
                    pendingTasksCount = tasks.Count(t => !((dynamic)t).completed),
                    attendanceRatePct = 92,
                    nextSessions = bookings.Take(3),
                    recentTasks = tasks.Take(3),
                    supportTickets = tickets.Take(2)
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Get member aggregated dashboard statistics and preview items");
        }
    }
}
