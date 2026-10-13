import { List, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Bộ môn
          </label>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[150px] shadow-xs cursor-pointer"
          >
            {sportOptions.map((o) => (
              <option key={o} value={o}>
                {o === "all" ? "Tất cả bộ môn" : o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Hình thức
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[185px] shadow-xs cursor-pointer"
          >
            <option value="all">Tất cả lịch dạy</option>
            <option value="group">Lớp học nhóm</option>
            <option value="pt">Dạy kèm 1–1 (Đã có HV)</option>
            <option value="open_pt">Lịch trống 1–1 (Chờ HV đặt)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Trạng thái
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 min-w-[150px] shadow-xs cursor-pointer"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setView("list")}
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              view === "list"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" /> Danh sách
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              view === "week"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Theo tuần
          </button>
        </div>

        {view === "week" && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setWeekOffset((v) => v - 1)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              className={`text-xs font-semibold px-3.5 py-2 border rounded-xl transition-colors ${
                weekOffset === 0
                  ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 font-bold"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((v) => v + 1)}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
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
