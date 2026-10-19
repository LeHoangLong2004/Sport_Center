import React from "react";
import { createPortal } from "react-dom";
import { X, AlertCircle, Info } from "lucide-react";
import type { MemberSessionItem } from "../../types";

interface Props {
  session: MemberSessionItem | null;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirmCancel: (e: React.FormEvent) => void;
}

export default function CancelSessionModal({
  session,
  cancelReason,
  onCancelReasonChange,
  onClose,
  onConfirmCancel,
}: Props) {
  if (!session) return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Xác nhận hủy đặt chỗ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bạn có chắc chắn muốn hủy buổi tập <strong>"{session.name}"</strong> vào lúc{" "}
            <strong>{session.startTime} ({session.date})</strong> không?
          </p>
        </div>

        {/* Reason Form */}
        <form onSubmit={onConfirmCancel} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Lý do hủy lịch: <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {["Bận việc đột xuất", "Sức khỏe không tốt", "Trùng lịch cá nhân", "Đổi sang buổi khác"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onCancelReasonChange(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    cancelReason === r
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700 font-bold"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              placeholder="Nhập lý do hủy lịch của bạn..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Chính sách: Suất học sẽ được hoàn lại tự động vào gói tập của bạn và thông báo tới HLV để mở lại suất cho học viên khác.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Giữ lại lịch tập
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
            >
              Xác nhận hủy chỗ
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
