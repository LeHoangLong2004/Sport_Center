import { useState } from "react";
import {
  Plus,
  Check,
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  Inbox,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { ScheduleChangeRequest, SubstituteInvitation } from "../../services/api";
import { REQUEST_STATUS_BADGE, INVITATION_STATUS_BADGE } from "./types";

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
        <div className="grid grid-cols-1 gap-4">
          {invitations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              Bạn chưa có lời mời dạy thay nào từ đồng nghiệp.
            </div>
          ) : (
            invitations.map((inv) => {
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
                            onChange={(e) =>
                              setDeclineReason((prev) => ({
                                ...prev,
                                [inv.id]: e.target.value,
                              }))
                            }
                            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-rose-500"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleAction(inv.id, "reject")}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                              {isProcessing && <Loader2 className="w-3 h-3 animate-spin" />}
                              Xác nhận từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeclineInput(null)}
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
                            onClick={() => handleAction(inv.id, "accept")}
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
                            onClick={() => setShowDeclineInput(inv.id)}
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
            })
          )}
        </div>
      )}

      {/* 2. Yêu cầu của chính Coach */}
      {activeSubTab === "my_requests" && (
        <div className="grid grid-cols-1 gap-3">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
              Chưa có yêu cầu nào được gửi.
            </div>
          ) : (
            requests.map((req) => {
              const badge = REQUEST_STATUS_BADGE[req.status] || {
                label: req.status,
                bg: "bg-slate-100",
                text: "text-slate-600",
              };
              return (
                <div
                  key={req.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        {req.className}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                        {req.requestType}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {req.requestType === "dạy thay" && req.substituteCoachName && (
                        <div>
                          HLV thay thế đề xuất:{" "}
                          <strong className="text-slate-800 dark:text-slate-100">
                            {req.substituteCoachName}
                          </strong>
                        </div>
                      )}
                      {req.newDate && (
                        <div>
                          Thời gian mới đề xuất:{" "}
                          <strong className="text-slate-800 dark:text-slate-100">
                            {req.newDate} {req.newTime}
                          </strong>
                        </div>
                      )}
                      <div>
                        Lý do: <span className="italic text-slate-500">"{req.reason}"</span>
                      </div>
                      {req.managerNote && (
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Phản hồi quản lý: {req.managerNote}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 shrink-0">
                    Gửi lúc: {req.createdAt}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
