import React from "react";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { Flow5Exercise } from "../../services/api";

interface CoachAiExerciseCardProps {
  exercise: Flow5Exercise;
  index: number;
  totalCount: number;
  isDraft: boolean;
  onUpdate: (patch: Partial<Flow5Exercise>) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}

export const CoachAiExerciseCard: React.FC<CoachAiExerciseCardProps> = ({
  exercise,
  index,
  totalCount,
  isDraft,
  onUpdate,
  onMove,
  onRemove,
}) => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-600">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <input
            type="text"
            value={exercise.name}
            disabled={!isDraft}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-orange-500 focus:outline-none flex-1 truncate"
            placeholder="Tên bài tập"
          />
        </div>

        {isDraft && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove("up")}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
              title="Di chuyển lên"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={() => onMove("down")}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer"
              title="Di chuyển xuống"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
              title="Xóa bài tập"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Dosage inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Số hiệp (Sets)</span>
          <input
            type="text"
            value={exercise.sets || ""}
            disabled={!isDraft}
            onChange={(e) => onUpdate({ sets: e.target.value })}
            placeholder="VD: 3 hoặc 4"
            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Số lần (Reps)</span>
          <input
            type="text"
            value={exercise.reps || ""}
            disabled={!isDraft}
            onChange={(e) => onUpdate({ reps: e.target.value })}
            placeholder="VD: 12-15 lần"
            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Thời gian</span>
          <input
            type="text"
            value={exercise.duration || ""}
            disabled={!isDraft}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="VD: 45 giây"
            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Nghỉ giữa hiệp</span>
          <input
            type="text"
            value={exercise.rest || ""}
            disabled={!isDraft}
            onChange={(e) => onUpdate({ rest: e.target.value })}
            placeholder="VD: 60s"
            className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Technique tip */}
      <div>
        <input
          type="text"
          value={exercise.note || ""}
          disabled={!isDraft}
          onChange={(e) => onUpdate({ note: e.target.value })}
          placeholder="Lưu ý kỹ thuật: VD: Gồng bụng, gót chạm sàn, thở đều..."
          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-orange-500 focus:outline-none italic placeholder:not-italic"
        />
      </div>
    </div>
  );
};
