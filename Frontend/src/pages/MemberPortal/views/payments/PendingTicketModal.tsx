import React from "react";
import { createPortal } from "react-dom";
import { Clock, X, Building } from "lucide-react";
import type { WalletTransaction } from "../../services/walletService";

interface Props {
  pendingTicketModal: WalletTransaction | null;
  confirmingPending: boolean;
  onClose: () => void;
  onConfirmPendingTicket: (txId: string) => void;
}

export default function PendingTicketModal({
  pendingTicketModal,
  confirmingPending,
  onClose,
  onConfirmPendingTicket,
}: Props) {
  if (!pendingTicketModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Phiếu nạp tiền tại quầy
              </h4>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                Đang chờ thanh toán • Chưa cộng ví
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Số tiền cần thanh toán
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {pendingTicketModal.amount.toLocaleString("vi-VN")} đ
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between mt-2">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">
                  Mã phiếu nạp
                </span>
                <span className="text-base font-mono font-bold text-emerald-600">
                  {pendingTicketModal.id}
                </span>
              </div>
              <div className="p-1 bg-white rounded-lg border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                    pendingTicketModal.id
                  )}`}
                  alt="QR Code"
                  className="w-14 h-14 object-contain"
                />
              </div>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl p-3 text-[11px] text-amber-800 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Hướng dẫn tại quầy Lễ tân:</span>
            </div>
            <p>
              Đến quầy Lễ tân / Thu ngân SportCenter (Tầng 1), xuất trình mã phiếu hoặc mã QR trên để thanh toán tiền mặt. Sau khi thu ngân xác nhận, tiền sẽ được kích hoạt vào ví.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Đóng phiếu nạp
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
