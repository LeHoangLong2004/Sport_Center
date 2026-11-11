import type { MemberSessionItem } from "../../types";

export type ViewMode = "list" | "week";
export type TypeFilter = "all" | "group" | "pt";
export type SportFilter = "all" | string;
export type StatusFilter = "all" | "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";

export const DAYS_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export const DEFAULT_TIME_ROWS = Array.from({ length: 17 }, (_, index) =>
  `${String(index + 6).padStart(2, "0")}:00`
);

export const SPORT_OPTIONS = ["all", "Gym", "Yoga", "Boxing", "Pilates", "Zumba", "Bơi", "Cardio"];

export const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": {
    label: "Sắp diễn ra",
    bg: "bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-400",
  },
  "đang diễn ra": {
    label: "Đang diễn ra",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  "hoàn thành": {
    label: "Hoàn thành",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    text: "text-slate-700 dark:text-slate-300",
  },
  "đã hủy": {
    label: "Đã hủy",
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-400",
  },
};

export const SPORT_THEME: Record<string, { badge: string; border: string }> = {
  Yoga: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
    border: "border-l-emerald-500",
  },
  Gym: {
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    border: "border-l-amber-500",
  },
  Boxing: {
    badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
    border: "border-l-rose-500",
  },
  Pilates: {
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    border: "border-l-purple-500",
  },
  Bơi: {
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    border: "border-l-cyan-500",
  },
  Zumba: {
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    border: "border-l-pink-500",
  },
  Cardio: {
    badge: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:text-slate-300 dark:border-slate-800",
    border: "border-l-amber-500",
  },
};

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isCancelledSession(session: MemberSessionItem): boolean {
  const normalizedStatus = String(session.status ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  return ["da huy", "cancelled", "canceled", "rejected", "class_cancelled"].includes(normalizedStatus);
}

export function resolveSessionStatus(
  status: MemberSessionItem["status"] | string,
  dateStr?: string,
  endTimeStr?: string,
  startTimeStr?: string
): MemberSessionItem["status"] {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["cancelled", "canceled", "rejected", "class_cancelled", "đã hủy"].includes(normalized)) {
    return "đã hủy";
  }
  if (["attended", "completed", "hoàn thành"].includes(normalized)) {
    return "hoàn thành";
  }

  if (dateStr) {
    const timeToEnd = endTimeStr || startTimeStr || "23:59";
    const endDateTime = new Date(`${dateStr}T${timeToEnd.length === 5 ? timeToEnd + ":00" : timeToEnd}`);
    const timeToStart = startTimeStr || "00:00";
    const startDateTime = new Date(`${dateStr}T${timeToStart.length === 5 ? timeToStart + ":00" : timeToStart}`);
    const now = new Date();

    if (!Number.isNaN(endDateTime.getTime()) && now > endDateTime) {
      return "hoàn thành";
    }
    if (!Number.isNaN(startDateTime.getTime()) && !Number.isNaN(endDateTime.getTime()) && now >= startDateTime && now <= endDateTime) {
      return "đang diễn ra";
    }
  }

  return "sắp diễn ra";
}
