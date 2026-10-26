import React from "react";
import { X, Printer } from "lucide-react";
import type { PackageOrder } from "../../../../services/packageApi";

interface Props {
  receiptOrder: PackageOrder | null;
  onClose: () => void;
  formatMoney: (value: number) => string;
}

export default function CounterReceiptModal({
  receiptOrder,
  onClose,
  formatMoney,
}: Props) {
  React.useEffect(() => {
    if (!receiptOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [receiptOrder, onClose]);

  if (!receiptOrder) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Phiếu thu SportCenter
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt printable container */}
        <div
          id="printable-receipt"
          className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col gap-4 text-xs font-mono"
        >
          <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <p className="font-extrabold text-base font-sans text-slate-900 dark:text-white">
              SPORTCENTER FITNESS
            </p>
            <p className="text-[10px] text-slate-500">
              Trung tâm thể thao & thể hình cao cấp
            </p>
            <p className="text-[10px] text-slate-500">Hotline: 1900 6868</p>
          </div>

          <div className="flex flex-col gap-1.5 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Mã phiếu:</span>
              <strong className="text-slate-900 dark:text-white">
                #{receiptOrder.id.slice(0, 8).toUpperCase()}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Ngày in:</span>
              <span>{new Date().toLocaleString("vi-VN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <span className="font-bold">{receiptOrder.userName}</span>
            </div>
            {receiptOrder.userPhone && (
              <div className="flex justify-between">
                <span>Số điện thoại:</span>
                <span>{receiptOrder.userPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Trạng thái:</span>
              <span className="font-bold uppercase text-teal-600">
                {receiptOrder.status === "paid"
                  ? "ĐÃ THANH TOÁN"
                  : "CHỜ THANH TOÁN TẠI QUẦY"}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-300 dark:border-slate-700 pt-3 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span>{receiptOrder.packageSnapshot?.name}</span>
              <span>{formatMoney(receiptOrder.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Kỳ hạn:</span>
              <span>{receiptOrder.durationMonths} tháng</span>
            </div>
            {receiptOrder.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Ưu đãi giảm giá:</span>
                <span>-{formatMoney(receiptOrder.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-dashed border-slate-300 dark:border-slate-700 pt-2 text-sm font-bold text-slate-900 dark:text-white">
              <span>TỔNG THANH TOÁN:</span>
              <span className="text-teal-600 font-extrabold">
                {formatMoney(receiptOrder.total)}
              </span>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
            Cảm ơn quý khách đã tin tưởng và đồng hành cùng SportCenter!
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In phiếu ra máy in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
