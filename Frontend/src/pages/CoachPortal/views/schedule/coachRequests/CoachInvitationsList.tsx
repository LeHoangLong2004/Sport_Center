import React from "react";
import { Inbox } from "lucide-react";
import type { SubstituteInvitation } from "../../../services/api";
import { CoachInvitationCard } from "./CoachInvitationCard";

interface CoachInvitationsListProps {
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
}: CoachInvitationsListProps) {
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
      {invitations.map((inv) => (
        <CoachInvitationCard
          key={inv.id}
          invitation={inv}
          isProcessing={respondingId === inv.id}
          isDeclineInputVisible={showDeclineInput === inv.id}
          declineReason={declineReason[inv.id] || ""}
          onRespondInvitation={onRespondInvitation}
          onSetDeclineReason={onSetDeclineReason}
          onSetShowDeclineInput={onSetShowDeclineInput}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
