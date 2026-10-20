import React from "react";
import { createPortal } from "react-dom";
import { X, Building } from "lucide-react";
import type { MemberPaymentItem } from "../../types";

interface Props {
  activePaymentModal: MemberPaymentItem | null;
  bankMethod: "Chuyển khoản" | "Tiền mặt tại quầy";
  onBankMethodChange: (method: "Chuyển khoản" | "Tiền mặt tại quầy") => void;
  refCode: string;
  onRefCodeChange: (code: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ReportPaymentModal({
  activePaymentModal,
  bankMethod,
  onBankMethodChange,
  refCode,
  onRefCodeChange,
  onClose,
  onSubmit,
}: Props) {
  if (!activePaymentModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {activePaymentModal.id}
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Thông tin thanh toán đơn hàng
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-2 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                Ngân hàng Quân Đội (MB Bank)
              </span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-lg font-mono font-bold tracking-widest text-white">
              0903 8888 6868
            </div>
            <div className="text-[11px] text-slate-300">
              Chủ TK:{" "}
              <span className="font-semibold text-white">
                TRUNG TAM THE THAO SPORTCENTER
              </span>
            </div>
            <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Số tiền:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {activePaymentModal.amount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Nội dung CK:</span>
              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">
                {activePaymentModal.id}
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Phương thức thanh toán:
            </label>
            <select
              value={bankMethod}
              onChange={(e) => onBankMethodChange(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="Chuyển khoản">Chuyển khoản Ngân hàng (QR / App)</option>
              <option value="Tiền mặt tại quầy">Tiền mặt tại quầy Lễ tân</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Mã giao dịch / Ghi chú đối soát:
            </label>
            <input
              type="text"
              value={refCode}
              onChange={(e) => onRefCodeChange(e.target.value)}
              placeholder="VD: MB-889921 hoặc Đã chuyển khoản sáng nay"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-colors shadow-xs"
            >
              Xác nhận đã thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
