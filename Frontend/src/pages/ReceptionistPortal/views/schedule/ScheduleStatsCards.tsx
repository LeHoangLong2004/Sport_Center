import React from "react";
import { Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import type { ScheduleStats, StatusFilterType } from "./types";

interface Props {
  stats: ScheduleStats;
  statusFilter: StatusFilterType;
  onSelectFilter: (status: StatusFilterType) => void;
}

export const ScheduleStatsCards: React.FC<Props> = ({
  stats,
  statusFilter,
  onSelectFilter,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* 1. Tất cả */}
      <button
        onClick={() => onSelectFilter("all")}
        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          statusFilter === "all"
            ? "bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
            Tất cả hôm nay
          </span>
          <span className="text-xl font-extrabold text-slate-900 leading-tight">
            {stats.total}
          </span>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === "all"
              ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
        </div>
      </button>

      {/* 2. Chờ tiếp đón */}
      <button
        onClick={() => onSelectFilter("Đang chờ khách")}
        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          statusFilter === "Đang chờ khách"
            ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20 shadow-xs"
            : "bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/30"
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold text-amber-800 block mb-0.5">
            Chờ tiếp đón
          </span>
          <span className="text-xl font-extrabold text-amber-900 leading-tight">
            {stats.waiting}
          </span>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === "Đang chờ khách"
              ? "bg-amber-500 text-white shadow-xs shadow-amber-500/30"
              : "bg-amber-100/80 text-amber-700"
          }`}
        >
          <Clock className="w-4 h-4 animate-pulse" />
        </div>
      </button>

      {/* 3. Đã hoàn tất */}
      <button
        onClick={() => onSelectFilter("Đã hoàn tất")}
        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          statusFilter === "Đã hoàn tất"
            ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs"
            : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30"
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold text-emerald-800 block mb-0.5">
            Đã hoàn tất
          </span>
          <span className="text-xl font-extrabold text-emerald-900 leading-tight">
            {stats.completed}
          </span>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === "Đã hoàn tất"
              ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </button>

      {/* 4. Đã hủy */}
      <button
        onClick={() => onSelectFilter("Đã hủy")}
        className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          statusFilter === "Đã hủy"
            ? "bg-rose-50/60 border-rose-200 ring-2 ring-rose-500/20 shadow-xs"
            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">
            Đã hủy hẹn
          </span>
          <span className="text-xl font-extrabold text-slate-700 leading-tight">
            {stats.cancelled}
          </span>
        </div>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            statusFilter === "Đã hủy"
              ? "bg-rose-500 text-white shadow-xs shadow-rose-500/30"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <XCircle className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
