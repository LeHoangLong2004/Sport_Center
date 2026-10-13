import React from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import type { MockCurriculum } from "../../services/api";
import { EMPTY_EXERCISE } from "./types";

interface CurriculumEditorModalProps {
  editingId: string | null;
  draft: MockCurriculum | null;
  setDraft: React.Dispatch<React.SetStateAction<MockCurriculum | null>>;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const CurriculumEditorModal: React.FC<CurriculumEditorModalProps> = ({
  editingId,
  draft,
  setDraft,
  isSaving,
  onClose,
  onSave,
}) => {
  if (!editingId || !draft) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {editingId === "new" ? "Tạo giáo án mới" : "Chỉnh sửa giáo án"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Tên giáo án: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Yoga Cân Bằng Cột Sống – Tuần 1"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Bộ môn:
              </label>
              <select
                value={draft.sport}
                onChange={(e) => setDraft({ ...draft, sport: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {["Gym", "Yoga", "Pilates", "Boxing", "Bơi", "CrossFit"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Trình độ:
              </label>
              <select
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {["Cơ bản", "Trung cấp", "Nâng cao"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Thời lượng (phút):
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={draft.duration}
                onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Mục tiêu luyện tập:
            </label>
            <input
              type="text"
              placeholder="VD: Tăng sức mạnh cốt lõi, giảm áp lực thắt lưng..."
              value={draft.goal}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Mô tả / Lưu ý khi tập:
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm về nhịp thở, tư thế chuẩn..."
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Exercise list editor */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Danh sách bài tập ({draft.exercises.length})
              </span>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    exercises: [...draft.exercises, { ...EMPTY_EXERCISE }],
                  })
                }
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm bài tập
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {draft.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                >
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Tên bài (VD: Squat, Plank...)"
                      value={ex.name}
                      onChange={(e) => {
                        const updated = [...draft.exercises];
                        updated[i].name = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Hiệp/Lần (3x12)"
                      value={ex.reps}
                      onChange={(e) => {
                        const updated = [...draft.exercises];
                        updated[i].reps = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="w-24 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Nghỉ (45s)"
                      value={ex.rest}
                      onChange={(e) => {
                        const updated = [...draft.exercises];
                        updated[i].rest = e.target.value;
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="w-20 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = draft.exercises.filter((_, idx) => idx !== i);
                        setDraft({ ...draft, exercises: updated });
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                      title="Xóa bài này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? "Đang lưu..." : "Lưu giáo án"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
