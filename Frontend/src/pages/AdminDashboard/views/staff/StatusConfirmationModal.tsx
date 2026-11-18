import React from 'react';
import { createPortal } from 'react-dom';

interface StatusConfirmationModalProps {
  confirmation: { realId: string; currentStatus: boolean } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function StatusConfirmationModal({
  confirmation,
  onClose,
  onConfirm,
}: StatusConfirmationModalProps) {
  if (!confirmation) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overscroll-contain animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-confirmation-title"
    >
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <span className="text-xl font-bold">!</span>
          </div>
          <div>
            <h2 id="status-confirmation-title" className="text-lg font-bold text-slate-900">
              Xác nhận thay đổi trạng thái
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Bạn có chắc muốn {confirmation.currentStatus ? 'khóa' : 'mở khóa'} tài khoản này không?
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

