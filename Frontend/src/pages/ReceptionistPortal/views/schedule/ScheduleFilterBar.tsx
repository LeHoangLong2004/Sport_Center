import React from "react";
import { Search, X } from "lucide-react";
import type { DateFilterType, ScheduleStats, StatusFilterType } from "./types";

interface Props {
  statusFilter: StatusFilterType;
  setStatusFilter: (status: StatusFilterType) => void;
  dateFilter: DateFilterType;
  setDateFilter: (filter: DateFilterType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  stats: ScheduleStats;
}

export const ScheduleFilterBar: React.FC<Props> = ({
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  searchQuery,
  setSearchQuery,
  stats,
}) => {
  const tabs = [
    { id: "all", label: "Tất cả", count: stats.total },
    { id: "Đang chờ khách", label: "Chờ tiếp đón", count: stats.waiting },
    { id: "Đã hoàn tất", label: "Đã hoàn tất", count: stats.completed },
    { id: "Đã hủy", label: "Đã hủy", count: stats.cancelled },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as StatusFilterType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/25 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        {/* Quick Date Filters */}
        <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg text-[11px] font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setDateFilter("all")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              dateFilter === "all"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả ngày
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("today")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              dateFilter === "today"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setDateFilter("tomorrow")}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              dateFilter === "tomorrow"
                ? "bg-white text-emerald-800 shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ngày mai
          </button>
        </div>

        {/* Compact Search Box */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm khách, SĐT, HLV..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
