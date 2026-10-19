import type { MemberSessionItem } from "../../types";

export interface BookingFeedback {
  message: string;
  type: "success" | "error";
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
