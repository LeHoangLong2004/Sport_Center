import React from "react";
import { Dumbbell } from "lucide-react";
import type { MockCurriculum } from "../../services/api";

interface ClassCurriculumCardProps {
  curricula: MockCurriculum[];
}

export const ClassCurriculumCard: React.FC<ClassCurriculumCardProps> = ({ curricula }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Giáo án của ca dạy</h2>
        </div>
        <span className="text-xs font-semibold text-emerald-600">Đã giao</span>
      </div>

      {curricula.map((cur) => (
        <div key={cur.id} className="mt-4 space-y-3">
          <div>
            <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200">{cur.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cur.description || "Tập trung chuẩn form và sức bền tim mạch."}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {cur.exercises.map((ex, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {ex.name}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span>
                    Khối lượng: <strong className="text-slate-700 dark:text-slate-300">{ex.reps}</strong>
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Nghỉ: {ex.rest}</span>
                </div>
                {ex.note && (
                  <div className="text-[10px] text-slate-400 italic mt-1 pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                    * {ex.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
