import React from "react";
import { Users, Check, X, Clock } from "lucide-react";

interface AttendanceStats {
  total: number;
  attended: number;
  absent: number;
  late: number;
  pending: number;
  attendanceRate: number;
}

interface AttendanceStatsGridProps {
  stats: AttendanceStats;
}

export const AttendanceStatsGrid: React.FC<AttendanceStatsGridProps> = ({ stats }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Total */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Tổng sĩ số</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">học viên</span>
          </div>
        </div>

        {/* Attended */}
        <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1.5">
            <span className="text-xs font-semibold">Có mặt</span>
            <Check className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.attended}
            </span>
            <span className="text-xs text-emerald-600/70">học viên</span>
          </div>
        </div>

        {/* Absent */}
        <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1.5">
            <span className="text-xs font-semibold">Vắng</span>
            <X className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-700 dark:text-rose-300">
              {stats.absent}
            </span>
            <span className="text-xs text-rose-600/70">học viên</span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Chưa điểm danh</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.pending}
            </span>
            <span className="text-xs text-slate-400">học viên</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatsGrid;

