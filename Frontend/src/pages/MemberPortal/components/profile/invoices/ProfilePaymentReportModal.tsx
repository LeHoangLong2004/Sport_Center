import React from "react";
import { createPortal } from "react-dom";
import { Building, X, Copy } from "lucide-react";
import type { InvoiceItem } from "./ProfileElectronicReceiptModal";

interface Props {
  activePaymentReportModal: InvoiceItem | null;
  profile: any;
  phone: string;
  storedUser: any;
  reportBankMethod: string;
  onReportBankMethodChange: (method: string) => void;
  reportRefCode: string;
  onReportRefCodeChange: (code: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfilePaymentReportModal({
  activePaymentReportModal,
  profile,
  phone,
  storedUser,
  reportBankMethod,
  onReportBankMethodChange,
  reportRefCode,
  onReportRefCodeChange,
  onClose,
  onSubmit,
}: Props) {
  if (!activePaymentReportModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Thông tin chuyển khoản & Báo thanh toán
              </h3>
              <p className="text-xs text-slate-400">
                Hóa đơn: {activePaymentReportModal.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Bank info box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
              <div className="flex justify-between items-center text-slate-500">
                <span>Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  MB Bank (Ngân hàng Quân Đội)
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    0903 8888 6868
                  </span>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText("090388886868")}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Tên tài khoản:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  SMART GYM SPORTS CENTER
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>Số tiền thanh toán:</span>
                <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                  {(Number(activePaymentReportModal.amount) || 0).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Nội dung chuyển khoản (bắt buộc):</span>
                <span className="font-mono font-bold bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600">
                  {activePaymentReportModal.id}{" "}
                  {profile?.phone || phone || storedUser?.phoneNumber || storedUser?.phone || ""}
                </span>
              </div>
            </div>

            {/* Form fields */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Phương thức thực hiện:
              </label>
              <select
                value={reportBankMethod}
                onChange={(e) => onReportBankMethodChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="Chuyển khoản QR">Chuyển khoản Ví VNPAY / QR (0815353732)</option>
                <option value="Thanh toán trực tiếp">Nộp tiền mặt tại Quầy Lễ tân</option>
                <option value="Thẻ tín dụng / POS">Quẹt thẻ POS tại quầy</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Mã giao dịch ngân hàng / Ghi chú đối soát:
              </label>
              <input
                type="text"
                placeholder="VD: MB-889922 hoặc mã giao dịch trên biên lai..."
                value={reportRefCode}
                onChange={(e) => onReportRefCodeChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Nhập mã giao dịch để kế toán đối soát và kích hoạt gói nhanh nhất.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors cursor-pointer"
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
