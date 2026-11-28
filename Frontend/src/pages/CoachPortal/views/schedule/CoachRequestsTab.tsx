import { useState, useEffect } from "react";
import { Plus, Inbox, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  CoachAPI,
  type ScheduleChangeRequest,
  type SubstituteInvitation,
  type CoachClassProposal,
} from "../../services/api";
import { CoachInvitationsList } from "./coachRequests/CoachInvitationsList";
import { CoachOwnRequestsList } from "./coachRequests/CoachOwnRequestsList";
import { CoachClassProposalsList } from "./coachRequests/CoachClassProposalsList";
import { ConfirmWithdrawProposalModal } from "./coachRequests/ConfirmWithdrawProposalModal";

interface Props {
  requests: ScheduleChangeRequest[];
  invitations?: SubstituteInvitation[];
  onOpenCreateRequest: () => void;
  onOpenClassProposal?: () => void;
}

export default function CoachRequestsTab({
  requests,
  invitations = [],
  onOpenCreateRequest,
  onOpenClassProposal,
}: Props) {
  const approvedInvitations = invitations.filter(
    (inv) => ["approved", "đã duyệt"].includes(String(inv.status).trim().toLowerCase()),
  );

  const [activeSubTab, setActiveSubTab] = useState<"invitations" | "my_requests" | "class_proposals">(
    approvedInvitations.length > 0 ? "invitations" : "my_requests",
  );

  const [classProposals, setClassProposals] = useState<CoachClassProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [withdrawingProposalId, setWithdrawingProposalId] = useState<string | null>(null);
  const [proposalToWithdraw, setProposalToWithdraw] = useState<CoachClassProposal | null>(null);

  const loadProposals = async (silent = false) => {
    if (!silent) setLoadingProposals(true);
    try {
      const list = await CoachAPI.getMyClassProposals();
      setClassProposals(list);
    } catch (err) {
      console.error("Lỗi tải đề xuất mở lớp:", err);
    } finally {
      if (!silent) setLoadingProposals(false);
    }
  };

  useEffect(() => {
    loadProposals();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadProposals(true);
      }
    }, 4000);

    const onSync = () => {
      void loadProposals(true);
    };

    const onStorageSync = (e: StorageEvent) => {
      if (e.key === "coach-proposal-timestamp" || e.key === "class-proposal-updated") {
        void loadProposals(true);
      }
    };

    window.addEventListener("focus", onSync);
    window.addEventListener("class-proposal-updated", onSync);
    window.addEventListener("coach-schedule-updated", onSync);
    window.addEventListener("storage", onStorageSync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onSync);
      window.removeEventListener("class-proposal-updated", onSync);
      window.removeEventListener("coach-schedule-updated", onSync);
      window.removeEventListener("storage", onStorageSync);
    };
  }, []);

  const handleOpenWithdrawModal = (id: string) => {
    const found = classProposals.find((p) => p.id === id);
    if (found) {
      setProposalToWithdraw(found);
    }
  };

  const handleConfirmWithdraw = async (id: string) => {
    setWithdrawingProposalId(id);
    try {
      await CoachAPI.withdrawClassProposal(id);
      window.dispatchEvent(new CustomEvent("class-proposal-updated"));
      window.dispatchEvent(new CustomEvent("coach-schedule-updated"));
      try {
        localStorage.setItem("coach-proposal-timestamp", Date.now().toString());
      } catch {}
      toast.success("Đã thu hồi đề xuất mở lớp thành công!");
      setProposalToWithdraw(null);
      await loadProposals();
    } catch (err: any) {
      toast.error(err?.message || "Không thể thu hồi đề xuất mở lớp.");
    } finally {
      setWithdrawingProposalId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab("invitations")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "invitations"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Lời mời dạy thay ({approvedInvitations.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("my_requests")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "my_requests"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Yêu cầu của tôi ({requests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab("class_proposals");
              loadProposals();
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "class_proposals"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đề xuất mở lớp ({classProposals.length})</span>
          </button>
        </div>

        {activeSubTab === "my_requests" && (
          <button
            type="button"
            onClick={onOpenCreateRequest}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tạo yêu cầu mới
          </button>
        )}

        {activeSubTab === "class_proposals" && onOpenClassProposal && (
          <button
            type="button"
            onClick={onOpenClassProposal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Đề xuất mở lớp mới
          </button>
        )}
      </div>

      {/* 1. Lời mời dạy thay gửi đến tôi */}
      {activeSubTab === "invitations" && (
        <CoachInvitationsList
          invitations={approvedInvitations}
        />
      )}

      {/* 2. Yêu cầu của chính Coach */}
      {activeSubTab === "my_requests" && (
        <CoachOwnRequestsList requests={requests} />
      )}

      {/* 3. Đề xuất mở lớp của Coach */}
      {activeSubTab === "class_proposals" && (
        <CoachClassProposalsList
          proposals={classProposals}
          loading={loadingProposals}
          onWithdraw={handleOpenWithdrawModal}
          withdrawingId={withdrawingProposalId}
          onOpenCreateProposal={onOpenClassProposal || (() => {})}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmWithdrawProposalModal
        isOpen={Boolean(proposalToWithdraw)}
        proposal={proposalToWithdraw}
        isWithdrawing={Boolean(withdrawingProposalId)}
        onClose={() => setProposalToWithdraw(null)}
        onConfirm={handleConfirmWithdraw}
      />
    </div>
  );
}
