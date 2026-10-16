import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen } from "../types";
import {
  curriculumSync,
  type SyncedCurriculum,
  type SyncedHomeworkTask,
} from "../services/curriculumSync";
import {
  Dumbbell,
  CheckCircle2,
  Circle,
  Flame,
  X,
  Eye,
  MessageSquare,
} from "lucide-react";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberWorkouts({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id || "";
  const userName = user?.fullName || user?.name || "";

  const [curricula, setCurricula] = useState<SyncedCurriculum[]>(() => curriculumSync.getCurricula());
  const [tasks, setTasks] = useState<SyncedHomeworkTask[]>(() => curriculumSync.getTasks());
  const [selectedCurriculum, setSelectedCurriculum] = useState<SyncedCurriculum | null>(null);

  useEffect(() => {
    setCurricula(curriculumSync.getCurricula());
    setTasks(curriculumSync.getTasks());

    const unsub = curriculumSync.subscribe(() => {
      setCurricula(curriculumSync.getCurricula());
      setTasks(curriculumSync.getTasks());
    });

    return () => unsub();
  }, []);

  const handleToggleTask = (taskId: string) => {
    const res = curriculumSync.toggleTaskCompletion(taskId);
    setTasks([...res.tasks]);
    setCurricula(curriculumSync.getCurricula());
  };

  // Filter curricula assigned to this logged-in member
  const assignedCurriculums = useMemo(() => {
    if (!userId && !userName) return [];
    return curricula.filter((c) =>
      c.assignedTo.some(
        (a) =>
          a.id === userId ||
          (userName && a.name?.toLowerCase().includes(userName.toLowerCase()))
      )
    );
  }, [curricula, userId, userName]);

  // Filter tasks assigned to this logged-in member
  const assignedTasks = useMemo(() => {
    if (!userId && !userName) return [];
    return tasks.filter(
      (t) => t.memberId === userId || t.memberId === "all" || !t.memberId
    );
  }, [tasks, userId, userName]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Giáo án & Bài tập</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Kế hoạch rèn luyện chuyên sâu do Huấn luyện viên chỉ định và nhiệm vụ rèn luyện tại nhà
        </p>
      </div>

      {/* 1. ASSIGNED CURRICULUMS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Giáo án được giao riêng cho bạn ({assignedCurriculums.length})
          </h3>
        </div>

        {assignedCurriculums.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chưa có giáo án nào được chỉ định
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Khi bạn tham gia các buổi tập 1-1 hoặc lớp nhóm, Huấn luyện viên sẽ thiết kế và bàn giao lộ trình rèn luyện cá nhân hóa tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedCurriculums.map((curr) => {
              const memberAssignee = curr.assignedTo.find(
                (a) => a.id === userId || (userName && a.name?.toLowerCase().includes(userName.toLowerCase()))
              );
              const progress = memberAssignee ? memberAssignee.progressPercent : 0;

              return (
                <div
                  key={curr.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {curr.sport} • {curr.level}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {curr.durationWeeks || Math.round(curr.duration / 15) || 4} tuần lộ trình
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {curr.name || curr.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {curr.goal || curr.description}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                        <span className="text-slate-600 dark:text-slate-400">Tiến độ bài tập:</span>
                        <span className={progress === 100 ? "text-emerald-600 font-bold" : "text-amber-600"}>
                          {progress}% {progress === 100 && "✓ Đã xong"}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>HLV phụ trách: <strong>{curr.coachName || "Huấn luyện viên"}</strong></span>
                      <span className="text-emerald-600 font-semibold">{curr.exercises?.length || 0} bài tập</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCurriculum(curr)}
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

      {/* 2. HOMEWORK TASKS */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bài tập & Nhiệm vụ rèn luyện cá nhân ({assignedTasks.length})
            </h3>
          </div>
          {assignedTasks.length > 0 && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Đã hoàn thành {assignedTasks.filter((t) => t.completed).length}/{assignedTasks.length}
            </span>
          )}
        </div>

        {assignedTasks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Chưa có bài tập rèn luyện tại nhà nào hôm nay. Hãy duy trì thói quen nghỉ ngơi và sinh hoạt lành mạnh!
          </div>
        ) : (
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  task.completed
                    ? "bg-slate-50/60 dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-70"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 shadow-xs"
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4
                      className={`text-xs font-bold ${
                        task.completed
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.dueDate && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Hạn: {task.dueDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                    <span>Giao bởi: <strong className="text-emerald-600 dark:text-emerald-400">{task.assignedBy}</strong></span>
                    <span>Ngày giao: {task.assignedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL MODAL (PORTAL) */}
      {selectedCurriculum &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {selectedCurriculum.sport} • {selectedCurriculum.level}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedCurriculum.name || selectedCurriculum.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedCurriculum(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mục tiêu huấn luyện:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedCurriculum.goal || selectedCurriculum.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Danh sách bài tập ({selectedCurriculum.exercises?.length || 0})
                  </h4>

                  <div className="space-y-2">
                    {selectedCurriculum.exercises?.map((ex, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {i + 1}. {ex.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {ex.sets ? `${ex.sets} hiệp x ` : ""}{ex.reps} • Nghỉ {ex.rest}
                          </p>
                          {ex.note && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                              💡 Lưu ý: {ex.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedCurriculum(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs cursor-pointer"
                >
                  Đóng giáo án
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
