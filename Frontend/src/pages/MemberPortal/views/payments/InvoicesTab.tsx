import React from "react";
import { Receipt, CheckCircle2, Clock, PlusCircle } from "lucide-react";
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
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="p-4 font-mono font-semibold text-slate-900 dark:text-white">
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
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                      }`}
                    >
                      {p.status === "paid" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã thanh toán
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
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
        </div>
      )}
    </div>
  );
}
