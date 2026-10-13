import { Sparkles } from "lucide-react";
import type { CoachScreen } from "../../types";
import { DAYS_NAMES, TIME_ROWS, type UnifiedScheduleItem } from "./types";

interface Props {
  weekDates: string[];
  todayStr: string;
  filteredSessions: UnifiedScheduleItem[];
  onSelectOpenSlot: (item: UnifiedScheduleItem) => void;
  onSelectPtSession: (item: UnifiedScheduleItem) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export default function ScheduleWeekGrid({
  weekDates,
  todayStr,
  filteredSessions,
  onSelectOpenSlot,
  onSelectPtSession,
  navigateTo,
}: Props) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
      <div className="min-w-[960px]">
        {/* Header Row: Giờ | Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7 | Chủ nhật */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200 dark:border-slate-800">
            Giờ
          </div>
          {DAYS_NAMES.map((d, di) => {
            const dateStr = weekDates[di];
            const isToday = dateStr === todayStr;
            return (
              <div
                key={d}
                className={`p-3 text-xs font-semibold text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                  isToday
                    ? "bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <div>{d}</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                  {dateStr?.split("-").slice(1).reverse().join("/")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Rows by Time */}
        {TIME_ROWS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 dark:border-slate-800/60 last:border-0"
          >
            <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {hour}
            </div>

            {DAYS_NAMES.map((_, di) => {
              const colDate = weekDates[di];
              const cellSessions = filteredSessions.filter((s) => {
                const isSameDay = s.date === colDate;
                const isSameHour = s.startTime.startsWith(hour.slice(0, 2));
                return isSameDay && isSameHour;
              });

              return (
                <div
                  key={di}
                  className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-0 relative space-y-1.5"
                >
                  {cellSessions.map((sessionItem) => {
                    const isPT = sessionItem.type === "pt";
                    const isOpenPT = sessionItem.type === "open_pt";
                    return (
                      <button
                        key={sessionItem.id}
                        type="button"
                        onClick={() => {
                          if (isOpenPT) {
                            onSelectOpenSlot(sessionItem);
                          } else if (isPT) {
                            onSelectPtSession(sessionItem);
                          } else {
                            navigateTo("class-detail", { sessionId: sessionItem.id });
                          }
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                          isOpenPT
                            ? "bg-sky-50/70 dark:bg-sky-950/30 border-dashed border-sky-300 dark:border-sky-700 hover:border-sky-500 hover:bg-sky-50"
                            : isPT
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800/60 hover:border-amber-400"
                            : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.2 rounded ${
                                isOpenPT
                                  ? "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                  : isPT
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              }`}
                            >
                              {isOpenPT ? "Trống 1–1" : isPT ? "PT 1–1" : sessionItem.sport}
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {sessionItem.startTime}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                            {isOpenPT
                              ? sessionItem.className
                              : isPT
                              ? sessionItem.memberName
                              : sessionItem.className}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                          <span className="truncate">{sessionItem.room}</span>
                          {isOpenPT ? (
                            <span className="text-sky-600 dark:text-sky-400 font-semibold truncate flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> Mở nhận HV
                            </span>
                          ) : isPT ? (
                            <span className="text-amber-600 dark:text-amber-400 font-medium truncate max-w-[80px]">
                              {sessionItem.goal}
                            </span>
                          ) : (
                            <span>{sessionItem.registeredCount} HV</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
