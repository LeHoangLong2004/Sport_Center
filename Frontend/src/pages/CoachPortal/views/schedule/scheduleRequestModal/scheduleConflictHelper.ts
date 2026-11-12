import type { UnifiedScheduleItem } from "../types";

export function normalizeDateToIso(val?: string): string {
  if (!val) return "";
  const clean = val.split("T")[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;
  const match = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return clean;
}

export function formatIsoToDisplayDate(isoDate?: string): string {
  if (!isoDate) return "";
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  return isoDate;
}

export function parseTimeToMinutes(val?: string): number | null {
  if (!val) return null;
  const clean = val.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const modifier = match[3]?.toUpperCase();

  if (modifier === "PM" && h < 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;

  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

export function parseSessionStartDateTime(dateStr?: string, startTimeStr?: string): Date | null {
  if (!dateStr) return null;
  const cleanDate = dateStr.slice(0, 10);
  const parts = cleanDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;

  let hour = 0;
  let minute = 0;
  if (startTimeStr) {
    const timeParts = startTimeStr.split(":");
    if (timeParts.length >= 2) {
      hour = Number(timeParts[0]) || 0;
      minute = Number(timeParts[1]) || 0;
    }
  }

  return new Date(y, m - 1, d, hour, minute, 0, 0);
}

export function isSessionInFuture(dateStr?: string, startTimeStr?: string): boolean {
  const dt = parseSessionStartDateTime(dateStr, startTimeStr);
  if (!dt) return false;
  return dt.getTime() > Date.now();
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingSession: UnifiedScheduleItem | null;
  warningMessage: string | null;
}

export function checkScheduleConflict(
  sessions: UnifiedScheduleItem[],
  selectedSessionId: string,
  newDate: string,
  newTime: string,
): ConflictCheckResult {
  if (!newDate || !newTime) {
    return { hasConflict: false, conflictingSession: null, warningMessage: null };
  }

  const parts = newTime.split("-").map((s) => s.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return { hasConflict: false, conflictingSession: null, warningMessage: null };
  }

  const propStart = parseTimeToMinutes(parts[0]);
  const propEnd = parseTimeToMinutes(parts[1]);
  if (propStart === null || propEnd === null || propEnd <= propStart) {
    return { hasConflict: false, conflictingSession: null, warningMessage: null };
  }

  const targetDateIso = normalizeDateToIso(newDate);
  if (!targetDateIso) {
    return { hasConflict: false, conflictingSession: null, warningMessage: null };
  }

  const conflict = sessions.find((s) => {
    // Không so sánh với chính ca dạy đang được dời
    if (s.id === selectedSessionId) return false;
    // Bỏ qua ca đã hủy hoặc đã bị từ chối
    if (s.status === "đã hủy" || s.approvalStatus === "rejected") return false;

    const sDateIso = normalizeDateToIso(s.date);
    if (!sDateIso || sDateIso !== targetDateIso) return false;

    const sStart = parseTimeToMinutes(s.startTime);
    let sEnd = parseTimeToMinutes(s.endTime);
    if (sStart === null) return false;
    if (sEnd === null || sEnd <= sStart) sEnd = sStart + 60;

    // Khoảng thời gian giao nhau
    return propStart < sEnd && propEnd > sStart;
  });

  if (conflict) {
    const displayDate = formatIsoToDisplayDate(targetDateIso);
    const timeRange = `${conflict.startTime} - ${conflict.endTime}`;
    const warningMessage = `Trùng ca dạy: Bạn đã có lớp "${conflict.className}" (${timeRange}) vào ngày ${displayDate}. Vui lòng chọn khung giờ khác!`;
    return {
      hasConflict: true,
      conflictingSession: conflict,
      warningMessage,
    };
  }

  return { hasConflict: false, conflictingSession: null, warningMessage: null };
}
