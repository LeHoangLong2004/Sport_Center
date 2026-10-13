import type { MockCurriculum } from "../../services/api";

export type CurriculumStatus = "Nháp" | "Đã giao" | "Lưu trữ";

export const STATUS_STYLE: Record<CurriculumStatus, { label: string; bg: string; text: string }> = {
  "Nháp": { label: "Bản nháp", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  "Đã giao": { label: "Đã giao", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "Lưu trữ": { label: "Lưu trữ", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
};

export const EMPTY_EXERCISE = { name: "", reps: "", rest: "", note: "" };

export function makeDraft(): MockCurriculum {
  return {
    id: `cur_${Date.now()}`,
    name: "",
    sport: "Gym",
    goal: "",
    level: "Cơ bản",
    duration: 60,
    status: "Nháp",
    updatedAt: new Date().toISOString().split("T")[0],
    description: "",
    exercises: [
      { name: "Khởi động toàn thân", reps: "5 phút", rest: "30s", note: "Xoay khớp cổ tay, chân" },
      { name: "", reps: "", rest: "", note: "" },
    ],
    assignedTo: [],
  };
}
