import React from "react";
import { Clock, MapPin, Users, ArrowRight, AlertCircle } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MockSession, AttendanceRecord } from "../../services/api";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "đang diễn ra": { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
  "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

interface TodaySessionsListProps {
  loading: boolean;
  todaySessions: MockSession[];
  attendances: Record<string, AttendanceRecord[]>;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

export const TodaySessionsList: React.FC<TodaySessionsListProps> = ({
  loading,
  todaySessions,
  attendances,
  navigateTo,
}) => {
  return (
    <div className="xl:col-span-2 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Lịch dạy hôm nay
        </h2>
        <button
          type="button"
          onClick={() => navigateTo("schedule")}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          Đang tải lịch hôm nay...
        </div>
      ) : todaySessions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
          Hôm nay bạn không có ca dạy nào. Hãy tận hưởng thời gian nghỉ hoặc soạn giáo án mới!
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {todaySessions.map((s) => {
            const badge = STATUS_BADGE[s.status] || {
              label: s.status,
              bg: "bg-slate-100",
              text: "text-slate-600",
            };
            const recs = attendances[s.id] || [];
            const pending = recs.filter((r) => r.status === "chưa điểm danh").length;
            const isCancelled = s.status === "đã hủy";

            return (
              <div
                key={s.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm ${
                  isCancelled ? "opacity-60" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span className="font-semibold text-base text-slate-900 dark:text-white">
                      {s.className}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      {s.sport}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {s.startTime} – {s.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {s.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {s.registeredMemberIds.length}/{s.capacity} học viên
                    </span>
                  </div>

                  {pending > 0 && !isCancelled && (
                    <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Còn {pending} học viên chưa được điểm danh
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCancelled && (
                    <button
                      type="button"
                      onClick={() => navigateTo("attendance", { sessionId: s.id })}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                    >
                      Điểm danh
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
