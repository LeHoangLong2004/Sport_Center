import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2, Calendar, MapPin, Dumbbell } from "lucide-react";
import type { CoachClassProposal } from "../../services/types";

interface Props {
  proposal: CoachClassProposal | null;
  isOpen: boolean;
  isWithdrawing: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function ConfirmWithdrawProposalModal({
  proposal,
  isOpen,
  isWithdrawing,
  onClose,
  onConfirm,
}: Props) {
  if (!isOpen || !proposal) return null;

  let formattedDate = proposal.scheduleTime;
  try {
    const d = new Date(proposal.scheduleTime);
    if (!isNaN(d.getTime())) {
      const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = days[d.getDay()];
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      formattedDate = `${dayName}, ${dateStr} lúc ${timeStr} (${proposal.durationMinutes} phút)`;
    }
  } catch {
    // fallback to raw
  }

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Thu hồi đề xuất mở lớp
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Xác nhận hủy đề xuất đang chờ phê duyệt
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Bạn có chắc chắn muốn thu hồi đề xuất mở lớp học này? Sau khi thu hồi, đề xuất sẽ bị hủy bỏ và không còn hiển thị chờ Ban Quản lý duyệt nữa.
          </p>

          {/* Proposal Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {proposal.className}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shrink-0">
                Chờ duyệt
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Bộ môn: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{proposal.sportName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Địa điểm: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{proposal.facilityName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Lịch học: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{formattedDate}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/40 dark:bg-slate-850">
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={() => onConfirm(proposal.id)}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang thu hồi...</span>
              </>
            ) : (
              <span>Xác nhận thu hồi</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
