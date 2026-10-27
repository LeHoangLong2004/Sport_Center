import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Save,
  Send,
  Copy,
  Archive,
  Info,
  Dumbbell,
  FileText,
  Activity,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ClipboardCopy,
  Zap,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import type { Flow5WorkoutPlan, Flow5Exercise } from "../../services/api";
import { CoachAiEmptyState } from "./CoachAiEmptyState";
import { CoachAiLoadingState } from "./CoachAiLoadingState";
import { CoachAiExerciseCard } from "./CoachAiExerciseCard";
import type { RoutinePreset } from "./types";

interface CoachAiPlanWorkspaceProps {
  plan: Flow5WorkoutPlan | null;
  setPlan: React.Dispatch<React.SetStateAction<Flow5WorkoutPlan | null>>;
  isGenerating: boolean;
  elapsedSeconds?: number;
  isSaving: boolean;
  isApproving: boolean;
  onSaveDraft: () => void;
  onApprove: () => void;
  onApproveAndAssign?: () => void;
  onOpenAssign: () => void;
  onClone: () => void;
  onArchive: () => void;
  onReset: () => void;
  onQuickDemo?: () => void;
  onApplyPreset?: (preset: RoutinePreset) => void;
  onAiRefine?: (action: "lighter" | "heavier" | "shorten" | "bodyweight") => void;
  onBackToSetup?: () => void;
}

export const CoachAiPlanWorkspace: React.FC<CoachAiPlanWorkspaceProps> = ({
  plan,
  setPlan,
  isGenerating,
  elapsedSeconds = 0,
  isSaving,
  isApproving,
  onSaveDraft,
  onApprove,
  onApproveAndAssign,
  onOpenAssign,
  onClone,
  onArchive,
  onReset,
  onQuickDemo,
  onApplyPreset,
  onAiRefine,
  onBackToSetup,
}) => {
  const [showAiDetails, setShowAiDetails] = useState(false);

  // Quick Copy formatted routine to clipboard
  const handleCopyPlan = () => {
    if (!plan || !plan.exercises) return;
    const lines = [
      `🏋️ DANH SÁCH BÀI TẬP GỢI Ý (AI) - ${plan.planName}`,
      `🎯 Mục tiêu: ${plan.goal || "Cải thiện thể lực"} | Trình độ: ${plan.level || "Cơ bản"} | Thời lượng: ${plan.durationMinutes || 60} phút`,
      `---------------------------------`,
      ...plan.exercises.map(
        (ex, idx) =>
          `${idx + 1}. ${ex.name}: ${ex.sets} hiệp x ${ex.reps || ex.duration || "12 lần"}${ex.rest ? ` (Nghỉ ${ex.rest})` : ""}${ex.note ? `\n   👉 Ghi chú: ${ex.note}` : ""}`
      ),
      `---------------------------------`,
      `HLV Sport Center kiểm duyệt & đề xuất`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("📋 Đã sao chép danh sách bài tập vào clipboard! Bạn có thể dán gửi cho học viên.");
  };

  const handlePrintPlan = () => {
    window.print();
  };

  // Exercise modifiers
  const updateExercise = (index: number, patch: Partial<Flow5Exercise>) => {
    if (!plan) return;
    const nextExercises = [...plan.exercises];
    nextExercises[index] = { ...nextExercises[index], ...patch };
    setPlan({ ...plan, exercises: nextExercises });
  };

  const addExercise = () => {
    if (!plan) return;
    const newEx: Flow5Exercise = {
      name: "Bài tập mới",
      sets: "3",
      reps: "12 lần",
      duration: "",
      rest: "60s",
      note: "Giữ đúng tư thế",
      order: plan.exercises.length + 1,
    };
    setPlan({ ...plan, exercises: [...plan.exercises, newEx] });
  };

  const removeExercise = (index: number) => {
    if (!plan) return;
    const next = plan.exercises.filter((_, i) => i !== index);
    setPlan({ ...plan, exercises: next.map((e, idx) => ({ ...e, order: idx + 1 })) });
  };

  const moveExercise = (index: number, direction: "up" | "down") => {
    if (!plan) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= plan.exercises.length) return;
    const next = [...plan.exercises];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setPlan({ ...plan, exercises: next.map((e, idx) => ({ ...e, order: idx + 1 })) });
  };

  if (isGenerating) {
    return <CoachAiLoadingState elapsedSeconds={elapsedSeconds} onCancel={onReset} />;
  }

  if (!plan) {
    return <CoachAiEmptyState onQuickDemo={onQuickDemo} onApplyPreset={onApplyPreset} />;
  }

  const isDraft = plan.status === "draft";
  const isApproved = plan.status === "approved";
  const isAssigned = plan.status === "assigned";
  const isArchived = plan.status === "archived";

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col overflow-hidden max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Navigation & Status Bar */}
      {onBackToSetup && (
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>← Quay lại thiết lập tiêu chí / Tạo giáo án mới</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Trạng thái:
            </span>
            {isDraft && (
              <span className="font-bold text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/30">
                🟡 HLV đang kiểm duyệt bài tập
              </span>
            )}
            {isApproved && (
              <span className="font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
                ✓ Đã lưu vào Thư viện giáo án
              </span>
            )}
            {isAssigned && (
              <span className="font-bold text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-400/30">
                🚀 Đã giao cho học viên
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Banner & Metadata */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300">
                🟡 Bản nháp gợi ý (Draft)
              </span>
            )}
            {isApproved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu Thư viện bài tập (Approved)
              </span>
            )}
            {isAssigned && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-400/40 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Đã giao cho học viên (Assigned)
              </span>
            )}
            {isArchived && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 border border-slate-400/40 text-slate-700 dark:text-slate-300">
                📦 Đã lưu trữ (Archived)
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Phiên bản v{plan.version}
            </span>

            {plan.source === "ai_recommendation" && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                AI Generated
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showAiDetails ? "Ẩn thông số AI" : "Chi tiết AI"}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* AI Metadata Inspector */}
        {showAiDetails && plan.aiMetadata && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">AI Provider</span>
              <span className="font-bold">{plan.aiMetadata.provider || "Gemini"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mô hình</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {plan.aiMetadata.model || "gemini-1.5-flash"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Token</span>
              <span className="font-bold">
                {plan.aiMetadata.inputTokens || 0} in / {plan.aiMetadata.outputTokens || 0} out
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Thời gian sinh</span>
              <span className="font-bold">
                {plan.aiMetadata.generatedAt
                  ? new Date(plan.aiMetadata.generatedAt).toLocaleTimeString("vi-VN")
                  : "Mới đây"}
              </span>
            </div>
          </div>
        )}

        {/* Plan Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tên giáo án
          </label>
          <input
            type="text"
            value={plan.planName}
            disabled={!isDraft}
            onChange={(e) => setPlan({ ...plan, planName: e.target.value })}
            className={`w-full text-base sm:text-lg font-bold px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none ${
              !isDraft ? "opacity-90 bg-slate-50 dark:bg-slate-900 cursor-not-allowed" : "border-slate-200 dark:border-slate-700"
            }`}
          />
        </div>

        {/* Plan Meta Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            Thời lượng: <strong>{plan.durationMinutes || 60} phút</strong>
          </span>
          {plan.level && (
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              Trình độ: <strong>{plan.level}</strong>
            </span>
          )}
          {plan.goal && (
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              Mục tiêu: <strong>{plan.goal}</strong>
            </span>
          )}
        </div>

        {/* AI Copilot Quick Actions (Interactive Refinement Chips) */}
        {isDraft && onAiRefine && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Trợ lý AI Copilot - Lệnh tinh chỉnh nhanh:</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bấm để AI tự động tối ưu</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onAiRefine("lighter")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Giảm số hiệp, giảm reps, tăng thời gian nghỉ ngơi"
              >
                <span>🔄 AI đổi bài nhẹ hơn</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("heavier")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Tăng hiệp, rút ngắn thời gian nghỉ để đốt mỡ tối đa"
              >
                <span>🔥 Tăng cường độ HIIT</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("shorten")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Rút ngắn thời lượng còn 30 phút, tập trung compound cốt lõi"
              >
                <span>⏱️ Rút ngắn còn 30p</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("bodyweight")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Chuyển toàn bộ sang bài tập tay không Bodyweight"
              >
                <span>🤸 Đổi sang Bodyweight (Không tạ)</span>
              </button>
            </div>
          </div>
        )}

        {/* Description & Safety Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mô tả / Lưu ý an toàn & Kỹ thuật
          </label>
          <textarea
            rows={2}
            value={plan.description || ""}
            disabled={!isDraft}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
            placeholder="Ghi chú về khởi động, phòng tránh chấn thương hoặc dặn dò đặc biệt..."
            className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none ${
              !isDraft ? "opacity-90 bg-slate-50 dark:bg-slate-900 cursor-not-allowed" : "border-slate-200 dark:border-slate-700"
            }`}
          />
        </div>
      </div>

      {/* Exercises Section */}
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span>Danh sách bài tập ({plan.exercises.length} bài)</span>
          </h4>
          {isDraft && (
            <button
              type="button"
              onClick={addExercise}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm bài tập</span>
            </button>
          )}
        </div>

        {/* Exercise Cards */}
        <div className="flex flex-col gap-3">
          {plan.exercises.map((ex, index) => (
            <CoachAiExerciseCard
              key={ex.id || index}
              exercise={ex}
              index={index}
              totalCount={plan.exercises.length}
              isDraft={isDraft}
              onUpdate={(patch) => updateExercise(index, patch)}
              onMove={(direction) => moveExercise(index, direction)}
              onRemove={() => removeExercise(index)}
            />
          ))}
        </div>
      </div>

      {/* Action Bar */}
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
                onClick={handleCopyPlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Sao chép danh sách bài tập để gửi tin nhắn"
              >
                <ClipboardCopy className="w-4 h-4 text-slate-500" />
                <span>Sao chép bài tập</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPlan}
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
                onClick={handleCopyPlan}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Sao chép danh sách bài tập"
              >
                <ClipboardCopy className="w-4 h-4 text-slate-500" />
                <span>Sao chép</span>
              </button>

              <button
                type="button"
                onClick={handlePrintPlan}
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
                onClick={handleCopyPlan}
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
    </div>
  );
};
