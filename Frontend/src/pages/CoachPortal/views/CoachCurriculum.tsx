/**
 * CO-06 — Giáo án
 * Danh sách, tạo/sửa, giao cho lớp/học viên thuộc quyền.
 * Demo: thao tác ghi rõ "chưa nối BE".
 */
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { CoachAPI } from "../services/api";
import type { MockCurriculum, MockSession, MockMember } from "../services/api";

type CurriculumStatus = "Nháp" | "Đã giao" | "Lưu trữ";

const STATUS_STYLE: Record<CurriculumStatus, string> = {
  "Nháp":      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Đã giao":   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Lưu trữ":  "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

const EMPTY_EXERCISE = { name: "", reps: "", rest: "", note: "" };

function makeDraft(): MockCurriculum {
  return {
    id: `cur_${Date.now()}`,
    name: "",
    sport: "Yoga",
    goal: "",
    level: "Cơ bản",
    duration: 60,
    status: "Nháp",
    updatedAt: new Date().toISOString().split("T")[0],
    description: "",
    exercises: [{ ...EMPTY_EXERCISE }],
    assignedTo: [],
  };
}

export default function CoachCurriculum() {
  const [curricula, setCurricula] = useState<MockCurriculum[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MockCurriculum | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [assignTarget, setAssignTarget] = useState<{ curricId: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      CoachAPI.getCurricula(),
      CoachAPI.getSchedule(),
      CoachAPI.getMembers()
    ]).then(([cur, sch, mem]) => {
      setCurricula(cur);
      setSessions(sch);
      setMembers(mem);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const editingCurric = useMemo(() => draft, [draft]);

  const openNew = () => {
    setDraft(makeDraft());
    setEditingId("new");
  };

  const openEdit = (c: MockCurriculum) => {
    setDraft({ ...c, exercises: c.exercises.map((e) => ({ ...e })) });
    setEditingId(c.id);
  };

  const closeEdit = () => {
    setDraft(null);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.name.trim()) { setFeedback({ type: "error", msg: "Tên giáo án không được để trống." }); return; }
    setIsSaving(true);
    setFeedback(null);
    await CoachAPI.saveCurriculum({ ...draft, updatedAt: new Date().toISOString().split("T")[0] });
    const cur = await CoachAPI.getCurricula();
    setCurricula(cur);
    setIsSaving(false);
    setFeedback({ type: "success", msg: "Đã lưu thành công" });
    closeEdit();
  };

  const handleAssign = async (type: "class" | "member", id: string, name: string) => {
    if (!assignTarget) return;
    await CoachAPI.assignCurriculum(assignTarget.curricId, { type, id, name });
    const cur = await CoachAPI.getCurricula();
    setCurricula(cur);
    setAssignTarget(null);
    setFeedback({ type: "success", msg: "Đã giao giáo án thành công" });
  };

  const uniqueClasses = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    sessions.forEach((s) => { if (!map.has(s.classId)) map.set(s.classId, { id: s.classId, name: s.className.split("–")[0].trim() }); });
    return Array.from(map.values());
  }, [sessions]);

  if (loading) return <div className="py-20 text-center text-slate-400">Đang tải giáo án...</div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Giáo án</h1>
        <button type="button" onClick={openNew}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-md shadow-teal-500/20">
          + Tạo giáo án mới
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-xl px-4 py-2 text-sm font-medium ${feedback.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"}`}>
          {feedback.type === "success" ? "✓" : "✗"} {feedback.msg}
        </div>
      )}

      {/* Danh sách */}
      <div className="flex flex-col gap-3">
        {curricula.map((c) => (
          <div key={c.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[c.status as CurriculumStatus]}`}>
                    {c.status}
                  </span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {c.sport} · {c.level} · {c.duration} phút · {c.exercises.length} bài · Cập nhật {c.updatedAt}
                </div>
                {c.assignedTo.length > 0 && (
                  <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                    Đã giao: {c.assignedTo.map((t) => t.name).join(", ")}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => openEdit(c)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Sửa
                </button>
                {c.status !== "Lưu trữ" && (
                  <button type="button" onClick={() => setAssignTarget({ curricId: c.id })}
                    className="px-2.5 py-1.5 text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 border border-teal-200 dark:border-teal-700">
                    Giao
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form modal */}
      {editingId && draft && createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingId === "new" ? "Tạo giáo án mới" : "Sửa giáo án"}
              </h2>
              <button type="button" onClick={closeEdit} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-3xl leading-none transition-colors">&times;</button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
              <Field label="Tên giáo án *">
                <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="VD: Yoga Cơ Bản – Tuần 1" className={inputCls} />
              </Field>
              
              <div className="grid grid-cols-2 gap-5">
                <Field label="Môn">
                  <select value={draft.sport} onChange={(e) => setDraft({ ...draft, sport: e.target.value })} className={inputCls}>
                    {["Yoga", "Gym", "Bơi", "CrossFit", "Cầu lông", "Bóng đá"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Trình độ">
                  <select value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} className={inputCls}>
                    {["Cơ bản", "Trung cấp", "Nâng cao"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              
              <Field label="Mục tiêu">
                <input type="text" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })}
                  placeholder="VD: Giảm cân, tăng cơ, cải thiện linh hoạt..." className={inputCls} />
              </Field>
              
              <Field label="Thời lượng (phút)">
                <input type="number" min={15} step={15} value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: +e.target.value })}
                  className={inputCls} />
              </Field>
              
              <Field label="Mô tả / Lưu ý">
                <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={3} placeholder="Ghi chú thêm về giáo án này..." className={`${inputCls} resize-none`} />
              </Field>

              {/* Exercises */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Danh sách bài tập</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Liệt kê các bài tập chi tiết cho giáo án này</p>
                  </div>
                  <button type="button" className="text-sm px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-100 font-medium transition-colors flex items-center gap-1"
                    onClick={() => setDraft({ ...draft, exercises: [...draft.exercises, { ...EMPTY_EXERCISE }] })}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                    Thêm bài tập
                  </button>
                </div>
                
                <div className="flex flex-col gap-3">
                  {draft.exercises.map((ex, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-3 items-start bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 relative group transition-colors hover:border-slate-200 dark:hover:border-slate-600">
                      
                      {/* Delete button (absolute on small, inline on desktop) */}
                      <button type="button" className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg sm:mt-1 transition-colors"
                        onClick={() => { const exs = draft.exercises.filter((_, j) => j !== i); setDraft({ ...draft, exercises: exs }); }}
                        title="Xóa bài tập này">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>

                      <div className="flex-1 w-full">
                        <input type="text" placeholder="Tên bài tập (VD: Plank, Push-up...)" value={ex.name}
                          onChange={(e) => { const exs = [...draft.exercises]; exs[i] = { ...ex, name: e.target.value }; setDraft({ ...draft, exercises: exs }); }}
                          className={`${inputCls} font-medium`} />
                      </div>
                      
                      <div className="flex gap-3 w-full sm:w-auto">
                        <div className="w-1/3 sm:w-28 shrink-0">
                          <input type="text" placeholder="Số hiệp/lần" value={ex.reps}
                            onChange={(e) => { const exs = [...draft.exercises]; exs[i] = { ...ex, reps: e.target.value }; setDraft({ ...draft, exercises: exs }); }}
                            className={inputCls} title="Số hiệp/lần (VD: 3x15)" />
                        </div>
                        <div className="w-1/3 sm:w-24 shrink-0">
                          <input type="text" placeholder="Nghỉ" value={ex.rest}
                            onChange={(e) => { const exs = [...draft.exercises]; exs[i] = { ...ex, rest: e.target.value }; setDraft({ ...draft, exercises: exs }); }}
                            className={inputCls} title="Thời gian nghỉ (VD: 30s)" />
                        </div>
                        <div className="w-1/3 sm:w-32 shrink-0">
                          <input type="text" placeholder="Ghi chú" value={ex.note}
                            onChange={(e) => { const exs = [...draft.exercises]; exs[i] = { ...ex, note: e.target.value }; setDraft({ ...draft, exercises: exs }); }}
                            className={inputCls} title="Ghi chú thêm" />
                        </div>
                      </div>

                    </div>
                  ))}
                  
                  {draft.exercises.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                      Chưa có bài tập nào. Hãy bấm "Thêm bài tập" để bắt đầu soạn giáo án.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={closeEdit}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                Hủy bỏ
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors shadow-md shadow-teal-500/20">
                {isSaving ? "Đang lưu..." : "Lưu giáo án"}
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}

      {/* Assign modal */}
      {assignTarget && createPortal(
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Giao giáo án</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Chọn lớp hoặc học viên để giao:</p>
            <div className="flex flex-col gap-2">
              {uniqueClasses.map((cls) => (
                <button key={cls.id} type="button"
                  className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-sm text-slate-800 dark:text-slate-100"
                  onClick={() => handleAssign("class", cls.id, cls.name)}>
                  📚 Lớp: {cls.name}
                </button>
              ))}
              {members.map((m) => (
                <button key={m.id} type="button"
                  className="text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-sm text-slate-800 dark:text-slate-100"
                  onClick={() => handleAssign("member", m.id, m.name)}>
                  👤 {m.name} ({m.code})
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setAssignTarget(null)}
              className="mt-2 text-sm text-slate-400 hover:text-slate-600">Đóng</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full";
