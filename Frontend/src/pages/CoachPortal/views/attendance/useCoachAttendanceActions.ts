import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { CoachAPI, type AttendanceRecord, type AttendanceStatus, type MockSession, type MockMember } from "../../services/api";
import { isAttendanceLocked24h, getAttendanceLockDeadlineInfo } from "../../utils/attendanceLock";

export type FilterStatus = "all" | "attended" | "late" | "no_show" | "pending";
export type TopTab = "active" | "history";

interface UseCoachAttendanceActionsProps {
  selectedSessionId: string;
  setSelectedSessionId: (id: string) => void;
  activeSessions: MockSession[];
  records: AttendanceRecord[];
  setRecords: (records: AttendanceRecord[]) => void;
  savedRecords: AttendanceRecord[];
  setSavedRecords: (records: AttendanceRecord[]) => void;
  members: MockMember[];
  sheetState: "unmarked" | "draft" | "finalized";
  setSheetState: (state: "unmarked" | "draft" | "finalized") => void;
}

export function useCoachAttendanceActions({
  selectedSessionId,
  setSelectedSessionId,
  activeSessions,
  records,
  setRecords,
  savedRecords,
  setSavedRecords,
  members,
  sheetState,
  setSheetState,
}: UseCoachAttendanceActionsProps) {
  const [topTab, setTopTab] = useState<TopTab>("active");
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const [finalizedMap, setFinalizedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("coach_attendance_finalized_sessions");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
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

  const isFinalized = sheetState === "finalized" || !!finalizedMap[selectedSessionId];
  const isDraft = sheetState === "draft" || (!isFinalized && records.some((r) => r.status !== "chưa điểm danh"));

  const isExpired24h = useMemo(
    () => isAttendanceLocked24h(session?.date, session?.startTime),
    [session?.date, session?.startTime]
  );

  const deadlineInfo = useMemo(
    () => getAttendanceLockDeadlineInfo(session?.date, session?.startTime),
    [session?.date, session?.startTime]
  );

  const isOver24h = isExpired24h;
  const isEditingThisSession = !isOver24h && editingSessionId === selectedSessionId;
  const isLocked = isOver24h || (isFinalized && !isEditingThisSession);

  const handleSessionChange = useCallback(
    (newId: string) => {
      if (hasChanges && !window.confirm("Bạn có thay đổi chưa lưu. Tiếp tục chuyển sang buổi khác?")) {
        return;
      }
      setEditingSessionId(null);
      setSelectedSessionId(newId);
      setFilterStatus("all");
      setSearch("");
    },
    [hasChanges, setSelectedSessionId]
  );

  const handleStatusChange = useCallback(
    (memberId: string, status: AttendanceStatus) => {
      if (isLocked) return;
      const next = records.map((r) => (r.memberId === memberId ? { ...r, status } : r));
      setRecords(next);

      if (selectedSessionId) {
        localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
        if (!isFinalized) {
          void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
        }
      }
      if (!isFinalized) setSheetState("draft");
    },
    [isLocked, records, selectedSessionId, isFinalized, setRecords, setSheetState]
  );

  const handleNoteChange = useCallback(
    (memberId: string, note: string) => {
      if (isLocked) return;
      const next = records.map((r) => (r.memberId === memberId ? { ...r, note } : r));
      setRecords(next);

      if (selectedSessionId) {
        localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
        if (!isFinalized) {
          void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
        }
      }
    },
    [isLocked, records, selectedSessionId, isFinalized, setRecords]
  );

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    const next = records.map((r) => ({ ...r, status: "attended" as const }));
    setRecords(next);
    if (selectedSessionId) {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
      if (!isFinalized) {
        void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
      }
    }
    if (!isFinalized) setSheetState("draft");
    toast.info("Đã đánh dấu tất cả học viên có mặt (đã lưu nháp).");
  };

  const handleResetAll = () => {
    if (isLocked) return;
    const next = records.map((r) => ({ ...r, status: "chưa điểm danh" as const, note: "" }));
    setRecords(next);
    if (selectedSessionId) {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(next));
      if (!isFinalized) {
        void CoachAPI.saveAttendanceDraft(selectedSessionId, next).catch(() => {});
      }
    }
    setSheetState("unmarked");
    toast.info("Đã đặt lại trạng thái điểm danh về chưa điểm danh.");
  };

  const handleSaveDraft = async () => {
    if (!selectedSessionId || isSaving) return;
    if (isExpired24h) {
      toast.error("Ca dạy này đã bắt đầu quá 24 giờ. Theo quy định, không thể lưu nháp điểm danh.");
      return;
    }
    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.saveAttendanceDraft(selectedSessionId, records);
      setSavedRecords(records);
      setSheetState("draft");
      toast.success("Đã lưu bản nháp điểm danh vào hệ thống!");
    } catch (err: any) {
      toast.error(err?.message || "Lưu nháp thất bại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSessionId || isSaving) return;
    if (isExpired24h) {
      toast.error("Buổi học này đã bắt đầu quá 24 giờ. Sổ điểm danh đã bị khóa vĩnh viễn và không thể điều chỉnh.");
      return;
    }

    if (isFinalized && isEditingThisSession && !auditReason.trim()) {
      setShowReasonModal(true);
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem(`coach_attendance_${selectedSessionId}`, JSON.stringify(records));
      await CoachAPI.finalizeAttendance(selectedSessionId, records, auditReason.trim() || undefined);

      const updatedMap = { ...finalizedMap, [selectedSessionId]: true };
      setFinalizedMap(updatedMap);
      localStorage.setItem("coach_attendance_finalized_sessions", JSON.stringify(updatedMap));

      setEditingSessionId(null);
      setAuditReason("");
      setSavedRecords(records);
      setSheetState("finalized");
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
    const late = records.filter((r) => (r.status as string) === "late").length;
    const pending = total - attended - absent;
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;
    return { total, attended, absent, late, pending, attendanceRate };
  }, [records]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.phone && m.phone.includes(q));

      if (!matchSearch) return false;

      const record = records.find((r) => r.memberId === m.id);
      const status = record?.status || "chưa điểm danh";

      if (filterStatus === "all") return true;
      if (filterStatus === "attended") return status === "attended";
      if (filterStatus === "no_show") return status === "no_show";
      if (filterStatus === "pending") return status !== "attended" && status !== "no_show";

      return true;
    });
  }, [members, search, filterStatus, records]);

  return {
    topTab,
    setTopTab,
    isSaving,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    finalizedMap,
    setFinalizedMap,
    editingSessionId,
    setEditingSessionId,
    auditReason,
    setAuditReason,
    showReasonModal,
    setShowReasonModal,
    hasChanges,
    session,
    isFinalized,
    isDraft,
    isExpired24h,
    deadlineInfo,
    isLocked,
    isEditingThisSession,
    handleSessionChange,
    handleStatusChange,
    handleNoteChange,
    handleMarkAllPresent,
    handleResetAll,
    handleSaveDraft,
    handleSave,
    stats,
    filteredMembers,
  };
}

