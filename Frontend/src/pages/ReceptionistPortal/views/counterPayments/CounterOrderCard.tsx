import React from "react";
import { Check, Printer } from "lucide-react";
import type { PackageOrder } from "../../../../services/packageApi";

interface Props {
  order: PackageOrder;
  processingId: string | null;
  onOpenConfirm: (order: PackageOrder) => void;
  onOpenReceipt: (order: PackageOrder) => void;
  onCancelOrder: (order: PackageOrder) => void;
  formatMoney: (value: number) => string;
}

export default function CounterOrderCard({
  order,
  processingId,
  onOpenConfirm,
  onOpenReceipt,
  onCancelOrder,
  formatMoney,
}: Props) {
  const isPending = order.status === "pending";
  const isPaid = order.status === "paid";

  return (
    <div
      className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between shadow-sm transition-all hover:shadow-md ${
        isPending
          ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-950"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Customer & Order info */}
      <div className="flex items-start gap-4 min-w-0 flex-1">
        <div
          className={`size-12 rounded-2xl font-black text-lg flex items-center justify-center shrink-0 ${
            order.packageSnapshot?.category === "class"
              ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
              : "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300"
          }`}
        >
          {order.packageSnapshot?.category === "class"
            ? "🎫"
            : order.userName?.slice(0, 1).toUpperCase() || "H"}
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              {order.userName || "Hội viên"}
            </span>
            {order.userPhone && (
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                📞 {order.userPhone}
              </span>
            )}
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isPending
                  ? "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                  : isPaid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-rose-50 text-rose-800 border-rose-300"
              }`}
            >
              {isPending
                ? "⏳ Chờ thu tiền tại quầy"
                : isPaid
                ? "✓ Đã thanh toán"
                : "✕ Đã hủy"}
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mã đơn:{" "}
            <strong className="font-mono text-slate-700 dark:text-slate-300">
              #{order.id.slice(0, 8).toUpperCase()}
            </strong>
            {order.userEmail && ` • ${order.userEmail}`}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-semibold px-2 py-0.5 rounded-md border ${
                order.packageSnapshot?.category === "class"
                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                  : "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
              }`}
            >
              {order.packageSnapshot?.category === "class"
                ? `${order.packageSnapshot?.name || "Lớp học"}`
                : `${order.packageSnapshot?.name || "Gói tập"} • ${order.durationMonths} tháng`}
            </span>
            {order.packageSnapshot?.category === "class" && (
              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                Vé lớp học
              </span>
            )}
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">
              Tạo lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </span>
            {order.paidAt && (
              <span className="text-emerald-600 font-medium">
                (Đã thu: {new Date(order.paidAt).toLocaleString("vi-VN")})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-end gap-4 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
        <div className="text-left lg:text-right">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Số tiền cần thu
          </p>
          <p className="text-xl font-extrabold text-teal-600 dark:text-teal-400">
            {formatMoney(order.total)}
          </p>
          {order.discountAmount > 0 && (
            <p className="text-[11px] text-emerald-600 font-semibold">
              Đã giảm {formatMoney(order.discountAmount)}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isPending ? (
            <>
              <button
                type="button"
                disabled={processingId === order.id}
                onClick={() => onOpenConfirm(order)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>
                  {order.packageSnapshot?.category === "class"
                    ? "Thu tiền & Vào lớp"
                    : "Thu tiền & Kích hoạt"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onOpenReceipt(order)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="In phiếu hẹn"
              >
                <Printer className="w-4 h-4" />
                <span>Phiếu hẹn</span>
              </button>

              <button
                type="button"
                disabled={processingId === order.id}
                onClick={() => onCancelOrder(order)}
                className="px-3 py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs transition-all cursor-pointer"
                title="Hủy đơn quá hạn hoặc khách đổi ý"
              >
                Hủy đơn
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onOpenReceipt(order)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In biên nhận</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
