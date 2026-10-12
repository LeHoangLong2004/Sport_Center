import type {
  MemberSessionItem,
  MemberPackageItem,
  MemberPaymentItem,
  MemberTaskItem,
  MemberBodyMetricItem,
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
  {
    id: "sess-01",
    name: "Yoga Cân Bằng Cột Sống & Dây",
    sport: "Yoga",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-13",
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
    id: "sess-02",
    name: "Kèm 1-1: Tăng cơ cốt lõi & Giảm mỡ",
    sport: "Gym",
    level: "Nâng cao",
    type: "pt",
    date: "2026-10-14",
    startTime: "08:30",
    endTime: "09:30",
    room: "Khu PT 1-1 - Tầng 1",
    coachId: "coach-02",
    coachName: "HLV Enam",
    capacity: 1,
    registeredCount: 1,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Hôm nay tập trung vào các nhóm cơ ngực và tay sau, khởi động kỹ cổ tay.",
  },
  {
    id: "sess-03",
    name: "Boxing Cardio & Phản xạ",
    sport: "Boxing",
    level: "Trung cấp",
    type: "group",
    date: "2026-10-16",
    startTime: "18:00",
    endTime: "19:00",
    room: "Combat Ring - Tầng 3",
    coachId: "coach-03",
    coachName: "HLV Hoàng Long",
    capacity: 20,
    registeredCount: 18,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
  },
  {
    id: "sess-04",
    name: "Yoga Vinyasa Thải độc",
    sport: "Yoga",
    level: "Cơ bản",
    type: "group",
    date: "2026-10-10",
    startTime: "07:00",
    endTime: "08:00",
    room: "Studio 1 - Tầng 2",
    coachId: "coach-01",
    coachName: "HLV Minh Tuấn",
    capacity: 15,
    registeredCount: 15,
    status: "hoàn thành",
    attendanceStatus: "có mặt",
    coachNote: "Học viên giữ nhịp thở rất đều, tư thế chiến binh chuẩn xác.",
  },
  {
    id: "sess-05",
    name: "Functional HIIT Cường độ cao",
    sport: "Gym",
    level: "Nâng cao",
    type: "group",
    date: "2026-10-07",
    startTime: "18:30",
    endTime: "19:30",
    room: "Arena 2 - Tầng 1",
    coachId: "coach-02",
    coachName: "HLV Enam",
    capacity: 16,
    registeredCount: 14,
    status: "hoàn thành",
    attendanceStatus: "đi muộn",
    coachNote: "Cần chú ý khởi động thêm 5 phút nếu đến sau giờ.",
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

export const DEFAULT_BODY_METRICS: MemberBodyMetricItem[] = [
  { date: "2026-08-01", weightKg: 58.5, heightCm: 162, bmi: 22.3, bodyFatPct: 24.5, muscleMassKg: 23.1, note: "Bắt đầu tập luyện" },
  { date: "2026-09-01", weightKg: 56.8, heightCm: 162, bmi: 21.6, bodyFatPct: 23.1, muscleMassKg: 23.4, note: "Giảm mỡ bụng tốt" },
  { date: "2026-10-01", weightKg: 55.4, heightCm: 162, bmi: 21.1, bodyFatPct: 21.8, muscleMassKg: 23.8, note: "Tăng cơ nét rõ" },
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
        if (Array.isArray(data) && data.length > 0) return data;
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

