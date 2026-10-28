import React from "react";
import { Dumbbell, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Flow5WorkoutPlan, Flow5Exercise } from "../../services/api";
import { CoachAiEmptyState } from "./CoachAiEmptyState";
import { CoachAiLoadingState } from "./CoachAiLoadingState";
import { CoachAiExerciseCard } from "./CoachAiExerciseCard";
import { CoachAiPlanHeader } from "./workspace/CoachAiPlanHeader";
import { CoachAiPlanActionBar } from "./workspace/CoachAiPlanActionBar";
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

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col overflow-hidden max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      <CoachAiPlanHeader
        plan={plan}
        setPlan={setPlan}
        onBackToSetup={onBackToSetup}
        onReset={onReset}
        onAiRefine={onAiRefine}
      />

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

      <CoachAiPlanActionBar
        plan={plan}
        isSaving={isSaving}
        isApproving={isApproving}
        onSaveDraft={onSaveDraft}
        onApprove={onApprove}
        onApproveAndAssign={onApproveAndAssign}
        onOpenAssign={onOpenAssign}
        onCopyPlan={handleCopyPlan}
        onPrintPlan={handlePrintPlan}
        onClone={onClone}
        onArchive={onArchive}
      />
    </div>
  );
};
