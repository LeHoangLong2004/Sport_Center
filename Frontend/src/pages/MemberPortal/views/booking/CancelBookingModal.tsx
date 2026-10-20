import React from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X } from "lucide-react";

interface CancelBookingModalProps {
  cancelTarget: { classId: string; className: string } | null;
  onClose: () => void;
  onConfirmCancel: (classId: string) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  cancelTarget,
  onClose,
  onConfirmCancel
}) => {
  if (!cancelTarget) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Xác nhận hủy đặt lớp
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có chắc chắn muốn hủy chỗ tại lớp học này không?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-slate-200">
            {cancelTarget.className}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
          >
            Giữ lại lịch
          </button>
          <button
            type="button"
            onClick={() => onConfirmCancel(cancelTarget.classId)}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-500"
          >
            Xác nhận hủy
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
