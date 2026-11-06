export interface Appointment {
  id: string;
  date?: string;
  time: string;
  title: string;
  customerName: string;
  coachName: string | null;
  status: string; // "Đang chờ khách" | "Đã hoàn tất" | "Đã hủy"
}

export const APPOINTMENT_UPDATED_EVENT = "receptionist-appointment-updated";

export function dispatchAppointmentUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(APPOINTMENT_UPDATED_EVENT));
  }
}

/**
 * Tách tên và số điện thoại từ chuỗi customerName
 * Ví dụ: "Trần Quốc Huy (0912345678)" -> { name: "Trần Quốc Huy", phone: "0912345678" }
 */
export function parseAppointmentCustomer(raw: string): { name: string; phone: string } {
  if (!raw) return { name: "", phone: "" };
  let name = raw.trim();
  let phone = "";

  const matchParen = raw.match(/^(.*?)\s*\((0[0-9\s\.\-]{8,13})\)$/);
  if (matchParen) {
    name = matchParen[1].trim();
    phone = matchParen[2].replace(/[\s\.\-]/g, "");
  } else {
    const matchDash = raw.match(/^(.*?)\s*-\s*(0[0-9\s\.\-]{8,13})$/);
    if (matchDash) {
      name = matchDash[1].trim();
      phone = matchDash[2].replace(/[\s\.\-]/g, "");
    }
  }

  return { name, phone };
}

/**
 * Chuẩn hóa chuỗi tiếng Việt (bỏ dấu, thường hóa, bỏ khoảng trắng thừa) để so khớp chính xác
 */
function normalizeText(text: string): string {
  return (text || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
}

/**
 * Kiểm tra xem lịch hẹn có thuộc về hội viên hiện tại không
 */
export function isAppointmentForMember(
  customerNameRaw: string,
  memberName?: string,
  memberPhone?: string
): boolean {
  if (!customerNameRaw) return false;
  const parsed = parseAppointmentCustomer(customerNameRaw);

  const cleanPhone = (p?: string) => (p || "").replace(/[\s\.\-]/g, "");
  const pPhone = cleanPhone(parsed.phone);
  const mPhone = cleanPhone(memberPhone);

  // 1. So khớp bằng số điện thoại
  if (pPhone && mPhone && pPhone === mPhone) {
    return true;
  }

  // 2. So khớp bằng họ và tên nếu có
  if (memberName && parsed.name) {
    const normPName = normalizeText(parsed.name);
    const normMName = normalizeText(memberName);
    if (normPName && normMName && normPName === normMName) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra xem lịch hẹn có thuộc về HLV hiện tại không (loại bỏ tiền tố HLV / Coach)
 */
export function isAppointmentForCoach(
  appointmentCoach?: string | null,
  coachName?: string
): boolean {
  if (!appointmentCoach || !coachName) return false;

  const stripPrefix = (name: string) =>
    normalizeText(name).replace(/^(hlv|coach|huan luyen vien|trainer)\s+/i, "").trim();

  const c1 = stripPrefix(appointmentCoach);
  const c2 = stripPrefix(coachName);

  if (!c1 || !c2) return false;
  return c1 === c2 || c1.includes(c2) || c2.includes(c1);
}

/**
 * Tính giờ kết thúc (mặc định 60 phút)
 */
export function calculateAppointmentEndTime(startTime: string, durationMinutes = 60): string {
  if (!startTime) return "10:00";
  if (startTime.includes("-")) {
    const parts = startTime.split("-");
    return parts[1].trim();
  }
  const match = startTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return startTime;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const total = h * 60 + m + durationMinutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

/**
 * Service API thao tác với /api/appointments
 */
export const AppointmentService = {
  async getAll(): Promise<Appointment[]> {
    try {
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (e) {
      console.warn("Lỗi tải appointments:", e);
    }
    return [];
  },

  async getForCoach(coachName: string): Promise<Appointment[]> {
    const all = await this.getAll();
    if (!coachName) return [];
    return all.filter((a) => isAppointmentForCoach(a.coachName, coachName));
  },

  async getForMember(memberName: string, memberPhone?: string): Promise<Appointment[]> {
    const all = await this.getAll();
    return all.filter((a) => isAppointmentForMember(a.customerName, memberName, memberPhone));
  },

  async updateStatus(id: string, newStatus: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        dispatchAppointmentUpdated();
        return { success: true };
      }
      const data = await res.json().catch(() => null);
      return { success: false, error: data?.message || "Không thể cập nhật trạng thái" };
    } catch (e: any) {
      return { success: false, error: e?.message || "Lỗi kết nối mạng" };
    }
  },
};
