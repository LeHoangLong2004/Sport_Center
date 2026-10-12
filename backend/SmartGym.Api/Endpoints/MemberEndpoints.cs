using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace SmartGym.Api.Endpoints
{
    public static class MemberEndpoints
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

            // 2. GET & POST /api/member/bookings - Book Class or PT Slot
            group.MapGet("/bookings", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                return Results.Ok(bookings);
            })
            .WithTags("Member Portal")
            .WithSummary("Get all member active bookings");

            group.MapPost("/bookings", (HttpContext context, [FromBody] JsonElement body) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());

                var newBooking = new
                {
                    id = $"bk-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
                    name = body.TryGetProperty("name", out var n) ? n.GetString() : "Lớp học SportCenter",
                    sport = body.TryGetProperty("sport", out var sp) ? sp.GetString() : "Gym",
                    level = body.TryGetProperty("level", out var lv) ? lv.GetString() : "Cơ bản",
                    type = body.TryGetProperty("type", out var tp) ? tp.GetString() : "group",
                    date = body.TryGetProperty("date", out var dt) ? dt.GetString() : DateTime.UtcNow.ToString("yyyy-MM-dd"),
                    startTime = body.TryGetProperty("startTime", out var st) ? st.GetString() : "08:00",
                    endTime = body.TryGetProperty("endTime", out var et) ? et.GetString() : "09:00",
                    room = body.TryGetProperty("room", out var rm) ? rm.GetString() : "Studio 1",
                    coachName = body.TryGetProperty("coachName", out var cn) ? cn.GetString() : "HLV SportCenter",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = body.TryGetProperty("coachNote", out var nt) ? nt.GetString() : "",
                    bookedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                };

                bookings.Insert(0, newBooking);
                return Results.Ok(new { message = "Đặt lịch thành công!", booking = newBooking });
            })
            .WithTags("Member Portal")
            .WithSummary("Create new booking for group class or 1-on-1 PT slot");

            // 3. DELETE /api/member/bookings/{id} - Cancel Booking with Reason
            group.MapDelete("/bookings/{id}", (string id, [FromQuery] string? reason, HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var bookings = _memberBookings.GetOrAdd(userId, _ => GetDefaultBookings());
                var cancelledList = _memberCancelledBookings.GetOrAdd(userId, _ => new List<object>());

                var found = bookings.FirstOrDefault(b => ((dynamic)b).id == id);
                if (found != null)
                {
                    bookings.Remove(found);
                    cancelledList.Insert(0, new
                    {
                        id = ((dynamic)found).id,
                        name = ((dynamic)found).name,
                        date = ((dynamic)found).date,
                        startTime = ((dynamic)found).startTime,
                        coachName = ((dynamic)found).coachName,
                        cancelReason = string.IsNullOrWhiteSpace(reason) ? "Học viên tự hủy" : reason,
                        cancelledAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss")
                    });
                    return Results.Ok(new { message = "Hủy lịch thành công!", id });
                }

                return Results.NotFound(new { message = "Không tìm thấy buổi đặt chỗ" });
            })
            .WithTags("Member Portal")
            .WithSummary("Cancel a booked session with reason");

            // 4. GET /api/member/cancelled-bookings
            group.MapGet("/cancelled-bookings", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var cancelledList = _memberCancelledBookings.GetOrAdd(userId, _ => new List<object>());
                return Results.Ok(cancelledList);
            })
            .WithTags("Member Portal")
            .WithSummary("Get member cancelled bookings history");

            // 5. GET & POST /api/member/support-tickets
            group.MapGet("/support-tickets", (HttpContext context) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var tickets = _memberSupportTickets.GetOrAdd(userId, _ => GetDefaultTickets());
                return Results.Ok(tickets);
            })
            .WithTags("Member Portal")
            .WithSummary("Get member support tickets");

            group.MapPost("/support-tickets", (HttpContext context, [FromBody] JsonElement body) =>
            {
                var userId = GetUserId(context) ?? "m-demo";
                var tickets = _memberSupportTickets.GetOrAdd(userId, _ => GetDefaultTickets());

                var newTicket = new
                {
                    id = $"TCK-{Random.Shared.Next(100, 999)}",
                    category = body.TryGetProperty("category", out var c) ? c.GetString() : "Tư vấn dịch vụ",
                    subject = body.TryGetProperty("subject", out var s) ? s.GetString() : "Yêu cầu từ hội viên",
                    content = body.TryGetProperty("content", out var ct) ? ct.GetString() : "",
                    status = "open",
                    createdAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                    reply = (string?)null,
                    repliedAt = (string?)null,
                    repliedBy = (string?)null
                };

                tickets.Insert(0, newTicket);
                return Results.Ok(new { message = "Đã gửi yêu cầu hỗ trợ thành công!", ticket = newTicket });
            })
            .WithTags("Member Portal")
            .WithSummary("Create new support ticket");

            // 6. POST /api/member/ai-ask - Intelligent AI Assistant endpoint
            group.MapPost("/ai-ask", ([FromBody] JsonElement body) =>
            {
                var query = body.TryGetProperty("query", out var q) ? q.GetString()?.ToLower() ?? "" : "";
                string answer;

                if (query.Contains("lịch") || query.Contains("buổi") || query.Contains("ngày mai") || query.Contains("hôm nay"))
                {
                    answer = "📅 Bạn có ca tập gần nhất là lớp **Yoga Cân Bằng Cột Sống** vào ngày mai lúc 07:00 tại Studio 2 với HLV Minh Tuấn, và ca **Kèm 1-1 PT Gym** vào 08:30.";
                }
                else if (query.Contains("gói") || query.Contains("hạn") || query.Contains("hạn dùng"))
                {
                    answer = "💳 Bạn đang có 2 gói còn hiệu lực:\n1. **Gói Yoga Chuyên Sâu 3 Tháng** (Hạn đến 30/11/2026, còn 49 ngày).\n2. **Gói Gym & Thể Lực 1 Tháng** (Hạn đến 31/10/2026, còn 19 ngày).";
                }
                else if (query.Contains("thực đơn") || query.Contains("đạm") || query.Contains("dinh dưỡng") || query.Contains("ăn"))
                {
                    answer = "🥗 Gợi ý thực đơn tăng cơ giảm mỡ chuẩn SportCenter:\n• Sáng: 2 trứng ốp la + 1 lát bánh mì nguyên cám + 1 cốc sữa hạt.\n• Trưa: 150g ức gà hoặc phi lê bò + cơm gạo lứt + rau luộc.\n• Trước tập: 1 quả chuối tiêu hoặc 1 muỗng Whey Protein.\n• Tối: 150g cá hồi áp chảo + đĩa salad sốt chanh leo.";
                }
                else if (query.Contains("đau") || query.Contains("mỏi") || query.Contains("chân") || query.Contains("giãn"))
                {
                    answer = "💪 Khắc phục mỏi cơ bắp sau ngày tập nặng:\n1. Thực hiện giãn cơ tĩnh 10-15 phút sau buổi tập.\n2. Lăn ống Foam Roller vùng đùi và bắp chân.\n3. Uống đủ 2 - 2.5 lít nước, bổ sung điện giải và ngủ đủ 7-8 tiếng.";
                }
                else
                {
                    answer = "SportCenter AI Assistant đã ghi nhận câu hỏi của bạn. Hệ thống khuyên bạn nên duy trì tập luyện đều đặn 3 buổi/tuần và có thể gửi ticket hỗ trợ nếu cần sự can thiệp từ ban quản lý hoặc HLV!";
                }

                return Results.Ok(new { answer, timestamp = DateTime.UtcNow.ToString("HH:mm") });
            })
            .WithTags("Member Portal")
            .WithSummary("AI assistant chat consultation for member");
        }

        private static string? GetUserId(HttpContext context)
        {
            return context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private static List<object> GetDefaultBookings()
        {
            return new List<object>
            {
                new
                {
                    id = "sess-01",
                    name = "Yoga Cân Bằng Cột Sống",
                    sport = "Yoga",
                    level = "Cơ bản",
                    type = "group",
                    date = DateTime.UtcNow.AddDays(1).ToString("yyyy-MM-dd"),
                    startTime = "07:00",
                    endTime = "08:00",
                    room = "Studio 2 - Tầng 2",
                    coachName = "HLV Minh Tuấn",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Mang theo khăn tập và nước uống đầy đủ nhé cả lớp."
                },
                new
                {
                    id = "sess-02",
                    name = "Kèm 1-1: Tăng cơ cốt lõi & Giảm mỡ",
                    sport = "Gym",
                    level = "Nâng cao",
                    type = "pt",
                    date = DateTime.UtcNow.AddDays(2).ToString("yyyy-MM-dd"),
                    startTime = "08:30",
                    endTime = "09:30",
                    room = "Khu PT 1-1 - Tầng 1",
                    coachName = "HLV Enam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Hôm nay tập trung vào nhóm cơ ngực và tay sau."
                },
                new
                {
                    id = "sess-03",
                    name = "Boxing Cardio & Phản xạ",
                    sport = "Boxing",
                    level = "Trung cấp",
                    type = "group",
                    date = DateTime.UtcNow.AddDays(4).ToString("yyyy-MM-dd"),
                    startTime = "18:00",
                    endTime = "19:00",
                    room = "Combat Ring - Tầng 3",
                    coachName = "HLV Hoàng Long",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Tập phản xạ bộ pháp di chuyển."
                }
            };
        }

        private static List<object> GetDefaultTasks()
        {
            return new List<object>
            {
                new
                {
                    id = "task-01",
                    title = "Chạy bộ phục hồi 20 phút",
                    description = "Nhịp tim vùng Zone 2 (khoảng 120-130 bpm).",
                    assignedBy = "HLV Enam",
                    assignedDate = "2026-10-11",
                    dueDate = "2026-10-14",
                    completed = false,
                    category = "recovery"
                },
                new
                {
                    id = "task-02",
                    title = "Plank 3 hiệp x 60 giây",
                    description = "Giữ thẳng lưng, gồng chặt cơ bụng và thở đều.",
                    assignedBy = "HLV Minh Tuấn",
                    assignedDate = "2026-10-10",
                    dueDate = "2026-10-13",
                    completed = true,
                    category = "workout"
                }
            };
        }

        private static List<object> GetDefaultTickets()
        {
            return new List<object>
            {
                new
                {
                    id = "TCK-881",
                    category = "Đổi lịch",
                    subject = "Xin phép đổi lịch tập lớp Yoga sang tối Thứ 5",
                    content = "Do bận việc đột xuất vào sáng Thứ 4 nên em muốn chuyển ca học sang 18:30 Thứ 5 được không ạ?",
                    status = "resolved",
                    createdAt = "2026-10-08 09:15",
                    reply = "Chào bạn, quầy lễ tân đã hỗ trợ chuyển bạn sang lớp Yoga Tối thứ 5 thành công rồi nhé!",
                    repliedAt = "2026-10-08 10:02",
                    repliedBy = "Lễ tân Minh Thư"
                }
            };
        }
    }
}
