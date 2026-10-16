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

// REST Backend API Client for Member Portal
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
    try {
      const res = await fetch("/api/member/bookings", {
        headers: this.getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data.filter((item: any) => !item?.id || !LEGACY_MOCK_IDS.has(item.id));
        }
      }
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
