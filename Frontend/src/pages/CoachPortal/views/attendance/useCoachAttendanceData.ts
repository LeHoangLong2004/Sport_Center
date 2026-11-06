import { useState, useEffect } from "react";
import { CoachAPI, type AttendanceRecord, type AttendanceStatus, type MockSession, type MockMember } from "../../services/api";

export function useCoachAttendanceData(initialSessionId: string | null) {
  const [activeSessions, setActiveSessions] = useState<MockSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || "");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);
  const [sheetState, setSheetState] = useState<"unmarked" | "draft" | "finalized">("unmarked");

  useEffect(() => {
    async function loadSessions() {
      setIsLoadingSessions(true);
      try {
        const sessions = await CoachAPI.getSchedule();
        const active = Array.isArray(sessions)
          ? sessions.filter((s: MockSession) => s.status !== "đã hủy")
          : [];

        setActiveSessions(active);
        setSelectedSessionId((currentId) => {
          if (initialSessionId && active.some((s) => s.id === initialSessionId)) {
            return initialSessionId;
          }
          if (currentId && active.some((s) => s.id === currentId)) {
            return currentId;
          }
          return active[0]?.id || "";
        });
      } catch {
        setActiveSessions([]);
        setSelectedSessionId("");
      } finally {
        setIsLoadingSessions(false);
      }
    }
    loadSessions();
  }, [initialSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadSessionAttendance() {
      try {
        const [attRecords, sessionMembers, sheetInfo] = await Promise.all([
          CoachAPI.getAttendance(selectedSessionId).catch(() => []),
          CoachAPI.getSessionMembers(selectedSessionId).catch(() => []),
          CoachAPI.getSheetStatus(selectedSessionId).catch(() => ({ state: "unmarked", isFinalized: false, isDraft: false, version: 0 })),
        ]);

        const usableMembers = Array.isArray(sessionMembers) ? sessionMembers : [];

        const localKey = `coach_attendance_${selectedSessionId}`;
        const localSaved = localStorage.getItem(localKey);
        const baseRecords: AttendanceRecord[] = localSaved
          ? JSON.parse(localSaved)
          : [];

        const initialized: AttendanceRecord[] = usableMembers.map((m: MockMember) => {
          const exist = (Array.isArray(attRecords) && attRecords.find((r) => r.memberId === m.id && r.status !== "chưa điểm danh"))
            || baseRecords.find((r) => r.memberId === m.id && r.status !== "chưa điểm danh")
            || (Array.isArray(attRecords) && attRecords.find((r) => r.memberId === m.id))
            || baseRecords.find((r) => r.memberId === m.id);
          
          const status: AttendanceStatus = exist?.status || "chưa điểm danh";

          return {
            sessionId: selectedSessionId,
            memberId: m.id,
            status,
            note: exist?.note || ""
          };
        });

        const resolvedState = sheetInfo.isFinalized
          ? "finalized"
          : sheetInfo.isDraft || initialized.some((r) => r.status !== "chưa điểm danh")
          ? "draft"
          : "unmarked";

        setSheetState(resolvedState);
        setRecords(initialized);
        setSavedRecords(initialized);
        setMembers(usableMembers);

        // Đồng bộ lại registeredMemberIds cho buổi học đang chọn để sĩ số trên Header luôn chuẩn xác
        setActiveSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSessionId
              ? { ...s, registeredMemberIds: usableMembers.map((m) => m.id) }
              : s
          )
        );
      } catch (err) {
        console.error("Lỗi nạp điểm danh:", err);
      }
    }
    loadSessionAttendance();
  }, [selectedSessionId]);

  return {
    activeSessions,
    isLoadingSessions,
    selectedSessionId,
    setSelectedSessionId,
    records,
    setRecords,
    savedRecords,
    setSavedRecords,
    members,
    sheetState,
    setSheetState,
  };
}
