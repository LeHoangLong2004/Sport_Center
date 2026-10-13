import React from "react";
import { BookOpen, Plus, Search, Filter } from "lucide-react";
import type { MockCurriculum } from "../../services/api";

interface CurriculumHeaderProps {
  curricula: MockCurriculum[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sportFilter: string;
  setSportFilter: (s: string) => void;
  sportsList: string[];
  onOpenNew: () => void;
}

export const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({
  curricula,
  searchQuery,
  setSearchQuery,
  sportFilter,
  setSportFilter,
  sportsList,
  onOpenNew,
}) => {
  return (
    <>
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Giáo án & Bài tập
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết kế giáo án tập luyện theo bộ môn và giao bài cho học viên / lớp phụ trách
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Tạo giáo án mới
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số giáo án</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{curricula.length}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Đã giao cho học viên</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {curricula.filter((c) => c.status === "Đã giao").length}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Bản nháp đang soạn</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {curricula.filter((c) => c.status === "Nháp").length}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Tìm theo tên giáo án, mục tiêu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Bộ môn:
          </span>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            {sportsList.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "Tất cả" : s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};
