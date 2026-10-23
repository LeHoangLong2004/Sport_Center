import React from "react";
import { Clock, Dumbbell, Users, Edit2, Send, Sparkles, CheckCircle2 } from "lucide-react";
import type { MockCurriculum } from "../../services/api";
import { STATUS_STYLE, type CurriculumStatus } from "./types";

interface CurriculumGridProps {
  loading: boolean;
  curricula: MockCurriculum[];
  onEdit: (c: MockCurriculum) => void;
  onAssign: (c: MockCurriculum) => void;
  onApprove?: (c: MockCurriculum) => void;
  approvingId?: string | null;
}

export const CurriculumGrid: React.FC<CurriculumGridProps> = ({
  loading,
  curricula,
  onEdit,
  onAssign,
  onApprove,
  approvingId,
}) => {
  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        Đang tải danh sách giáo án...
      </div>
    );
  }

  if (curricula.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
        Không tìm thấy giáo án nào phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {curricula.map((c) => {
        const statusBadge = STATUS_STYLE[c.status as CurriculumStatus] || {
          label: c.status,
          bg: "bg-slate-100",
          text: "text-slate-600",
        };

        const isAiPlan = c.source === "ai_recommendation" || c.source === "ai";

        return (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                      {c.name}
                    </h3>
                    {isAiPlan && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 flex items-center gap-1 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                        AI Gợi ý
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.sport}
                    </span>
                    <span className="text-xs text-slate-400">• {c.level}</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      • <Clock className="w-3 h-3" /> {c.duration} phút
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg} ${statusBadge.text} shrink-0`}
                >
                  {statusBadge.label}
                </span>
              </div>

              {c.goal && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Mục tiêu:</span> {c.goal}
                </p>
              )}

              {/* Exercises preview snippet */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Danh sách bài tập ({c.exercises.length} bài)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {c.exercises.slice(0, 4).map((ex, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Dumbbell className="w-3 h-3 text-slate-400" />
                      <span className="font-medium">{ex.name || `Bài ${i + 1}`}</span>
                      {ex.reps && <span className="text-slate-400 text-[10px]">({ex.reps})</span>}
                    </span>
                  ))}
                  {c.exercises.length > 4 && (
                    <span className="text-xs px-2 py-1 text-slate-400 self-center">
                      +{c.exercises.length - 4} bài nữa
                    </span>
                  )}
                </div>
              </div>

              {/* Assigned to pills */}
              {c.assignedTo.length > 0 && (
                <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Đã giao cho: {c.assignedTo.map((t) => t.name).join(", ")}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                Cập nhật: {c.updatedAt}
              </span>

              <div className="flex items-center gap-2">
                {onApprove && (c.status === "Nháp" || (c.status as string) === "draft") && (
                  <button
                    type="button"
                    disabled={approvingId === c.id}
                    onClick={() => onApprove(c)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                    title="Đánh dấu giáo án này là sẵn sàng giao cho học viên"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="whitespace-nowrap">{approvingId === c.id ? "Đang xử lý..." : "Sẵn sàng giao"}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onAssign(c)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3 h-3" /> Giao bài
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
