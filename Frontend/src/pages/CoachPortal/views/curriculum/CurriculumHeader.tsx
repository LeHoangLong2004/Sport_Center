import React from "react";
import { BookOpen, Plus, Search, Filter, Sparkles, CheckCircle2, AlertTriangle, X } from "lucide-react";
import type { MockCurriculum } from "../../services/api";
import { getEffectiveStatus } from "./curriculumUtils";

interface CurriculumHeaderProps {
  curricula: MockCurriculum[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sportFilter: string;
  setSportFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  sportsList: string[];
  onOpenNew: () => void;
  onOpenAiTab?: () => void;
}

export const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({
  curricula,
  searchQuery,
  setSearchQuery,
  sportFilter,
  setSportFilter,
  statusFilter,
  setStatusFilter,
  sportsList,
  onOpenNew,
  onOpenAiTab,
}) => {
  // Đồng bộ số liệu KPI với logic trạng thái thực tế
  const totalCount = curricula.length;
  const readyCount = curricula.filter((c) => getEffectiveStatus(c).key === "ready").length;
  const assignedCount = curricula.filter((c) => getEffectiveStatus(c).key === "assigned").length;
  const emptyCount = curricula.filter((c) => getEffectiveStatus(c).key === "empty").length;
  const draftCount = curricula.filter(
    (c) => getEffectiveStatus(c).key === "draft" || getEffectiveStatus(c).key === "empty"
  ).length;

  return (
    <>
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Giáo án & Bài tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Thiết kế giáo án tập luyện theo bộ môn và giao bài cho học viên / lớp phụ trách.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenAiTab && (
            <button
              type="button"
              onClick={onOpenAiTab}
              className="flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-600 hover:from-emerald-700 hover:to-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              title="Sử dụng AI gợi ý và tạo nhanh giáo án bài tập"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Soạn với Coach AI</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo giáo án mới</span>
          </button>
        </div>
      </div>

      {/* Metrics Row (Clickable quick filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Tổng số */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl text-left transition-all cursor-pointer ${
            statusFilter === "all"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Tổng số giáo án
            </span>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Tất cả giáo án hiện có
          </div>
        </button>

        {/* KPI 2: Sẵn sàng giao */}
        <button
          type="button"
          onClick={() => setStatusFilter("ready")}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl text-left transition-all cursor-pointer ${
            statusFilter === "ready"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Sẵn sàng giao
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {readyCount}
          </div>
          <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 mt-1 font-medium">
            Đã duyệt & đủ bài tập
          </div>
        </button>

        {/* KPI 3: Đã giao cho học viên */}
        <button
          type="button"
          onClick={() => setStatusFilter("assigned")}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl text-left transition-all cursor-pointer ${
            statusFilter === "assigned"
              ? "border-sky-500 ring-2 ring-sky-500/20 shadow-sm"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
              Đã giao cho học viên
            </span>
            <span className="w-2 h-2 rounded-full bg-sky-500" />
          </div>
          <div className="text-2xl font-bold text-sky-700 dark:text-sky-400 mt-1">
            {assignedCount}
          </div>
          <div className="text-[11px] text-sky-600/90 dark:text-sky-400/90 mt-1 font-medium">
            Đang áp dụng trong lớp/PT
          </div>
        </button>

        {/* KPI 4: Bản nháp / Cần bài tập */}
        <button
          type="button"
          onClick={() => setStatusFilter("draft")}
          className={`p-4 bg-white dark:bg-slate-900 border rounded-xl text-left transition-all cursor-pointer ${
            statusFilter === "draft"
              ? "border-amber-500 ring-2 ring-amber-500/20 shadow-sm"
              : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Bản nháp đang soạn
            </span>
            {emptyCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> {emptyCount} cần bài
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">
            {draftCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Bản nháp hoặc chưa đủ bài
          </div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-xs">
        {/* Search input */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Tìm theo tên giáo án, mục tiêu, bộ môn, bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Trạng thái:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-xs"
            >
              <option value="all">Tất cả trạng thái ({totalCount})</option>
              <option value="ready">Sẵn sàng giao ({readyCount})</option>
              <option value="assigned">Đã giao ({assignedCount})</option>
              <option value="draft">Bản nháp / Cần bài ({draftCount})</option>
            </select>
          </div>

          {/* Sport Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 whitespace-nowrap">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Bộ môn:
            </span>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-xs"
            >
              {sportsList.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "Tất cả bộ môn" : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
