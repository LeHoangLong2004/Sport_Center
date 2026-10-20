import {
  type SyncedSession,
  pushBookingToBackend,
  cancelBookingOnBackend,
  finalizeAttendanceOnBackend,
} from "./scheduleSyncApi";

export type { SyncedSession };

const STORAGE_KEY = "synced_schedule_sessions";

export const INITIAL_SYNCED_SESSIONS: SyncedSession[] = [];

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
    return [];
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

  public async bookPtSlot(params: {
    slotId: string;
    memberId: string;
    memberName: string;
    memberPhone: string;
    memberEmail: string;
    goal: string;
    userNote?: string;
  }): Promise<SyncedSession> {
    const all = this.getSyncedSessions();
    const previousAll = all.map((session) => ({ ...session }));
    const previousMemberStorage = localStorage.getItem("member_sessions");
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

    const backendResult = await pushBookingToBackend(bookedSession);
    if (!backendResult.ok) {
      this.saveSyncedSessions(previousAll);
      if (previousMemberStorage === null) {
        localStorage.removeItem("member_sessions");
      } else {
        localStorage.setItem("member_sessions", previousMemberStorage);
      }
      throw new Error(backendResult.message || "Không thể đặt lịch PT.");
    }

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

    void cancelBookingOnBackend(sessionId, reason);
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

    void finalizeAttendanceOnBackend(sessionId, attendanceStatus, coachNote);
  }
}

export const scheduleSync = new ScheduleSyncService();

export function getStoredSyncedSessions(): SyncedSession[] {
  return scheduleSync.getSyncedSessions();
}

