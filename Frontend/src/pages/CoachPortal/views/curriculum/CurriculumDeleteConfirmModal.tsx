import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";

interface CurriculumDeleteConfirmModalProps {
  planName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const CurriculumDeleteConfirmModal: React.FC<CurriculumDeleteConfirmModalProps> = ({
  planName,
  isDeleting,
  onCancel,
  onConfirm,
}) => createPortal(
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isDeleting) onCancel();
    }}
  >
    <section
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-plan-title"
      aria-describedby="delete-plan-description"
      className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in zoom-in-95 duration-150"
    >
      <header className="flex items-start gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="delete-plan-title" className="text-base font-bold text-slate-900 dark:text-white">Xóa kế hoạch tập luyện?</h2>
          <p className="mt-1 break-words text-sm font-semibold text-slate-700 dark:text-slate-300">{planName}</p>
        </div>
        <button type="button" onClick={onCancel} disabled={isDeleting} aria-label="Đóng" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="p-5">
        <p id="delete-plan-description" className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Kế hoạch sẽ bị xóa vĩnh viễn khỏi thư viện. Kế hoạch đã giao cho học viên hoặc đang được dùng làm bản gốc sẽ được hệ thống giữ lại để bảo toàn lịch sử.
        </p>
      </div>

      <footer className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/30">
        <button type="button" onClick={onCancel} disabled={isDeleting} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
          Hủy
        </button>
        <button type="button" onClick={onConfirm} disabled={isDeleting} className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-wait disabled:opacity-70">
          {isDeleting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {isDeleting ? "Đang xóa..." : "Xóa kế hoạch"}
        </button>
      </footer>
    </section>
  </div>,
  document.body
);
