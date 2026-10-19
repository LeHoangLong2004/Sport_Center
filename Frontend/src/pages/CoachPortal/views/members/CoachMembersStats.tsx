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
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Thời gian thực
            </span>
            <span className="text-xs text-slate-400">Đồng bộ học viên và lớp học</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
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
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
            <span>Đồng bộ</span>
          </button>

          <div className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 shadow-2xs">
            Tổng cộng: {totalMembersCount} học viên
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Lớp học phụ trách</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {classesCount} <span className="text-xs font-normal text-slate-400">lớp</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tổng số học viên</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalMembersCount} <span className="text-xs font-normal text-slate-400">học viên</span>
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Tỉ lệ lấp đầy lớp</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {averageFillRate}% <span className="text-xs font-normal text-slate-400">({totalEnrolled}/{totalCapacity || 0} chỗ)</span>
            </h3>
          </div>
        </div>
      </div>
    </>
  );
};
