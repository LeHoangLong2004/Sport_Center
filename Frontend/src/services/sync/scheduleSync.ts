export interface SyncedSession {
  id: string;
  type: "group" | "pt" | "open_pt";
  classId?: string;
  className: string;
  sport: string;
  level: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  room: string;
  coachId: string;
  coachName: string;
  capacity: number;
  registeredCount: number;
  status: "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
  attendanceStatus?: "chưa điểm danh" | "có mặt" | "vắng" | "có phép" | "đi muộn";
  coachNote?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  goal?: string;
  userNote?: string;
  cancelReason?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "synced_schedule_sessions";
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// Initial seed open PT slots & sample bookings
export const INITIAL_SYNCED_SESSIONS: SyncedSession[] = [
  {
    id: "pt-open-nam-01",
    type: "open_pt",
    className: "Lịch trống 1–1 (HLV Nam)",
    sport: "Gym",
    level: "1-1 PT",
    date: "2026-10-14",
    startTime: "08:30",
    endTime: "09:30",
    room: "Khu PT 1-1 - Tầng 1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 0,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Nhận kèm cá nhân siết mỡ, tăng cơ ngực và thể lực",
  },
  {
    id: "pt-open-nam-02",
    type: "open_pt",
    className: "Lịch trống 1–1 (HLV Nam)",
    sport: "Boxing",
    level: "1-1 PT",
    date: "2026-10-15",
    startTime: "14:00",
    endTime: "15:30",
    room: "Ring PT 1-1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 0,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Kèm boxing cardio, rèn phản xạ và thể lực chiến đấu",
  },
  {
    id: "pt-open-nam-03",
    type: "open_pt",
    className: "Lịch trống 1–1 (HLV Nam)",
    sport: "Gym",
    level: "1-1 PT",
    date: "2026-10-16",
    startTime: "18:00",
    endTime: "19:00",
    room: "Khu PT 1-1 - Tầng 1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 0,
    status: "sắp diễn ra",
    attendanceStatus: "chưa điểm danh",
    coachNote: "Tập chân mông và siết nét cơ lõi (Core & Leg day)",
  },
  {
    id: "pt-booked-sample",
    type: "pt",
    className: "Kèm 1-1: Nguyễn Văn An",
    sport: "Gym",
    level: "1-1 PT",
    date: "2026-10-13",
    startTime: "07:00",
    endTime: "08:30",
    room: "Khu PT 1-1",
    coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
    coachName: "HLV Hồ Xuân Ánh Nam",
    capacity: 1,
    registeredCount: 1,
    status: "hoàn thành",
    attendanceStatus: "có mặt",
    memberName: "Nguyễn Văn An",
    memberPhone: "0912345678",
    goal: "Tăng cơ giảm mỡ",
    coachNote: "Đã hoàn thành tốt 5 hiệp Bench Press và Barbell Row. Form chuẩn.",
  }
];

class ScheduleSyncService {
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY || e.key === "member_sessions") {
          this.notify();
        }
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((l) => {
      try { l(); } catch {}
    });
  }

  public getSyncedSessions(): SyncedSession[] {
    try {
      const str = localStorage.getItem(STORAGE_KEY);
      if (str) {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    // Seed default
    this.saveSyncedSessions(INITIAL_SYNCED_SESSIONS);
    return INITIAL_SYNCED_SESSIONS;
  }

  public saveSyncedSessions(sessions: SyncedSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      this.notify();
    } catch (err) {
      console.warn("Lỗi lưu synced sessions:", err);
    }
  }

  public getOpenPtSlots(): SyncedSession[] {
    const all = this.getSyncedSessions();
    const openFromAll = all.filter((s) => s.type === "open_pt" && s.status === "sắp diễn ra" && s.registeredCount === 0);

    // Merge any coach custom open pt slots from localStorage for 100% seamless cross-portal sync
    try {
      const customStr = localStorage.getItem("coach_custom_open_pt_slots");
      if (customStr) {
        const customSlots = JSON.parse(customStr);
        if (Array.isArray(customSlots)) {
          for (const cs of customSlots) {
            if (!openFromAll.some((o) => o.id === cs.id || (o.date === cs.date && o.startTime === cs.startTime))) {
              openFromAll.unshift({
                id: cs.id,
                type: "open_pt",
                className: cs.className || `Lịch trống 1–1: ${cs.sport}`,
                sport: cs.sport,
                level: cs.level || "1-1 PT",
                date: cs.date,
                startTime: cs.startTime,
                endTime: cs.endTime,
                room: cs.room,
                coachId: cs.coachId || "25f50fba-506a-4edf-9db7-43f77f6741a4",
                coachName: cs.coachName || "HLV Hồ Xuân Ánh Nam",
                capacity: 1,
                registeredCount: 0,
                status: "sắp diễn ra",
                attendanceStatus: "chưa điểm danh",
                coachNote: cs.note || "Mở nhận học viên kèm 1-1",
              });
            }
          }
        }
      }
    } catch {}

    return openFromAll;
  }

  public createOpenPtSlot(slot: {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport: string;
    room: string;
    coachName: string;
    coachId?: string;
    note?: string;
  }): SyncedSession {
    const all = this.getSyncedSessions();
    const newSlot: SyncedSession = {
      id: slot.id || `open-${Date.now()}`,
      type: "open_pt",
      className: `Lịch trống 1–1: ${slot.sport}`,
      sport: slot.sport,
      level: "1-1 PT",
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
      coachId: slot.coachId || "25f50fba-506a-4edf-9db7-43f77f6741a4",
      coachName: slot.coachName || "HLV Hồ Xuân Ánh Nam",
      capacity: 1,
      registeredCount: 0,
      status: "sắp diễn ra",
      attendanceStatus: "chưa điểm danh",
      coachNote: slot.note || "Mở nhận học viên kèm 1-1",
      updatedAt: new Date().toISOString(),
    };

    const updated = [newSlot, ...all.filter(s => s.id !== newSlot.id)];
    this.saveSyncedSessions(updated);
    return newSlot;
  }

  public deleteOpenPtSlot(slotId: string): void {
    const all = this.getSyncedSessions();
    const updated = all.filter((s) => s.id !== slotId);
    this.saveSyncedSessions(updated);
  }

  public bookPtSlot(params: {
    slotId: string;
    memberId: string;
    memberName: string;
    memberPhone: string;
    memberEmail: string;
    goal: string;
    userNote?: string;
  }): SyncedSession {
    const all = this.getSyncedSessions();
    const slotIndex = all.findIndex((s) => s.id === params.slotId);

    const nowStr = new Date().toISOString();
    let bookedSession: SyncedSession;

    if (slotIndex >= 0) {
      const orig = all[slotIndex];
      bookedSession = {
        ...orig,
        id: `pt-booked-${Date.now()}`,
        type: "pt",
        className: `Kèm 1-1: ${orig.sport} (${params.goal})`,
        registeredCount: 1,
        status: "sắp diễn ra",
        attendanceStatus: "chưa điểm danh",
        memberId: params.memberId,
        memberName: params.memberName,
        memberPhone: params.memberPhone,
        memberEmail: params.memberEmail,
        goal: params.goal,
        userNote: params.userNote,
        coachNote: params.userNote ? `Mục tiêu HV: ${params.goal} - Ghi chú: ${params.userNote}` : `Mục tiêu HV: ${params.goal}`,
        updatedAt: nowStr,
      };

      all[slotIndex] = bookedSession;
    } else {
      bookedSession = {
        id: `pt-booked-${Date.now()}`,
        type: "pt",
        className: `Kèm 1-1: Gym (${params.goal})`,
        sport: "Gym",
        level: "1-1 PT",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        startTime: "08:30",
        endTime: "09:30",
        room: "Khu PT 1-1 - Tầng 1",
        coachId: "25f50fba-506a-4edf-9db7-43f77f6741a4",
        coachName: "HLV Hồ Xuân Ánh Nam",
        capacity: 1,
        registeredCount: 1,
        status: "sắp diễn ra",
        attendanceStatus: "chưa điểm danh",
        memberId: params.memberId,
        memberName: params.memberName,
        memberPhone: params.memberPhone,
        memberEmail: params.memberEmail,
        goal: params.goal,
        userNote: params.userNote,
        coachNote: `Mục tiêu: ${params.goal}`,
        updatedAt: nowStr,
      };
      all.unshift(bookedSession);
    }

    this.saveSyncedSessions(all);

    try {
      const memStr = localStorage.getItem("member_sessions");
      const memSessions = memStr ? JSON.parse(memStr) : [];
      const newMemberSession = {
        id: bookedSession.id,
        name: bookedSession.className,
        sport: bookedSession.sport,
        level: "1-1 PT",
        type: "pt",
        date: bookedSession.date,
        startTime: bookedSession.startTime,
        endTime: bookedSession.endTime,
        room: bookedSession.room,
        coachId: bookedSession.coachId,
        coachName: bookedSession.coachName,
        capacity: 1,
        registeredCount: 1,
        status: "sắp diễn ra",
        attendanceStatus: "chưa điểm danh",
        coachNote: bookedSession.coachNote,
      };
      localStorage.setItem("member_sessions", JSON.stringify([newMemberSession, ...memSessions]));
    } catch {}

    this.pushBookingToBackend(bookedSession);
    return bookedSession;
  }

  public cancelBooking(sessionId: string, reason: string): void {
    const all = this.getSyncedSessions();
    const updated = all.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: "đã hủy" as const,
          cancelReason: reason || "Học viên tự hủy trước giờ tập",
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    this.saveSyncedSessions(updated);

    try {
      const memStr = localStorage.getItem("member_sessions");
      if (memStr) {
        const memSessions = JSON.parse(memStr);
        const mapped = memSessions.map((s: any) =>
          s.id === sessionId ? { ...s, status: "đã hủy", cancelReason: reason } : s
        );
        localStorage.setItem("member_sessions", JSON.stringify(mapped));
      }
    } catch {}

    this.cancelBookingOnBackend(sessionId, reason);
  }

  public recordAttendance(sessionId: string, attendanceStatus: "có mặt" | "vắng" | "có phép", coachNote: string): void {
    const all = this.getSyncedSessions();
    const updated = all.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          attendanceStatus,
          coachNote: coachNote.trim() || s.coachNote || "",
          status: (attendanceStatus === "có mặt" ? "hoàn thành" : s.status) as any,
          updatedAt: new Date().toISOString(),
        };
      }
      return s;
    });

    this.saveSyncedSessions(updated);

    try {
      const memStr = localStorage.getItem("member_sessions");
      if (memStr) {
        const memSessions = JSON.parse(memStr);
        const mapped = memSessions.map((s: any) => {
          if (s.id === sessionId) {
            return {
              ...s,
              attendanceStatus,
              coachNote: coachNote.trim() || s.coachNote || "",
              status: attendanceStatus === "có mặt" ? "hoàn thành" : s.status,
            };
          }
          return s;
        });
        localStorage.setItem("member_sessions", JSON.stringify(mapped));
      }
    } catch {}

    this.finalizeAttendanceOnBackend(sessionId, attendanceStatus, coachNote);
  }

  private async pushBookingToBackend(session: SyncedSession) {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${BASE_URL}/member/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          slotId: session.id,
          name: session.className,
          sport: session.sport,
          level: session.level,
          type: session.type,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.room,
          coachName: session.coachName,
          coachId: session.coachId,
          memberName: session.memberName,
          memberPhone: session.memberPhone,
          memberEmail: session.memberEmail,
          goal: session.goal,
          coachNote: session.coachNote,
        }),
      });
    } catch {}
  }

  private async cancelBookingOnBackend(sessionId: string, reason: string) {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${BASE_URL}/member/bookings/${encodeURIComponent(sessionId)}?reason=${encodeURIComponent(reason)}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {}
  }

  private async finalizeAttendanceOnBackend(sessionId: string, status: string, note: string) {
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${BASE_URL}/coach/sessions/${encodeURIComponent(sessionId)}/attendance/finalize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          records: [
            {
              memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
              status,
              note,
            },
          ],
        }),
      });
    } catch {}
  }
}

export const scheduleSync = new ScheduleSyncService();

export function getStoredSyncedSessions(): SyncedSession[] {
  return scheduleSync.getSyncedSessions();
}
