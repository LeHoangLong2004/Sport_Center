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
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Đơn chờ thu tại quầy
          </p>
          <p className="text-2xl font-black text-amber-900 dark:text-amber-100 mt-1">
            {pendingCount} đơn
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
            Tổng: {formatMoney(pendingAmount)}
          </p>
        </div>
        <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 text-2xl font-bold">
          ⏳
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Đã thu hôm nay
          </p>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100 mt-1">
            {todayPaidCount} đơn
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            Tổng thu: {formatMoney(todayPaidAmount)}
          </p>
        </div>
        <div className="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 text-2xl font-bold">
          ✓
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between">
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
