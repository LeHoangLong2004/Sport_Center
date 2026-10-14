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
        }

        private static string? GetUserId(HttpContext context)
        {
            return context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        private static List<object> GetDefaultBookings()
        {
            var today = DateTime.UtcNow;
            var diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var mon = today.AddDays(-1 * diff).Date;

            return new List<object>
            {
                // Thứ 2
                new
                {
                    id = "sess-mon-01",
                    name = "Yoga Cơ Bản – Lớp A",
                    sport = "Yoga",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.ToString("yyyy-MM-dd"),
                    startTime = "07:00",
                    endTime = "08:00",
                    room = "Studio 2 - Tầng 2",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "hoàn thành",
                    attendanceStatus = "có mặt",
                    coachNote = "Tập thở và giãn cơ sâu rất tốt."
                },
                new
                {
                    id = "sess-mon-03",
                    name = "Zumba Sôi Động Khởi Đầu Tuần",
                    sport = "Zumba",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.ToString("yyyy-MM-dd"),
                    startTime = "08:00",
                    endTime = "09:00",
                    room = "Studio 3 - Tầng 3",
                    coachName = "HLV Lan Anh",
                    status = "hoàn thành",
                    attendanceStatus = "có mặt",
                    coachNote = "Đốt mỡ cực tốt cùng âm nhạc sôi động."
                },
                new
                {
                    id = "sess-mon-02",
                    name = "Gym Group BodyPump",
                    sport = "Gym",
                    level = "Nâng cao",
                    type = "group",
                    date = mon.ToString("yyyy-MM-dd"),
                    startTime = "09:00",
                    endTime = "10:30",
                    room = "Khu Tạ Tự Do",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "hoàn thành",
                    attendanceStatus = "có mặt",
                    coachNote = "Hoàn thành 4 hiệp Squat và Deadlift chuẩn form."
                },

                // Thứ 3
                new
                {
                    id = "sess-tue-01",
                    name = "Bơi Lội Sáng Sớm",
                    sport = "Bơi",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(1).ToString("yyyy-MM-dd"),
                    startTime = "06:00",
                    endTime = "07:00",
                    room = "Hồ Bơi Tầng 4",
                    coachName = "HLV Đỗ Quốc Bảo",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Khởi động kỹ khớp vai trước khi xuống nước nhé."
                },
                new
                {
                    id = "sess-tue-02",
                    name = "Boxing Cơ Bản",
                    sport = "Boxing",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(1).ToString("yyyy-MM-dd"),
                    startTime = "07:00",
                    endTime = "08:00",
                    room = "Võ Đài Ring 1",
                    coachName = "HLV Hoàng Long",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Mang theo găng tay và băng quấn tay."
                },
                new
                {
                    id = "sess-tue-03",
                    name = "Kèm 1-1: Phản xạ & Sức bền",
                    sport = "Gym",
                    level = "1-1 PT",
                    type = "pt",
                    date = mon.AddDays(1).ToString("yyyy-MM-dd"),
                    startTime = "14:00",
                    endTime = "15:00",
                    room = "Ring PT 1-1",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    goal = "Phản xạ & Sức bền",
                    coachNote = "Kèm kỹ thuật đấm thẳng và xoay hông."
                },
                new
                {
                    id = "sess-tue-04",
                    name = "Cardio & Core Workout",
                    sport = "Cardio",
                    level = "Trung cấp",
                    type = "group",
                    date = mon.AddDays(1).ToString("yyyy-MM-dd"),
                    startTime = "18:00",
                    endTime = "19:00",
                    room = "Khu Thể Lực",
                    coachName = "HLV Minh Tuấn",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Tăng nhịp tim và săn chắc cơ bụng."
                },

                // Thứ 4
                new
                {
                    id = "sess-wed-01",
                    name = "Yoga Cân Bằng Cột Sống",
                    sport = "Yoga",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(2).ToString("yyyy-MM-dd"),
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
                    id = "sess-wed-02",
                    name = "Kèm 1-1: Tăng cơ cốt lõi (Core & Leg)",
                    sport = "Gym",
                    level = "1-1 PT",
                    type = "pt",
                    date = mon.AddDays(2).ToString("yyyy-MM-dd"),
                    startTime = "08:00",
                    endTime = "09:00",
                    room = "Khu PT 1-1 - Tầng 1",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    goal = "Tăng cơ & Siết nét",
                    coachNote = "Tập trung nhóm cơ ngực và tay sau."
                },
                new
                {
                    id = "sess-wed-03",
                    name = "Pilates Nâng Cao",
                    sport = "Pilates",
                    level = "Nâng cao",
                    type = "group",
                    date = mon.AddDays(2).ToString("yyyy-MM-dd"),
                    startTime = "14:00",
                    endTime = "15:00",
                    room = "Studio 1 - Tầng 2",
                    coachName = "HLV Lê Thu Hà",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Cải thiện vóc dáng và cột sống."
                },

                // Thứ 5
                new
                {
                    id = "sess-thu-01",
                    name = "Gym Core & Abs",
                    sport = "Gym",
                    level = "Trung cấp",
                    type = "group",
                    date = mon.AddDays(3).ToString("yyyy-MM-dd"),
                    startTime = "07:00",
                    endTime = "08:00",
                    room = "Khu Tạ Tự Do",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Bài tập siết cơ bụng và liên sườn."
                },
                new
                {
                    id = "sess-thu-02",
                    name = "Kèm 1-1: Tăng cơ ngực & Tay sau",
                    sport = "Gym",
                    level = "1-1 PT",
                    type = "pt",
                    date = mon.AddDays(3).ToString("yyyy-MM-dd"),
                    startTime = "08:00",
                    endTime = "09:00",
                    room = "Khu PT 1-1 - Tầng 1",
                    coachName = "HLV Enam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    goal = "Tăng cơ ngực",
                    coachNote = "Hôm nay tập trung vào các bài Bench Press."
                },
                new
                {
                    id = "sess-thu-03",
                    name = "Zumba Dance Cardio Party",
                    sport = "Zumba",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(3).ToString("yyyy-MM-dd"),
                    startTime = "18:00",
                    endTime = "19:00",
                    room = "Studio 3 - Tầng 3",
                    coachName = "HLV Lan Anh",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Vũ điệu latin giải tỏa căng thẳng sau giờ làm."
                },

                // Thứ 6
                new
                {
                    id = "sess-fri-01",
                    name = "Kèm 1-1: Sức bền & Tốc độ",
                    sport = "Gym",
                    level = "1-1 PT",
                    type = "pt",
                    date = mon.AddDays(4).ToString("yyyy-MM-dd"),
                    startTime = "07:00",
                    endTime = "08:00",
                    room = "Võ Đài",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    goal = "Phản xạ & Sức bền",
                    coachNote = "Kèm cá nhân cardio phản xạ."
                },
                new
                {
                    id = "sess-fri-02",
                    name = "Boxing Nâng Cao",
                    sport = "Boxing",
                    level = "Nâng cao",
                    type = "group",
                    date = mon.AddDays(4).ToString("yyyy-MM-dd"),
                    startTime = "15:00",
                    endTime = "16:30",
                    room = "Võ Đài Ring 2",
                    coachName = "HLV Hoàng Long",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Luyện đòn tổ hợp và né đòn."
                },
                new
                {
                    id = "sess-fri-03",
                    name = "Bơi Thả Lỏng & Hồi Phục",
                    sport = "Bơi",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(4).ToString("yyyy-MM-dd"),
                    startTime = "17:00",
                    endTime = "18:00",
                    room = "Hồ Bơi Tầng 4",
                    coachName = "HLV Đỗ Quốc Bảo",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Thư giãn các nhóm cơ sau một tuần tập luyện."
                },

                // Thứ 7
                new
                {
                    id = "sess-sat-01",
                    name = "Kèm 1-1: Sức khỏe & Săn chắc",
                    sport = "Gym",
                    level = "1-1 PT",
                    type = "pt",
                    date = mon.AddDays(5).ToString("yyyy-MM-dd"),
                    startTime = "08:00",
                    endTime = "09:00",
                    room = "Studio 2",
                    coachName = "HLV Enam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    goal = "Săn chắc toàn thân",
                    coachNote = "Chuẩn bị bài tập tạ tay vừa sức."
                },
                new
                {
                    id = "sess-sat-02",
                    name = "Gym Strength & Fit",
                    sport = "Gym",
                    level = "Nâng cao",
                    type = "group",
                    date = mon.AddDays(5).ToString("yyyy-MM-dd"),
                    startTime = "09:00",
                    endTime = "10:30",
                    room = "Khu Thể Lực",
                    coachName = "HLV Hồ Xuân Ánh Nam",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Thử thách mức tạ mới an toàn."
                },
                new
                {
                    id = "sess-sat-03",
                    name = "Pilates Core Flow",
                    sport = "Pilates",
                    level = "Trung cấp",
                    type = "group",
                    date = mon.AddDays(5).ToString("yyyy-MM-dd"),
                    startTime = "15:00",
                    endTime = "16:00",
                    room = "Studio 1 - Tầng 2",
                    coachName = "HLV Lê Thu Hà",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Gồng cơ bụng trọng tâm và mở rộng khớp hông."
                },

                // Chủ nhật
                new
                {
                    id = "sess-sun-01",
                    name = "Bơi Sải & Thể Lực",
                    sport = "Bơi",
                    level = "Trung cấp",
                    type = "group",
                    date = mon.AddDays(6).ToString("yyyy-MM-dd"),
                    startTime = "14:00",
                    endTime = "15:30",
                    room = "Hồ Bơi Tầng 4",
                    coachName = "HLV Đỗ Quốc Bảo",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Bơi thả lỏng và rèn dung tích phổi."
                },
                new
                {
                    id = "sess-sun-02",
                    name = "Yoga Thiền & Phục Hồi Thần Kinh",
                    sport = "Yoga",
                    level = "Cơ bản",
                    type = "group",
                    date = mon.AddDays(6).ToString("yyyy-MM-dd"),
                    startTime = "17:00",
                    endTime = "18:00",
                    room = "Studio 2 - Tầng 2",
                    coachName = "HLV Minh Tuấn",
                    status = "sắp diễn ra",
                    attendanceStatus = "chưa điểm danh",
                    coachNote = "Tái tạo năng lượng chuẩn bị cho tuần mới."
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
