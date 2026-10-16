import { useState, useEffect } from "react";
import { CoachAPI, type AttendanceRecord, type AttendanceStatus, type MockSession, type MockMember } from "../../services/api";

export function useCoachAttendanceData(initialSessionId: string | null) {
  const [activeSessions, setActiveSessions] = useState<MockSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || "");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);

  useEffect(() => {
    async function loadSessions() {
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
      }
    }
    loadSessions();
  }, [initialSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadSessionAttendance() {
      try {
        const [attRecords, sessionMembers] = await Promise.all([
          CoachAPI.getAttendance(selectedSessionId).catch(() => []),
          CoachAPI.getSessionMembers(selectedSessionId).catch(() => []),
        ]);

        const usableMembers = Array.isArray(sessionMembers) ? sessionMembers : [];

        const localKey = `coach_attendance_${selectedSessionId}`;
        const localSaved = localStorage.getItem(localKey);
        const baseRecords: AttendanceRecord[] = localSaved
          ? JSON.parse(localSaved)
          : [];

        const initialized: AttendanceRecord[] = usableMembers.map((m: MockMember) => {
          const exist = (Array.isArray(attRecords) && attRecords.find((r) => r.memberId === m.id))
            || baseRecords.find((r) => r.memberId === m.id);
          
          // Thành viên chưa có bản ghi điểm danh phải giữ trạng thái chưa điểm danh.
          // Không coi lớp trong tương lai là đã có mặt.
          const status: AttendanceStatus = exist?.status || "chưa điểm danh";

          return {
            sessionId: selectedSessionId,
            memberId: m.id,
            status,
            note: exist?.note || ""
          };
        });

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
    selectedSessionId,
    setSelectedSessionId,
    records,
    setRecords,
    savedRecords,
    setSavedRecords,
    members,
  };
}
