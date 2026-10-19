import React from "react";
import { Wallet, Receipt, CheckCircle2, Clock, Award } from "lucide-react";

interface Props {
  walletBalance: number;
  totalSpent: number;
  paidCount: number;
  pendingCount: number;
  memberTier: string;
  hasPaidInvoices: boolean;
}

export default function ProfileFinanceStats({
  walletBalance,
  totalSpent,
  paidCount,
  pendingCount,
  memberTier,
  hasPaidInvoices,
}: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Card 1: Số dư ví khả dụng */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 p-5 shadow-xs bg-gradient-to-br from-emerald-500/5 to-transparent">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Số dư ví
          </span>
          <Wallet className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {walletBalance.toLocaleString("vi-VN")} đ
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              Khả dụng
            </span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-wallet-modal"))}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              + Nạp ví
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tổng chi tiêu
          </span>
          <Receipt className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {totalSpent.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            Đã hoàn tất thanh toán
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Giao dịch hoàn tất
          </span>
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {paidCount} đơn
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
            Phiếu thu hợp lệ
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Chờ thanh toán
          </span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {pendingCount} đơn
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            {pendingCount > 0 ? "Cần hoàn tất đối soát" : "Không có công nợ"}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hạng hội viên
          </span>
          <Award className="w-4 h-4 text-purple-500" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {memberTier || (hasPaidInvoices ? "Hội viên Hoạt động" : "Thành viên mới")}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            {hasPaidInvoices ? "Gói tập đang kích hoạt" : "Chưa đăng ký gói tập"}
          </div>
        </div>
      </div>
    </div>
  );
}
