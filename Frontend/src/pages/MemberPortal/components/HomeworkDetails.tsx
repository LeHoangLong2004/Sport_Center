import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface HomeworkDetailsProps {
  homework: any | null;
  onClose: () => void;
}

export function HomeworkDetails({ homework, onClose }: HomeworkDetailsProps) {
  const selectedHomework = homework;
  return (selectedHomework?.plan &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] shadow-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Giáo án được giao</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedHomework.plan.planName}</h3>
                </div>
                <button onClick={() => onClose()} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Đóng">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mục tiêu huấn luyện:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{selectedHomework.plan.goal || selectedHomework.plan.description || "Thực hiện theo hướng dẫn của huấn luyện viên."}</p>
                  {selectedHomework.notes && <p className="mt-2 text-amber-600 dark:text-amber-400">Ghi chú: {selectedHomework.notes}</p>}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Danh sách bài tập ({selectedHomework.plan.exercises.length})</h4>
                  <div className="space-y-2">
                    {selectedHomework.plan.exercises.map((exercise, index) => (
                      <div key={exercise.id || index} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-850">
                        <p className="font-bold text-slate-900 dark:text-white">{index + 1}. {exercise.name}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{exercise.reps || "Theo hướng dẫn"}{exercise.rest ? ` • Nghỉ ${exercise.rest}` : ""}</p>
                        {exercise.note && <p className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-1">Lưu ý: {exercise.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
                <button type="button" onClick={() => onClose()} className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs cursor-pointer">Đóng giáo án</button>
              </div>
            </div>
          </div>,
          document.body,
        ));
}

