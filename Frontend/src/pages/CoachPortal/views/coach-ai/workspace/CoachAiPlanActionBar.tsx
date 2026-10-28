import React from "react";
import {
  Save,
  CheckCircle2,
  Zap,
  ClipboardCopy,
  Printer,
  BookOpen,
  Send,
  ArrowRight,
  Copy,
  Archive,
} from "lucide-react";
import type { Flow5WorkoutPlan } from "../../../services/api";

interface Props {
  plan: Flow5WorkoutPlan;
  isSaving: boolean;
  isApproving: boolean;
  onSaveDraft: () => void;
  onApprove: () => void;
  onApproveAndAssign?: () => void;
  onOpenAssign: () => void;
  onCopyPlan: () => void;
  onPrintPlan: () => void;
  onClone: () => void;
  onArchive: () => void;
}

export function CoachAiPlanActionBar({
  plan,
  isSaving,
  isApproving,
  onSaveDraft,
  onApprove,
  onApproveAndAssign,
  onOpenAssign,
  onCopyPlan,
  onPrintPlan,
  onClone,
  onArchive,
}: Props) {
  const isDraft = plan.status === "draft";
  const isApproved = plan.status === "approved";
  const isAssigned = plan.status === "assigned";
  const isArchived = plan.status === "archived";

  return (
    <div className="p-5 sm:p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {isDraft && (
          <>
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-orange-500" />
              <span>{isSaving ? "Đang lưu..." : "Lưu bản nháp"}</span>
            </button>

            <button
              type="button"
              onClick={onApprove}
              disabled={isApproving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isApproving ? "Đang lưu..." : "✓ Lưu vào Thư viện"}</span>
            </button>

            {onApproveAndAssign && (
              <button
                type="button"
                onClick={onApproveAndAssign}
                disabled={isApproving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                <span>🚀 Duyệt & Giao ngay</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCopyPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Sao chép danh sách bài tập để gửi tin nhắn"
            >
              <ClipboardCopy className="w-4 h-4 text-slate-500" />
              <span>Sao chép bài tập</span>
            </button>

            <button
              type="button"
              onClick={onPrintPlan}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="In hoặc Xuất PDF giáo án"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>In / PDF</span>
            </button>
          </>
        )}

        {isApproved && (
          <>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#coach-curriculum";
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white transition-all shadow-md cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Đi đến Thư viện Giáo án & Bài tập</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onOpenAssign}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Giao bài tập ngay</span>
            </button>

            <button
              type="button"
              onClick={onCopyPlan}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Sao chép danh sách bài tập"
            >
              <ClipboardCopy className="w-4 h-4 text-slate-500" />
              <span>Sao chép</span>
            </button>

            <button
              type="button"
              onClick={onPrintPlan}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="In hoặc Xuất PDF giáo án"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>In / PDF</span>
            </button>
          </>
        )}

        {isAssigned && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Bài tập đã được giao thành công cho học viên.
            </span>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#coach-curriculum";
              }}
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem trong Thư viện</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={onCopyPlan}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ClipboardCopy className="w-3 h-3" />
              <span>Sao chép bài tập</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isArchived && (
          <button
            type="button"
            onClick={onClone}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Nhân bản giáo án"
          >
            <Copy className="w-4 h-4" />
          </button>
        )}

        {!isArchived && (
          <button
            type="button"
            onClick={onArchive}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Lưu trữ giáo án"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
