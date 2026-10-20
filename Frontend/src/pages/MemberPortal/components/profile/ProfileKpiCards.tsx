import React from "react";
import { CheckCircle2, Flame, Calendar, Trophy } from "lucide-react";

interface ProfileKpiCardsProps {
  completedCount: number;
  totalSessionsCount: number;
}

export const ProfileKpiCards: React.FC<ProfileKpiCardsProps> = ({
  completedCount,
  totalSessionsCount,
}) => {
  const completionPct =
    totalSessionsCount > 0
      ? Math.min(100, Math.round((completedCount / totalSessionsCount) * 100))
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Buổi tập hoàn thành */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Buổi tập hoàn thành
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{completedCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalSessionsCount || 0} buổi</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Tiến độ hoàn thành</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {totalSessionsCount > 0 ? `${completionPct}%` : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Kỷ luật chuyên cần */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kỷ luật chuyên cần
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalSessionsCount > 0 ? `${completionPct}%` : "0%"}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              {completedCount > 0 ? `${completedCount} buổi xong` : "Khởi đầu mới"}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Chuyên cần</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {completedCount > 0 ? "Rất tích cực 🔥" : "Chưa có dữ liệu"}
            </span>
          </div>
        </div>
      </div>

      {/* Lịch tập đã đặt */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lịch tập đã đặt
            </span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSessionsCount}</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">ca trong lịch</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {totalSessionsCount > 0
              ? `${totalSessionsCount - completedCount} ca sắp tới`
              : "Chưa đăng ký ca tập"}
          </span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            {totalSessionsCount > 0 ? "Đang lên lịch" : "Trống"}
          </span>
        </div>
      </div>

      {/* Cấp bậc rèn luyện */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cấp bậc rèn luyện
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              Level {Math.max(1, Math.floor(completedCount / 5) + 1)}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              {completedCount >= 20 ? "Vàng (Gold)" : completedCount >= 10 ? "Bạc (Silver)" : "Tân Binh"}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (completedCount % 5) * 20)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{(completedCount % 5) * 50} / 250 XP</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {250 - (completedCount % 5) * 50} XP tới Cấp tiếp theo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
