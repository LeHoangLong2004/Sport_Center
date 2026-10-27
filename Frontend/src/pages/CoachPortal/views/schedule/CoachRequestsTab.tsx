import { useState } from "react";
import { Plus, Check, Inbox, Send } from "lucide-react";
import { toast } from "sonner";
import type { ScheduleChangeRequest, SubstituteInvitation } from "../../services/api";
import { CoachInvitationsList } from "./coachRequests/CoachInvitationsList";
import { CoachOwnRequestsList } from "./coachRequests/CoachOwnRequestsList";

interface Props {
  requests: ScheduleChangeRequest[];
  invitations?: SubstituteInvitation[];
  onOpenCreateRequest: () => void;
  onRespondInvitation?: (id: string, action: "accept" | "reject", note?: string) => Promise<void>;
}

export default function CoachRequestsTab({
  requests,
  invitations = [],
  onOpenCreateRequest,
  onRespondInvitation,
}: Props) {
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "pending" || inv.status === "waiting_substitute",
  );

  const [activeSubTab, setActiveSubTab] = useState<"invitations" | "my_requests">(
    pendingInvitations.length > 0 ? "invitations" : "my_requests",
  );

  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<Record<string, string>>({});
  const [showDeclineInput, setShowDeclineInput] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    if (!onRespondInvitation) return;
    setRespondingId(id);
    setFeedback(null);
    try {
      const note = declineReason[id] || "";
      await onRespondInvitation(id, action, note);
      const msg =
        action === "accept"
          ? "Bạn đã đồng ý nhận dạy thay ca này! Lớp học đã được cập nhật."
          : "Bạn đã từ chối lời mời dạy thay.";
      setFeedback(msg);
      if (action === "accept") {
        toast.success(msg);
      } else {
        toast.info(msg);
      }
      setShowDeclineInput(null);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      const errMsg = err?.message || "Có lỗi xảy ra khi xử lý lời mời.";
      setFeedback(errMsg);
      toast.error(errMsg);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveSubTab("invitations")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "invitations"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Lời mời dạy thay</span>
            {pendingInvitations.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                {pendingInvitations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("my_requests")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeSubTab === "my_requests"
                ? "bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Yêu cầu của tôi ({requests.length})</span>
          </button>
        </div>

        {activeSubTab === "my_requests" && (
          <button
            type="button"
            onClick={onOpenCreateRequest}
            className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tạo yêu cầu mới
          </button>
        )}
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Lời mời dạy thay gửi đến tôi */}
      {activeSubTab === "invitations" && (
        <CoachInvitationsList
          invitations={invitations}
          respondingId={respondingId}
          declineReason={declineReason}
          showDeclineInput={showDeclineInput}
          onRespondInvitation={onRespondInvitation}
          onSetDeclineReason={(id, reason) => setDeclineReason((prev) => ({ ...prev, [id]: reason }))}
          onSetShowDeclineInput={setShowDeclineInput}
          onAction={handleAction}
        />
      )}

      {/* 2. Yêu cầu của chính Coach */}
      {activeSubTab === "my_requests" && (
        <CoachOwnRequestsList requests={requests} />
      )}
    </div>
  );
}
