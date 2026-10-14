export type ScheduleEvent = {
  id: string;
  column: number;
  rawStart: Date;
  title: string;
  detail: string;
  meta: string;
  status?: string | number;
  tone: "teal" | "green" | "orange";
  sport?: string;
};

type WeekDate = {
  label: string;
  iso: string;
};

interface Props {
  weekDates: WeekDate[];
  events: ScheduleEvent[];
  onSelect: (event: ScheduleEvent) => void;
}

const TIME_ROWS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "14:00",
  "15:00",
  "17:00",
  "18:00",
  "19:00",
];

const TONE_STYLES = {
  teal: {
    card: "bg-teal-50/70 border-teal-200 hover:border-teal-400",
    badge: "bg-teal-100 text-teal-800",
  },
  green: {
    card: "bg-emerald-50/70 border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-100 text-emerald-800",
  },
  orange: {
    card: "bg-orange-50/70 border-orange-200 hover:border-orange-400",
    badge: "bg-orange-100 text-orange-800",
  },
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function MemberScheduleGrid({ weekDates, events, onSelect }: Props) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
      <div className="min-w-[960px]">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/80">
          <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200">
            Giờ
          </div>
          {weekDates.map((day) => {
            const isToday = day.iso === localIso(new Date());
            return (
              <div
                key={day.iso}
                className={`p-3 text-xs font-semibold text-center border-r border-slate-200 last:border-0 ${
                  isToday ? "bg-teal-50 text-teal-700 font-bold" : "text-slate-700"
                }`}
              >
                <div>{day.label}</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                  {day.iso.slice(8, 10)}/{day.iso.slice(5, 7)}
                </div>
              </div>
            );
          })}
        </div>

        {TIME_ROWS.map((hour) => {
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
                const cellEvents = events.filter(
                  (event) =>
                    event.column === dayIndex + 1 &&
                    event.rawStart.getHours() === hourNumber,
                );

                return (
                  <div
                    key={day.iso}
                    className="p-1.5 border-r border-slate-100 last:border-0 relative space-y-1.5"
                  >
                    {cellEvents.map((event) => {
                      const style = TONE_STYLES[event.tone];
                      const status = String(event.status ?? "");
                      return (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => onSelect(event)}
                          className={`w-full min-h-[76px] text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${style.card}`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.badge}`}
                              >
                                {event.tone === "orange"
                                  ? "PT cá nhân"
                                  : event.tone === "green"
                                    ? "Tự tập"
                                    : event.sport || "Lớp nhóm"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatTime(event.rawStart)}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                              {event.title}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-1">
                              {event.detail}
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-500 flex items-center justify-between gap-2 mt-1 pt-1 border-t border-slate-200/70">
                            <span className="truncate">{event.meta}</span>
                            {status && <span className="shrink-0">{status}</span>}
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

function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}
