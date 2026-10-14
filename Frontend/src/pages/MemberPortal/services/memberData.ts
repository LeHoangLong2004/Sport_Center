import type {
  MemberSessionItem,
  MemberPackageItem,
  MemberPaymentItem,
  MemberTaskItem,
  MemberCoachReviewItem,
  MemberSupportTicketItem,
} from "../types";

export const DEFAULT_MEMBER_PACKAGES: MemberPackageItem[] = [
  {
    id: "pkg-sub-01",
    packageId: "pkg-yoga-01",
    name: "Gói Yoga Chuyên Sâu 3 Tháng",
    sport: "Yoga",
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    daysRemaining: 49,
    price: 3500000,
    status: "active",
    totalSessions: 36,
    usedSessions: 14,
  },
  {
    id: "pkg-sub-02",
    packageId: "pkg-gym-01",
    name: "Gói Gym & Thể Lực Tự Do 1 Tháng",
    sport: "Gym",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    daysRemaining: 19,
    price: 1200000,
    status: "active",
    totalSessions: 30,
    usedSessions: 11,
  },
];

export const DEFAULT_MEMBER_SESSIONS: MemberSessionItem[] = [
  // Thứ 2 (2026-10-12)
  {
    id: "sess-mon-01",
    name: "Yoga Cơ Bản – Lớp A",
    sport: "Yoga",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-12",
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2 - Tầng 2",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 10,
    registeredCount: 8,
    status: "hoàn thành",
    attendanceStatus: "có mặt",
    coachNote: "Tập thở và giãn cơ sâu rất tốt.",
  },
  {
    id: "sess-mon-03",
    name: "Zumba Sôi Động Khởi Đầu Tuần",
    sport: "Zumba",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-12",
    startTime: "08:00",
    endTime: "09:00",
    room: "Studio 3 - Tầng 3",
    coachId: "coach-zumba",
    coachName: "HLV Lan Anh",
    capacity: 20,
    registeredCount: 18,
    status: "hoàn thành",
    attendanceStatus: "có mặt",
    coachNote: "Đốt mỡ cực tốt cùng âm nhạc sôi động.",
  },
  {
    id: "sess-mon-02",
    name: "Gym Group BodyPump",
    sport: "Gym",
    level: "Nâng cao",
    type: "group",
    date: "2026-10-12",
    startTime: "09:00",
    endTime: "10:30",
    room: "Khu Tạ Tự Do",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 8,
    registeredCount: 6,
    status: "hoàn thành",
    attendanceStatus: "có mặt",
    coachNote: "Hoàn thành 4 hiệp Squat và Deadlift chuẩn form.",
  },

  // Thứ 3 (2026-10-13)
  {
    id: "sess-tue-01",
    name: "Bơi Lội Sáng Sớm",
    sport: "Bơi",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-13",
    startTime: "06:00",
    endTime: "07:00",
    room: "Hồ Bơi Tầng 4",
    coachId: "coach-swim-01",
    coachName: "HLV Đỗ Quốc Bảo",
    capacity: 12,
    registeredCount: 12,
    status: "đang diễn ra",
    attendanceStatus: "có mặt",
    coachNote: "Khởi động kỹ khớp vai trước khi xuống nước nhé.",
  },
  {
    id: "sess-tue-02",
    name: "Boxing Cơ Bản & Thể Lực",
    sport: "Boxing",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-13",
    startTime: "07:00",
    endTime: "08:00",
    room: "Võ Đài Ring 1",
    coachId: "coach-03",
    coachName: "HLV Hoàng Long",
    capacity: 15,
    registeredCount: 6,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Mang theo găng tay và băng quấn tay.",
  },
  {
    id: "sess-tue-03",
    name: "Kèm 1-1: Phản xạ & Sức bền",
    sport: "Gym",
    level: "1-1 PT",
    type: "pt",
    date: "2026-10-13",
    startTime: "14:00",
    endTime: "15:00",
    room: "Ring PT 1-1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    goal: "Phản xạ & Sức bền",
    coachNote: "Kèm kỹ thuật đấm thẳng và xoay hông.",
  },
  {
    id: "sess-tue-04",
    name: "Cardio & Core Workout",
    sport: "Cardio",
    level: "Trung cấp",
    type: "group",
    date: "2026-10-13",
    startTime: "18:00",
    endTime: "19:00",
    room: "Khu Thể Lực",
    coachId: "coach-01",
    coachName: "HLV Minh Tuấn",
    capacity: 15,
    registeredCount: 10,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Tăng nhịp tim và săn chắc cơ bụng.",
  },

  // Thứ 4 (2026-10-14)
  {
    id: "sess-wed-01",
    name: "Yoga Cân Bằng Cột Sống",
    sport: "Yoga",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-14",
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 2 - Tầng 2",
    coachId: "coach-01",
    coachName: "HLV Minh Tuấn",
    capacity: 15,
    registeredCount: 12,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Mang theo khăn tập và nước uống đầy đủ nhé cả lớp.",
  },
  {
    id: "sess-wed-02",
    name: "Kèm 1-1: Tăng cơ cốt lõi (Core & Leg)",
    sport: "Gym",
    level: "1-1 PT",
    type: "pt",
    date: "2026-10-14",
    startTime: "08:00",
    endTime: "09:00",
    room: "Khu PT 1-1 - Tầng 1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    goal: "Tăng cơ & Siết nét",
    coachNote: "Tập trung nhóm cơ ngực và tay sau.",
  },
  {
    id: "sess-wed-03",
    name: "Pilates Nâng Cao Cải Thiện Vóc Dáng",
    sport: "Pilates",
    level: "Nâng cao",
    type: "group",
    date: "2026-10-14",
    startTime: "14:00",
    endTime: "15:00",
    room: "Studio 1 - Tầng 2",
    coachId: "coach-pilates",
    coachName: "HLV Lê Thu Hà",
    capacity: 10,
    registeredCount: 10,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Cải thiện vóc dáng và giải tỏa căng thẳng cột sống.",
  },

  // Thứ 5 (2026-10-15)
  {
    id: "sess-thu-01",
    name: "Gym Core & Abs",
    sport: "Gym",
    level: "Trung cấp",
    type: "group",
    date: "2026-10-15",
    startTime: "07:00",
    endTime: "08:00",
    room: "Khu Tạ Tự Do",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 12,
    registeredCount: 8,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Bài tập siết cơ bụng và cơ liên sườn.",
  },
  {
    id: "sess-thu-02",
    name: "Kèm 1-1: Tăng cơ ngực & Tay sau",
    sport: "Gym",
    level: "1-1 PT",
    type: "pt",
    date: "2026-10-15",
    startTime: "08:00",
    endTime: "09:00",
    room: "Khu PT 1-1 - Tầng 1",
    coachId: "coach-02",
    coachName: "HLV Enam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    goal: "Tăng cơ ngực",
    coachNote: "Hôm nay tập trung vào các bài Bench Press nặng.",
  },
  {
    id: "sess-thu-03",
    name: "Zumba Dance Cardio Party",
    sport: "Zumba",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-15",
    startTime: "18:00",
    endTime: "19:00",
    room: "Studio 3 - Tầng 3",
    coachId: "coach-zumba",
    coachName: "HLV Lan Anh",
    capacity: 25,
    registeredCount: 22,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Vũ điệu latin giải tỏa căng thẳng sau giờ làm.",
  },

  // Thứ 6 (2026-10-16)
  {
    id: "sess-fri-01",
    name: "Kèm 1-1: Sức bền & Tốc độ",
    sport: "Gym",
    level: "1-1 PT",
    type: "pt",
    date: "2026-10-16",
    startTime: "07:00",
    endTime: "08:00",
    room: "Võ Đài",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    goal: "Phản xạ & Sức bền",
    coachNote: "Kèm cá nhân cardio phản xạ.",
  },
  {
    id: "sess-fri-02",
    name: "Boxing Nâng Cao",
    sport: "Boxing",
    level: "Nâng cao",
    type: "group",
    date: "2026-10-16",
    startTime: "15:00",
    endTime: "16:30",
    room: "Võ Đài Ring 2",
    coachId: "coach-03",
    coachName: "HLV Hoàng Long",
    capacity: 10,
    registeredCount: 6,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Luyện đòn tổ hợp và né đòn.",
  },
  {
    id: "sess-fri-03",
    name: "Bơi Thả Lỏng & Hồi Phục",
    sport: "Bơi",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-16",
    startTime: "17:00",
    endTime: "18:00",
    room: "Hồ Bơi Tầng 4",
    coachId: "coach-swim-01",
    coachName: "HLV Đỗ Quốc Bảo",
    capacity: 15,
    registeredCount: 9,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Thư giãn các nhóm cơ sau một tuần tập luyện.",
  },

  // Thứ 7 (2026-10-17)
  {
    id: "sess-sat-01",
    name: "Kèm 1-1: Sức khỏe & Săn chắc",
    sport: "Gym",
    level: "1-1 PT",
    type: "pt",
    date: "2026-10-17",
    startTime: "08:00",
    endTime: "09:00",
    room: "Studio 2",
    coachId: "coach-02",
    coachName: "HLV Enam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    goal: "Săn chắc toàn thân",
    coachNote: "Chuẩn bị bài tập tạ tay vừa sức.",
  },
  {
    id: "sess-sat-02",
    name: "Gym Strength & Fit",
    sport: "Gym",
    level: "Nâng cao",
    type: "group",
    date: "2026-10-17",
    startTime: "09:00",
    endTime: "10:30",
    room: "Khu Thể Lực",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 10,
    registeredCount: 10,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Thử thách mức tạ mới an toàn.",
  },
  {
    id: "sess-sat-03",
    name: "Pilates Core Flow",
    sport: "Pilates",
    level: "Trung cấp",
    type: "group",
    date: "2026-10-17",
    startTime: "15:00",
    endTime: "16:00",
    room: "Studio 1 - Tầng 2",
    coachId: "coach-pilates",
    coachName: "HLV Lê Thu Hà",
    capacity: 12,
    registeredCount: 9,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Gồng cơ bụng trọng tâm và mở rộng khớp hông.",
  },

  // Chủ nhật (2026-10-18)
  {
    id: "sess-sun-01",
    name: "Bơi Sải & Thể Lực",
    sport: "Bơi",
    level: "Trung cấp",
    type: "group",
    date: "2026-10-18",
    startTime: "14:00",
    endTime: "15:30",
    room: "Hồ Bơi Tầng 4",
    coachId: "coach-swim-01",
    coachName: "HLV Đỗ Quốc Bảo",
    capacity: 15,
    registeredCount: 11,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Bơi thả lỏng và rèn dung tích phổi.",
  },
  {
    id: "sess-sun-02",
    name: "Yoga Thiền & Phục Hồi Thần Kinh",
    sport: "Yoga",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-18",
    startTime: "17:00",
    endTime: "18:00",
    room: "Studio 2 - Tầng 2",
    coachId: "coach-01",
    coachName: "HLV Minh Tuấn",
    capacity: 20,
    registeredCount: 14,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Tái tạo năng lượng chuẩn bị cho tuần mới.",
  },
];

export const DEFAULT_MEMBER_TASKS: MemberTaskItem[] = [
  {
    id: "task-01",
    title: "Chạy bộ phục hồi 20 phút hoặc đi bộ nhanh",
    description: "Nhịp tim duy trì ở vùng Zone 2 (khoảng 120-130 bpm) vào ngày nghỉ ngơi.",
    assignedBy: "HLV Enam",
    assignedDate: "2026-10-11",
    dueDate: "2026-10-14",
    completed: false,
    category: "recovery",
  },
  {
    id: "task-02",
    title: "Plank 3 hiệp x 60 giây trước khi đi ngủ",
    description: "Giữ thẳng lưng, gồng chặt cơ bụng và thở đều, không cong mông.",
    assignedBy: "HLV Minh Tuấn",
    assignedDate: "2026-10-10",
    dueDate: "2026-10-13",
    completed: true,
    category: "workout",
  },
  {
    id: "task-03",
    title: "Uống đủ 2.5 lít nước và ngủ đủ 7-8 tiếng",
    description: "Tối ưu hóa khả năng hồi phục cơ bắp và giảm mỏi mệt sau buổi tập.",
    assignedBy: "HLV Enam",
    assignedDate: "2026-10-12",
    dueDate: "2026-10-15",
    completed: false,
    category: "diet",
  },
];

export const DEFAULT_PAYMENTS: MemberPaymentItem[] = [
  {
    id: "INV-2026-0091",
    packageName: "Gói Yoga Chuyên Sâu 3 Tháng",
    amount: 3500000,
    date: "2026-09-01",
    method: "Chuyển khoản",
    status: "paid",
    referenceCode: "VCB889218204",
  },
  {
    id: "INV-2026-0104",
    packageName: "Gói Gym & Thể Lực Tự Do 1 Tháng",
    amount: 1200000,
    date: "2026-10-01",
    method: "Tiền mặt tại quầy",
    status: "paid",
    referenceCode: "CASH-REC-104",
  },
];

export const DEFAULT_SUPPORT_TICKETS: MemberSupportTicketItem[] = [
  {
    id: "TCK-881",
    category: "Đổi lịch",
    subject: "Xin phép đổi lịch tập lớp Yoga sang tối Thứ 5",
    content: "Do bận việc đột xuất vào sáng Thứ 4 nên em muốn chuyển ca học sang 18:30 Thứ 5 được không ạ?",
    status: "resolved",
    createdAt: "2026-10-08 09:15",
    reply: "Chào bạn, quầy lễ tân đã hỗ trợ chuyển bạn sang lớp Yoga Tối thứ 5 thành công rồi nhé!",
    repliedAt: "2026-10-08 10:02",
    repliedBy: "Lễ tân Minh Thư",
  },
];

export const DEFAULT_COACH_REVIEWS: MemberCoachReviewItem[] = [
  {
    id: "rev-01",
    sessionId: "sess-04",
    sessionName: "Yoga Vinyasa Thải độc",
    coachId: "coach-01",
    coachName: "HLV Minh Tuấn",
    date: "2026-10-10",
    rating: 5,
    tags: ["Nhiệt tình", "Sửa form kỹ", "Âm nhạc thư giãn"],
    comment: "Thầy dạy cực kỳ tận tâm, hướng dẫn từng nhịp thở rất chuẩn!",
  },
];

// Helper functions for localStorage syncing
export function getSavedMemberData<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error("Failed to load", key, e);
  }
  return defaultVal;
}

export function saveMemberData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save", key, e);
  }
}

// REST Backend API Client for Member Portal
export const MemberBackendAPI = {
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async getDashboard() {
    try {
      const res = await fetch("/api/member/dashboard", {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend getDashboard failed, using local fallback", e);
    }
    return null;
  },

  async getBookings(): Promise<MemberSessionItem[]> {
    try {
      const res = await fetch("/api/member/bookings", {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const existingIds = new Set(data.map((d: any) => d.id));
          const missing = DEFAULT_MEMBER_SESSIONS.filter((d) => !existingIds.has(d.id));
          const merged = [...data, ...missing];
          saveMemberData("member_sessions", merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn("Backend getBookings failed, using local fallback", e);
    }
    return getSavedMemberData("member_sessions", DEFAULT_MEMBER_SESSIONS);
  },

  async createBooking(booking: Partial<MemberSessionItem>) {
    try {
      const res = await fetch("/api/member/bookings", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(booking),
      });
      if (res.ok) {
        const data = await res.json();
        return data.booking;
      }
    } catch (e) {
      console.warn("Backend createBooking failed, saving locally", e);
    }
    return null;
  },

  async cancelBooking(bookingId: string, reason: string) {
    try {
      const res = await fetch(
        `/api/member/bookings/${encodeURIComponent(bookingId)}?reason=${encodeURIComponent(reason)}`,
        {
          method: "DELETE",
          headers: this.getAuthHeaders(),
        }
      );
      if (res.ok) return true;
    } catch (e) {
      console.warn("Backend cancelBooking failed", e);
    }
    return false;
  },

  async askAI(query: string): Promise<string> {
    try {
      const res = await fetch("/api/member/ai-ask", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.answer;
      }
    } catch (e) {
      console.warn("Backend askAI failed", e);
    }
    return "";
  },

  async createSupportTicket(ticket: { category: string; subject: string; content: string }) {
    try {
      const res = await fetch("/api/member/support-tickets", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ticket),
      });
      if (res.ok) {
        const data = await res.json();
        return data.ticket;
      }
    } catch (e) {
      console.warn("Backend createSupportTicket failed", e);
    }
    return null;
  },
};

export const MemberAPI = MemberBackendAPI;

