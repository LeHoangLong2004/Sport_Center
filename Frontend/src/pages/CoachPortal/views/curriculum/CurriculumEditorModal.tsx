import React from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import type { MockCurriculum, SportOption } from "../../services/api";
import { EMPTY_EXERCISE, makePlanSession } from "./types";

interface CurriculumEditorModalProps {
  editingId: string | null;
  draft: MockCurriculum | null;
  setDraft: React.Dispatch<React.SetStateAction<MockCurriculum | null>>;
  isSaving: boolean;
  error?: string | null;
  sports: SportOption[];
  onClose: () => void;
  onSave: () => void;
}

export const CurriculumEditorModal: React.FC<CurriculumEditorModalProps> = ({
  editingId,
  draft,
  setDraft,
  isSaving,
  error,
  sports,
  onClose,
  onSave,
}) => {
  if (!editingId || !draft) return null;

  const outline = draft.programOutline || { durationWeeks: 1, sessionsPerWeek: 2, sessions: [makePlanSession(1)] };
  const updateOutline = (next: typeof outline) => setDraft({ ...draft, programOutline: next });
  const updateSession = (index: number, changes: Partial<(typeof outline.sessions)[number]>) => {
    const sessions = outline.sessions.map((session, current) => current === index ? { ...session, ...changes } : session);
    updateOutline({ ...outline, sessions });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Kế hoạch huấn luyện</p>
            <h3 className="mt-0.5 font-bold text-slate-900 dark:text-white text-base">
              {editingId === "new" ? "Tạo kế hoạch tập luyện" : "Chỉnh sửa kế hoạch tập luyện"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex flex-col gap-5 text-sm">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-[13px] leading-5 text-slate-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-slate-300">
            Kế hoạch mô tả mục tiêu và nội dung tập có thể áp dụng cho một học viên hoặc cả lớp. Giáo án triển khai riêng cho từng ca dạy nằm trong chi tiết lớp học.
          </div>
          {error && (
            <div className="p-3.5 rounded-xl text-xs flex items-center gap-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              Tên kế hoạch: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Yoga nền tảng – cải thiện thăng bằng và độ linh hoạt"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Bộ môn:
              </label>
              <select
                value={draft.sportId || ""}
                onChange={(e) => {
                  const selected = sports.find((sport) => sport.id === e.target.value);
                  setDraft({
                    ...draft,
                    sportId: selected?.id || null,
                    sport: selected?.name || "",
                  });
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                {sports.length === 0 ? (
                  <option value="">Chưa có bộ môn</option>
                ) : (
                  sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Trình độ:
              </label>
              <select
                value={draft.level}
                onChange={(e) => setDraft({ ...draft, level: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                Thời lượng mỗi buổi (phút):
              </label>
              <input
                type="number"
                min={15}
                step={15}
                value={draft.duration}
                onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Trạng thái:
              </label>
              <select
                value={draft.status === "Nháp" ? "Nháp" : "Đã duyệt"}
                onChange={(e) => setDraft({ ...draft, status: e.target.value as any })}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="Đã duyệt">Sẵn sàng giao</option>
                <option value="Nháp">Bản nháp</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="mb-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Cấu trúc kế hoạch</h4>
              <p className="mt-0.5 text-xs text-slate-500">Thiết lập thời lượng và tần suất tập mỗi tuần.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Thời lượng kế hoạch (tuần)</label>
              <input type="number" min={1} max={104} value={outline.durationWeeks} onChange={(e) => updateOutline({ ...outline, durationWeeks: Math.max(1, Number(e.target.value) || 1) })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Số buổi mỗi tuần</label>
              <input type="number" min={1} max={14} value={outline.sessionsPerWeek} onChange={(e) => updateOutline({ ...outline, sessionsPerWeek: Math.max(1, Number(e.target.value) || 1) })} className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200" />
            </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Mục tiêu luyện tập:
            </label>
            <input
              type="text"
              placeholder="VD: Tăng sức mạnh cốt lõi, giảm áp lực thắt lưng..."
              value={draft.goal}
              onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Mô tả / Lưu ý khi tập:
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm về nhịp thở, tư thế chuẩn..."
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Course outline editor */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Lộ trình theo buổi ({outline.sessions.length})</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Mỗi kế hoạch gồm các buổi theo thứ tự; có thể bổ sung chi tiết dần.</p>
              </div>
              <button
                type="button"
                onClick={() => updateOutline({ ...outline, sessions: [...outline.sessions, makePlanSession(outline.sessions.length + 1, Math.min(outline.durationWeeks, Math.floor(outline.sessions.length / outline.sessionsPerWeek) + 1))] })}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm buổi
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {outline.sessions.map((session, i) => (
                  <div
                    key={`${session.sessionNumber}-${i}`}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Buổi {session.sessionNumber}</span>
                      <button type="button" onClick={() => updateOutline({ ...outline, sessions: outline.sessions.filter((_, index) => index !== i).map((item, index) => ({ ...item, sessionNumber: index + 1 })) })} className="p-1.5 text-slate-400 hover:text-rose-500 rounded" title="Xóa buổi" disabled={outline.sessions.length <= 1}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-[11px] font-semibold text-slate-500">Tuần</label><input type="number" min={1} max={outline.durationWeeks} value={session.weekNumber} onChange={(e) => updateSession(i, { weekNumber: Math.min(outline.durationWeeks, Math.max(1, Number(e.target.value) || 1)) })} className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" /></div>
                      <div><label className="text-[11px] font-semibold text-slate-500">Chủ đề buổi</label><input value={session.title} onChange={(e) => updateSession(i, { title: e.target.value })} placeholder="VD: Làm quen nhịp thở" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" /></div>
                    </div>

                    <div><label className="text-[11px] font-semibold text-slate-500">Mục tiêu buổi</label><input value={session.goal} onChange={(e) => updateSession(i, { goal: e.target.value })} placeholder="Kỹ năng hoặc kết quả cần đạt" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" /></div>
                    <div><label className="text-[11px] font-semibold text-slate-500">Nội dung chính</label><textarea rows={2} value={session.activities} onChange={(e) => updateSession(i, { activities: e.target.value })} placeholder="Khởi động, nội dung luyện tập, thư giãn..." className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" /></div>
                    <div><label className="text-[11px] font-semibold text-slate-500">Lưu ý cho HLV</label><input value={session.coachNotes} onChange={(e) => updateSession(i, { coachNotes: e.target.value })} placeholder="Biến thể, lưu ý an toàn, dụng cụ..." className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" /></div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                      <div className="flex items-center justify-between mb-2"><span className="font-semibold text-slate-700 dark:text-slate-300">Bài tập buổi này</span><button type="button" onClick={() => updateSession(i, { exercises: [...session.exercises, { ...EMPTY_EXERCISE }] })} className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1"><Plus className="w-3 h-3" />Thêm bài</button></div>
                      {session.exercises.length === 0 && <p className="mb-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-600">Chưa có bài tập trong buổi này. Bạn có thể thêm bài mới hoặc lưu kế hoạch ở dạng nháp.</p>}
                      {session.exercises.map((exercise, exerciseIndex) => (
                        <div key={exerciseIndex} className="grid grid-cols-1 sm:grid-cols-[1fr_100px_80px_64px] gap-2 mb-2">
                          <input value={exercise.name} onChange={(e) => { const exercises = [...session.exercises]; exercises[exerciseIndex] = { ...exercise, name: e.target.value }; updateSession(i, { exercises }); }} placeholder="Tên bài tập" className="p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                          <input value={exercise.reps} onChange={(e) => { const exercises = [...session.exercises]; exercises[exerciseIndex] = { ...exercise, reps: e.target.value }; updateSession(i, { exercises }); }} placeholder="Hiệp/lần" className="p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                          <input value={exercise.rest} onChange={(e) => { const exercises = [...session.exercises]; exercises[exerciseIndex] = { ...exercise, rest: e.target.value }; updateSession(i, { exercises }); }} placeholder="Nghỉ" className="p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                          <button type="button" onClick={() => updateSession(i, { exercises: session.exercises.filter((_, index) => index !== exerciseIndex) })} className="inline-flex items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/60" title={`Xóa bài tập ${exercise.name || exerciseIndex + 1}`} aria-label={`Xóa bài tập ${exercise.name || exerciseIndex + 1}`}><Trash2 className="w-4 h-4" /><span className="text-[11px] font-semibold">Xóa</span></button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-white/95 dark:bg-slate-900/95">
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
            {isSaving ? "Đang lưu..." : "Lưu kế hoạch"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
