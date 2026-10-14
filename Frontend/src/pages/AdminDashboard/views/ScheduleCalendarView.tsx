import React from "react";

type WeekDate = { label: string; date: string; iso: string };

interface ScheduleCalendarViewProps {
  hours: string[];
  weekDates: WeekDate[];
  classesThisWeek: any[];
  onSelectClass: (id: string) => void;
}

function paletteFor(item: any) {
  const category = `${item.sport || ""} ${item.name || ""}`.toLowerCase();
  const isPersonalTraining = /pt|personal|1:1|cá nhân/.test(category);

  return isPersonalTraining
    ? {
        card: "bg-amber-50/60 border-amber-200 hover:border-amber-400",
        badge: "bg-amber-100 text-amber-800",
        text: "text-slate-800",
      }
    : {
        card: "bg-slate-50 border-slate-200 hover:border-slate-400",
        badge: "bg-emerald-100 text-emerald-800",
        text: "text-slate-800",
      };
}

function getStartDate(item: any) {
  return item.rawStart instanceof Date ? item.rawStart : new Date(item.rawStart);
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  hours,
  weekDates,
  classesThisWeek,
  onSelectClass,
}) => (
  <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
    <div className="min-w-[960px]">
      <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/80">
        <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200">
          Giờ
        </div>
        {weekDates.map((day) => {
          const isToday = day.iso === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={day.iso}
              className={`p-3 text-xs font-semibold text-center border-r border-slate-200 last:border-0 ${
                isToday ? "bg-orange-50/60 text-orange-600 font-bold" : "text-slate-700"
              }`}
            >
              <div>{day.label}</div>
              <div className="text-[10px] font-normal text-slate-400 mt-0.5">{day.date}</div>
            </div>
          );
        })}
      </div>

      {hours.map((hour) => {
        const hourNumber = Number(hour.slice(0, 2));
        return (
          <div
            key={hour}
            className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 last:border-0"
          >
            <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 flex items-center justify-center">
              {hour}
            </div>

            {weekDates.map((day, dayIndex) => {
              const dayClasses = classesThisWeek.filter((item) => {
                const start = getStartDate(item);
                return item.day === dayIndex && start.getHours() === hourNumber;
              });

              return (
                <div
                  key={day.iso}
                  className="p-1.5 border-r border-slate-100 last:border-0 relative space-y-1.5"
                >
                  {dayClasses.map((item: any) => {
                    const style = item.isCancelled
                      ? {
                          card: "bg-slate-50 border-slate-300 opacity-60",
                          badge: "bg-slate-200 text-slate-600",
                          text: "text-slate-500 line-through",
                        }
                      : paletteFor(item);
                    const start = getStartDate(item);
                    const sport = item.sport || "Lớp nhóm";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectClass(item.id)}
                        className={`w-full min-h-[76px] text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${style.card}`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.badge}`}>
                              {sport}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                            </span>
                          </div>
                          <div className={`text-xs font-semibold line-clamp-1 ${style.text}`}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-1">
                            {item.coach || "Chưa phân công HLV"}
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-200/70">
                          <span className="truncate">{item.room}</span>
                          <span className="shrink-0">{item.enrolled} HV</span>
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
