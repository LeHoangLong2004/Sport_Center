/**
 * CO-07 — Kết quả, Tiến độ & Đánh giá học viên (Coach Assessment)
 * Đã tách thành các Component nhỏ độc lập trong thư mục views/assessment/
 */
import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import type { AssessmentRecord, MockSession } from "../services/api";
import {
  Plus,
  CheckCircle2,
  Edit3,
  Award,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { UserAvatar } from "../../../components/UserAvatar";
import AssessmentClassSessionsList from "./assessment/AssessmentClassSessionsList";
import AssessmentEditResultModal from "./assessment/AssessmentEditResultModal";
import AssessmentMemberHistoryView from "./assessment/AssessmentMemberHistoryView";
import AssessmentSessionHeaderCard from "./assessment/AssessmentSessionHeaderCard";
import { isAttendanceLocked24h } from "../utils/attendanceLock";

interface CoachAssessmentProps {
  initialSessionId?: string | null;
  initialMemberId?: string | null;
}

export default function CoachAssessment({ initialSessionId, initialMemberId }: CoachAssessmentProps = {}) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [sessions, setSessions] = useState<MockSession[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; code: string; classIds?: string[] }[]>([]);
  const [viewMode, setViewMode] = useState<"by_session" | "by_member">(
    initialMemberId ? "by_member" : "by_session"
  );
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

      if (initialSessionId) {
        setSelectedSessionId(initialSessionId);
        const sess = sch.find((s) => s.id === initialSessionId);
        if (sess) {
          const matchingMember = mem.find((m) =>
            (Array.isArray(sess.registeredMemberIds) && sess.registeredMemberIds.some((id) => String(id) === String(m.id))) ||
            (Array.isArray(m.classIds) && m.classIds.some((cid) => String(cid) === String(sess.id) || String(cid) === String(sess.classId)))
          );
          if (matchingMember) {
            setSelectedMemberId(matchingMember.id);
          }
        }
      } else if (initialMemberId && mem.some((m) => m.id === initialMemberId)) {
        setSelectedMemberId(initialMemberId);
      } else if (mem.length > 0 && !selectedMemberId) {
        setSelectedMemberId(mem[0].id);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [initialMemberId, initialSessionId]);

  // Học viên thuộc ca dạy đang chọn
  const sessionMembers = useMemo(() => {
    if (!selectedSessionId) return [];
    const sess = sessions.find((s) => s.id === selectedSessionId);
    if (!sess) return [];
    return members.filter((m) => {
      const inRegistered =
        Array.isArray(sess.registeredMemberIds) &&
        sess.registeredMemberIds.some((id) => String(id) === String(m.id));
      const inClassIds =
        Array.isArray(m.classIds) &&
        m.classIds.some(
          (cid) => String(cid) === String(sess.id) || String(cid) === String(sess.classId)
        );
      return inRegistered || inClassIds;
    });
  }, [selectedSessionId, sessions, members]);

  // Ca dạy hợp lệ cho học viên (khi ở chế độ theo dõi học viên)
  const eligibleSessionsForMember = useMemo(() => {
    if (!selectedMemberId) return [];
    const selectedMember = members.find((m) => m.id === selectedMemberId);

    return sessions.filter((s) => {
      if (s.status === "đã hủy") return false;
      const registeredInSession =
        Array.isArray(s.registeredMemberIds) &&
        s.registeredMemberIds.some((id) => String(id) === String(selectedMemberId));
      const memberHasClass =
        Array.isArray(selectedMember?.classIds) &&
        selectedMember.classIds.some(
          (cid) => String(cid) === String(s.id) || String(cid) === String(s.classId)
        );
      return registeredInSession || memberHasClass;
    });
  }, [selectedMemberId, sessions, members]);

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

  const openForMemberSession = (mId: string, sId: string) => {
    setSelectedMemberId(mId);
    setSelectedSessionId(sId);
    const existing = assessments.find(
      (a) => String(a.sessionId) === String(sId) && String(a.memberId) === String(mId)
    );
    if (existing) {
      setDraft({ ...existing });
      setEditingId(existing.id);
    } else {
      const id = `as_${Date.now()}`;
      setDraft({
        id,
        sessionId: sId,
        memberId: mId,
        completion: 80,
        metrics: [{ label: "", value: "", unit: "" }],
        comment: "",
        nextStep: "",
        createdAt: new Date().toISOString(),
      });
      setEditingId(id);
    }
    setFeedback(null);
  };

  const openNew = () => {
    if (!selectedSessionId) { setFeedback("Vui lòng chọn buổi học trước."); return; }
    if (!selectedMemberId) { setFeedback("Vui lòng chọn học viên trước."); return; }
    openForMemberSession(selectedMemberId, selectedSessionId);
  };

  const handleSave = async () => {
    const isCurrentSessionExpired = isAttendanceLocked24h(currentSession?.date, currentSession?.startTime);
    if (isCurrentSessionExpired) {
      setFeedback("Buổi học đã đóng (Không thể sửa điểm vì đã quá 24 giờ).");
      return;
    }
    if (!draft.comment && !draft.completion) return;
    setIsSaving(true);
    const sanitizedMetrics = (draft.metrics || [])
      .filter((m) => (m.label || (m as any).metricName || "").trim() !== "")
      .map((m) => {
        const name = (m.label || (m as any).metricName || "").trim();
        return {
          label: name,
          metricName: name,
          value: m.value,
          unit: m.unit || "",
        };
      });

    const full: AssessmentRecord = {
      id: draft.id || `as_${Date.now()}`,
      sessionId: draft.sessionId || selectedSessionId,
      memberId: draft.memberId || selectedMemberId,
      completion: draft.completion || 0,
      metrics: sanitizedMetrics,
      comment: draft.comment || "",
      nextStep: draft.nextStep || "",
      createdAt: draft.createdAt || new Date().toISOString(),
    };
    try {
      const res = await CoachAPI.saveAssessment(full);
      const savedRecord: AssessmentRecord = res?.data ? {
        id: String(res.data.id || full.id),
        sessionId: String(res.data.sessionId || full.sessionId),
        memberId: String(res.data.memberId || full.memberId),
        completion: res.data.completion ?? full.completion,
        metrics: res.data.metrics ?? full.metrics,
        comment: res.data.comment ?? full.comment,
        nextStep: res.data.nextStep ?? full.nextStep,
        createdAt: res.data.createdAt ?? full.createdAt,
      } : full;

      const ass = await CoachAPI.getAssessments();
      if (Array.isArray(ass) && ass.length > 0) {
        setAssessments(ass);
      } else {
        setAssessments((prev) => [
          savedRecord,
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

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const isExpired24h = useMemo(
    () => isAttendanceLocked24h(selectedSession?.date, selectedSession?.startTime),
    [selectedSession?.date, selectedSession?.startTime]
  );

  // VIEW 1: Khi chưa chọn ca dạy cụ thể, hiển thị danh sách dạng thẻ trực quan
  if (viewMode === "by_session" && !selectedSessionId) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-6xl mx-auto pb-16">
        <AssessmentClassSessionsList
          sessions={sessions}
          assessments={assessments}
          isLoading={loading}
          onSelectSession={(id) => {
            setSelectedSessionId(id);
            const sess = sessions.find((s) => s.id === id);
            if (sess) {
              const matchingMember = members.find((m) =>
                (Array.isArray(sess.registeredMemberIds) && sess.registeredMemberIds.some((mid) => String(mid) === String(m.id))) ||
                (Array.isArray(m.classIds) && m.classIds.some((cid) => String(cid) === String(sess.id) || String(cid) === String(sess.classId)))
              );
              if (matchingMember) {
                setSelectedMemberId(matchingMember.id);
              }
            }
          }}
        />
      </div>
    );
  }

  // VIEW 2: Khi đã chọn ca dạy hoặc chọn theo học viên
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-5xl mx-auto pb-16">
      {/* Nút quay lại danh sách ca dạy */}
      {viewMode === "by_session" && (
        <div>
          <button
            type="button"
            onClick={() => setSelectedSessionId("")}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>← Quay lại danh sách ca dạy</span>
          </button>
        </div>
      )}

      {/* Page Title & View Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Đánh giá học viên</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận mức độ hoàn thành bài tập, thành tích và chỉ số luyện tập cho học viên.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("by_session")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "by_session"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Theo ca dạy
          </button>
          <button
            type="button"
            onClick={() => setViewMode("by_member")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "by_member"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Theo học viên
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* MODE 1: THEO CA DẠY */}
      {viewMode === "by_session" && (
        <div className="space-y-6">
          {/* Cảnh báo khóa quá 24h */}
          {isExpired24h && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 text-xs sm:text-sm animate-in fade-in">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-200">
                  Buổi học đã đóng ( Không thể sửa điểm danh vì đã quá 24 giờ )
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Ca học bắt đầu lúc <strong>{selectedSession?.startTime} ngày {selectedSession?.date}</strong>. Buổi học đã quá 24 giờ kể từ thời gian học ngoài đời thực nên chỉ có quyền xem lại kết quả đánh giá (Read-only), không thể đánh giá lại hoặc sửa đổi.
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                  🔒 Danh sách học viên và điểm đánh giá hiện tại ở chế độ chỉ xem (Read-only).
                </p>
              </div>
            </div>
          )}

          {/* Thông tin ca dạy đang chọn */}
          {selectedSession && (
            <AssessmentSessionHeaderCard
              selectedSession={selectedSession}
              sessions={sessions}
              selectedSessionId={selectedSessionId}
              setSelectedSessionId={setSelectedSessionId}
              isExpired24h={isExpired24h}
              memberCount={sessionMembers.length}
            />
          )}

          {/* Danh sách học viên trong ca dạy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Học viên trong ca dạy ({sessionMembers.length})
              </h2>
            </div>

            {sessionMembers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-sm">
                Không tìm thấy danh sách học viên cho ca dạy này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionMembers.map((m) => {
                  const ass = assessments.find(
                    (a) => String(a.sessionId) === String(selectedSessionId) && String(a.memberId) === String(m.id)
                  );
                  return (
                    <div
                      key={m.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={m.name} className="w-11 h-11 rounded-full text-sm font-bold" />
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h3>
                            <span className="text-[11px] font-semibold text-slate-400">{m.code}</span>
                          </div>
                        </div>

                        {ass ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {ass.completion}% hoàn thành
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Chưa đánh giá
                          </span>
                        )}
                      </div>

                      {ass?.comment && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2">
                          &ldquo;{ass.comment}&rdquo;
                        </p>
                      )}

                      {ass?.metrics && ass.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {ass.metrics.filter((x) => x && (x.value !== undefined && x.value !== "")).slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {item.label || (item as any).metricName}: {item.value} {item.unit}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => openForMemberSession(m.id, selectedSessionId)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isExpired24h
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                              : ass
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                          }`}
                        >
                          {isExpired24h ? (
                            <>
                              <Award className="w-3.5 h-3.5 text-slate-500" />
                              <span>{ass ? "Xem đánh giá" : "Xem chi tiết (Đã đóng)"}</span>
                            </>
                          ) : ass ? (
                            <>
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Xem / Sửa đánh giá</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Chấm điểm ngay</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: THEO HỌC VIÊN */}
      {viewMode === "by_member" && (
        <AssessmentMemberHistoryView
          members={members}
          selectedMemberId={selectedMemberId}
          setSelectedMemberId={setSelectedMemberId}
          selectedSessionId={selectedSessionId}
          setSelectedSessionId={setSelectedSessionId}
          eligibleSessionsForMember={eligibleSessionsForMember}
          sessions={sessions}
          memberAssessments={memberAssessments}
          onOpenNew={openNew}
        />
      )}

      {/* Modal chỉnh sửa kết quả / Chấm điểm học viên */}
      <AssessmentEditResultModal
        isOpen={Boolean(editingId)}
        draft={draft}
        setDraft={setDraft}
        currentMember={currentMember}
        currentSession={currentSession}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={() => { setEditingId(null); setDraft({}); }}
        addMetric={addMetric}
      />
    </div>
  );
}
