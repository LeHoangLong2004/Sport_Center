import { Star, Calendar, Dumbbell, CheckCircle2 } from "lucide-react";

interface Props {
  stats: {
    totalSessions?: number;
    completedSessions?: number;
    totalMembers?: number;
    upcomingClasses?: number;
  } | null;
}

export default function ProfileStatsCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Đánh giá học viên
          </span>
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">4.9</span>
          <span className="text-xs text-slate-400">/ 5.0 (98 lượt)</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Ca dạy tháng này
          </span>
          <Calendar className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.totalSessions ?? 28}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {stats?.completedSessions ? `${stats.completedSessions} đã hoàn thành` : "100% hoàn thành"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Học viên phụ trách
          </span>
          <Dumbbell className="w-4 h-4 text-purple-500" />
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.totalMembers ?? 42}
          </span>
          <span className="text-xs text-slate-400">học viên đang theo</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Lớp sắp diễn ra
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats?.upcomingClasses ?? 3}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            buổi tiếp theo
          </span>
        </div>
      </div>
    </div>
  );
}
