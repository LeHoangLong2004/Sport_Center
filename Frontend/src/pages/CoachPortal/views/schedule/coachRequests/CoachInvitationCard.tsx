import React from "react";
import { User, Calendar, MapPin, Clock } from "lucide-react";
import type { SubstituteInvitation } from "../../../services/api";
import { INVITATION_STATUS_BADGE } from "../types";
import { CoachInvitationActions } from "./CoachInvitationActions";

interface CoachInvitationCardProps {
  invitation: SubstituteInvitation;
  isProcessing: boolean;
  isDeclineInputVisible: boolean;
  declineReason: string;
  onRespondInvitation?: (id: string, action: "accept" | "reject", note?: string) => Promise<void>;
  onSetDeclineReason: (id: string, reason: string) => void;
  onSetShowDeclineInput: (id: string | null) => void;
  onAction: (id: string, action: "accept" | "reject") => void;
}

export function CoachInvitationCard({
  invitation: inv,
  isProcessing,
  isDeclineInputVisible,
  declineReason,
  onRespondInvitation,
  onSetDeclineReason,
  onSetShowDeclineInput,
  onAction,
}: CoachInvitationCardProps) {
  const isPending =
    inv.status === "pending" || inv.status === "waiting_substitute";
  const badge = INVITATION_STATUS_BADGE[inv.status] || {
    label: inv.status,
    bg: "bg-slate-100",
    text: "text-slate-600",
  };

  return (
    <div
      className={`p-5 bg-white dark:bg-slate-900 border rounded-xl flex flex-col gap-4 shadow-xs transition-all ${
        isPending
          ? "border-orange-300 dark:border-orange-900/50 ring-1 ring-orange-200/50 dark:ring-orange-950/50"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          {/* Header row: Class name, Request Type, Status Badge */}
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

          {/* Details Grid */}
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

          {/* Handover reason */}
          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Lời nhắn / Lý do bàn giao:
            </span>{" "}
            <span className="italic text-slate-600 dark:text-slate-400">
              "{inv.reason}"
            </span>
          </div>

          {/* Management / System note */}
          {inv.managerNote && (
            <div className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Phản hồi hệ thống/quản lý: {inv.managerNote}
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      {isPending && onRespondInvitation && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <CoachInvitationActions
            invitationId={inv.id}
            isProcessing={isProcessing}
            isDeclineInputVisible={isDeclineInputVisible}
            declineReason={declineReason}
            onSetDeclineReason={onSetDeclineReason}
            onSetShowDeclineInput={onSetShowDeclineInput}
            onAction={onAction}
          />
        </div>
      )}
    </div>
  );
}
