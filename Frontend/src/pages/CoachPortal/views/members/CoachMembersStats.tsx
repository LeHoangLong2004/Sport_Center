import React from "react";
import { Users, GraduationCap, Dumbbell, RefreshCw } from "lucide-react";

interface CoachMembersStatsProps {
  totalMembersCount: number;
  classesCount: number;
  totalCapacity: number;
  totalEnrolled: number;
  averageFillRate: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const CoachMembersStats: React.FC<CoachMembersStatsProps> = ({
  totalMembersCount,
  classesCount,
  totalCapacity,
  totalEnrolled,
  averageFillRate,
  isRefreshing,
  onRefresh
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              Thời gian thực
            </span>
            <span className="text-xs text-slate-400">Đồng bộ học viên và lớp học</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-2 h-6 rounded-full bg-orange-500 shrink-0" />
            Học viên phụ trách & Lớp học
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách học viên theo từng lớp và học viên kèm 1–1 được cập nhật theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs"
            title="Đồng bộ danh sách học viên mới nhất"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-orange-500" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          <div className="text-xs font-bold px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 shadow-2xs">
            Tổng cộng: {totalMembersCount} học viên
          </div>
        </div>
      </div>

      {/* Overview Stat Cards - Sleek Minimalist without bulky icon squares */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Lớp học phụ trách
            </span>
            <span className="size-2 rounded-full bg-orange-500/40" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {classesCount} <span className="text-xs font-normal text-slate-400">lớp</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tổng số học viên
            </span>
            <span className="size-2 rounded-full bg-orange-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalMembersCount} <span className="text-xs font-normal text-slate-400">học viên</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:border-orange-300 dark:hover:border-orange-800/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tỉ lệ lấp đầy
            </span>
            <span className="size-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {averageFillRate}% <span className="text-xs font-normal text-slate-400">({totalEnrolled}/{totalCapacity || 0} chỗ)</span>
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};
