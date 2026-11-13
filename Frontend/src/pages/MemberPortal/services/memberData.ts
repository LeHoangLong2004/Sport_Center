import type {
  MemberSessionItem,
  MemberPackageItem,
  MemberPaymentItem,
  MemberTaskItem,
  MemberCoachReviewItem,
  MemberSupportTicketItem,
} from "../types";

// Clean, empty default structures (Zero mock data)
export const DEFAULT_MEMBER_PACKAGES: MemberPackageItem[] = [];
export const DEFAULT_MEMBER_SESSIONS: MemberSessionItem[] = [];
export const DEFAULT_MEMBER_TASKS: MemberTaskItem[] = [];
export const DEFAULT_PAYMENTS: MemberPaymentItem[] = [];
export const DEFAULT_SUPPORT_TICKETS: MemberSupportTicketItem[] = [];
export const DEFAULT_COACH_REVIEWS: MemberCoachReviewItem[] = [];

// Legacy mock IDs to automatically clean out from user's localStorage
const LEGACY_MOCK_IDS = new Set([
  "sess-mon-01", "sess-mon-02", "sess-mon-03", "sess-tue-01", "sess-tue-02",
  "sess-wed-01", "sess-wed-02", "sess-wed-03", "sess-thu-01", "sess-thu-02",
  "sess-fri-01", "sess-fri-02", "sess-sat-01", "sess-sat-02", "sess-sun-01",
  "pkg-sub-01", "pkg-sub-02",
  "task-01", "task-02", "task-03",
  "INV-2026-0091", "INV-2026-0104", "INV-2026-0112",
  "TCK-881", "rev-01"
]);

// Helper functions for localStorage syncing with auto mock cleanup
export function getSavedMemberData<T>(key: string, defaultVal: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item: any) => !item?.id || !LEGACY_MOCK_IDS.has(item.id));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
        return (cleaned.length > 0 ? cleaned : defaultVal) as T;
      }
      return parsed;
    }
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

import {
  AppointmentService,
  calculateAppointmentEndTime,
} from "../../../services/appointmentService";
import { parseScheduleTime } from "../../../utils/scheduleTimeHelper";

// Flow 6 — AI Assistant response
export type MemberAiAction =
  | "none"
  | "schedule"
  | "booking"
  | "packages"
  | "packages_sport"
  | "packages_membership"
  | "payments"
  | "workouts"
  | "attendance"
  | "chat"
  | "shop"
  | "support_ticket";

export interface MemberAiAnswer {
  answer: string;
  action: MemberAiAction;
  actionLabel?: string | null;
  source: "ai" | "fallback" | "throttled";
  timestamp: string;
}

// REST Backend API Client for Member Portal
export function mergeStoredTicketReplies<T extends { id: string; status: any; reply?: string; repliedAt?: string; repliedBy?: string }>(list: T[]): T[] {
  try {
    const raw = localStorage.getItem("smartgym_ticket_replies");
    if (!raw) return list;
    const replies: Record<string, { status: any; reply?: string; repliedAt?: string; repliedBy?: string }> = JSON.parse(raw);
    return list.map((item) => {
      if (replies[item.id]) {
        return {
          ...item,
          ...replies[item.id],
        };
      }
      return item;
    });
  } catch {
    return list;
  }
}

export const MemberBackendAPI = {
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
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
      console.warn("Backend getDashboard failed", e);
    }
    return null;
  },

  async getBookings(): Promise<MemberSessionItem[]> {
    let memberName = "";
    let memberPhone = "";
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        const u = JSON.parse(userStr);
        memberName = u.fullName || u.name || "";
        memberPhone = u.phoneNumber || u.phone || "";
      }
    } catch {}

    const todayIso = [
      new Date().getFullYear(),
      String(new Date().getMonth() + 1).padStart(2, "0"),
      String(new Date().getDate()).padStart(2, "0"),
    ].join("-");

    const getUiStatus = (
      value: unknown,
      scheduleTime?: string | Date | null,
      durationMinutes: number = 60
    ): MemberSessionItem["status"] => {
      const status = String(value ?? "").trim().toLowerCase();
      if (["cancelled", "canceled", "rejected", "class_cancelled", "đã hủy"].includes(status)) return "đã hủy";
      if (["attended", "completed", "hoàn thành"].includes(status)) return "hoàn thành";
      if (["in_progress", "đang diễn ra"].includes(status)) return "đang diễn ra";

      if (scheduleTime) {
        const startDate = parseScheduleTime(scheduleTime);
        if (!Number.isNaN(startDate.getTime())) {
          const duration = Number(durationMinutes || 60);
          const endDate = new Date(startDate.getTime() + duration * 60000);
          const now = new Date();

          if (now > endDate) {
            return "hoàn thành";
          }
          if (now >= startDate && now <= endDate) {
            return "đang diễn ra";
          }
          return "sắp diễn ra";
        }
      }

      return "sắp diễn ra";
    };

    const toSessionTime = (value: string | undefined, fallback = "00:00") => {
      if (!value) return { date: "", time: fallback };
      const date = parseScheduleTime(value);
      if (!date || Number.isNaN(date.getTime())) return { date: "", time: fallback };
      return {
        date: [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-"),
        time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
      };
    };

    let classBookings: MemberSessionItem[] = [];
    let ptSessions: MemberSessionItem[] = [];
    let apptSessions: MemberSessionItem[] = [];

    try {
      const [res, memberAppts] = await Promise.all([
        fetch("/api/schedule/member", { headers: this.getAuthHeaders() }).catch(() => null),
        AppointmentService.getForMember(memberName, memberPhone).catch(() => []),
      ]);

      if (res && res.ok) {
        const data = await res.json().catch(() => null);

        classBookings = (Array.isArray(data?.classBookings) ? data.classBookings : []).map((booking: any) => {
          const start = toSessionTime(booking.scheduleTime);
          const duration = Number(booking.durationMinutes || 60);
          const startDate = booking.scheduleTime ? parseScheduleTime(booking.scheduleTime) : null;
          const endDate = startDate && !Number.isNaN(startDate.getTime())
            ? new Date(startDate.getTime() + duration * 60000)
            : null;
          return {
            id: booking.bookingId || booking.classId,
            classId: booking.classId,
            name: booking.className || "Lớp học",
            sport: booking.sportName || "N/A",
            level: "",
            type: "group" as const,
            date: start.date,
            startTime: start.time,
            endTime: endDate && !Number.isNaN(endDate.getTime())
              ? `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
              : start.time,
            room: booking.facilityName || "N/A",
            coachId: booking.coachId ? String(booking.coachId) : "",
            coachName: booking.coachName || "N/A",
            coachAvatar: booking.coachAvatar || "",
            coachSpecialty: booking.coachSpecialty || "",
            coachPhone: booking.coachPhone || "",
            coachBio: booking.coachBio || "",
            coachRating: booking.coachRating ? Number(booking.coachRating) : undefined,
            coachExperienceYears: booking.coachExperienceYears ? Number(booking.coachExperienceYears) : undefined,
            price: booking.price ? Number(booking.price) : 150000,
            capacity: 0,
            registeredCount: 0,
            status: getUiStatus(booking.status, booking.scheduleTime, duration),
            bookingStatus: booking.status,
          };
        });

        ptSessions = (Array.isArray(data?.ptSessions) ? data.ptSessions : []).map((session: any) => {
          const start = toSessionTime(session.scheduleTime);
          const duration = Number(session.durationMinutes || 60);
          const startDate = session.scheduleTime ? parseScheduleTime(session.scheduleTime) : null;
          const endDate = startDate && !Number.isNaN(startDate.getTime())
            ? new Date(startDate.getTime() + duration * 60000)
            : null;
          return {
            id: session.sessionId,
            name: "PT 1-1 session",
            sport: "PT 1-1",
            level: "1-1 PT",
            type: "pt" as const,
            date: start.date,
            startTime: start.time,
            endTime: endDate && !Number.isNaN(endDate.getTime())
              ? `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`
              : start.time,
            room: "",
            coachId: session.coachId ? String(session.coachId) : "",
            coachName: session.coachName || "Personal Trainer",
            coachAvatar: session.coachAvatar || "",
            coachSpecialty: session.coachSpecialty || "Huấn luyện viên cá nhân 1-1",
            coachPhone: session.coachPhone || "",
            coachBio: session.coachBio || "",
            coachRating: session.coachRating ? Number(session.coachRating) : undefined,
            price: session.price ? Number(session.price) : 250000,
            capacity: 1,
            registeredCount: 1,
            status: getUiStatus(session.status, session.scheduleTime, duration),
            bookingStatus: session.status,
          };
        });
      }

      if (Array.isArray(memberAppts) && memberAppts.length > 0) {
        apptSessions = memberAppts.map((appt) => {
          const startTime = appt.time?.split("-")[0]?.trim() || appt.time || "09:00";
          const endTime = calculateAppointmentEndTime(appt.time);

          let uiStatus: MemberSessionItem["status"] = "sắp diễn ra";
          if (appt.status === "Đã hoàn tất") uiStatus = "hoàn thành";
          else if (appt.status === "Đã hủy") uiStatus = "đã hủy";
          else if (appt.date) {
            const apptEndDateTime = new Date(`${appt.date}T${endTime.length === 5 ? endTime + ":00" : endTime}`);
            const apptStartDateTime = new Date(`${appt.date}T${startTime.length === 5 ? startTime + ":00" : startTime}`);
            const now = new Date();
            if (!Number.isNaN(apptEndDateTime.getTime()) && now > apptEndDateTime) {
              uiStatus = "hoàn thành";
            } else if (!Number.isNaN(apptStartDateTime.getTime()) && !Number.isNaN(apptEndDateTime.getTime()) && now >= apptStartDateTime && now <= apptEndDateTime) {
              uiStatus = "đang diễn ra";
            }
          }

          return {
            id: `appt-${appt.id}`,
            classId: "",
            name: appt.title,
            sport: "Lễ tân xếp",
            level: "1-1 PT",
            type: "pt" as const,
            date: appt.date || todayIso,
            startTime,
            endTime,
            room: "Khu PT 1-1 / Sảnh Lễ tân",
            coachId: "",
            coachName: appt.coachName || "HLV SmartGym",
            coachAvatar: "",
            coachSpecialty: "Huấn luyện viên cá nhân 1-1",
            coachPhone: "",
            coachBio: "Lịch hẹn được tạo bởi Lễ tân trung tâm tại quầy tiếp đón.",
            price: 0,
            capacity: 1,
            registeredCount: 1,
            status: uiStatus,
            bookingStatus: appt.status,
            goal: appt.title,
            coachNote: "Lịch hẹn tiếp đón do Lễ tân xếp. Vui lòng đến trước 10 phút để nhận chìa khóa tủ đồ.",
          };
        });
      }

      return [...classBookings, ...ptSessions, ...apptSessions].filter(
        (item: any) => item.date && (!item.id || !LEGACY_MOCK_IDS.has(item.id))
      );
    } catch (e) {
      console.warn("Backend getBookings failed", e);
    }
    return [];
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
      console.warn("Backend createBooking failed", e);
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

  async askAI(
    query: string,
    history: { role: "user" | "ai"; text: string }[] = []
  ): Promise<MemberAiAnswer | null> {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      let userMeta: any = null;
      try {
        if (userStr) userMeta = JSON.parse(userStr);
      } catch {}

      const res = await fetch("/api/member/ai-ask", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          query,
          history,
          userId: userMeta?.id,
          userEmail: userMeta?.email,
          userPhone: userMeta?.phoneNumber,
          userName: userMeta?.fullName || userMeta?.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.answer === "string") return data as MemberAiAnswer;
      }
    } catch (e) {
      console.warn("Backend askAI failed", e);
    }
    return null;
  },

  async getSupportTickets(): Promise<MemberSupportTicketItem[]> {
    let result: MemberSupportTicketItem[] = [];

    // 1. Ưu tiên lấy từ Backend API
    try {
      const res = await fetch("/api/member/support-tickets", {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          result = data;
        }
      }
    } catch (e) {
      console.warn("Backend getSupportTickets failed", e);
    }

    // 2. Đồng bộ qua localStorage nếu backend chưa có
    if (result.length === 0) {
      try {
        const local = localStorage.getItem("smartgym_support_tickets");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) result = parsed;
        }
      } catch {}
    }

    // 3. Luôn luôn hợp nhất phản hồi của Lễ tân đã lưu (không bao giờ mất khi refresh)
    const merged = mergeStoredTicketReplies(result);
    try {
      localStorage.setItem("smartgym_support_tickets", JSON.stringify(merged));
    } catch {}
    return merged;
  },

  async createSupportTicket(ticket: { category: string; subject: string; content: string }) {
    let created: MemberSupportTicketItem | null = null;
    try {
      const res = await fetch("/api/member/support-tickets", {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(ticket),
      });
      if (res.ok) {
        const data = await res.json();
        created = data.ticket;
      }
    } catch (e) {
      console.warn("Backend createSupportTicket failed", e);
    }

    if (!created) {
      created = {
        id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
        category: ticket.category as any,
        subject: ticket.subject,
        content: ticket.content,
        status: "open",
        createdAt: new Date().toLocaleString("vi-VN"),
      };
    }

    // Lưu vào shared localStorage để Lễ tân nhận được ngay lập tức
    try {
      const local = localStorage.getItem("smartgym_support_tickets");
      const list = local ? JSON.parse(local) : [];
      const updated = [created, ...list.filter((x: any) => x.id !== created!.id)];
      localStorage.setItem("smartgym_support_tickets", JSON.stringify(updated));
      window.dispatchEvent(new Event("support-tickets-updated"));
    } catch {}

    return created;
  },
};

export const MemberAPI = MemberBackendAPI;
