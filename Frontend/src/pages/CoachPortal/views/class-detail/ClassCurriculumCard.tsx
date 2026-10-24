import React from "react";
import { Dumbbell, BookOpen } from "lucide-react";
import type { MockCurriculum } from "../../services/api";

interface ClassCurriculumCardProps {
  curricula: MockCurriculum[];
  onNavigateToCurriculum?: () => void;
}

export const ClassCurriculumCard: React.FC<ClassCurriculumCardProps> = ({
  curricula,
  onNavigateToCurriculum,
}) => {
  const hasCurriculum = curricula && curricula.length > 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-orange-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Giáo án của ca dạy</h2>
        </div>
        {hasCurriculum ? (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Đã giao
          </span>
        ) : (
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            Chưa có
          </span>
        )}
      </div>

      {hasCurriculum ? (
        curricula.map((cur) => (
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
        ))
      ) : (
        <div className="py-8 px-4 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-500 ring-1 ring-orange-200 dark:ring-orange-800/40">
            <Dumbbell className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Chưa có giáo án cho ca dạy này
          </p>
          <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto">
            Ca dạy hiện chưa được gán giáo án. Huấn luyện viên có thể soạn giáo án mới hoặc chọn giáo án từ thư viện để giao cho lớp.
          </p>
          {onNavigateToCurriculum && (
            <button
              type="button"
              onClick={onNavigateToCurriculum}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Soạn giáo án ngay</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
