import { iChevron } from "../shared";

interface ScheduleCalendarProps {
  days: string[];
  hours: string[];
  weekString: string;
  classesThisWeek: any[];
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectClass: (id: string) => void;
}

export function ScheduleCalendar({
  days,
  hours,
  weekString,
  classesThisWeek,
  onPrevWeek,
  onNextWeek,
  onSelectClass,
}: ScheduleCalendarProps) {
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
          <p className="font-bold text-[#0f172a] text-base">{weekString}</p>
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
        <div className="flex flex-col w-full min-w-[800px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="w-16" />
            {days.map((day) => (
              <div
                key={day}
                className="text-center pb-2 border-b border-slate-200"
              >
                <p className="text-[#64748b] text-xs font-semibold uppercase">
                  {day}
                </p>
              </div>
            ))}
          </div>
          <div className="flex-1 relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 gap-2 relative h-24 group"
              >
                <div className="w-16 flex justify-end pr-3">
                  <span className="text-[#94a3b8] text-[11px] font-medium -mt-2">
                    {hour}
                  </span>
                </div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="border-t border-slate-200 group-hover:bg-slate-50/50 transition-colors relative"
                  >
                    <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-slate-200/60 pointer-events-none" />
                  </div>
                ))}
              </div>
            ))}

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8 gap-2 pl-[4.5rem]">
              {days.map((_, columnIndex) => (
                <div key={columnIndex} className="relative h-full">
                  {classesThisWeek
                    .filter((item) => item.day === columnIndex)
                    .map((item, index) => (
                      <div
                        key={index}
                        onClick={() => onSelectClass(item.id)}
                        className={`absolute w-full rounded-md border border-l-4 p-1 flex flex-col justify-between pointer-events-auto cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden ${item.color}`}
                        style={{
                          top: `${item.hour * 6}rem`,
                          height: `calc(${item.duration * 6}rem - 2px)`,
                          marginTop: "1px",
                          zIndex: 10,
                        }}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p
                            className={`font-bold text-[10px] leading-tight truncate ${item.text}`}
                          >
                            {item.name}
                          </p>
                          <span className="bg-white/90 px-1 py-0.5 rounded text-[8px] font-bold shrink-0 shadow-sm border border-black/5 leading-none">
                            {item.enrolled}
                          </span>
                        </div>
                        <div
                          className={`flex items-center justify-between opacity-80 mt-auto ${item.text}`}
                        >
                          <span className="text-[8px] font-medium truncate">
                            {item.room}
                          </span>
                          <span className="text-[8px] font-medium truncate">
                            {item.coach}
                          </span>
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
}
