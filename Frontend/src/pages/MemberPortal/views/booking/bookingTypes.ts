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

export function isClassCoveredByPackage(
  item: { name?: string; className?: string; sport?: string; room?: string } | null,
  activeOrders: any[] = []
): boolean {
  if (!item || !activeOrders || activeOrders.length === 0) return false;
  const classSport = (item.sport || "").toLowerCase();
  const classRoom = (item.room || "").toLowerCase();
  const className = (item.name || item.className || "").toLowerCase();

  return activeOrders.some((order) => {
    const pkgSport = (order.packageSnapshot?.sport || "").toLowerCase();
    const pkgName = (order.packageSnapshot?.name || "").toLowerCase();

    // 1. Khớp theo tên môn trực tiếp (Gym, Yoga, Bơi lội...)
    if (pkgSport && (classSport.includes(pkgSport) || pkgSport.includes(classSport))) {
      return true;
    }

    // 2. Gym / Thể lực / Cardio / Kháng lực
    const isGymPackage = pkgSport.includes("gym") || pkgName.includes("gym");
    const isGymClass =
      classSport.includes("gym") ||
      classSport.includes("thể lực") ||
      classRoom.includes("gym") ||
      className.includes("kháng lực") ||
      className.includes("cardio") ||
      className.includes("gym");
    if (isGymPackage && isGymClass) return true;

    // 3. Yoga / Pilates
    const isYogaPackage = pkgSport.includes("yoga") || pkgName.includes("yoga");
    const isYogaClass =
      classSport.includes("yoga") ||
      classSport.includes("pilates") ||
      classRoom.includes("yoga") ||
      className.includes("yoga") ||
      className.includes("pilates");
    if (isYogaPackage && isYogaClass) return true;

    // 4. Bơi lội
    const isSwimPackage = pkgSport.includes("bơi") || pkgName.includes("bơi") || pkgSport.includes("swim");
    const isSwimClass =
      classSport.includes("bơi") ||
      classRoom.includes("bơi") ||
      classRoom.includes("aquafit") ||
      className.includes("bơi");
    if (isSwimPackage && isSwimClass) return true;

    // 5. Boxing / Võ
    const isBoxPackage = pkgSport.includes("box") || pkgName.includes("box");
    const isBoxClass =
      classSport.includes("box") ||
      classRoom.includes("box") ||
      className.includes("box");
    if (isBoxPackage && isBoxClass) return true;

    // 6. Cầu lông
    const isBadmintonPackage = pkgSport.includes("cầu lông") || pkgName.includes("cầu lông");
    const isBadmintonClass =
      classSport.includes("cầu lông") ||
      classRoom.includes("cầu lông") ||
      className.includes("cầu lông");
    if (isBadmintonPackage && isBadmintonClass) return true;

    return false;
  });
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
