import React from "react";
import { createPortal } from "react-dom";
import { Receipt, X, CheckCircle2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { WalletTransaction } from "../services/walletService";

interface Props {
  transaction: WalletTransaction | null;
  userName: string;
  onClose: () => void;
}

export default function WalletReceiptModal({ transaction, userName, onClose }: Props) {
  if (!transaction) return null;

  const isPayment = transaction.type === "payment";
  const isTopUp = transaction.type === "topup";
  const isRefund = transaction.type === "refund";

  const typeLabel = isPayment
    ? "Thanh toán dịch vụ"
    : isTopUp
    ? "Nạp tiền vào ví"
    : "Hoàn tiền đặt lịch";

  let formattedDate = transaction.createdAt;
  try {
    const d = new Date(transaction.createdAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  } catch {
    // Keep fallback
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Biên lai giao dịch ví
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">SPORTCENTER</h4>
            <p className="text-[11px] text-slate-500">Hệ thống ví điện tử & thanh toán dịch vụ</p>
            <p className="text-[10px] text-slate-400 font-mono mt-1">Mã GD: {transaction.id}</p>
          </div>

          <div className="space-y-2 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Khách hàng:</span>
              <strong className="text-slate-900 dark:text-white">{userName}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Loại giao dịch:</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isPayment
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60"
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {isPayment ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {typeLabel}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Nội dung chi tiết:</span>
              <span className="font-medium text-right max-w-[220px] text-slate-800 dark:text-slate-200 leading-snug">
                {transaction.note || "Giao dịch ví thành viên"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Phương thức:</span>
              <span className="font-medium">{transaction.method}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Thời gian giao dịch:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Trạng thái:</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Thành công
              </span>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-900 dark:text-white">SỐ TIỀN BIẾN ĐỘNG:</span>
            <strong
              className={`text-base font-black ${
                isPayment
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isPayment ? "-" : "+"}
              {transaction.amount.toLocaleString("vi-VN")} đ
            </strong>
          </div>

          <div className="text-center pt-2 text-[10px] text-slate-400 italic">
            Biên lai điện tử có giá trị đối soát với nhân viên lễ tân và CSKH SportCenter.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Đóng biên lai
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

