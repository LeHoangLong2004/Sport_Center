import { useState, useEffect } from "react";
import { CoachAPI, type AttendanceRecord, type AttendanceStatus, type MockSession, type MockMember } from "../../services/api";
import { FALLBACK_SESSIONS, FALLBACK_MEMBERS, DEFAULT_ATTENDANCE_MAP } from "./constants";

export function useCoachAttendanceData(initialSessionId: string | null) {
  const [activeSessions, setActiveSessions] = useState<MockSession[]>(FALLBACK_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || "s1");
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [savedRecords, setSavedRecords] = useState<AttendanceRecord[]>([]);
  const [members, setMembers] = useState<MockMember[]>([]);

  useEffect(() => {
    async function loadSessions() {
      try {
        const sessions = await CoachAPI.getSchedule();
        if (Array.isArray(sessions) && sessions.length > 0) {
          const active = sessions.filter((s: MockSession) => s.status !== "đã hủy");
          if (active.length > 0) {
            setActiveSessions(active);
            if (!initialSessionId) setSelectedSessionId(active[0].id);
          }
        }
      } catch {}
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

        let usableMembers = Array.isArray(sessionMembers) && sessionMembers.length > 0
          ? sessionMembers
          : FALLBACK_MEMBERS.filter((m) => m.classIds.includes(selectedSessionId));

        if (usableMembers.length === 0) {
          usableMembers = FALLBACK_MEMBERS.slice(0, 8);
        }

        const localKey = `coach_attendance_${selectedSessionId}`;
        const localSaved = localStorage.getItem(localKey);
        const baseRecords: AttendanceRecord[] = localSaved
          ? JSON.parse(localSaved)
          : (DEFAULT_ATTENDANCE_MAP[selectedSessionId] || []);

        const initialized: AttendanceRecord[] = usableMembers.map((m: MockMember) => {
          const exist = (Array.isArray(attRecords) && attRecords.find((r) => r.memberId === m.id))
            || baseRecords.find((r) => r.memberId === m.id);
          
          const rawStatus = exist?.status;
          const status: AttendanceStatus = rawStatus === "no_show" ? "no_show" : "attended";

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
