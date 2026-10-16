import { useState, useEffect, useMemo } from "react";
import { type SessionStatus, type MockSession, type ScheduleChangeRequest, type AvailabilitySlot, CoachAPI } from "../../services/api";
import type { UnifiedScheduleItem } from "./types";
import { scheduleSync } from "../../../../services/sync/scheduleSync";

export function useCoachScheduleData(weekDates: string[]) {
  const [rawSessions, setRawSessions] = useState<MockSession[]>([]);
  const [requests, setRequests] = useState<ScheduleChangeRequest[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncedSessions, setSyncedSessions] = useState(() => scheduleSync.getSyncedSessions());

  useEffect(() => {
    return scheduleSync.subscribe(() => {
      setSyncedSessions(scheduleSync.getSyncedSessions());
    });
  }, []);

  const [openSlots, setOpenSlots] = useState<UnifiedScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem("coach_custom_open_pt_slots");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [schData, reqData, availData] = await Promise.all([
          CoachAPI.getSchedule(),
          CoachAPI.getScheduleRequests(),
          CoachAPI.getAvailabilitySlots(),
        ]);
        setRawSessions(schData);
        setRequests(reqData);
        setAvailabilitySlots(availData);
      } catch (err) {
        console.error("Lỗi nạp dữ liệu lịch:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
    }));

    const ptItems: UnifiedScheduleItem[] = availabilitySlots
      .filter((slot) => slot.isOpen && Boolean(slot.bookedMemberName))
      .map((slot) => {
        const targetDate = weekDates[(slot.dayOfWeek - 1) % 7] || weekDates[0];
        return {
          id: slot.id,
          type: "pt" as const,
          className: `Kèm 1-1: ${slot.bookedMemberName}`,
          sport: "Gym",
          level: "1-1 PT",
          date: targetDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: "Khu PT 1-1",
          coachName: "HLV",
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
        const targetDate = weekDates[(slot.dayOfWeek - 1) % 7] || weekDates[0];
        return {
          id: `open-${slot.id}`,
          type: "open_pt" as const,
          className: "Lịch trống 1–1 (Mở nhận HV)",
          sport: "Gym",
          level: "1-1 PT",
          date: targetDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: "Khu PT 1-1",
          coachName: "HLV",
          registeredCount: 0,
          capacity: 1,
          status: "sắp diễn ra" as SessionStatus,
          note: `Ca ${slot.period} - Sẵn sàng nhận học viên`,
        };
      });

    const syncedItems: UnifiedScheduleItem[] = syncedSessions.map((s) => ({
      id: s.id,
      type: s.type === "pt" ? ("pt" as const) : ("group" as const),
      classId: s.classId,
      className: s.className || (s.type === "pt" ? `Kèm 1-1: ${s.memberName}` : "Lớp học"),
      sport: s.sport,
      level: s.level || "Cơ bản",
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room || "Khu PT 1-1",
      coachName: s.coachName,
      capacity: s.capacity || 1,
      registeredCount: s.registeredCount || 1,
      status: s.status as any,
      memberName: s.memberName,
      memberPhone: s.memberPhone,
      note: s.userNote || s.coachNote,
    }));

    const combined = [...groupItems, ...ptItems, ...openItems, ...openSlots, ...syncedItems];
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [rawSessions, availabilitySlots, openSlots, weekDates, syncedSessions]);

  const addOpenSlot = (newItem: UnifiedScheduleItem) => {
    const updated = [newItem, ...openSlots];
    setOpenSlots(updated);
    try {
      localStorage.setItem("coach_custom_open_pt_slots", JSON.stringify(updated));
    } catch {}
    scheduleSync.createOpenPtSlot({
      id: newItem.id,
      date: newItem.date,
      startTime: newItem.startTime,
      endTime: newItem.endTime,
      sport: newItem.sport,
      room: newItem.room,
      coachName: newItem.coachName || "HLV",
      note: newItem.note,
    });
  };

  const removeOpenSlot = (id: string) => {
    const updated = openSlots.filter((s) => s.id !== id);
    setOpenSlots(updated);
    try {
      localStorage.setItem("coach_custom_open_pt_slots", JSON.stringify(updated));
    } catch {}
    scheduleSync.deleteOpenPtSlot(id);
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
    openSlots,
    allUnifiedSessions,
    loading,
    addOpenSlot,
    removeOpenSlot,
    toggleSlot,
    addRequest,
  };
}
