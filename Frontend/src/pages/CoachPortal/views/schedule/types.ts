import type { SessionStatus } from "../../services/api";

export type MainTab = "schedule" | "availability" | "requests";
export type ViewMode = "week" | "list";
export type TypeFilter = "all" | "group" | "pt" | "open_pt";
export type SportFilter = "all" | string;
export type StatusFilter = "all" | SessionStatus;

export interface UnifiedScheduleItem {
  id: string;
  type: "group" | "pt" | "open_pt";
  classId?: string;
  className: string;
  sport: string;
  level: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  room: string;
  coachName: string;
  capacity?: number;
  registeredCount: number;
  status: SessionStatus;
  approvalStatus?: "pending" | "approved" | "rejected";
  // PT specific
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  goal?: string;
  note?: string;
}

export const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "sắp diễn ra", label: "Sắp diễn ra" },
  { value: "đang diễn ra", label: "Đang diễn ra" },
  { value: "hoàn thành", label: "Hoàn thành" },
  { value: "đã hủy", label: "Đã hủy" },
];

export const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "đang diễn ra": { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
  "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

export const REQUEST_STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "chờ duyệt": { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  pending: { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  substitute_accepted: { label: "Coach đồng ý", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  substitute_declined: { label: "Coach từ chối", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
  "đã duyệt": { label: "Đã duyệt", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  approved: { label: "Đã duyệt", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "từ chối": { label: "Từ chối", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
  rejected: { label: "Từ chối", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

export const INVITATION_STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Chờ bạn xác nhận", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  substitute_accepted: { label: "Bạn đã nhận dạy", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  substitute_declined: { label: "Bạn đã từ chối", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
  approved: { label: "Đã duyệt vào lịch", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  rejected: { label: "Đã bị từ chối", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
};

export const DAYS_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
// Render every hourly row so classes starting at times such as 10:30, 11:15
// or 16:00 are not silently omitted from the weekly calendar.
export const TIME_ROWS = Array.from({ length: 17 }, (_, index) =>
  `${String(index + 6).padStart(2, "0")}:00`,
);
