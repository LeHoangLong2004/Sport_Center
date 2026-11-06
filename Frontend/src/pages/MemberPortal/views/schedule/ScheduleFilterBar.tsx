import React from "react";
import { List, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  SPORT_OPTIONS,
  type ViewMode,
  type TypeFilter,
  type SportFilter,
  type StatusFilter,
} from "./scheduleConstants";

interface Props {
  sportFilter: SportFilter;
  onSportFilterChange: (sport: SportFilter) => void;
  typeFilter: TypeFilter;
  onTypeFilterChange: (type: TypeFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrevWeek: () => void;
  onTodayWeek: () => void;
  onNextWeek: () => void;
  isCurrentWeek: boolean;
}

export default function ScheduleFilterBar({
  sportFilter,
  onSportFilterChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onPrevWeek,
  onTodayWeek,
  onNextWeek,
  isCurrentWeek,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      <div className="flex flex-wrap items-center gap-5">
        {/* Dropdown 1: Bộ môn */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Bộ môn
          </label>
          <div className="relative">
            <select
              value={sportFilter}
              onChange={(e) => onSportFilterChange(e.target.value)}
              className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-w-[150px] shadow-xs cursor-pointer"
            >
              {SPORT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === "all" ? "Tất cả bộ môn" : o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dropdown 2: Hình thức */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hình thức
          </label>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as TypeFilter)}
              className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-w-[185px] shadow-xs cursor-pointer"
            >
              <option value="all">Tất cả lịch tập</option>
              <option value="group">Lớp học nhóm</option>
              <option value="pt">Kèm 1–1 (PT)</option>
            </select>
          </div>
        </div>

        {/* Dropdown 3: Trạng thái */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Trạng thái
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
              className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 min-w-[150px] shadow-xs cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="sắp diễn ra">Sắp diễn ra</option>
              <option value="đang diễn ra">Đang diễn ra</option>
              <option value="hoàn thành">Hoàn thành</option>
              <option value="đã hủy">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right: View toggle & Week pagination */}
      <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Danh sách
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("week")}
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "week"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Theo tuần
          </button>
        </div>

        {/* Week Pagination Controls */}
        {viewMode === "week" && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevWeek}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onTodayWeek}
              className={`text-xs font-semibold px-3.5 py-2 border rounded-xl transition-colors cursor-pointer ${
                isCurrentWeek
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={onNextWeek}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
