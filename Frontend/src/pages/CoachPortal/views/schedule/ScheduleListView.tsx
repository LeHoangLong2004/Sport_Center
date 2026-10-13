import { Clock, MapPin, Sparkles, Target, Users, Eye } from "lucide-react";
import type { CoachScreen } from "../../types";
import { STATUS_BADGE, type UnifiedScheduleItem } from "./types";

interface Props {
  byDate: [string, UnifiedScheduleItem[]][];
  todayStr: string;
  loading: boolean;
  onSelectOpenSlot: (item: UnifiedScheduleItem) => void;
  onSelectPtSession: (item: UnifiedScheduleItem) => void;
  onOpenRequestModal: (sessionId?: string) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function ScheduleListView({
  byDate,
  todayStr,
  loading,
  onSelectOpenSlot,
  onSelectPtSession,
  onOpenRequestModal,
  navigateTo,
}: Props) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        Đang tải lịch dạy...
      </div>
    );
  }

  if (byDate.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        Không tìm thấy buổi học nào phù hợp với bộ lọc đã chọn.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {byDate.map(([date, daySessions]) => {
        const d = new Date(date);
        const isToday = date === todayStr;
        const label = d.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        });

        return (
          <div key={date} className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isToday
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {label} {isToday && "• Hôm nay"}
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {daySessions.map((s) => {
                const badge = STATUS_BADGE[s.status] || {
                  label: s.status,
                  bg: "bg-slate-100",
                  text: "text-slate-600",
                };
                const isPT = s.type === "pt";
                const isOpenPT = s.type === "open_pt";

                return (
                  <div
                    key={s.id}
                    className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                      isOpenPT
                        ? "border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-950/20 hover:border-sky-400"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                        <span className="font-semibold text-base text-slate-900 dark:text-white">
                          {s.className}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            isOpenPT
                              ? "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/50 dark:text-sky-300"
                              : isPT
                              ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                          }`}
                        >
                          {isOpenPT ? "Lịch Trống 1–1" : isPT ? "Kèm 1–1 (PT)" : "Lớp Nhóm"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {s.sport}
                        </span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                            isOpenPT
                              ? "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300"
                              : `${badge.bg} ${badge.text}`
                          }`}
                        >
                          {isOpenPT ? "Mở nhận học viên" : badge.label}
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
                        {isOpenPT ? (
                          <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            {s.note || "Chờ học viên đăng ký"}
                          </span>
                        ) : isPT ? (
                          <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                            <Target className="w-3.5 h-3.5" />
                            Mục tiêu: {s.goal}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            {s.registeredCount}/{s.capacity} học viên
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isOpenPT ? (
                        <button
                          type="button"
                          onClick={() => onSelectOpenSlot(s)}
                          className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
                        >
                          Đóng / Hủy ca trống
                        </button>
                      ) : (
                        <>
                          {isPT ? (
                            <button
                              type="button"
                              onClick={() => onSelectPtSession(s)}
                              className="px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Chi tiết PT
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => navigateTo("attendance", { sessionId: s.id })}
                              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                            >
                              Điểm danh
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenRequestModal(s.id)}
                            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            Dời ca
                          </button>
                          {!isPT && (
                            <button
                              type="button"
                              onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                              className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            >
                              Chi tiết →
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
