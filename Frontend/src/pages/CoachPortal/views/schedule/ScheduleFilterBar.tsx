import React from "react";
import { List, Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import {
  type ViewMode,
  type TypeFilter,
  type SportFilter,
  type StatusFilter,
  STATUS_OPTIONS,
} from "./types";

interface Props {
  sportFilter: SportFilter;
  setSportFilter: (v: string) => void;
  sportOptions: string[];
  typeFilter: TypeFilter;
  setTypeFilter: (v: TypeFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  weekOffset: number;
  setWeekOffset: React.Dispatch<React.SetStateAction<number>>;
  weekDates?: string[];
}

export default function ScheduleFilterBar({
  sportFilter,
  setSportFilter,
  sportOptions,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  view,
  setView,
  weekOffset,
  setWeekOffset,
  weekDates,
}: Props) {
  const isFiltered = sportFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSportFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const formattedWeekRange = React.useMemo(() => {
    if (!weekDates || weekDates.length < 7) return "";
    const startParts = weekDates[0].split("-");
    const endParts = weekDates[6].split("-");
    const startStr = `${startParts[2]}/${startParts[1]}`;
    const endStr = `${endParts[2]}/${endParts[1]}/${endParts[0]}`;
    return `${startStr} – ${endStr}`;
  }, [weekDates]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
      {/* Left: View Mode Toggle & Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* View toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              view === "week"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Theo tuần</span>
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              view === "list"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Danh sách</span>
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Dropdown filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            {sportOptions.map((o) => (
              <option key={o} value={o}>
                {o === "all" ? "Tất cả bộ môn" : o}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <option value="all">Tất cả hình thức</option>
            <option value="group">Lớp nhóm</option>
            <option value="pt">Dạy kèm 1–1 (PT)</option>
            <option value="open_pt">Lịch trống 1–1</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Week Navigator */}
      <div className="flex items-center gap-2 self-start lg:self-auto">
        {formattedWeekRange && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            Tuần: {formattedWeekRange}
          </span>
        )}

        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setWeekOffset((v) => v - 1)}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              weekOffset === 0
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((v) => v + 1)}
            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
