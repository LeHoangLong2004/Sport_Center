/**
 * Flow 5 — AI Workout Recommendation Engine (Coach Copilot)
 * Architecture:
 * 1. Coach selects target (Member / Class), sport, level, goal, equipment & duration.
 * 2. Backend injects user metrics & history context, requests structured JSON from Gemini.
 * 3. AI draft response is saved as 'draft' with source 'ai_recommendation'.
 * 4. Coach reviews, edits exercise dosages & approves draft (Coach-in-the-Loop).
 * 5. Approved plan can be officially assigned to member / class roster.
 */
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { CoachAiHeader } from "./coach-ai/CoachAiHeader";
import { CoachAiInputPanel } from "./coach-ai/CoachAiInputPanel";
import { CoachAiPlanWorkspace } from "./coach-ai/CoachAiPlanWorkspace";
import { CoachAiAssignModal } from "./coach-ai/CoachAiAssignModal";
import { CoachAiHistoryDrawer } from "./coach-ai/CoachAiHistoryDrawer";
import { useCoachAi } from "./coach-ai/useCoachAi";

export default function CoachAI() {
  const {
    loading,
    members,
    classes,
    sports,
    historyPlans,
    targetType,
    setTargetType,
    targetId,
    setTargetId,
    sportId,
    setSportId,
    level,
    setLevel,
    goal,
    setGoal,
    equipment,
    setEquipment,
    durationMinutes,
    setDurationMinutes,
    exerciseCount,
    setExerciseCount,
    isGenerating,
    elapsedSeconds,
    currentPlan,
    setCurrentPlan,
    isSaving,
    isApproving,
    showAssignModal,
    setShowAssignModal,
    showHistoryDrawer,
    setShowHistoryDrawer,
    feedback,
    setFeedback,
    handleGenerate,
    handleSaveDraft,
    handleApprove,
    handleConfirmAssign,
    handleClone,
    handleArchive,
    handleSelectPlanFromHistory,
    handleQuickDemo,
  } = useCoachAi();

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Đang tải dữ liệu HLV và học viên...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <CoachAiHeader
        onOpenHistory={() => setShowHistoryDrawer(true)}
        historyCount={historyPlans.length}
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {feedback.type === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {feedback.type === "info" && <Info className="w-4 h-4 text-orange-600 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 cursor-pointer ml-3"
          >
            Đóng
          </button>
        </div>
      )}

      {/* 2. Main Dual Panel: Input Criteria & Plan Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <CoachAiInputPanel
            targetType={targetType}
            setTargetType={setTargetType}
            targetId={targetId}
            setTargetId={setTargetId}
            members={members}
            classes={classes}
            sports={sports}
            sportId={sportId}
            setSportId={setSportId}
            level={level}
            setLevel={setLevel}
            goal={goal}
            setGoal={setGoal}
            equipment={equipment}
            setEquipment={setEquipment}
            durationMinutes={durationMinutes}
            setDurationMinutes={setDurationMinutes}
            exerciseCount={exerciseCount}
            setExerciseCount={setExerciseCount}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>

        {/* Right Column: Interactive Plan Workspace (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <CoachAiPlanWorkspace
            plan={currentPlan}
            setPlan={setCurrentPlan}
            isGenerating={isGenerating}
            elapsedSeconds={elapsedSeconds}
            isSaving={isSaving}
            isApproving={isApproving}
            onSaveDraft={handleSaveDraft}
            onApprove={handleApprove}
            onOpenAssign={() => setShowAssignModal(true)}
            onClone={handleClone}
            onArchive={handleArchive}
            onReset={() => setCurrentPlan(null)}
            onQuickDemo={handleQuickDemo}
          />
        </div>
      </div>

      {/* 3. Assign Plan Modal */}
      {currentPlan && (
        <CoachAiAssignModal
          plan={currentPlan}
          target={currentPlan.recommendationTarget || { type: targetType, id: targetId }}
          members={members}
          classes={classes}
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          onConfirm={handleConfirmAssign}
        />
      )}

      {/* 4. History Drawer */}
      <CoachAiHistoryDrawer
        isOpen={showHistoryDrawer}
        onClose={() => setShowHistoryDrawer(false)}
        plans={historyPlans}
        onSelectPlan={handleSelectPlanFromHistory}
      />
    </div>
  );
}
