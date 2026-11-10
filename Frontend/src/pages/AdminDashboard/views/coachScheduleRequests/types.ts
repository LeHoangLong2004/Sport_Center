import type { CoachScheduleRequest } from "../useCoachScheduleRequests";

export interface CoachOption {
  id: string;
  fullName: string;
  specialty?: string;
  email?: string;
}

export interface CandidateCoach extends CoachOption {
  isBusy: boolean;
  conflictReason?: string;
}

export interface ParsedTimeWindow {
  date: string; // YYYY-MM-DD
  startMinutes: number;
  endMinutes: number;
  formattedTime: string;
}

export const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: {
    label: "Chờ duyệt",
    bg: "bg-slate-50 dark:bg-slate-950/40",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  substitute_accepted: {
    label: "HLV thay thế đã nhận",
    bg: "bg-slate-50 dark:bg-slate-950/40",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  substitute_declined: {
    label: "HLV thay thế từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
  approved: {
    label: "Đã duyệt",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  rejected: {
    label: "Từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-200 dark:border-rose-800",
  },
};

export const isSubstituteRequest = (type: string) => {
  const t = (type || "").toLowerCase();
  return t.includes("thay") || t.includes("substitute");
};
