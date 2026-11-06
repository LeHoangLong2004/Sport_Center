import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <button
        onClick={() => onSelectFilter("all")}
        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
          statusFilter === "all"
            ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div>
          <span className="text-[11px] text-slate-500 block">Tất cả hôm nay</span>
          <span className="text-lg font-extrabold text-slate-900 leading-tight">
            {stats.total}
          </span>
        </div>
        <div className="w-7 h-7 rounded-md bg-blue-100/70 text-blue-700 flex items-center justify-center text-xs font-bold">
          All
        </div>
      </button>

      <button
        onClick={() => onSelectFilter("Đang chờ khách")}
        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
          statusFilter === "Đang chờ khách"
            ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-300"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div>
          <span className="text-[11px] text-amber-700 font-medium block">Chờ tiếp đón</span>
          <span className="text-lg font-extrabold text-amber-700 leading-tight">
            {stats.waiting}
          </span>
        </div>
        <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
          <Clock className="w-4 h-4 animate-pulse" />
        </div>
      </button>

      <button
        onClick={() => onSelectFilter("Đã hoàn tất")}
        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
          statusFilter === "Đã hoàn tất"
            ? "bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div>
          <span className="text-[11px] text-emerald-700 font-medium block">Đã hoàn tất</span>
          <span className="text-lg font-extrabold text-emerald-700 leading-tight">
            {stats.completed}
          </span>
        </div>
        <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </button>

      <button
        onClick={() => onSelectFilter("Đã hủy")}
        className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition cursor-pointer ${
          statusFilter === "Đã hủy"
            ? "bg-slate-100 border-slate-300 ring-1 ring-slate-300"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }`}
      >
        <div>
          <span className="text-[11px] text-slate-500 block">Đã hủy hẹn</span>
          <span className="text-lg font-extrabold text-slate-600 leading-tight">
            {stats.cancelled}
          </span>
        </div>
        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
          <XCircle className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};
