/**
 * Utility to reliably normalize and parse schedule timestamps from the backend/database.
 * 
 * Schedule timestamps from the API represent UTC instants. Older responses may
 * omit the zone suffix, so those values are treated as UTC too. Never infer a
 * timezone from the hour: 07:00 UTC can represent 14:00 in Vietnam.
 */
export const CENTER_TIME_ZONE = "Asia/Bangkok";

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

  // Timestamps with an explicit zone (Z or ±HH:mm) are absolute instants.
  // Keep timestamps as real instants. Rendering and calendar calculations
  // must use the explicit center timezone below, never the browser timezone.
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
    const instant = new Date(str);
    return Number.isNaN(instant.getTime()) ? new Date(NaN) : instant;
  }

  // Legacy API responses can lack an explicit Z suffix. Their values still
  // represent UTC, so convert to the center's UTC+7 wall time consistently.
  return new Date(Date.UTC(year, month, day, rawHour, minute, second));
}

export function formatCenterTime(value: Date | string, options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false }): string {
  const date = value instanceof Date ? value : parseScheduleTime(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleTimeString("vi-VN", { ...options, timeZone: CENTER_TIME_ZONE });
}

export function formatCenterDate(value: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
  const date = value instanceof Date ? value : parseScheduleTime(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN", { ...options, timeZone: CENTER_TIME_ZONE });
}

export function centerDateParts(value: Date | string) {
  const date = value instanceof Date ? value : parseScheduleTime(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CENTER_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])) as Record<string, string>;
}

export function formatCenterDateTime(value: Date | string, dateOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }, timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false }): string {
  return `${formatCenterDate(value, dateOptions)} ${formatCenterTime(value, timeOptions)}`;
}

export function formatTimeRange(start: Date, durationMinutes = 60): string {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const startStr = formatCenterTime(start);
  const endStr = formatCenterTime(end);
  return `${startStr} – ${endStr}`;
}

export function formatDateLabel(date: Date): string {
  return formatCenterDate(date, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

