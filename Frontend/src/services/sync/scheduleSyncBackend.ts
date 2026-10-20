import type { SyncedSession } from "./scheduleSync";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api";

export async function pushBookingToBackend(session: SyncedSession): Promise<{ ok: boolean; message?: string }> {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/member/bookings`, {
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
    if (response.ok) return { ok: true };
    let message = "Khung giờ PT không còn khả dụng.";
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {}
    return { ok: false, message };
  } catch {
    return { ok: false, message: "Không thể kết nối máy chủ để kiểm tra xung đột lịch." };
  }
}

export async function cancelBookingOnBackend(sessionId: string, reason: string): Promise<void> {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    await fetch(`${BASE_URL}/member/bookings/${encodeURIComponent(sessionId)}?reason=${encodeURIComponent(reason)}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {}
}

export async function finalizeAttendanceOnBackend(sessionId: string, status: string, note: string): Promise<void> {
  try {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    await fetch(`${BASE_URL}/coach/sessions/${encodeURIComponent(sessionId)}/attendance/finalize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        records: [{ memberId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", status, note }],
      }),
    });
  } catch {}
}
