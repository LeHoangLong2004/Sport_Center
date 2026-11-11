import React, { useState, useMemo } from "react";
import {
  Wallet,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const totalPages = Math.max(1, Math.ceil(transactions.length / ITEMS_PER_PAGE));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return transactions.slice(start, start + ITEMS_PER_PAGE);
  }, [transactions, page]);

  const fromIndex = transactions.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const toIndex = Math.min(page * ITEMS_PER_PAGE, transactions.length);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4" />
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
              {paginatedTransactions.map((tx) => {
                const isPending = tx.status === "pending";
                const isPayment = tx.type === "payment";
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">
                      {tx.id}
                    </td>
                    <td className="p-4">
                      {isPayment ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <ArrowUpRight className="w-3 h-3" />
                          Thanh toán dịch vụ
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300">
                          <Clock className="w-3 h-3 text-slate-600" />
                          Chờ nạp tại quầy
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <ArrowDownLeft className="w-3 h-3" />
                          Nạp tiền vào ví
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-4 font-bold ${
                        isPayment
                          ? "text-rose-600 dark:text-rose-400"
                          : isPending
                          ? "text-slate-600 dark:text-slate-400"
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-50 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                          <Clock className="w-3 h-3 text-slate-600 animate-pulse" />
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
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/60 text-slate-800 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-800 cursor-pointer transition-colors"
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

          {/* Pagination Bar */}
          {transactions.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Hiển thị{" "}
                <strong className="text-slate-800 dark:text-slate-200">{fromIndex} - {toIndex}</strong>{" "}
                trên tổng số{" "}
                <strong className="text-slate-800 dark:text-slate-200">{transactions.length}</strong> giao dịch
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5 select-none">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={`flex items-center justify-center size-8 rounded-lg border text-xs transition cursor-pointer ${
                      page === 1
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="Trang trước"
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                      if (p === 2 || p === totalPages - 1) {
                        return (
                          <span key={p} className="px-1 text-slate-400 text-xs font-bold">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                    const isActive = p === page;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`flex items-center justify-center size-8 rounded-lg border text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={`flex items-center justify-center size-8 rounded-lg border text-xs transition cursor-pointer ${
                      page === totalPages
                        ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="Trang sau"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
