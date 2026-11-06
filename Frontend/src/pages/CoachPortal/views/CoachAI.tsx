/**
 * Flow 5 — AI Workout Recommendation Engine (Coach Copilot)
 * Architecture:
 * 1. Coach selects target (Member / Class), sport, level, goal, equipment & duration.
 * 2. Backend injects user metrics & history context, requests structured JSON from Gemini.
 * 3. AI draft response is saved as 'draft' with source 'ai_recommendation'.
 * 4. Coach reviews, edits exercise dosages & approves draft (Coach-in-the-Loop).
 * 5. Approved plan can be officially assigned to member / class roster.
 */
import { AlertCircle, CheckCircle2, Info, BookOpen, ArrowRight, Sparkles, X } from "lucide-react";
import { CoachAiHeader } from "./coach-ai/CoachAiHeader";
import { CoachAiInputPanel } from "./coach-ai/CoachAiInputPanel";
import { CoachAiPlanWorkspace } from "./coach-ai/CoachAiPlanWorkspace";
import { CoachAiLoadingState } from "./coach-ai/CoachAiLoadingState";
import { CoachAiAssignModal } from "./coach-ai/CoachAiAssignModal";
import { CoachAiHistoryDrawer } from "./coach-ai/CoachAiHistoryDrawer";
import { useCoachAi } from "./coach-ai/useCoachAi";

export default function CoachAI({ initialMemberId }: { initialMemberId?: string | null }) {
  const {
    loading,
    members,
    classes,
    sports,
    historyPlans,
    selectedMemberProfile,
    loadingProfile,
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
    handleSelectTarget,
    handleGenerate,
    handleSaveDraft,
    handleApprove,
    handleApproveAndAssign,
    handleConfirmAssign,
    handleClone,
    handleArchive,
    handleSelectPlanFromHistory,
    handleQuickDemo,
    handleApplyPreset,
    handleAiRefine,
  } = useCoachAi(initialMemberId);

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
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm ${
            feedback.type === "success"
              ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/30 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100"
              : feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                feedback.type === "success"
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                  : feedback.type === "error"
                  ? "bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300"
                  : "bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-300"
              }`}
            >
              {feedback.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {feedback.type === "error" && <AlertCircle className="w-5 h-5" />}
              {feedback.type === "info" && <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm">
                {feedback.title || (
                  feedback.type === "success"
                    ? "✨ Giáo án đề xuất thành công!"
                    : feedback.type === "error"
                    ? "Đã xảy ra lỗi"
                    : "Thông báo trợ lý AI"
                )}
              </div>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{feedback.msg}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-1 sm:mt-0">
            {feedback.showLibraryLink && (
              <button
                type="button"
                onClick={() => {
                  window.location.hash = "#coach-curriculum";
                }}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Xem Thư viện</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Focused Single-Workflow: Setup -> Generating -> Result */}
      {isGenerating ? (
        <CoachAiLoadingState
          elapsedSeconds={elapsedSeconds}
          onCancel={() => setCurrentPlan(null)}
          targetName={
            targetType === "member"
              ? members.find((m) => m.id === targetId)?.name
              : classes.find((c) => c.id === targetId)?.className
          }
          sportName={sports.find((s) => s.id === sportId)?.name || "Gym"}
          goal={goal}
          durationMinutes={durationMinutes}
        />
      ) : currentPlan ? (
        <CoachAiPlanWorkspace
          plan={currentPlan}
          setPlan={setCurrentPlan}
          isGenerating={isGenerating}
          elapsedSeconds={elapsedSeconds}
          isSaving={isSaving}
          isApproving={isApproving}
          onSaveDraft={handleSaveDraft}
          onApprove={handleApprove}
          onApproveAndAssign={handleApproveAndAssign}
          onOpenAssign={() => setShowAssignModal(true)}
          onClone={handleClone}
          onArchive={handleArchive}
          onReset={() => setCurrentPlan(null)}
          onBackToSetup={() => setCurrentPlan(null)}
          onQuickDemo={handleQuickDemo}
          onApplyPreset={handleApplyPreset}
          onAiRefine={handleAiRefine}
        />
      ) : (
        <CoachAiInputPanel
          targetType={targetType}
          setTargetType={setTargetType}
          targetId={targetId}
          setTargetId={setTargetId}
          onSelectTarget={handleSelectTarget}
          onApplyPreset={handleApplyPreset}
          memberProfile={selectedMemberProfile}
          loadingProfile={loadingProfile}
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
      )}

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
