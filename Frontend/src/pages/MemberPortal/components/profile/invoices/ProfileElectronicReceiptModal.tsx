import React from "react";
import { createPortal } from "react-dom";
import { Receipt, X, FileCheck, CheckCircle2, Copy, Printer } from "lucide-react";

export interface InvoiceItem {
  id: string;
  packageName: string;
  amount: number | string;
  date: string;
  method: string;
  status: "paid" | "pending";
  referenceCode?: string;
  startDate?: string;
  endDate?: string;
}

interface Props {
  receiptModal: InvoiceItem | null;
  profile: any;
  fullName: string;
  phone: string;
  email: string;
  storedUser: any;
  onClose: () => void;
  onCopySuccess: (id: string) => void;
}

export default function ProfileElectronicReceiptModal({
  receiptModal,
  profile,
  fullName,
  phone,
  email,
  storedUser,
  onClose,
  onCopySuccess,
}: Props) {
  if (!receiptModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Receipt Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">
                PHIẾU THU ĐIỆN TỬ
              </h3>
              <p className="text-xs text-slate-300">
                SmartGym Center · Hệ thống quản lý tập luyện
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Meta details */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block mb-0.5">Mã số phiếu thu:</span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {receiptModal.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block mb-0.5">Ngày lập chứng từ:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {receiptModal.date}
              </span>
            </div>
          </div>

          {/* Customer & Center Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Khách hàng / Hội viên
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {profile?.fullName || fullName || storedUser?.fullName || storedUser?.name || "Hội viên"}
              </p>
              <p className="text-slate-500">
                {profile?.phone || phone || storedUser?.phoneNumber || storedUser?.phone || "Chưa cập nhật"}
              </p>
              <p className="text-slate-500">
                {profile?.email || email || storedUser?.email || "Chưa cập nhật"}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Đơn vị thụ hưởng
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                SmartGym Sports Complex
              </p>
              <p className="text-slate-500">MST: 0316889922</p>
              <p className="text-slate-500">Hotline: 1900 6868</p>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Khoản thu dịch vụ</th>
                  <th className="py-2.5 px-3 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {receiptModal.packageName}
                    </p>
                    {receiptModal.startDate && (
                      <p className="text-[11px] text-slate-400">
                        Thời hạn hiệu lực: {receiptModal.startDate} - {receiptModal.endDate}
                      </p>
                    )}
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Hình thức: {receiptModal.method}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                    {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 dark:bg-slate-850 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    TỔNG CỘNG THANH TOÁN (ĐÃ VAT):
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 text-base font-black">
                    {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Electronic Stamp */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                  XÁC NHẬN ĐÃ THU TIỀN THÀNH CÔNG
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Ký số điện tử bởi Ban Tài chính SmartGym
                </p>
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        {/* Receipt Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(receiptModal.id);
              onCopySuccess(receiptModal.id);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Sao chép mã
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            In phiếu thu
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
