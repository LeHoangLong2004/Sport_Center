import React from "react";
import type { MemberSessionItem } from "../../types";
import { DAYS_NAMES } from "./scheduleConstants";

interface Props {
  weekDates: {
    dateStr: string;
    dateObj: Date;
    dayName: string;
    dayOfMonth: number;
    isToday: boolean;
  }[];
  activeTimeRows: string[];
  weekSessions: MemberSessionItem[];
  onSelectSession: (session: MemberSessionItem) => void;
}

export default function ScheduleWeekView({
  weekDates,
  activeTimeRows,
  weekSessions,
  onSelectSession,
}: Props) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-xs">
      <div className="min-w-[960px]">
        {/* Header Row */}
        <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
          <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
            Giờ
          </div>
          {DAYS_NAMES.map((d, di) => {
            const day = weekDates[di];
            const isToday = day?.isToday;
            return (
              <div
                key={d}
                className={`p-3 text-xs text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                  isToday
                    ? "bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 font-semibold"
                }`}
              >
                <div>{d}</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                  {day?.dateStr?.split("-").slice(1).reverse().join("/")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid Rows by Time */}
        {activeTimeRows.map((hour) => {
          const rowHour = parseInt(hour.split(":")[0], 10);
          return (
            <div
              key={hour}
              className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 dark:border-slate-800/60 last:border-0"
            >
              <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {hour}
              </div>

              {DAYS_NAMES.map((_, di) => {
                const colDate = weekDates[di]?.dateStr;
                const cellSessions = weekSessions.filter((s) => {
                  const isSameDay = s.date === colDate;
                  const match = s.startTime?.match(/^(\d{1,2})/);
                  const sHour = match ? parseInt(match[1], 10) : -1;
                  return isSameDay && sHour === rowHour;
                });

                cellSessions.sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

                return (
                  <div
                    key={di}
                    className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-0 relative space-y-1.5"
                  >
                    {cellSessions.map((s) => {
                      const isPT = s.type === "pt";
                      const isCancelled = s.status === "đã hủy";

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => onSelectSession(s)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer ${
                            isPT
                              ? "bg-amber-50/70 border-amber-200 hover:border-amber-300 dark:bg-amber-950/30 dark:border-amber-800/60"
                              : isCancelled
                              ? "opacity-60 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700"
                              : "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800/60"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  isPT
                                    ? "bg-amber-200/80 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200"
                                    : "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200"
                                }`}
                              >
                                {isPT ? "PT 1–1" : s.sport.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono font-medium">
                                {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {s.name}
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                            <span className="truncate max-w-[85px]">{s.room}</span>
                            {isPT ? (
                              <span className="text-amber-700 dark:text-amber-400 font-semibold truncate max-w-[80px]">
                                {s.goal || s.coachName}
                              </span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {s.registeredCount || 8} HV
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
