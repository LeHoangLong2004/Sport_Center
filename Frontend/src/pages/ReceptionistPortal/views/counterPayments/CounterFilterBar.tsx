import React from "react";
import { Search, X } from "lucide-react";

interface CounterFilterBarProps {
  search: string;
  onSearchChange: (search: string) => void;
  statusFilter: "all" | "pending" | "paid";
  onStatusFilterChange: (status: "all" | "pending" | "paid") => void;
  categoryFilter: "all" | "membership" | "sport" | "class";
  onCategoryFilterChange: (cat: "all" | "membership" | "sport" | "class") => void;
  pendingCount: number;
}

export function CounterFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  pendingCount,
}: CounterFilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo SĐT, Tên, Email hoặc Mã đơn..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => onStatusFilterChange("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "pending"
                ? "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Chờ thu tiền ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("paid")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "paid"
                ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Đã thu
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Tất cả
          </button>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value as any)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
        >
          <option value="all">Tất cả loại đơn / dịch vụ</option>
          <option value="membership">Gói thành viên (Gym)</option>
          <option value="sport">Gói bộ môn (Yoga, Bơi, Boxing...)</option>
          <option value="class">Đơn đặt lớp học</option>
        </select>
      </div>
    </div>
  );
}
