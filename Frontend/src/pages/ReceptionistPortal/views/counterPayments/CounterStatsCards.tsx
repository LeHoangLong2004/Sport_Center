import React from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  pendingCount: number;
  pendingAmount: number;
  todayPaidCount: number;
  todayPaidAmount: number;
  loading: boolean;
  onRefresh: () => void;
  formatMoney: (value: number) => string;
}

export default function CounterStatsCards({
  pendingCount,
  pendingAmount,
  todayPaidCount,
  todayPaidAmount,
  loading,
  onRefresh,
  formatMoney,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-600 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Đơn chờ thu tại quầy
          </p>
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {pendingCount} đơn
          </p>
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
            Tổng: {formatMoney(pendingAmount)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-purple-400 dark:hover:border-purple-600 transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Đã thu ca trực hôm nay
          </p>
          <span className="size-2 rounded-full bg-purple-600" />
        </div>
        <div className="mt-3">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {todayPaidCount} đơn
          </p>
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
            Tổng thu: {formatMoney(todayPaidAmount)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Tác vụ nhanh
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Đồng bộ thời gian thực
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới dữ liệu ngay
          </button>
        </div>
        <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 text-xl font-bold">
          ⚡
        </div>
      </div>
    </div>
  );
}
