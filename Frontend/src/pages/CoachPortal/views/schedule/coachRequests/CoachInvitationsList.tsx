import React from "react";
import {
  Inbox,
  User,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Check,
  X,
} from "lucide-react";
import type { SubstituteInvitation } from "../../../services/api";
import { INVITATION_STATUS_BADGE } from "../types";

interface Props {
  invitations: SubstituteInvitation[];
  respondingId: string | null;
  declineReason: Record<string, string>;
  showDeclineInput: string | null;
  onRespondInvitation?: (id: string, action: "accept" | "reject", note?: string) => Promise<void>;
  onSetDeclineReason: (id: string, reason: string) => void;
  onSetShowDeclineInput: (id: string | null) => void;
  onAction: (id: string, action: "accept" | "reject") => void;
}

export function CoachInvitationsList({
  invitations,
  respondingId,
  declineReason,
  showDeclineInput,
  onRespondInvitation,
  onSetDeclineReason,
  onSetShowDeclineInput,
  onAction,
}: Props) {
  if (invitations.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
        Bạn chưa có lời mời dạy thay nào từ đồng nghiệp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {invitations.map((inv) => {
        const isPending =
          inv.status === "pending" || inv.status === "waiting_substitute";
        const badge = INVITATION_STATUS_BADGE[inv.status] || {
          label: inv.status,
          bg: "bg-slate-100",
          text: "text-slate-600",
        };
        const isProcessing = respondingId === inv.id;

        return (
          <div
            key={inv.id}
            className={`p-5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-4 shadow-xs transition-all ${
              isPending
                ? "border-orange-300 dark:border-orange-900/50 ring-1 ring-orange-200/50 dark:ring-orange-950/50"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-base">
                    {inv.className}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 uppercase">
                    {inv.requestType}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      HLV nhờ dạy:{" "}
                      <strong className="text-slate-800 dark:text-slate-100 font-semibold">
                        {inv.coachName}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Thời gian ca:{" "}
                      <strong className="text-slate-800 dark:text-slate-100 font-semibold">
                        {inv.scheduleTime || `${inv.newDate} ${inv.newTime}`}
                      </strong>
                      {inv.durationMinutes > 0 && ` (${inv.durationMinutes}p)`}
                    </span>
                  </div>

                  {inv.facilityName && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Địa điểm:{" "}
                        <strong className="text-slate-800 dark:text-slate-100">
                          {inv.facilityName}
                        </strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Gửi lúc: {inv.createdAt}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Lời nhắn / Lý do bàn giao:
                  </span>{" "}
                  <span className="italic text-slate-600 dark:text-slate-400">
                    "{inv.reason}"
                  </span>
                </div>

                {inv.managerNote && (
                  <div className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Phản hồi hệ thống/quản lý: {inv.managerNote}
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Coach B */}
            {isPending && onRespondInvitation && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                {showDeclineInput === inv.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Nhập lý do từ chối (không bắt buộc)..."
                      value={declineReason[inv.id] || ""}
                      onChange={(e) => onSetDeclineReason(inv.id, e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => onAction(inv.id, "reject")}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                        Xác nhận từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => onSetShowDeclineInput(null)}
                        className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => onAction(inv.id, "accept")}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
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
                      onClick={() => onSetShowDeclineInput(inv.id)}
                      className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
