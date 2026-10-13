import React from "react";
import { Calendar, CheckCircle2, AlertCircle, Clock, Dumbbell } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MemberAttendanceHistoryItem, MemberWorkoutItem } from "./types";

interface MemberHistoryAndWorkoutsProps {
  attendanceHistory: MemberAttendanceHistoryItem[];
  assignedWorkouts: MemberWorkoutItem[];
  navigateTo: (s: CoachScreen, extra?: { memberId?: string; sessionId?: string }) => void;
}

export const MemberHistoryAndWorkouts: React.FC<MemberHistoryAndWorkoutsProps> = ({
  attendanceHistory,
  assignedWorkouts,
  navigateTo,
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Lịch sử điểm danh (11 Có mặt, 1 Có phép) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Lịch sử điểm danh</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {attendanceHistory.length} ca dạy
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Tỷ lệ tham dự: 92%
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[420px] overflow-y-auto">
          {attendanceHistory.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                    {item.className}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                    {item.room}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                  {item.note && (
                    <>
                      <span>•</span>
                      <span className="text-slate-500 dark:text-slate-400 italic truncate max-w-[240px]">
                        "{item.note}"
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {item.status === "attended" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Có mặt
                  </span>
                )}
                {item.status === "excused" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    <AlertCircle className="w-3 h-3 text-blue-600" />
                    Có phép
                  </span>
                )}
                {item.status === "late" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Đi trễ
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Giáo án bài tập đã giao */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Giáo án bài tập đã giao</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {assignedWorkouts.length} giáo án
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigateTo("curriculum")}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            + Thêm giáo án
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-6 space-y-6">
          {assignedWorkouts.map((workout) => (
            <div key={workout.id} className="pt-4 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {workout.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{workout.sport}</span>
                    <span>•</span>
                    <span>{workout.level}</span>
                    <span>•</span>
                    <span>Thời lượng: {workout.duration} phút</span>
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    workout.status === "Hoàn thành"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200"
                      : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200"
                  }`}
                >
                  {workout.status}
                </span>
              </div>

              {/* Exercise list sub-table */}
              <div className="mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {workout.exercises.map((ex, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                        <span>{ex.reps}</span>
                        <span className="text-orange-600 dark:text-orange-400">Nghỉ: {ex.rest}</span>
                      </div>
                      {ex.note && (
                        <div className="text-[10px] text-slate-400 italic mt-1 border-t border-slate-100 dark:border-slate-700 pt-1">
                          * {ex.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
