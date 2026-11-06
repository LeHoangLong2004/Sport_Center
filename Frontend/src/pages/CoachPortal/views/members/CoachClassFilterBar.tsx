import React from "react";
import { Layers, Clock } from "lucide-react";
import type { CoachClassOverview } from "../../services/api";

interface CoachClassFilterBarProps {
  classes: CoachClassOverview[];
  selectedClassId: string;
  totalMembersCount: number;
  onSelectClassId: (id: string) => void;
}

export const CoachClassFilterBar: React.FC<CoachClassFilterBarProps> = ({
  classes,
  selectedClassId,
  totalMembersCount,
  onSelectClassId
}) => {
  if (classes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Các lớp học đang phụ trách ({classes.length} lớp)
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">Bấm vào lớp để lọc nhanh học viên</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onSelectClassId("all")}
          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
            selectedClassId === "all"
              ? "bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-200 shadow-xs ring-1 ring-orange-500/30"
              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold">Tất cả các lớp</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
              {totalMembersCount} HV
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Hiển thị toàn bộ học viên thuộc quyền quản lý</p>
        </button>

        {classes.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const fillPct = cls.capacity ? Math.min(Math.round((cls.enrolledCount / cls.capacity) * 100), 100) : 0;

          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => onSelectClassId(isSelected ? "all" : cls.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-orange-500/10 border-orange-500 text-orange-900 dark:text-orange-200 shadow-xs ring-1 ring-orange-500/30"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {cls.className}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 shrink-0">
                    {cls.sport}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{cls.scheduleTime} ({cls.durationMinutes}p)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Số lượng học viên:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {cls.enrolledCount}/{cls.capacity} học viên
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${fillPct}%` }}
                  ></div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
