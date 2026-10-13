import React from "react";
import { iChevron } from "../shared";

interface ScheduleCalendarViewProps {
  days: string[];
  hours: string[];
  currentWeekString: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  classesThisWeek: any[];
  onSelectClass: (id: string) => void;
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  days,
  hours,
  currentWeekString,
  onPrevWeek,
  onNextWeek,
  classesThisWeek,
  onSelectClass,
}) => {
  return (
    <div className="flex-1 bg-white border border-[#e2e8f0] rounded-xl drop-shadow-sm flex flex-col min-w-0">
      <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-4">
          <button
            onClick={onPrevWeek}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <img
              src={iChevron}
              alt=""
              className="size-5 rotate-90 opacity-60"
            />
          </button>
          <p className="font-bold text-[#0f172a] text-base">
            {currentWeekString}
          </p>
          <button
            onClick={onNextWeek}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <img
              src={iChevron}
              alt=""
              className="size-5 -rotate-90 opacity-60"
            />
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button className="bg-white drop-shadow-sm px-4 py-1.5 rounded-md text-sm font-semibold text-[#0f172a]">
            Tuần
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">
            Tháng
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-auto relative p-4">
        {/* simple grid calendar */}
        <div className="flex flex-col w-full min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="w-16"></div>
            {days.map((d) => (
              <div
                key={d}
                className="text-center pb-2 border-b border-slate-200"
              >
                <p className="text-[#64748b] text-xs font-semibold uppercase">
                  {d}
                </p>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            {hours.map((h) => (
              <div
                key={h}
                className="grid grid-cols-8 gap-2 relative h-24 group"
              >
                <div className="w-16 flex justify-end pr-3">
                  <span className="text-[#94a3b8] text-[11px] font-medium -mt-2">
                    {h}
                  </span>
                </div>
                {days.map((_, col) => (
                  <div
                    key={col}
                    className="border-t border-slate-200 group-hover:bg-slate-50/50 transition-colors relative"
                  >
                    {/* Đường kẻ lằn ranh đứt quãng cho giữa giờ (lẻ) */}
                    <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200/60 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            ))}

            {/* Render classes directly over the grid */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8 gap-2 pl-[4.5rem]">
              {days.map((_, colIdx) => (
                <div key={colIdx} className="relative h-full">
                  {classesThisWeek
                    .filter((c) => c.day === colIdx)
                    .map((c, i) => (
                      <div
                        key={i}
                        onClick={() => onSelectClass(c.id)}
                        className={`absolute w-full rounded-md border border-l-4 p-1 flex flex-col justify-between pointer-events-auto cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden ${c.color}`}
                        style={{
                          top: `${c.hour * 6}rem`,
                          height: `calc(${c.duration * 6}rem - 2px)`,
                          marginTop: "1px",
                          zIndex: 10,
                        }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p
                            className={`font-bold text-[10px] leading-tight truncate ${c.text}`}
                          >
                            {c.name}
                          </p>
                          <span className="bg-white/90 px-1 py-0.5 rounded text-[8px] font-bold shrink-0 shadow-sm border border-black/5 leading-none">
                            {c.enrolled}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-between opacity-80 mt-auto ${c.text}`}
                        >
                          <div className="flex items-center gap-0.5 truncate min-w-0 pr-1">
                            <svg
                              className="w-2.5 h-2.5 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <p className="text-[8px] font-medium truncate">
                              {c.room}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 truncate shrink-0">
                            <svg
                              className="w-2.5 h-2.5 shrink-0 opacity-80"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <p
                              className={`text-[8px] font-medium truncate ${c.text}`}
                            >
                              {c.coach}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
