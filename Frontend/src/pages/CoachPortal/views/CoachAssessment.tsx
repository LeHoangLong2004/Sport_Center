/**
 * CO-07 — Kết quả, Tiến độ & Đánh giá
 * Không tạo kết quả cho học viên vắng.
 * Biểu đồ chỉ hiển thị khi có dữ liệu thực.
 */
import { useState, useEffect, useMemo } from "react";
import { CoachAPI } from "../services/api";
import { createPortal } from "react-dom";
import type { AssessmentRecord, MockSession } from "../services/api";
import {
  X,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Edit3,
  Award,
  BookOpen,
  UserCheck,
  ArrowLeft,
  Dumbbell,
  Lock,
} from "lucide-react";
import { UserAvatar } from "../../../components/UserAvatar";
import AssessmentClassSessionsList from "./assessment/AssessmentClassSessionsList";
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
  const [, setLoading] = useState(true);

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
            (Array.isArray(sess.registeredMemberIds) && sess.registeredMemberIds.some((id) => String(id).toLowerCase() === String(m.id).toLowerCase())) ||
            (Array.isArray(m.classIds) && m.classIds.some((cid) => String(cid).toLowerCase() === String(sess.id).toLowerCase() || String(cid).toLowerCase() === String(sess.classId).toLowerCase()))
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
        sess.registeredMemberIds.some((id) => String(id).toLowerCase() === String(m.id).toLowerCase());
      const inClassIds =
        Array.isArray(m.classIds) &&
        m.classIds.some(
          (cid) => String(cid).toLowerCase() === String(sess.id).toLowerCase() || String(cid).toLowerCase() === String(sess.classId).toLowerCase()
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
        s.registeredMemberIds.some((id) => String(id).toLowerCase() === String(selectedMemberId).toLowerCase());
      const memberHasClass =
        Array.isArray(selectedMember?.classIds) &&
        selectedMember.classIds.some(
          (cid) => String(cid).toLowerCase() === String(s.id).toLowerCase() || String(cid).toLowerCase() === String(s.classId).toLowerCase()
        );
      return registeredInSession || memberHasClass;
    });
  }, [selectedMemberId, sessions, members]);

  // Tự động chọn buổi học hợp lệ đầu tiên khi ở chế độ theo học viên
  useEffect(() => {
    if (viewMode !== "by_member") return;
    if (!selectedSessionId) {
      if (eligibleSessionsForMember.length > 0) {
        setSelectedSessionId(eligibleSessionsForMember[0].id);
      }
    } else if (!eligibleSessionsForMember.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId(eligibleSessionsForMember.length > 0 ? eligibleSessionsForMember[0].id : "");
    }
  }, [eligibleSessionsForMember, selectedSessionId, viewMode]);

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
      (a) => String(a.sessionId) === String(sId) && String(a.memberId).toLowerCase() === String(mId).toLowerCase()
    );
    if (existing) {
      setDraft({ ...existing });
      setEditingId(existing.id);
    } else {
      const id = `as_${Date.now()}`;
      setDraft({
        id,
        sessionId: sId === "general" ? undefined : sId,
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

    const targetSessionId = draft.sessionId && draft.sessionId !== "general"
      ? draft.sessionId
      : (selectedSessionId && selectedSessionId !== "general" ? selectedSessionId : "");

    const full: AssessmentRecord = {
      id: draft.id || `as_${Date.now()}`,
      sessionId: targetSessionId,
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

  // VIEW 1: Khi chưa chọn ca dạy cụ thể, hiển thị danh sách dạng thẻ trực quan (giống Điểm danh lớp)
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {selectedSession.sport || "Lớp nhóm"}
                  </span>
                  {selectedSession.level && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {selectedSession.level}
                    </span>
                  )}
                  {isExpired24h && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      Đã đóng (Quá 24 giờ)
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {selectedSession.className}
                </h2>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedSession.startTime} - {selectedSession.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSession.date}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSession.room || "Studio trung tâm"}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Sĩ số: {sessionMembers.length} học viên
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.className} — {s.date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
                    (a) => String(a.sessionId) === String(selectedSessionId) && String(a.memberId).toLowerCase() === String(m.id).toLowerCase()
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
        <div className="space-y-6">
          {/* Chọn học viên */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Học viên</label>
              <select
                value={selectedMemberId}
                onChange={(e) => {
                  setSelectedMemberId(e.target.value);
                  setSelectedSessionId("");
                }}
                className={selectCls}
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Buổi học (đủ điều kiện)</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={eligibleSessionsForMember.length === 0}
                className={`${selectCls} ${eligibleSessionsForMember.length === 0 ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <option value="">
                  {eligibleSessionsForMember.length === 0
                    ? "-- Học viên chưa có buổi học đủ điều kiện --"
                    : "-- Chọn buổi --"}
                </option>
                {eligibleSessionsForMember.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className} — {s.date}
                  </option>
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
                  const s = a.sessionId ? sessions.find((x) => x.id === a.sessionId) : null;
                  return (
                    <div key={a.id} className="px-4 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                            {s?.className || (a.sessionId ? a.sessionId : "Đánh giá chung / Định kỳ")}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {s?.date ? `${s.date} · ` : ""}{new Date(a.createdAt).toLocaleDateString("vi-VN")}
                          </div>
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
                        {a.metrics?.filter((m) => m && (m.value !== undefined && m.value !== "")).map((m, idx) => {
                          const metricLabel = m.label || (m as any).metricName || `Chỉ số ${idx + 1}`;
                          return (
                            <span key={idx} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                              {metricLabel}: {m.value}{m.unit ? ` ${m.unit}` : ""}
                            </span>
                          );
                        })}
                      </div>
                      {a.comment && <div className="text-sm text-slate-600 dark:text-slate-300 mt-2 italic">"{a.comment}"</div>}
                      {a.nextStep && <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">→ Hướng tiếp: {a.nextStep}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit form */}
      {editingId && (() => {
        const isCurrentSessionExpired = isAttendanceLocked24h(currentSession?.date, currentSession?.startTime);

        return createPortal(
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
                    {isCurrentSessionExpired && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Buổi học đã đóng (Quá 24 giờ)
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {isCurrentSessionExpired
                      ? "Xem kết quả & tiến độ buổi học (Chỉ xem)"
                      : "Ghi nhận kết quả & tiến độ buổi học"}
                  </h2>
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
                  {currentSession ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Buổi: {currentSession.className} ({currentSession.date})
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Đánh giá chung / Định kỳ
                    </span>
                  )}
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
                {/* Banner cảnh báo đã đóng khi quá 24h */}
                {isCurrentSessionExpired && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ ) - Chỉ xem kết quả.</span>
                  </div>
                )}

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
                    disabled={isCurrentSessionExpired}
                    value={draft.completion || 0}
                    onChange={(e) => setDraft({ ...draft, completion: +e.target.value })}
                    className={`w-full accent-emerald-500 ${isCurrentSessionExpired ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  />
                  {!isCurrentSessionExpired && (
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
                  )}
                </div>

                {/* 2. Chỉ số tập luyện & Thể lực */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                        Chỉ số tập luyện & Thể lực
                      </label>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {isCurrentSessionExpired
                          ? "Các thành tích và chỉ số đã được ghi nhận cho buổi học này"
                          : "Ghi nhận mức tạ, cự ly, số lần hoặc thành tích đạt được"}
                      </span>
                    </div>
                    {!isCurrentSessionExpired && (
                      <button
                        type="button"
                        onClick={() => addMetric("", "")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm chỉ số
                      </button>
                    )}
                  </div>

                  {/* Quick suggestion chips (chỉ hiện khi chưa khóa) */}
                  {!isCurrentSessionExpired && (
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
                  )}

                  {/* Metric Items List */}
                  {(!draft.metrics || draft.metrics.length === 0) ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                      {isCurrentSessionExpired
                        ? "Không có chỉ số tập luyện nào được ghi nhận cho buổi này."
                        : "Chưa có chỉ số nào. Bấm vào các nút gợi ý nhanh ở trên hoặc nút \"+ Thêm chỉ số\"."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Header Columns */}
                      <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <span className="flex-1 min-w-0">Tên bài tập / Chỉ số</span>
                        <span className="w-24 shrink-0 text-center">Giá trị</span>
                        <span className="w-24 shrink-0 text-center">Đơn vị</span>
                        {!isCurrentSessionExpired && <span className="w-8 shrink-0"></span>}
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
                            readOnly={isCurrentSessionExpired}
                            onChange={(e) => {
                              const ms = [...(draft.metrics || [])];
                              ms[i] = { ...m, label: e.target.value };
                              setDraft({ ...draft, metrics: ms });
                            }}
                            className={`flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                              isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="VD: 60"
                            value={m.value}
                            readOnly={isCurrentSessionExpired}
                            onChange={(e) => {
                              const ms = [...(draft.metrics || [])];
                              ms[i] = { ...m, value: e.target.value };
                              setDraft({ ...draft, metrics: ms });
                            }}
                            className={`w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                              isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            }`}
                          />
                          <input
                            type="text"
                            placeholder="kg, km, s..."
                            value={m.unit}
                            readOnly={isCurrentSessionExpired}
                            onChange={(e) => {
                              const ms = [...(draft.metrics || [])];
                              ms[i] = { ...m, unit: e.target.value };
                              setDraft({ ...draft, metrics: ms });
                            }}
                            className={`w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                              isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            }`}
                          />
                          {!isCurrentSessionExpired && (
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
                          )}
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
                    readOnly={isCurrentSessionExpired}
                    onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
                    rows={3}
                    className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none leading-relaxed ${
                      isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-850 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    placeholder={
                      isCurrentSessionExpired
                        ? "Không có nhận xét nào được lưu."
                        : "Nhận xét kỹ thuật, sự tập trung và mức độ nỗ lực của học viên trong buổi học này..."
                    }
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
                    readOnly={isCurrentSessionExpired}
                    onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })}
                    className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                      isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-850 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    }`}
                    placeholder={
                      isCurrentSessionExpired
                        ? "Không có định hướng nào được ghi nhận."
                        : "VD: Nâng mức tạ Bench Press lên 65kg, cải thiện nhịp thở khi Squat..."
                    }
                  />
                </div>
              </div>

              {/* Footer */}
              {isCurrentSessionExpired ? (
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-2xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ )</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setDraft({}); }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer hover:bg-slate-800"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
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
              )}
              
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}

const selectCls = "border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none";
