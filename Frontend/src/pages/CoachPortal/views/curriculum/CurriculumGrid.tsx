import React from "react";
import { Clock, Dumbbell, Users, Edit2, Send } from "lucide-react";
import type { MockCurriculum } from "../../services/api";
import { STATUS_STYLE, type CurriculumStatus } from "./types";

interface CurriculumGridProps {
  loading: boolean;
  curricula: MockCurriculum[];
  onEdit: (c: MockCurriculum) => void;
  onAssign: (c: MockCurriculum) => void;
}

export const CurriculumGrid: React.FC<CurriculumGridProps> = ({
  loading,
  curricula,
  onEdit,
  onAssign,
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

        return (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                    {c.name}
                  </h3>
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
