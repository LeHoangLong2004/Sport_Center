import type { MemberSessionItem } from "../../types";

export interface BookingFeedback {
  message: string;
  type: "success" | "error";
}

export interface CancelBookingTarget {
  classId: string;
  className: string;
  scheduleTime?: string;
  startTime?: string;
  endTime?: string;
  dateStr?: string;
  price?: number;
  type?: "class" | "pt";
  isCovered?: boolean;
  sport?: string;
  room?: string;
}

export const COUNTER_PENDING_KEY = "member_counter_pending_classes";

export function getCounterPendingIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COUNTER_PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addCounterPendingId(classId: string) {
  try {
    const ids = getCounterPendingIds();
    if (!ids.includes(String(classId))) {
      ids.push(String(classId));
      localStorage.setItem(COUNTER_PENDING_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export function removeCounterPendingId(classId: string) {
  try {
    const ids = getCounterPendingIds().filter((id) => id !== String(classId));
    localStorage.setItem(COUNTER_PENDING_KEY, JSON.stringify(ids));
  } catch {}
}

export function findConflictingSession(
  target: { date?: string; dateStr?: string; startTime?: string; endTime?: string; id?: string } | null,
  sessions: any[]
): any | null {
  if (!target || !sessions || sessions.length === 0) return null;

  const targetDateRaw = target.date || target.dateStr || "";
  const targetStart = target.startTime;
  const targetEnd = target.endTime;
  if (!targetDateRaw || !targetStart || !targetEnd) return null;

  const normalizeDate = (d: string) => {
    if (!d) return "";
    const clean = d.split("T")[0];
    if (clean.includes("/")) {
      const parts = clean.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }
    }
    return clean;
  };

  const targetDateNorm = normalizeDate(targetDateRaw);

  return (
    sessions.find((s) => {
      if (!s) return false;
      if (target.id && (String(s.id) === String(target.id) || String((s as any).classId) === String(target.id))) {
        return false;
      }

      const rawStatus = String(s.bookingStatus ?? s.status ?? "").toLowerCase();
      if (
        rawStatus.includes("cancel") ||
        rawStatus.includes("huy") ||
        rawStatus === "rejected"
      ) {
        return false;
      }

      const sDateNorm = normalizeDate(s.date || (s as any).dateStr || "");
      if (sDateNorm !== targetDateNorm) return false;

      const sStart = s.startTime;
      const sEnd = s.endTime;
      if (!sStart || !sEnd) return false;

      return sStart < targetEnd && targetStart < sEnd;
    }) ?? null
  );
}
