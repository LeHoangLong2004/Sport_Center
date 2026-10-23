import { useEffect, useMemo, useState } from "react";
import type { MemberScreen } from "../types";
import { MemberAPI } from "../services/api";
import {
  CheckCircle2,
  Circle,
  Dumbbell,
  Eye,
  Flame,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import type { MemberHomework, HomeworkExercise, HomeworkTask } from "./workouts/workoutTypes";
import { HomeworkDetailModal } from "./workouts/HomeworkDetailModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
};

const getExerciseDescription = (exercise: HomeworkExercise) =>
  [
    exercise.reps ? `Số lượng: ${exercise.reps}` : "",
    exercise.rest ? `Nghỉ: ${exercise.rest}` : "",
    exercise.note || "",
  ]
    .filter(Boolean)
    .join(". ");

export default function MemberWorkouts({ onNavigate }: Props) {
  const [homeworks, setHomeworks] = useState<MemberHomework[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Record<string, number[]>>({});
  const [selectedHomework, setSelectedHomework] = useState<MemberHomework | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHomeworks = async () => {
    setLoading(true);
    setError(null);

    try {
      const raw = await MemberAPI.getMyHomework();
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];
      const data = list as MemberHomework[];
      setHomeworks(data);

      const completedByHomework: Record<string, number[]> = {};
      data.forEach((homework) => {
        const total = homework.plan?.exercises?.length || 0;
        const completedCount = Math.min(
          total,
          Math.round(((homework.progressPct || 0) / 100) * total),
        );
        completedByHomework[homework.id] = Array.from(
          { length: completedCount },
          (_, index) => index,
        );
      });
      setCompletedTasks(completedByHomework);
    } catch (loadError) {
      console.error("Failed to load assigned workouts", loadError);
      setHomeworks([]);
      setError("Không thể tải giáo án được giao. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHomeworks();

    const handleAutoRefresh = () => {
      void loadHomeworks();
    };

    window.addEventListener("focus", handleAutoRefresh);
    window.addEventListener("visibilitychange", handleAutoRefresh);
    window.addEventListener("local-storage-update", handleAutoRefresh);

    return () => {
      window.removeEventListener("focus", handleAutoRefresh);
      window.removeEventListener("visibilitychange", handleAutoRefresh);
      window.removeEventListener("local-storage-update", handleAutoRefresh);
    };
  }, []);

  const assignedTasks = useMemo<HomeworkTask[]>(
    () =>
      homeworks.flatMap((homework) => {
        const exercises = homework.plan?.exercises || [];
        const completedIndexes = completedTasks[homework.id] || [];

        return exercises.map((exercise, exerciseIndex) => ({
          id: `${homework.id}-${exerciseIndex}`,
          homeworkId: homework.id,
          exerciseIndex,
          title: exercise.name || `Bài tập #${exerciseIndex + 1}`,
          description: getExerciseDescription(exercise),
          dueDate: homework.dueDate,
          assignedDate: homework.assignedDate,
          completed: completedIndexes.includes(exerciseIndex),
        }));
      }),
    [completedTasks, homeworks],
  );

  const getProgress = (homework: MemberHomework) => {
    const total = homework.plan?.exercises?.length || 0;
    if (total === 0) return Math.round(homework.progressPct || 0);
    return Math.round(((completedTasks[homework.id]?.length || 0) / total) * 100);
  };

  const handleToggleTask = async (task: HomeworkTask) => {
    const homework = homeworks.find((item) => item.id === task.homeworkId);
    if (!homework || updatingTaskId) return;

    const currentIndexes = completedTasks[homework.id] || [];
    const nextIndexes = task.completed
      ? currentIndexes.filter((index) => index !== task.exerciseIndex)
      : [...currentIndexes, task.exerciseIndex].sort((a, b) => a - b);
    const total = homework.plan?.exercises?.length || 1;
    const progressPct = Math.round((nextIndexes.length / total) * 100);
    // Anti-cheating rule: Reaching 100% transitions to pending_review for Coach sign-off
    const status = progressPct === 100 ? "pending_review" : progressPct > 0 ? "in_progress" : "assigned";

    setUpdatingTaskId(task.id);
    setError(null);
    try {
      await MemberAPI.updateHomeworkProgress(homework.id, { status, progressPct });
      setCompletedTasks((current) => ({ ...current, [homework.id]: nextIndexes }));
      setHomeworks((current) =>
        current.map((item) =>
          item.id === homework.id ? { ...item, status, progressPct } : item,
        ),
      );
    } catch (updateError) {
      console.error("Failed to update workout progress", updateError);
      setError("Không thể cập nhật tiến độ bài tập. Vui lòng thử lại.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleSubmitForReview = async (homeworkId: string) => {
    try {
      await MemberAPI.updateHomeworkProgress(homeworkId, { status: "pending_review", progressPct: 100 });
      setHomeworks((current) =>
        current.map((item) =>
          item.id === homeworkId ? { ...item, status: "pending_review", progressPct: 100 } : item,
        ),
      );
    } catch (err) {
      console.error("Failed to submit workout for review", err);
      setError("Không thể gửi yêu cầu nghiệm thu. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Giáo án tập luyện tại trung tâm</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tập luyện trực tiếp dưới sự hướng dẫn và giám sát nghiệm thu của Huấn luyện viên
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadHomeworks()}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          <span>{loading ? "Đang tải..." : "Làm mới"}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          <span>{error}</span>
          <button type="button" onClick={() => void loadHomeworks()} className="font-semibold underline">
            Thử lại
          </button>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Giáo án được giao riêng cho bạn ({homeworks.length})
          </h3>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Đang tải giáo án...
          </div>
        ) : homeworks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chưa có giáo án nào được giao
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Giáo án sẽ xuất hiện tại đây sau khi huấn luyện viên giao cho bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworks.map((homework) => {
              const plan = homework.plan;
              const progress = getProgress(homework);
              const exerciseCount = plan?.exercises?.length || 0;

              return (
                <div
                  key={homework.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {plan?.level || "Giáo án cá nhân"}
                      </span>
                      {homework.status === "completed" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                          ✓ Đã nghiệm thu
                        </span>
                      ) : homework.status === "pending_review" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 animate-pulse">
                          ⏳ Chờ HLV duyệt
                        </span>
                      ) : homework.status === "rejected" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                          ✕ Cần tập lại
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {plan?.durationMinutes ? `${plan.durationMinutes} phút` : "Theo giáo án"}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {plan?.planName || "Giáo án tập luyện"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan?.goal || plan?.description || "Giáo án do huấn luyện viên giao tại trung tâm."}
                    </p>

                    {homework.notes && (
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Lưu ý của Coach: </span>
                        {homework.notes}
                      </div>
                    )}

                    <div className="mt-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">Tiến độ bài tập:</span>
                        {homework.status === "completed" ? (
                          <span className="text-emerald-600 font-bold">100% ✓ Đã nghiệm thu</span>
                        ) : homework.status === "pending_review" ? (
                          <span className="text-amber-600 font-bold">100% ⏳ Chờ HLV ký duyệt</span>
                        ) : (
                          <span className={progress === 100 ? "text-emerald-600 font-bold" : "text-amber-600"}>
                            {progress}%
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            homework.status === "completed"
                              ? "bg-emerald-500"
                              : homework.status === "pending_review"
                              ? "bg-amber-500"
                              : progress === 100
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Pending Review Notice Banner */}
                    {homework.status === "pending_review" && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                        <span>Đã gửi nghiệm thu! Vui lòng chờ HLV trực tiếp kiểm tra và xác nhận.</span>
                      </div>
                    )}

                    {/* Submit Review Action Button when 100% reached */}
                    {progress === 100 && homework.status !== "completed" && homework.status !== "pending_review" && (
                      <button
                        type="button"
                        onClick={() => handleSubmitForReview(homework.id)}
                        className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Gửi HLV nghiệm thu buổi tập</span>
                      </button>
                    )}

                    {/* Completed verification badge */}
                    {homework.status === "completed" && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>HLV đã nghiệm thu đạt yêu cầu buổi tập!</span>
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>HLV phụ trách: <strong>Huấn luyện viên</strong></span>
                      <span className="text-emerald-600 font-semibold">{exerciseCount} bài tập</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedHomework(homework)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Xem bài tập</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate("chat")}
                      className="px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Nhắn tin trao đổi với HLV phụ trách"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="hidden sm:inline">Nhắn HLV</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Chi tiết các bài tập rèn luyện tại trung tâm ({assignedTasks.length})
            </h3>
          </div>
          {assignedTasks.length > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Đã tập xong {assignedTasks.filter((task) => task.completed).length}/{assignedTasks.length} bài
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Đang tải bài tập...</div>
        ) : assignedTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Chưa có bài tập rèn luyện nào được giao.
          </div>
        ) : (
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => void handleToggleTask(task)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${task.completed ? "bg-slate-50/60 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-70" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 shadow-xs"}`}
              >
                <button type="button" className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors">
                  {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-slate-400" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className={`text-xs font-bold ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"}`}>
                      {task.title}
                    </h4>
                    {task.dueDate && <span className="text-[10px] text-slate-400 font-medium">Buổi tập: {formatDate(task.dueDate)}</span>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{task.description || "Thực hiện theo hướng dẫn của huấn luyện viên."}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span>Hướng dẫn bởi: <strong className="text-emerald-600 dark:text-emerald-400">HLV phụ trách</strong></span>
                    <span>Ngày áp dụng: {formatDate(task.assignedDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <HomeworkDetailModal
        homework={selectedHomework}
        onClose={() => setSelectedHomework(null)}
      />

      {updatingTaskId && <span className="sr-only">Đang cập nhật tiến độ</span>}
    </div>
  );
}

