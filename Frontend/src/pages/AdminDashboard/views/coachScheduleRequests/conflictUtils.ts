import { isAppointmentForCoach } from "../../../../services/appointmentService";
import type { CoachOption, ParsedTimeWindow } from "./types";

export function parseShiftTimeWindow(
  sessionTime?: string,
  scheduleTime?: string,
  fallbackDuration = 60,
): ParsedTimeWindow | null {
  const text = (sessionTime || scheduleTime || "").trim();
  if (!text) return null;

  // Format 1: "2026-10-27 (17:00 - 18:00)" or "2026-10-27 17:00 - 18:00"
  const rangeMatch = text.match(/(\d{4}-\d{2}-\d{2}).*?(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (rangeMatch) {
    const date = rangeMatch[1];
    const [sH, sM] = rangeMatch[2].split(":").map(Number);
    const [eH, eM] = rangeMatch[3].split(":").map(Number);
    return {
      date,
      startMinutes: sH * 60 + sM,
      endMinutes: eH * 60 + eM,
      formattedTime: `${rangeMatch[2]} - ${rangeMatch[3]}`,
    };
  }

  // Format 2: "2026-10-27 17:00" or ISO "2026-10-27T17:00:00"
  const singleMatch = text.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}:\d{2})/);
  if (singleMatch) {
    const date = singleMatch[1];
    const [sH, sM] = singleMatch[2].split(":").map(Number);
    const startMinutes = sH * 60 + sM;
    const endMinutes = startMinutes + (fallbackDuration > 0 ? fallbackDuration : 60);
    const eH = Math.floor(endMinutes / 60) % 24;
    const eM = endMinutes % 60;
    const formattedEnd = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
    return {
      date,
      startMinutes,
      endMinutes,
      formattedTime: `${singleMatch[2]} - ${formattedEnd}`,
    };
  }

  return null;
}

export function checkCoachConflict(
  coach: CoachOption,
  window: ParsedTimeWindow | null,
  classes: any[],
  appointments: any[],
  currentSessionId?: string,
): { isBusy: boolean; conflictReason?: string } {
  if (!window) return { isBusy: false };

  const normCoachName = (coach.fullName || "").toLowerCase().trim();

  // 1. Kiểm tra trong danh sách lớp học (classes)
  for (const cls of classes) {
    if (cls.status === false || cls.isCancelled === true) continue;
    if (cls.approvalStatus === "rejected") continue;
    if (currentSessionId && cls.id === currentSessionId) continue;

    const matchCoach =
      (cls.coachId && cls.coachId === coach.id) ||
      (cls.coachName &&
        (cls.coachName.toLowerCase().includes(normCoachName) ||
          normCoachName.includes(cls.coachName.toLowerCase())));
    if (!matchCoach) continue;

    let clsDate = "";
    let clsStartMin = 0;
    let clsEndMin = 0;
    let clsStartStr = "";
    let clsEndStr = "";

    if (cls.scheduleTime) {
      const str = String(cls.scheduleTime).trim();
      if (str.endsWith("Z")) {
        const dt = new Date(str);
        if (!isNaN(dt.getTime())) {
          clsDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(dt);
          clsStartStr = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(dt);
          const [h, m] = clsStartStr.split(":").map(Number);
          clsStartMin = h * 60 + m;
        }
      } else {
        const match = str.match(/(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}):(\d{2})/);
        if (match) {
          clsDate = match[1];
          const h = Number(match[2]);
          const m = Number(match[3]);
          clsStartMin = h * 60 + m;
          clsStartStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }
      }

      if (clsDate) {
        const dur = cls.durationMinutes || 60;
        clsEndMin = clsStartMin + dur;
        const eH = Math.floor(clsEndMin / 60) % 24;
        const eM = clsEndMin % 60;
        clsEndStr = `${String(eH).padStart(2, "0")}:${String(eM).padStart(2, "0")}`;
      }
    }

    if (clsDate === window.date) {
      if (clsStartMin < window.endMinutes && clsEndMin > window.startMinutes) {
        return {
          isBusy: true,
          conflictReason: `Trùng lớp: "${cls.className || cls.name || "Lớp học"}" (${clsStartStr} - ${clsEndStr})`,
        };
      }
    }
  }

  // 2. Kiểm tra trong danh sách lịch hẹn (appointments)
  for (const appt of appointments) {
    if (appt.status === "Đã hủy") continue;
    if (!isAppointmentForCoach(appt.coachName, coach.fullName)) continue;

    const apptDate = appt.date ? appt.date.slice(0, 10) : "";
    if (apptDate !== window.date) continue;

    const timeParts = (appt.time || "").split("-").map((t: string) => t.trim());
    if (timeParts.length >= 1 && timeParts[0].includes(":")) {
      const [aH, aM] = timeParts[0].split(":").map(Number);
      const apptStartMin = aH * 60 + aM;
      let apptEndMin = apptStartMin + 60;
      let apptEndStr = `${String(Math.floor(apptEndMin / 60) % 24).padStart(2, "0")}:${String(apptEndMin % 60).padStart(2, "0")}`;

      if (timeParts.length >= 2 && timeParts[1].includes(":")) {
        const [aeH, aeM] = timeParts[1].split(":").map(Number);
        apptEndMin = aeH * 60 + aeM;
        apptEndStr = timeParts[1];
      }

      if (apptStartMin < window.endMinutes && apptEndMin > window.startMinutes) {
        return {
          isBusy: true,
          conflictReason: `Trùng lịch hẹn: "${appt.title}" (${timeParts[0]} - ${apptEndStr})`,
        };
      }
    }
  }

  return { isBusy: false };
}
