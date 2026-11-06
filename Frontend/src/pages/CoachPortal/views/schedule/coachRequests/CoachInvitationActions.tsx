import React from "react";
import { Check, X, Loader2 } from "lucide-react";

interface CoachInvitationActionsProps {
  invitationId: string;
  isProcessing: boolean;
  isDeclineInputVisible: boolean;
  declineReason: string;
  onSetDeclineReason: (id: string, reason: string) => void;
  onSetShowDeclineInput: (id: string | null) => void;
  onAction: (id: string, action: "accept" | "reject") => void;
}

export function CoachInvitationActions({
  invitationId,
  isProcessing,
  isDeclineInputVisible,
  declineReason,
  onSetDeclineReason,
  onSetShowDeclineInput,
  onAction,
}: CoachInvitationActionsProps) {
  if (isDeclineInputVisible) {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Nhập lý do từ chối (không bắt buộc)..."
          value={declineReason}
          onChange={(e) => onSetDeclineReason(invitationId, e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500"
          autoFocus
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAction(invitationId, "reject")}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
            Xác nhận từ chối
          </button>
          <button
            type="button"
            onClick={() => onSetShowDeclineInput(null)}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        disabled={isProcessing}
        onClick={() => onAction(invitationId, "accept")}
        className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shadow-orange-600/20 cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        Chấp nhận dạy thay
      </button>

      <button
        type="button"
        disabled={isProcessing}
        onClick={() => onSetShowDeclineInput(invitationId)}
        className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <X className="w-3.5 h-3.5" />
        Từ chối
      </button>
    </div>
  );
}
