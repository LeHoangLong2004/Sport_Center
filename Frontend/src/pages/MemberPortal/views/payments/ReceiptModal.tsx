import React from "react";
import { createPortal } from "react-dom";
import { Receipt, X } from "lucide-react";
import type { MemberPaymentItem } from "../../types";

interface Props {
  receiptModal: MemberPaymentItem | null;
  userName: string;
  onClose: () => void;
}

export default function ReceiptModal({ receiptModal, userName, onClose }: Props) {
  if (!receiptModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Phiếu thu điện tử
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono">
          <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">SPORTCENTER</h4>
            <p className="text-[11px] text-slate-500">Trung tâm thể thao & chăm sóc sức khỏe</p>
            <p className="text-[10px] text-slate-400 mt-1">Số: {receiptModal.id}</p>
          </div>

          <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Khách hàng:</span>
              <strong>{userName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Nội dung:</span>
              <span>{receiptModal.packageName}</span>
            </div>
            <div className="flex justify-between">
              <span>Ngày thu:</span>
              <span>{receiptModal.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span>{receiptModal.method}</span>
            </div>
            {receiptModal.referenceCode && (
              <div className="flex justify-between">
                <span>Mã tham chiếu:</span>
                <span>{receiptModal.referenceCode}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
            <span className="font-bold text-slate-900 dark:text-white">TỔNG TIỀN:</span>
            <strong className="text-emerald-600 dark:text-emerald-400 text-base">
              {receiptModal.amount.toLocaleString("vi-VN")} đ
            </strong>
          </div>

          <div className="text-center pt-3 text-[10px] text-slate-400 italic">
            Cảm ơn quý hội viên đã tin tưởng và đồng hành cùng SportCenter!
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
          >
            Đóng phiếu thu
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
