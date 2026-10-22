import React from "react";
import { X, Banknote, CreditCard, QrCode, ShieldCheck, RefreshCw, Check } from "lucide-react";
import type { PackageOrder } from "../../../../services/packageApi";

export type PaymentOption = "counter" | "card" | "qr";

interface Props {
  confirmOrder: PackageOrder | null;
  selectedPayMethod: PaymentOption;
  processingId: string | null;
  onSelectPayMethod: (method: PaymentOption) => void;
  onClose: () => void;
  onConfirm: () => void;
  formatMoney: (value: number) => string;
}

export default function CounterConfirmModal({
  confirmOrder,
  selectedPayMethod,
  processingId,
  onSelectPayMethod,
  onClose,
  onConfirm,
  formatMoney,
}: Props) {
  if (!confirmOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
              💰
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Xác nhận thu tiền tại quầy
              </h3>
              <p className="text-xs text-slate-500">
                Mã đơn: #{confirmOrder.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order details summary */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Khách hàng:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {confirmOrder.userName} ({confirmOrder.userPhone || "Chưa có SĐT"})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Gói đăng ký:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {confirmOrder.packageSnapshot?.name} ({confirmOrder.durationMonths} tháng)
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-2 text-sm">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Tổng tiền cần thu:
            </span>
            <strong className="font-black text-teal-600 dark:text-teal-400 text-lg">
              {formatMoney(confirmOrder.total)}
            </strong>
          </div>
        </div>

        {/* Payment method selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Hình thức khách hàng thanh toán tại quầy:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSelectPayMethod("counter")}
              className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedPayMethod === "counter"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold ring-2 ring-purple-600/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-semibold">Tiền mặt</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectPayMethod("card")}
              className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedPayMethod === "card"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold ring-2 ring-purple-600/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold">Quẹt thẻ POS</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectPayMethod("qr")}
              className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedPayMethod === "qr"
                  ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold ring-2 ring-purple-600/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
              }`}
            >
              <QrCode className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-semibold">Mã VNPAY QR</span>
            </button>
          </div>
        </div>

        {selectedPayMethod === "qr" && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="w-20 h-auto bg-white p-1 rounded-lg border border-slate-200 shrink-0 shadow-2xs">
              <img src="/vnpay_qr.png" alt="Mã VNPAY QR" className="w-full h-auto object-contain rounded" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-slate-900 dark:text-white">Ví VNPAY: <span className="font-mono text-purple-600">0815353732</span></p>
              <p className="text-[11px] text-slate-500">Chủ ví: <strong>Khách hàng 0815353732</strong></p>
              <p className="text-[11px] text-emerald-600 font-semibold">Đưa mã này cho khách hàng quét bằng App VNPAY hoặc App Ngân hàng.</p>
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            Khi bấm <strong>"Xác nhận đã nhận tiền"</strong>, quyền lợi gói tập sẽ lập tức kích hoạt cho hội viên. Hệ thống tự động cập nhật hóa đơn.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={processingId === confirmOrder.id}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {processingId === confirmOrder.id ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang kích hoạt...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Xác nhận đã nhận tiền & Kích hoạt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
