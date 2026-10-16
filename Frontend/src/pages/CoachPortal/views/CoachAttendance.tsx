import { useState, useMemo, useCallback } from "react";
import type { CoachScreen } from "../types";
import { CoachAPI } from "../services/api";
import { Edit3, X, Clock, Search, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import AttendanceSessionSelector from "./attendance/AttendanceSessionSelector";
import AttendanceMemberList from "./attendance/AttendanceMemberList";
import AttendanceAuditReasonModal from "./attendance/AttendanceAuditReasonModal";
import { useCoachAttendanceData } from "./attendance/useCoachAttendanceData";

interface Props {
  initialSessionId: string | null;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

export default function CoachAttendance({ initialSessionId, navigateTo }: Props) {
  const {
    activeSessions,
    selectedSessionId,
    setSelectedSessionId,
    records,
    setRecords,
    savedRecords,
    setSavedRecords,
    members,
  } = useCoachAttendanceData(initialSessionId);

  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  
  const [finalizedMap, setFinalizedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("coach_attendance_finalized_sessions");
      return saved ? JSON.parse(saved) : { s1: true };
    } catch {
      return { s1: true };
    }
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [auditReason, setAuditReason] = useState("");
  const [showReasonModal, setShowReasonModal] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(records) !== JSON.stringify(savedRecords),
    [records, savedRecords]
  );

  const session = useMemo(
    () => activeSessions.find((s) => s.id === selectedSessionId),
    [activeSessions, selectedSessionId]
  );

  const isFinalized = !!finalizedMap[selectedSessionId];
  const isEditingThisSession = editingSessionId === selectedSessionId;
  const isLocked = isFinalized && !isEditingThisSession;

  const handleSessionChange = useCallback(
    (newId: string) => {
      if (hasChanges && !window.confirm("Bạn có thay đổi chưa lưu. Tiếp tục chuyển?")) return;
      setEditingSessionId(null);
      setSelectedSessionId(newId);
    },
    [hasChanges, setSelectedSessionId]
  );

  const handleStatusChange = useCallback((memberId: string, status: "attended" | "no_show") => {
    if (isLocked) return;
    setRecords((prev) => prev.map((r) => (r.memberId === memberId ? { ...r, status } : r)));
  }, [isLocked, setRecords]);

  const handleNoteChange = useCallback((memberId: string, note: string) => {
    if (isLocked) return;
    setRecords((prev) => prev.map((r) => (r.memberId === memberId ? { ...r, note } : r)));
  }, [isLocked, setRecords]);

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    setRecords((prev) => prev.map((r) => ({ ...r, status: "attended" })));
    toast.info("Đã đánh dấu tất cả học viên có mặt.");
  };

  const handleSave = async () => {
    if (!selectedSessionId || isSaving) return;

    if (isFinalized && isEditingThisSession && !auditReason.trim()) {
      setShowReasonModal(true);
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.finalizeAttendance(selectedSessionId, records).catch(() => {});
      
      const updatedMap = { ...finalizedMap, [selectedSessionId]: true };
      setFinalizedMap(updatedMap);
      localStorage.setItem("coach_attendance_finalized_sessions", JSON.stringify(updatedMap));

      setEditingSessionId(null);
      setAuditReason("");
      setSavedRecords(records);
      toast.success(isEditingThisSession ? "Đã lưu điều chỉnh điểm danh!" : "Đã chốt sổ điểm danh thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = records.length;
    const attended = records.filter((r) => r.status === "attended").length;
    const absent = records.filter((r) => r.status === "no_show").length;
    return { total, attended, absent };
  }, [records]);

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter((m) => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q));
  }, [members, search]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        <p className="text-base font-medium">Không có buổi học nào cần điểm danh.</p>
        <button
          type="button"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          onClick={() => navigateTo("schedule")}
        >
          Xem lịch dạy →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            QUẢN LÝ LỚP HỌC
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            Điểm danh buổi học
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhận học viên có mặt hoặc vắng mặt trong buổi học thực tế.
          </p>
        </div>

        <div>
          {isFinalized && !isEditingThisSession && (
            <button
              onClick={() => setEditingSessionId(selectedSessionId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              Điều chỉnh điểm danh
            </button>
          )}

          {isEditingThisSession && (
            <button
              onClick={() => {
                setEditingSessionId(null);
                setRecords(savedRecords);
                setAuditReason("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl hover:bg-rose-100/70 transition-colors shadow-xs"
            >
              <X className="w-4 h-4 text-rose-500" />
              Hủy điều chỉnh
            </button>
          )}
        </div>
      </div>

      <AttendanceSessionSelector
        selectedSessionId={selectedSessionId}
        onSessionChange={handleSessionChange}
        activeSessions={activeSessions}
        session={session}
        isFinalized={isFinalized}
        enrolledCount={members.length}
      />
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Tổng sĩ số</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Có mặt</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.attended}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Vắng mặt</span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.absent}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm tên hoặc mã học viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Tất cả có mặt
          </button>
        )}
      </div>

      <AttendanceMemberList
        members={filteredMembers}
        records={records}
        isLocked={isLocked}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
      />

      {!isLocked && (
        <div className="sticky bottom-6 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Có mặt: {stats.attended}/{stats.total}
            </span>
            <span>·</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              Vắng: {stats.absent}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (isEditingThisSession) setShowReasonModal(true);
                else handleSave();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isEditingThisSession ? "Lưu điều chỉnh cho buổi này" : "Chốt điểm danh"}
            </button>
          </div>
        </div>
      )}

      <AttendanceAuditReasonModal
        isOpen={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        className={session.className}
        auditReason={auditReason}
        setAuditReason={setAuditReason}
        onConfirm={() => {
          setShowReasonModal(false);
          handleSave();
        }}
      />
    </div>
  );
}
