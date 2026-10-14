import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface ScheduleFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  facilities: string[];
  selectedRooms: string[];
  onRoomChange: (room: string) => void;
  currentWeekString: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export function ScheduleFilters({
  searchQuery,
  onSearchChange,
  facilities,
  selectedRooms,
  onRoomChange,
  currentWeekString,
  onPrevWeek,
  onNextWeek,
  onToday,
}: ScheduleFiltersProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Tìm lớp, HLV...</span>
          <span className="flex items-center gap-2 min-w-[220px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl shadow-xs focus-within:ring-2 focus-within:ring-orange-500">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tên lớp hoặc HLV"
              className="w-full text-xs font-medium text-slate-800 outline-none"
            />
          </span>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-slate-700">Phòng tập</span>
          <div className="flex flex-wrap gap-1.5 max-w-[520px]">
            <button
              type="button"
              onClick={() => onRoomChange("Tất cả")}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                selectedRooms.length === 0
                  ? "bg-orange-50 text-orange-600 border-orange-200"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
            {facilities.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => onRoomChange(room)}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  selectedRooms.includes(room)
                    ? "bg-orange-50 text-orange-600 border-orange-200"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {room.replace(" (Yoga/Pilates)", "")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-sm text-xs font-semibold border border-slate-200">
          Theo tuần
        </span>
        <button
          type="button"
          onClick={onPrevWeek}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          title="Tuần trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onToday}
          className="px-3.5 py-2 border border-orange-200 bg-orange-50 text-orange-600 rounded-xl text-xs font-semibold whitespace-nowrap"
        >
          {currentWeekString}
        </button>
        <button
          type="button"
          onClick={onNextWeek}
          className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
          title="Tuần sau"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
