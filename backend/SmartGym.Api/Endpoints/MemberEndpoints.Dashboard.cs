using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using SmartGym.Infrastructure.Persistence.EF;

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
                    activePackagesCount = 0,
                    upcomingBookingsCount = bookings.Count,
                    pendingTasksCount = tasks.Count(t => !((dynamic)t).completed),
                    attendanceRatePct = bookings.Count > 0 ? 100 : 0,
                    nextSessions = bookings.Take(3),
                    recentTasks = tasks.Take(3),
                    supportTickets = tickets.Take(2)
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Get member aggregated dashboard statistics and preview items");

            // 2. GET /api/member/gamification - Badges, Level, XP & Session Stats
            group.MapGet("/gamification", async (HttpContext context, SmartGymDbContext db) =>
            {
                var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                                ?? context.User.FindFirstValue("sub")
                                ?? GetUserId(context);

                if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                {
                    return Results.Ok(new
                    {
                        completedCount = 0,
                        totalSessionsCount = 0,
                        level = 1,
                        xp = 0,
                        title = "Tân binh thể thao",
                        badgesStatus = new
                        {
                            streak10 = false,
                            breakthrough20 = false,
                            multiSport = false,
                            coachBuddy = false,
                            warrior50 = false,
                            goldMember = false
                        },
                        unlockedBadgesCount = 0
                    });
                }

                int completedCount = 0;
                int totalSessionsCount = 0;
                int distinctSports = 0;
                int hasCoachSessions = 0;
                int hasPaid = 0;

                try
                {
                    await db.Database.OpenConnectionAsync();
                    await using var cmd = db.Database.GetDbConnection().CreateCommand();

                    // 1. Completed & Total bookings
                    cmd.CommandText = @"
                        SELECT
                            COUNT(*) FILTER (WHERE status IN ('confirmed', 'attended', 'completed')) AS completed,
                            COUNT(*) AS total
                        FROM class_bookings
                        WHERE user_id = @userId";
                    var pUser = cmd.CreateParameter();
                    pUser.ParameterName = "@userId";
                    pUser.Value = userId;
                    cmd.Parameters.Add(pUser);

                    await using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            completedCount = reader.IsDBNull(0) ? 0 : Convert.ToInt32(reader.GetValue(0));
                            totalSessionsCount = reader.IsDBNull(1) ? 0 : Convert.ToInt32(reader.GetValue(1));
                        }
                    }

                    // 2. Distinct sports & coach sessions
                    cmd.Parameters.Clear();
                    cmd.CommandText = @"
                        SELECT
                            COUNT(DISTINCT c.sport_id) AS distinct_sports,
                            COUNT(*) FILTER (WHERE c.coach_id IS NOT NULL) AS coach_sessions
                        FROM class_bookings cb
                        JOIN classes c ON cb.class_id = c.id
                        WHERE cb.user_id = @userId";
                    var pUser2 = cmd.CreateParameter();
                    pUser2.ParameterName = "@userId";
                    pUser2.Value = userId;
                    cmd.Parameters.Add(pUser2);

                    await using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            distinctSports = reader.IsDBNull(0) ? 0 : Convert.ToInt32(reader.GetValue(0));
                            hasCoachSessions = reader.IsDBNull(1) ? 0 : Convert.ToInt32(reader.GetValue(1));
                        }
                    }

                    // 3. Paid subscriptions/invoices
                    cmd.Parameters.Clear();
                    cmd.CommandText = @"
                        SELECT COUNT(*)
                        FROM subscriptions
                        WHERE user_id = @userId AND (payment_status = 1 OR payment_status::text ILIKE '%completed%')";
                    var pUser3 = cmd.CreateParameter();
                    pUser3.ParameterName = "@userId";
                    pUser3.Value = userId;
                    cmd.Parameters.Add(pUser3);

                    var subResult = await cmd.ExecuteScalarAsync();
                    hasPaid = subResult != null && !Convert.IsDBNull(subResult) ? Convert.ToInt32(subResult) : 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Gamification Calc Error] {ex.Message}");
                }

                bool streak10 = completedCount >= 10;
                bool breakthrough20 = completedCount >= 20;
                bool multiSport = distinctSports >= 2;
                bool coachBuddy = hasCoachSessions >= 1;
                bool warrior50 = completedCount >= 50;
                bool goldMember = hasPaid >= 1;

                int unlockedCount = 0;
                if (streak10) unlockedCount++;
                if (breakthrough20) unlockedCount++;
                if (multiSport) unlockedCount++;
                if (coachBuddy) unlockedCount++;
                if (warrior50) unlockedCount++;
                if (goldMember) unlockedCount++;

                int level = Math.Max(1, (completedCount / 5) + 1);
                int xp = completedCount * 100;
                string title = level >= 10 ? "Chiến binh huyền thoại"
                             : level >= 5 ? "Chiến binh tinh anh"
                             : level >= 2 ? "Hội viên năng động"
                             : "Tân binh thể thao";

                return Results.Ok(new
                {
                    completedCount,
                    totalSessionsCount,
                    level,
                    xp,
                    title,
                    badgesStatus = new
                    {
                        streak10,
                        breakthrough20,
                        multiSport,
                        coachBuddy,
                        warrior50,
                        goldMember
                    },
                    unlockedBadgesCount = unlockedCount
                });
            })
            .WithTags("Member Portal")
            .WithSummary("Get member dynamic gamification stats, badges and XP");
        }
    }
}
