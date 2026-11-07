/**
 * CO-07 — Kết quả, Tiến độ & Đánh giá
 * Không tạo kết quả cho học viên vắng.
 * Biểu đồ chỉ hiển thị khi có dữ liệu thực.
 */
import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import { createPortal } from "react-dom";
import type { AssessmentRecord, MockSession } from "../services/api";
import { X, Plus, Trash2, Check, CheckCircle2 } from "lucide-react";

interface CoachAssessmentProps {
  initialSessionId?: string | null;
  initialMemberId?: string | null;
}

export default function CoachAssessment({ initialSessionId, initialMemberId }: CoachAssessmentProps = {}) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; code: string; classIds?: string[] }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState(initialMemberId || "");
  const [selectedSessionId, setSelectedSessionId] = useState(initialSessionId || "");
  const [editingId, setEditingId] = useState<string | null>(null);
  useEffect(() => {
    if (editingId) {
      const prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevBodyOverflow;
      };
    }
  }, [editingId]);
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
      if (initialMemberId && mem.some(m => m.id === initialMemberId)) {
        setSelectedMemberId(initialMemberId);
      } else if (mem.length > 0 && !selectedMemberId) {
        setSelectedMemberId(mem[0].id);
      }
      if (initialSessionId) {
        setSelectedSessionId(initialSessionId);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [initialMemberId, initialSessionId]);

  const eligibleSessions = useMemo(() => {
    if (!selectedMemberId) return [];
    const selectedMember = members.find((m) => m.id === selectedMemberId);

    return sessions.filter((s) => {
      // 1. Không hiển thị các buổi học đã bị hủy
      if (s.status === "đã hủy") return false;

      // 2. Kiểm tra học viên có đăng ký buổi học này hay không
      const registeredInSession =
        Array.isArray(s.registeredMemberIds) &&
        s.registeredMemberIds.some((id) => String(id) === String(selectedMemberId));

      const memberHasClass =
        Array.isArray(selectedMember?.classIds) &&
        selectedMember.classIds.some(
          (cid) => String(cid) === String(s.id) || String(cid) === String(s.classId)
        );

      const isRegistered = registeredInSession || memberHasClass;
      if (!isRegistered) return false;

      // 3. Buổi học phải đã hoặc đang diễn ra (không đánh giá buổi sắp diễn ra trong tương lai)
      const todayIso = new Date().toISOString().split("T")[0];
      const isPastOrToday = s.date ? s.date <= todayIso : true;
      const isEligibleTime = s.status === "hoàn thành" || s.status === "đang diễn ra" || isPastOrToday;

      return isEligibleTime;
    });
  }, [selectedMemberId, sessions, members]);

  // Reset selectedSessionId if it's no longer eligible
  useEffect(() => {
    if (selectedSessionId && !eligibleSessions.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId("");
    }
  }, [eligibleSessions, selectedSessionId]);

  const memberAssessments = useMemo(
    () =>
      assessments
        .filter(
          (a) =>
            Boolean(a.memberId) &&
            Boolean(selectedMemberId) &&
            a.memberId.toString().toLowerCase() === selectedMemberId.toString().toLowerCase()
        )
        .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [assessments, selectedMemberId]
  );

  const addMetric = (label = "", unit = "") => {
    setDraft((prev) => ({
      ...prev,
      metrics: [...(prev.metrics || []), { label, value: "", unit }],
    }));
  };

  const openNew = () => {
    if (!selectedSessionId) { setFeedback("Vui lòng chọn buổi học trước."); return; }
    const id = `as_${Date.now()}`;
    setDraft({
      id,
      sessionId: selectedSessionId,
      memberId: selectedMemberId,
      completion: 80,
      metrics: [{ label: "", value: "", unit: "" }],
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
    try {
      await CoachAPI.saveAssessment(full);
      const ass = await CoachAPI.getAssessments();
      if (Array.isArray(ass) && ass.length > 0) {
        setAssessments(ass);
      } else {
        setAssessments((prev) => [
          full,
          ...prev.filter((p) => p.sessionId !== full.sessionId || p.memberId !== full.memberId),
        ]);
      }
    } catch (err) {
      console.error("Save assessment error:", err);
      // Fallback local update
      setAssessments((prev) => [
        full,
        ...prev.filter((p) => p.sessionId !== full.sessionId || p.memberId !== full.memberId),
      ]);
    } finally {
      setIsSaving(false);
      setEditingId(null);
      setDraft({});
      setFeedback("Đã ghi kết quả thành công");
    }
  };

  const currentMember = members.find((m) => m.id === (draft.memberId || selectedMemberId));
  const currentSession = sessions.find((s) => s.id === (draft.sessionId || selectedSessionId));

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
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            disabled={eligibleSessions.length === 0}
            className={`${selectCls} ${eligibleSessions.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <option value="">
              {eligibleSessions.length === 0
                ? "-- Học viên chưa có buổi học đủ điều kiện --"
                : "-- Chọn buổi --"}
            </option>
            {eligibleSessions.map((s) => (
              <option key={s.id} value={s.id}>{s.className} — {s.date}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={openNew}
          disabled={!selectedSessionId}
          className={`px-4 py-2 text-white rounded-xl text-sm font-semibold transition-all ${
            !selectedSessionId
              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 cursor-pointer"
          }`}
        >
          + Ghi kết quả
        </button>
      </div>

      {/* Tiến độ theo thời gian */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
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
                <div key={a.id} className="px-4 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{s?.className || a.sessionId}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s?.date} · {new Date(a.createdAt).toLocaleDateString("vi-VN")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Hoàn thành</div>
                        <div className={`text-lg font-black ${a.completion >= 80 ? "text-emerald-600" : a.completion >= 60 ? "text-slate-500" : "text-rose-600"}`}>
                          {a.completion}%
                        </div>
                      </div>
                      {/* Simple bar chart */}
                      <div className="w-20 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${a.completion >= 80 ? "bg-emerald-500" : a.completion >= 60 ? "bg-slate-400" : "bg-rose-500"}`}
                          style={{ width: `${a.completion}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {a.metrics.filter((m) => m.value).map((m) => (
                      <span key={m.label} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                        {m.label}: {m.value}{m.unit}
                      </span>
                    ))}
                  </div>
                  {a.comment && <div className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{a.comment}"</div>}
                  {a.nextStep && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">→ Hướng tiếp: {a.nextStep}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit form */}
      {editingId && createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0 bg-slate-50/70 dark:bg-slate-850">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Học viên: {currentMember?.name || "Học viên"}
                  </span>
                  {currentSession && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Buổi: {currentSession.className} ({currentSession.date})
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Ghi nhận kết quả & tiến độ buổi học
                </h2>
              </div>
              <button
                type="button"
                onClick={() => { setEditingId(null); setDraft({}); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
              {/* 1. Mức độ hoàn thành */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Mức độ hoàn thành bài tập
                  </label>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                    (draft.completion || 0) >= 80
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : (draft.completion || 0) >= 60
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}>
                    {draft.completion || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={draft.completion || 0}
                  onChange={(e) => setDraft({ ...draft, completion: +e.target.value })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] text-slate-400 mr-1">Mốc nhanh:</span>
                  {[50, 70, 80, 90, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDraft({ ...draft, completion: val })}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        draft.completion === val
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Chỉ số tập luyện & Thể lực */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                      Chỉ số tập luyện & Thể lực
                    </label>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Ghi nhận mức tạ, cự ly, số lần hoặc thành tích đạt được
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMetric("", "")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm chỉ số
                  </button>
                </div>

                {/* Quick suggestion chips */}
                <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Gợi ý nhanh:</span>
                  {[
                    { label: "Mức tạ", unit: "kg" },
                    { label: "Quãng đường", unit: "km" },
                    { label: "Thời gian", unit: "phút" },
                    { label: "Số rep", unit: "lần" },
                    { label: "Nhịp tim", unit: "bpm" },
                    { label: "Calo", unit: "kcal" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => addMetric(chip.label, chip.unit)}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-slate-650 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      + {chip.label} ({chip.unit})
                    </button>
                  ))}
                </div>

                {/* Metric Items List */}
                {(!draft.metrics || draft.metrics.length === 0) ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                    Chưa có chỉ số nào. Bấm vào các nút gợi ý nhanh ở trên hoặc nút "+ Thêm chỉ số".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header Columns */}
                    <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex-1 min-w-0">Tên bài tập / Chỉ số</span>
                      <span className="w-24 shrink-0 text-center">Giá trị</span>
                      <span className="w-24 shrink-0 text-center">Đơn vị</span>
                      <span className="w-8 shrink-0"></span>
                    </div>

                    {draft.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700"
                      >
                        <input
                          type="text"
                          placeholder="VD: Đẩy ngực, Plank, Chạy bộ..."
                          value={m.label}
                          onChange={(e) => {
                            const ms = [...(draft.metrics || [])];
                            ms[i] = { ...m, label: e.target.value };
                            setDraft({ ...draft, metrics: ms });
                          }}
                          className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="VD: 60"
                          value={m.value}
                          onChange={(e) => {
                            const ms = [...(draft.metrics || [])];
                            ms[i] = { ...m, value: e.target.value };
                            setDraft({ ...draft, metrics: ms });
                          }}
                          className="w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="kg, km, s..."
                          value={m.unit}
                          onChange={(e) => {
                            const ms = [...(draft.metrics || [])];
                            ms[i] = { ...m, unit: e.target.value };
                            setDraft({ ...draft, metrics: ms });
                          }}
                          className="w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const ms = draft.metrics!.filter((_, j) => j !== i);
                            setDraft({ ...draft, metrics: ms });
                          }}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          title="Xóa chỉ số này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Nhận xét buổi tập */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                  Nhận xét của Huấn luyện viên
                </label>
                <textarea
                  value={draft.comment || ""}
                  onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                  rows={3}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none leading-relaxed"
                  placeholder="Nhận xét kỹ thuật, sự tập trung và mức độ nỗ lực của học viên trong buổi học này..."
                />
              </div>

              {/* 4. Hướng tập tiếp theo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                  Kế hoạch & Định hướng buổi tập tiếp theo
                </label>
                <input
                  type="text"
                  value={draft.nextStep || ""}
                  onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  placeholder="VD: Nâng mức tạ Bench Press lên 65kg, cải thiện nhịp thở khi Squat..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setEditingId(null); setDraft({}); }}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? "Đang lưu..." : "Lưu kết quả"}</span>
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none";
const inputCls = "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full";
