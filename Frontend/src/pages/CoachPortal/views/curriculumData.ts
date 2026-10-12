import type { MockCurriculum } from "../services/api";

export type CurriculumStatus = "Nháp" | "Đã giao" | "Lưu trữ";

export const STATUS_STYLE: Record<CurriculumStatus, string> = {
  Nháp: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Đã giao":
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Lưu trữ":
    "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

export const EMPTY_EXERCISE = { name: "", reps: "", rest: "", note: "" };

export function makeDraft(): MockCurriculum {
  return {
    id: `cur_${Date.now()}`,
    name: "",
    sport: "Yoga",
    goal: "",
    level: "Cơ bản",
    duration: 60,
    status: "Nháp",
    updatedAt: new Date().toISOString().split("T")[0],
    description: "",
    exercises: [{ ...EMPTY_EXERCISE }],
    assignedTo: [],
  };
}
