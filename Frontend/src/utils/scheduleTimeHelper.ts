/**
 * Utility to reliably normalize and parse schedule timestamps from the backend/database.
 * 
 * Rules for Sport Center:
 * - Center operational hours: 06:00 - 22:00 (Vietnam Time, UTC+7).
 * - There are NEVER classes between 00:00 and 05:59.
 * - If a timestamp has raw hour in [00..05] (e.g. 00:30, 01:30, 01:45), it is a raw UTC timestamp from database.
 *   In Vietnam (+7), 00:30 UTC -> 07:30 VN, 01:30 UTC -> 08:30 VN, 01:45 UTC -> 08:45 VN.
 * - If a timestamp has raw hour >= 06 (e.g. 08:30, 08:45, 10:00, 14:00, 17:00, 19:00),
 *   it is already the local Vietnam shift time. DO NOT add 7 hours (which would falsely turn 08:45 AM into 15:45 PM).
 */
export function parseScheduleTime(rawTime: any): Date {
  if (!rawTime) return new Date();
  if (rawTime instanceof Date) return rawTime;

  const str = String(rawTime).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  const [, yStr, mStr, dStr, hStr, minStr, secStr = "0"] = match;
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10) - 1;
  const day = parseInt(dStr, 10);
  const rawHour = parseInt(hStr, 10);
  const minute = parseInt(minStr, 10);
  const second = parseInt(secStr, 10);

  // If rawHour is in 0..5, it was stored in UTC (e.g. 00:30 UTC is 07:30 VN, 01:45 UTC is 08:45 VN)
  if (rawHour < 6) {
    return new Date(year, month, day, rawHour + 7, minute, second);
  }

  // If rawHour is >= 6, it is already the true local shift time of the sport center
  return new Date(year, month, day, rawHour, minute, second);
}

export function formatTimeRange(start: Date, durationMinutes = 60): string {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const startStr = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const endStr = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${startStr} – ${endStr}`;
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

