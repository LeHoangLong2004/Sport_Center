import { useEffect, useState } from "react";
import type { MemberScreen } from "../types";
import { MemberAPI } from "../services/api";
import {
  Dumbbell,
  Eye,
  MessageSquare,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import type { MemberHomework } from "./workouts/workoutTypes";
import { HomeworkDetailModal } from "./workouts/HomeworkDetailModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

/**
 * Màn hình Kế hoạch tập luyện được giao của Hội viên (Member Workouts View).
 * Hiển thị kế hoạch bài tập và các bài tập về nhà do HLV phụ trách giao.
 * và cho phép hội viên đánh dấu hoàn thành bài tập.
 * 
 * @param onNavigate Hàm điều hướng màn hình
 */
export default function MemberWorkouts({ onNavigate }: Props) {
  const [homeworks, setHomeworks] = useState<MemberHomework[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<MemberHomework | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeworks = async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const raw = await MemberAPI.getMyHomework();
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray((raw as any)?.data)
        ? (raw as any).data
        : [];
      setHomeworks(list as MemberHomework[]);
    } catch (loadError) {
      console.error("Failed to load assigned workouts", loadError);
      if (!silent) {
        setHomeworks([]);
        setError("Không thể tải kế hoạch tập luyện được giao. Vui lòng thử lại.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    void loadHomeworks();

    let lastRefresh = Date.now();
    const handleAutoRefresh = () => {
      // Cooldown 30s to avoid UI freeze on tab switching
      if (Date.now() - lastRefresh > 30000) {
        lastRefresh = Date.now();
        void loadHomeworks(true);
      }
    };

    window.addEventListener("focus", handleAutoRefresh);
    window.addEventListener("local-storage-update", handleAutoRefresh);

    return () => {
      window.removeEventListener("focus", handleAutoRefresh);
      window.removeEventListener("local-storage-update", handleAutoRefresh);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Kế hoạch tập luyện cá nhân</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xem hướng dẫn chi tiết các bài tập do Huấn luyện viên giao để tự tin rèn luyện tại trung tâm
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

      {/* Assigned Workout Plans Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Kế hoạch được giao cho bạn ({homeworks.length})
          </h3>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            Đang tải kế hoạch...
          </div>
        ) : homeworks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Chưa có kế hoạch nào được giao
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Kế hoạch sẽ xuất hiện tại đây khi huấn luyện viên phụ trách giao cho bạn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworks.map((homework) => {
              const plan = homework.plan;
              const exerciseCount = plan?.exercises?.length || 0;

              return (
                <div
                  key={homework.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          {plan?.level || "Bài tập cá nhân"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Gợi ý AI & HLV duyệt</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{plan?.durationMinutes ? `${plan.durationMinutes} phút` : "Theo bài tập"}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {plan?.planName || "Bài tập rèn luyện"}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {plan?.goal || plan?.description || "Bài tập do huấn luyện viên đề xuất tại trung tâm."}
                    </p>

                    {homework.notes && (
                      <div className="mt-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Lưu ý của Coach: </span>
                        {homework.notes}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
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
                      <span>Xem bài tập chi tiết</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate("chat")}
                      className="px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Nhắn tin trao đổi với HLV phụ trách"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Nhắn HLV</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <HomeworkDetailModal
        homework={selectedHomework}
        onClose={() => setSelectedHomework(null)}
      />
    </div>
  );
}

