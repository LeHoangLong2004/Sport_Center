import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, CheckCircle2, LoaderCircle, Save, X } from "lucide-react";
import { MemberAPI } from "../../services/api";
import { cleanWorkoutPlanName, type MemberHomework } from "./workoutTypes";

interface HomeworkDetailModalProps {
  homework: MemberHomework | null;
  onClose: () => void;
  onProgressChanged?: () => void;
}

export function HomeworkDetailModal({ homework, onClose, onProgressChanged }: HomeworkDetailModalProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(homework?.completedExerciseIds || []);
  const [savedIds, setSavedIds] = useState<string[]>(homework?.completedExerciseIds || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  useEffect(() => {
    const ids = homework?.completedExerciseIds || [];
    setCompletedIds(ids);
    setSavedIds(ids);
    setSaveSuccess(false);
  }, [homework?.id]);
  const progress = useMemo(() => homework?.plan?.exercises.length ? Math.round(completedIds.length * 100 / homework.plan.exercises.length) : 0, [completedIds, homework?.plan?.exercises.length]);
  const hasUnsavedChanges = useMemo(() => [...completedIds].sort().join("|") !== [...savedIds].sort().join("|"), [completedIds, savedIds]);
  if (!homework?.plan) return null;

  const toggleExercise = (exerciseId?: string) => {
    if (!exerciseId || saving) return;
    const nextIds = completedIds.includes(exerciseId) ? completedIds.filter((id) => id !== exerciseId) : [...completedIds, exerciseId];
    setCompletedIds(nextIds);
    setError("");
    setSaveSuccess(false);
  };

  const saveProgress = async () => {
    if (!homework || !hasUnsavedChanges || saving) return;
    setSaving(true);
    setError("");
    try {
      await MemberAPI.updateHomeworkProgress(homework.id, { completedExerciseIds: completedIds });
      setSavedIds(completedIds);
      setSaveSuccess(true);
      onProgressChanged?.();
    } catch (err: any) {
      setError(err?.message || "Không thể cập nhật tiến độ. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Bài tập về nhà
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {cleanWorkoutPlanName(homework.plan.planName)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mục tiêu huấn luyện:
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {homework.plan.goal || homework.plan.description || "Thực hiện theo hướng dẫn của huấn luyện viên."}
            </p>
            {homework.notes && (
              <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                Lưu ý của Coach: {homework.notes}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200"><span>Tiến độ</span><span>{completedIds.length}/{homework.plan.exercises.length} bài · {progress}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
          {!hasUnsavedChanges && progress >= 100 && homework.status !== "completed" && <p role="status" className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><CheckCircle2 className="h-4 w-4 shrink-0" />{saveSuccess ? "Đã cập nhật tiến độ và gửi Coach duyệt hoàn thành." : "Đã hoàn thành các bài tập, đang chờ Coach duyệt."}</p>}
          {!hasUnsavedChanges && saveSuccess && progress < 100 && <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" />Tiến độ đã được cập nhật.</p>}
          {!hasUnsavedChanges && homework.status === "completed" && <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" />Coach đã xác nhận hoàn thành bài tập.</p>}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Danh sách bài tập ({homework.plan.exercises.length})
            </h4>
            <div className="space-y-2">
              {homework.plan.exercises.map((exercise, index) => (
                <label
                  key={exercise.id || index}
                  className={`flex cursor-pointer items-start gap-3 p-3 rounded-xl border ${completedIds.includes(exercise.id || "") ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850"}`}
                >
                  <input type="checkbox" checked={completedIds.includes(exercise.id || "")} disabled={!exercise.id || saving || homework.status === "completed"} onChange={() => toggleExercise(exercise.id)} className="mt-0.5 h-4 w-4 accent-emerald-600 disabled:cursor-not-allowed" aria-label={`Đánh dấu hoàn thành ${exercise.name}`} />
                  <div className="min-w-0 flex-1"><p className="font-bold text-slate-900 dark:text-white">{index + 1}. {exercise.name}</p><p className="text-[11px] text-slate-500 mt-1">{[exercise.sets && `${exercise.sets} hiệp`, exercise.reps, exercise.duration, exercise.rest && `Nghỉ ${exercise.rest}`].filter(Boolean).join(" • ") || "Theo hướng dẫn"}</p>{exercise.note && <p className="text-[10px] text-slate-600 dark:text-slate-400 italic mt-1">Lưu ý: {exercise.note}</p>}</div>
                  {completedIds.includes(exercise.id || "") && <Check className="h-4 w-4 text-emerald-600" />}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-850">
          <div className="flex w-full items-center justify-end gap-2">
            <button type="button" onClick={() => setCompletedIds(savedIds)} disabled={!hasUnsavedChanges || saving} className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300">Hoàn tác</button>
            <button type="button" onClick={() => void saveProgress()} disabled={!hasUnsavedChanges || saving || homework.status === "completed"} className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : hasUnsavedChanges ? <Save className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{hasUnsavedChanges ? "Cập nhật tiến độ" : "Đã cập nhật"}</button>
            <button type="button" onClick={onClose} className="shrink-0 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">Đóng bài tập</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
