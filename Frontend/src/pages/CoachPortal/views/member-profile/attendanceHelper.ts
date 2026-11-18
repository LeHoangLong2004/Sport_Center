import React from "react";

export interface AttendanceStatusInfo {
  label: string;
  badgeClass: string;
  textClass: string;
}

export function getAttendanceStatusInfo(rawStatus?: string | null): AttendanceStatusInfo {
  const s = (rawStatus || "").toLowerCase().trim();
  switch (s) {
    case "attended":
    case "present":
    case "có mặt":
      return {
        label: "Có mặt",
        badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
        textClass: "text-emerald-600 dark:text-emerald-400",
      };
    case "late":
    case "đi trễ":
      return {
        label: "Đi trễ",
        badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
        textClass: "text-amber-600 dark:text-amber-400",
      };
    case "excused":
    case "có phép":
      return {
        label: "Có phép",
        badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/40",
        textClass: "text-sky-600 dark:text-sky-400",
      };
    case "no_show":
    case "absent":
    case "vắng":
    case "vắng mặt":
      return {
        label: "Vắng mặt",
        badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
        textClass: "text-rose-600 dark:text-rose-400",
      };
    case "unmarked":
    case "pending":
    case "chưa điểm danh":
    default:
      return {
        label: "Chưa điểm danh",
        badgeClass: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        textClass: "text-slate-500 dark:text-slate-400",
      };
  }
}

export function formatDateVN(dateStr?: string | null): string {
  if (!dateStr) return "";
  if (dateStr.includes("/")) return dateStr;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

