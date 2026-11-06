import React from "react";
import { Search, X } from "lucide-react";
import { DateInput } from "../../../../components/DateInput";

interface BookingFiltersProps {
  activeTab: "group" | "pt" | "my_classes";
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  selectedCoachId: string;
  setSelectedCoachId: (coachId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  coaches: any[];
}

export const BookingFilters: React.FC<BookingFiltersProps> = ({
  activeTab,
  selectedDate,
  setSelectedDate,
  selectedSport,
  setSelectedSport,
  selectedCoachId,
  setSelectedCoachId,
  searchQuery,
  setSearchQuery,
  coaches,
}) => {
  if (activeTab === "my_classes") return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
      {/* Date filter */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs shadow-2xs hover:border-emerald-500/40 transition-colors">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ngày:</span>
        <DateInput
          value={selectedDate}
          onChange={setSelectedDate}
          className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate("")}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Xóa lọc ngày"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sport Filter */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs shadow-2xs hover:border-emerald-500/40 transition-colors">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bộ môn:</span>
        <select
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
          className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
        >
          <option value="all" className="bg-white dark:bg-slate-800">Tất cả bộ môn</option>
          <option value="Gym" className="bg-white dark:bg-slate-800">Gym & Thể lực</option>
          <option value="Yoga" className="bg-white dark:bg-slate-800">Yoga & Pilates</option>
          <option value="Boxing" className="bg-white dark:bg-slate-800">Boxing & Kickfit</option>
          <option value="Bơi lội" className="bg-white dark:bg-slate-800">Bơi lội 4 mùa</option>
          <option value="Zumba" className="bg-white dark:bg-slate-800">Zumba Dance</option>
        </select>
      </div>

      {/* Coach Filter Dropdown */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 text-xs shadow-2xs hover:border-emerald-500/40 transition-colors">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">HLV:</span>
        <select
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value)}
          className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[160px] truncate"
        >
          <option value="all" className="bg-white dark:bg-slate-800">Tất cả HLV ({coaches.length})</option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">
              {c.fullName || c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div className="flex-1 min-w-[200px] relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={activeTab === "group" ? "Tìm theo tên lớp, HLV..." : "Tìm HLV hoặc môn tập..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Reset all filters button */}
      {(selectedDate || selectedSport !== "all" || selectedCoachId !== "all" || searchQuery) && (
        <button
          type="button"
          onClick={() => {
            setSelectedDate("");
            setSelectedSport("all");
            setSelectedCoachId("all");
            setSearchQuery("");
          }}
          className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
        >
          Đặt lại bộ lọc
        </button>
      )}
    </div>
  );
};
