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
} from "lucide-react";
import type { Flow5WorkoutPlan, Flow5Exercise } from "../../services/api";
import { CoachAiEmptyState } from "./CoachAiEmptyState";
import { CoachAiLoadingState } from "./CoachAiLoadingState";
import { CoachAiExerciseCard } from "./CoachAiExerciseCard";

interface CoachAiPlanWorkspaceProps {
  plan: Flow5WorkoutPlan | null;
  setPlan: React.Dispatch<React.SetStateAction<Flow5WorkoutPlan | null>>;
  isGenerating: boolean;
  elapsedSeconds?: number;
  isSaving: boolean;
  isApproving: boolean;
  onSaveDraft: () => void;
  onApprove: () => void;
  onOpenAssign: () => void;
  onClone: () => void;
  onArchive: () => void;
  onReset: () => void;
  onQuickDemo?: () => void;
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
  onOpenAssign,
  onClone,
  onArchive,
  onReset,
  onQuickDemo,
}) => {
  const [showAiDetails, setShowAiDetails] = useState(false);

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
    return <CoachAiEmptyState onQuickDemo={onQuickDemo} />;
  }

  const isDraft = plan.status === "draft";
  const isApproved = plan.status === "approved";
  const isAssigned = plan.status === "assigned";
  const isArchived = plan.status === "archived";

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col overflow-hidden">
      {/* Top Banner & Metadata */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300">
                🟡 Bản nháp (Draft)
              </span>
            )}
            {isApproved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu Thư viện (Approved)
              </span>
            )}
            {isAssigned && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-400/40 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Đã giao (Assigned)
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? "Đang lưu vào Thư viện..." : "✓ Chấp nhận & Lưu vào Thư viện giáo án"}</span>
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
                <span>Giao bài ngay</span>
              </button>
            </>
          )}

          {isAssigned && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Giáo án đã được giao thành công cho học viên.
              </span>
              <button
                type="button"
                onClick={() => {
                  window.location.hash = "#coach-curriculum";
                }}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
              >
                <span>Xem trong Thư viện</span>
                <ArrowRight className="w-3 h-3" />
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
