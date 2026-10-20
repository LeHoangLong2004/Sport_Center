import React from "react";
import {
  Wallet,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import type { WalletTransaction } from "../../services/walletService";

interface Props {
  balance: number;
  transactions: WalletTransaction[];
  onOpenTopUp: () => void;
  onOpenPendingTicket: (tx: WalletTransaction) => void;
}

export default function WalletTransactionsTab({
  balance,
  transactions,
  onOpenTopUp,
  onOpenPendingTicket,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-500" />
          Lịch sử nạp & biến động số dư ví
        </h3>
        <span className="text-xs text-slate-500">
          Tổng số dư:{" "}
          <strong className="text-emerald-600">
            {balance.toLocaleString("vi-VN")} đ
          </strong>
        </span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có giao dịch ví nào
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Khi bạn nạp tiền hoặc thanh toán dịch vụ bằng ví, lịch sử biến động số dư sẽ hiển thị chi tiết tại đây.
          </p>
          <button
            type="button"
            onClick={onOpenTopUp}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nạp tiền ngay</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Mã giao dịch</th>
                <th className="p-4">Loại giao dịch</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {transactions.map((tx) => {
                const isPending = tx.status === "pending";
                const isPayment = tx.type === "payment";
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">
                      {tx.id}
                    </td>
                    <td className="p-4">
                      {isPayment ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          Thanh toán dịch vụ
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Chờ nạp tại quầy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          Nạp tiền vào ví
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-4 font-bold ${
                        isPayment
                          ? "text-rose-600 dark:text-rose-400"
                          : isPending
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isPayment ? "-" : "+"}
                      {tx.amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {tx.method}
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">
                      {tx.note}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(tx.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                          Chờ tại quầy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Thành công
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => onOpenPendingTicket(tx)}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800 cursor-pointer transition-colors"
                        >
                          Xem phiếu
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
