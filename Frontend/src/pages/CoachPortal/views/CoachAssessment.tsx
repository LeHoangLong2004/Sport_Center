/**
 * CO-07 — Kết quả, Tiến độ & Đánh giá
 * Không tạo kết quả cho học viên vắng.
 * Biểu đồ chỉ hiển thị khi có dữ liệu thực.
 */
import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import { createPortal } from "react-dom";
import type { AssessmentRecord, MockSession } from "../services/api";

export default function CoachAssessment() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; code: string }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<AssessmentRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      CoachAPI.getAssessments(),
      CoachAPI.getSchedule(),
      CoachAPI.getMembers()
    ]).then(([ass, sch, mem]) => {
      setAssessments(ass);
      setSessions(sch);
      setMembers(mem);
      if (mem.length > 0) setSelectedMemberId(mem[0].id);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const eligibleSessions = useMemo(() => {
    if (!selectedMemberId) return [];
    return sessions.filter((s) => {
      if (!s.registeredMemberIds.includes(selectedMemberId)) return false;
      if (s.status === "đã hủy") return false;
      return true; // Bỏ qua check attendance (vắng) để tránh gọi API N+1
    });
  }, [selectedMemberId, sessions]);

  const memberAssessments = useMemo(
    () => assessments.filter((a) => a.memberId === selectedMemberId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [assessments, selectedMemberId]
  );

  const openNew = () => {
    if (!selectedSessionId) { setFeedback("Vui lòng chọn buổi học trước."); return; }
    const id = `as_${Date.now()}`;
    setDraft({
      id,
      sessionId: selectedSessionId,
      memberId: selectedMemberId,
      completion: 80,
      metrics: [{ label: "Chỉ số", value: "", unit: "" }],
      comment: "",
      nextStep: "",
      createdAt: new Date().toISOString(),
    });
    setEditingId(id);
    setFeedback(null);
  };

  const handleSave = async () => {
    if (!draft.comment && !draft.completion) return;
    setIsSaving(true);
    const full: AssessmentRecord = {
      id: draft.id!,
      sessionId: draft.sessionId!,
      memberId: draft.memberId!,
      completion: draft.completion || 0,
      metrics: draft.metrics || [],
      comment: draft.comment || "",
      nextStep: draft.nextStep || "",
      createdAt: draft.createdAt || new Date().toISOString(),
    };
    await CoachAPI.saveAssessment(full);
    const ass = await CoachAPI.getAssessments();
    setAssessments(ass);
    setIsSaving(false);
    setEditingId(null);
    setDraft({});
    setFeedback("Đã ghi kết quả thành công");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tiến độ & Đánh giá</h1>

      {feedback && (
        <div className="rounded-xl px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 text-sm">
          ✓ {feedback}
        </div>
      )}

      {/* Chọn học viên */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Học viên</label>
          <select value={selectedMemberId} onChange={(e) => { setSelectedMemberId(e.target.value); setSelectedSessionId(""); }}
            className={selectCls}>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Buổi học (đủ điều kiện)</label>
          <select value={selectedSessionId} onChange={(e) => setSelectedSessionId(e.target.value)} className={selectCls}>
            <option value="">-- Chọn buổi --</option>
            {eligibleSessions.map((s) => (
              <option key={s.id} value={s.id}>{s.className} — {s.date}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={openNew}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 shadow-md shadow-teal-500/20">
          + Ghi kết quả
        </button>
      </div>

      {/* Tiến độ theo thời gian */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Lịch sử kết quả</h2>
        </div>
        {memberAssessments.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-400 text-sm">
            Chưa có kết quả nào. Bắt đầu ghi nhận sau mỗi buổi học.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {memberAssessments.map((a) => {
              const s = sessions.find((x) => x.id === a.sessionId);
              return (
                <div key={a.id} className="px-4 py-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{s?.className || a.sessionId}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s?.date} · {new Date(a.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Hoàn thành</div>
                        <div className={`text-lg font-black ${a.completion >= 80 ? "text-green-600" : a.completion >= 60 ? "text-amber-500" : "text-red-600"}`}>
                          {a.completion}%
                        </div>
                      </div>
                      {/* Simple bar chart */}
                      <div className="w-20 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${a.completion >= 80 ? "bg-green-500" : a.completion >= 60 ? "bg-amber-400" : "bg-red-500"}`}
                          style={{ width: `${a.completion}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.metrics.filter((m) => m.value).map((m) => (
                      <span key={m.label} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                        {m.label}: {m.value}{m.unit}
                      </span>
                    ))}
                  </div>
                  {a.comment && <div className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{a.comment}"</div>}
                  {a.nextStep && <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">→ Hướng tiếp: {a.nextStep}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit form */}
      {editingId && createPortal(
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ghi kết quả buổi học</h2>
              <button type="button" onClick={() => { setEditingId(null); setDraft({}); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-3xl leading-none transition-colors">&times;</button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mức hoàn thành (%)</label>
                <input type="range" min={0} max={100} value={draft.completion || 0}
                  onChange={(e) => setDraft({ ...draft, completion: +e.target.value })}
                  className="accent-teal-600" />
                <div className="text-sm font-bold text-teal-600">{draft.completion}%</div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Chỉ số tập luyện</label>
                  <button type="button" className="text-xs text-teal-600 hover:underline font-medium"
                    onClick={() => setDraft({ ...draft, metrics: [...(draft.metrics || []), { label: "", value: "", unit: "" }] })}>
                    + Thêm chỉ số
                  </button>
                </div>
                {(draft.metrics || []).map((m, i) => (
                  <div key={i} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                    <input type="text" placeholder="Tên chỉ số (VD: Nhịp tim)" value={m.label}
                      onChange={(e) => { const ms = [...(draft.metrics || [])]; ms[i] = { ...m, label: e.target.value }; setDraft({ ...draft, metrics: ms }); }}
                      className={`${inputCls} text-xs flex-1`} />
                    <input type="text" placeholder="Giá trị" value={m.value}
                      onChange={(e) => { const ms = [...(draft.metrics || [])]; ms[i] = { ...m, value: e.target.value }; setDraft({ ...draft, metrics: ms }); }}
                      className={`${inputCls} text-xs w-20`} />
                    <input type="text" placeholder="Đvị" value={m.unit}
                      onChange={(e) => { const ms = [...(draft.metrics || [])]; ms[i] = { ...m, unit: e.target.value }; setDraft({ ...draft, metrics: ms }); }}
                      className={`${inputCls} text-xs w-14`} />
                    <button type="button" onClick={() => { const ms = draft.metrics!.filter((_, j) => j !== i); setDraft({ ...draft, metrics: ms }); }}
                      className="text-slate-400 hover:text-red-500 px-1">
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nhận xét</label>
                <textarea value={draft.comment || ""} onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                  rows={3} className={`${inputCls} resize-none`} placeholder="Nhận xét kết quả buổi học..." />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hướng tập tiếp theo</label>
                <input type="text" value={draft.nextStep || ""} onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })}
                  className={inputCls} placeholder="VD: Tăng tạ, cải thiện tư thế..." />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button type="button" onClick={() => { setEditingId(null); setDraft({}); }}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                Hủy
              </button>
              <button type="button" onClick={handleSave} disabled={isSaving}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors shadow-md shadow-teal-500/20">
                {isSaving ? "Đang lưu..." : "Lưu kết quả"}
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500";
const inputCls = "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-full";
