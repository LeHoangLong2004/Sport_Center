import { useState, useEffect, useMemo } from "react";
import { type SessionStatus, type MockSession, type ScheduleChangeRequest, type AvailabilitySlot, CoachAPI } from "../../services/api";
import type { UnifiedScheduleItem } from "./types";

export function useCoachScheduleData(weekDates: string[]) {
  const [rawSessions, setRawSessions] = useState<MockSession[]>([]);
  const [requests, setRequests] = useState<ScheduleChangeRequest[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let disposed = false;

    async function loadData() {
      setLoading(true);
      try {
        const [schData, reqData, availData] = await Promise.all([
          CoachAPI.getSchedule(),
          CoachAPI.getScheduleRequests(),
          CoachAPI.getAvailabilitySlots(),
        ]);
        if (disposed) return;
        setRawSessions(schData);
        setRequests(reqData);
        setAvailabilitySlots(availData);
      } catch (err) {
        console.error("Lỗi nạp dữ liệu lịch:", err);
      } finally {
        if (!disposed) setLoading(false);
      }

    }

    const refreshSchedule = () => {
      void loadData();
    };

    void loadData();
    window.addEventListener("focus", refreshSchedule);
    window.addEventListener("coach-schedule-updated", refreshSchedule);
    const refreshTimer = window.setInterval(refreshSchedule, 30000);

    return () => {
      disposed = true;
      window.removeEventListener("focus", refreshSchedule);
      window.removeEventListener("coach-schedule-updated", refreshSchedule);
      window.clearInterval(refreshTimer);
    }
  }, []);

  const allUnifiedSessions: UnifiedScheduleItem[] = useMemo(() => {
    const groupItems: UnifiedScheduleItem[] = rawSessions.map((s) => ({
      id: s.id,
      type: "group" as const,
      classId: s.classId,
      className: s.className,
      sport: s.sport,
      level: s.level,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      coachName: s.coachName,
      capacity: s.capacity,
      registeredCount: Array.isArray(s.registeredMemberIds) ? s.registeredMemberIds.length : 0,
      status: s.status,
      approvalStatus: s.approvalStatus,
    }));

    const ptItems: UnifiedScheduleItem[] = availabilitySlots
      .filter((slot) => slot.isOpen && Boolean(slot.bookedMemberName))
      .map((slot) => {
        const targetDate = slot.date || weekDates[((slot.dayOfWeek || 1) - 1) % 7] || weekDates[0];
        return {
          id: slot.id,
          type: "pt" as const,
          className: `Kèm 1-1: ${slot.bookedMemberName}`,
          sport: slot.sport || "Gym",
          level: "1-1 PT",
          date: targetDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room || "Khu PT 1-1",
          coachName: slot.coachName || "HLV",
          registeredCount: 1,
          capacity: 1,
          status: "sắp diễn ra" as SessionStatus,
          memberId: slot.memberId,
          memberName: slot.bookedMemberName,
          memberPhone: slot.bookedMemberPhone,
          goal: slot.goal,
        };
      });

    const openItems: UnifiedScheduleItem[] = availabilitySlots
      .filter((slot) => slot.isOpen && !slot.bookedMemberName)
      .map((slot) => {
        const targetDate = slot.date || weekDates[((slot.dayOfWeek || 1) - 1) % 7] || weekDates[0];
        return {
          id: `open-${slot.id}`,
          type: "open_pt" as const,
          className: "Lịch trống 1–1 (Mở nhận HV)",
          sport: slot.sport || "Gym",
          level: "1-1 PT",
          date: targetDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room || "Khu PT 1-1",
          coachName: slot.coachName || "HLV",
          registeredCount: 0,
          capacity: 1,
          status: "sắp diễn ra" as SessionStatus,
          note: slot.note || `Ca ${slot.period || "trống"} - Sẵn sàng nhận học viên`,
        };
      });

    const combined = [...groupItems, ...ptItems, ...openItems];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [rawSessions, availabilitySlots, weekDates]);

  const addOpenSlot = async (newItem: UnifiedScheduleItem) => {
    const created = await CoachAPI.createAvailabilitySlot({
      date: newItem.date,
      startTime: newItem.startTime,
      endTime: newItem.endTime,
      sport: newItem.sport,
      room: newItem.room,
      note: newItem.note,
    });
    setAvailabilitySlots((previous) => [created, ...previous.filter((slot) => slot.id !== created.id)]);
    return created;
  };

  const removeOpenSlot = async (id: string) => {
    const availabilityId = id.startsWith("open-") ? id.slice("open-".length) : id;
    await CoachAPI.deleteAvailabilitySlot(availabilityId);
    setAvailabilitySlots((previous) => previous.filter((slot) => slot.id !== availabilityId));
  };

  const toggleSlot = async (slotId: string) => {
    setAvailabilitySlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, isOpen: !s.isOpen } : s))
    );
    try {
      await CoachAPI.toggleAvailabilitySlot(slotId);
    } catch {}
  };

  const addRequest = (req: ScheduleChangeRequest) => {
    setRequests((prev) => [req, ...prev]);
  };

  return {
    rawSessions,
    requests,
    availabilitySlots,
    allUnifiedSessions,
    loading,
    addOpenSlot,
    removeOpenSlot,
    toggleSlot,
    addRequest,
  };
}
