import React from "react";
import { Plus, RotateCcw, Calendar, Users, MapPin, Loader2, Sparkles } from "lucide-react";
import type { CoachClassProposal } from "../../../services/api";

interface Props {
  proposals: CoachClassProposal[];
  loading: boolean;
  onWithdraw: (id: string) => Promise<void>;
  withdrawingId: string | null;
  onOpenCreateProposal: () => void;
}

const PROPOSAL_STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending_approval: {
    label: "Chờ Manager duyệt",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
  },
  pending: {
    label: "Chờ Manager duyệt",
    bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
  },
  approved: {
    label: "Đã phê duyệt",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  active: {
    label: "Đang mở",
    bg: "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    text: "text-teal-700 dark:text-teal-400",
  },
  rejected: {
    label: "Đã từ chối",
    bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-400",
  },
  cancelled: {
    label: "Đã thu hồi",
    bg: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-400",
  },
};

export function CoachClassProposalsList({
  proposals,
  loading,
  onWithdraw,
  withdrawingId,
  onOpenCreateProposal,
}: Props) {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
        <span>Đang tải danh sách đề xuất mở lớp...</span>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Chưa có đề xuất mở lớp nào
        </h4>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Bạn có thể chủ động đề xuất mở thêm lớp mới cho bộ môn mình phụ trách để Manager phê duyệt và xếp lịch.
        </p>
        <button
          type="button"
          onClick={onOpenCreateProposal}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Đề xuất mở lớp mới
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5">
      {proposals.map((item) => {
        const rawStatus = (item.status || "pending_approval").toLowerCase();
        const statusConfig = PROPOSAL_STATUS_MAP[rawStatus] || {
          label: item.status,
          bg: "bg-slate-100 border-slate-200",
          text: "text-slate-600",
        };
        const canWithdraw = rawStatus === "pending" || rawStatus === "pending_approval";
        const isWithdrawing = withdrawingId === item.id;

        return (
          <div
            key={item.id}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {item.className}
                </h4>
                {item.sportName && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {item.sportName}
                  </span>
                )}
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.bg} ${statusConfig.text}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                {item.branchName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chi nhánh: <strong className="text-slate-700 dark:text-slate-300">{item.branchName}</strong></span>
                  </span>
                )}
                {item.maxCapacity > 0 && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sĩ số dự kiến: <strong className="text-slate-700 dark:text-slate-300">{item.maxCapacity} học viên</strong></span>
                  </span>
                )}
                {item.defaultPrice > 0 && (
                  <span>
                    Học phí: <strong className="text-emerald-600 dark:text-emerald-400">{item.defaultPrice.toLocaleString("vi-VN")} đ</strong>
                  </span>
                )}
              </div>

              {item.requestedSlots && (
                <div className="text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Lịch học đề xuất:</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {item.requestedSlots}
                  </p>
                </div>
              )}

              {item.notes && (
                <div className="text-xs text-slate-500 italic">
                  Ghi chú: {item.notes}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end justify-between gap-3 shrink-0 self-stretch md:self-auto">
              <span className="text-[11px] text-slate-400">
                Gửi lúc: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
              </span>

              {canWithdraw && (
                <button
                  type="button"
                  disabled={isWithdrawing}
                  onClick={() => onWithdraw(item.id)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Thu hồi đề xuất mở lớp"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang thu hồi...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thu hồi đề xuất</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

