import React, { useState, useMemo } from "react";
import { Receipt, CheckCircle2, Clock, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { MemberPaymentItem, MemberScreen } from "../../types";

interface Props {
  loading: boolean;
  payments: MemberPaymentItem[];
  onNavigate: (screen: MemberScreen) => void;
  onOpenReportPayment: (p: MemberPaymentItem) => void;
  onOpenReceipt: (p: MemberPaymentItem) => void;
}

export default function InvoicesTab({
  loading,
  payments,
  onNavigate,
  onOpenReportPayment,
  onOpenReceipt,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return payments.slice(start, start + ITEMS_PER_PAGE);
  }, [payments, page]);

  const fromIndex = payments.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0;
  const toIndex = Math.min(page * ITEMS_PER_PAGE, payments.length);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Lịch sử đơn hàng & Hóa đơn ({payments.length})
        </h3>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Đang tải lịch sử giao dịch...
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center">
          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Chưa có hóa đơn hoặc đơn hàng nào
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Khi bạn đăng ký các gói tập luyện, thuê tủ đồ hoặc dịch vụ tại SportCenter, thông tin thanh toán sẽ được lưu trữ tự động tại đây.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("packages")}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Khám phá gói tập</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4">Mã hóa đơn</th>
                <th className="p-4">Gói dịch vụ</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Hình thức</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedPayments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="p-4 font-semibold text-slate-900 dark:text-white">
                    {p.id}
                  </td>
                  <td className="p-4 font-medium">{p.packageName}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {p.amount.toLocaleString("vi-VN")} đ
                  </td>
                  <td className="p-4 text-slate-500">{p.date}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {p.method}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === "paid"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-slate-100 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {p.status === "paid" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Đã thanh toán
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-600" />
                          Chờ thanh toán
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {p.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => onOpenReportPayment(p)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Báo thanh toán
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(p)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                        <span>Xem phiếu thu</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {payments.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Hiển thị{" "}
                <strong className="text-slate-800 dark:text-slate-200">{fromIndex} - {toIndex}</strong>{" "}
                trên tổng số{" "}
                <strong className="text-slate-800 dark:text-slate-200">{payments.length}</strong> hóa đơn
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
