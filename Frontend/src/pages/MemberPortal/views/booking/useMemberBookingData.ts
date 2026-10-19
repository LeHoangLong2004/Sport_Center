import { useState, useMemo, useEffect, useCallback } from "react";
import type { MemberSessionItem } from "../../types";
import { MemberAPI } from "../../services/api";
import { getRealCoachAvatar } from "../../utils/coachAvatar";
import { getCounterPendingIds } from "./bookingTypes";

export function useMemberBookingData() {
  const [mySessions, setMySessions] = useState<MemberSessionItem[]>([]);
  const [groupClasses, setGroupClasses] = useState<any[]>([]);
  const [ptSlots, setPtSlots] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loadingGroupClasses, setLoadingGroupClasses] = useState(true);
  const [refreshingGroupClasses, setRefreshingGroupClasses] = useState(false);
  const [groupClassesError, setGroupClassesError] = useState<string | null>(null);

  const loadGroupClasses = useCallback(async (silent = false) => {
    if (silent) setRefreshingGroupClasses(true);
    else setLoadingGroupClasses(true);
    setGroupClassesError(null);

    try {
      const [availableClasses, memberSchedule, availablePtSlots, coachesList] = await Promise.all([
        MemberAPI.getAvailableClasses(),
        MemberAPI.getMemberSchedule().catch(() => ({ classBookings: [], ptSessions: [] })),
        MemberAPI.getAvailablePtSlots().catch(() => []),
        MemberAPI.getCoaches().catch(() => []),
      ]);

      if (Array.isArray(coachesList)) setCoaches(coachesList);

      const coachById = new Map(
        (Array.isArray(coachesList) ? coachesList : []).map((coach: any) => [String(coach.id), coach])
      );

      const mappedClasses = (Array.isArray(availableClasses) ? availableClasses : []).map((item: any) => {
        const start = new Date(item.scheduleTime);
        const end = new Date(start.getTime() + Number(item.durationMinutes || 60) * 60000);
        const dateStr = [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, "0"),
          String(start.getDate()).padStart(2, "0"),
        ].join("-");
        const time = (value: Date) =>
          `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

        const coachAccount = coachById.get(String(item.coachId));
        const coachName = item.coachName || coachAccount?.fullName || "HLV Chuyên Nghiệp";
        const coachAvatar = getRealCoachAvatar(coachName, item.coachAvatar || coachAccount?.avatarUrl, item.coachId);

        return {
          ...item,
          id: item.id,
          name: item.className,
          sport: item.sportName || "Thể lực",
          level: item.level || "Mọi cấp độ",
          startTime: time(start),
          endTime: time(end),
          room: item.facilityName || "Studio Thể thao",
          coachId: item.coachId || "",
          coachName,
          coachAvatar,
          coachSpecialty: item.coachSpecialty || "Huấn luyện viên Thể hình & Lớp nhóm",
          coachPhone: item.coachPhone || "0901 234 567",
          coachBio:
            item.coachBio ||
            "Huấn luyện viên giàu kinh nghiệm, tận tâm hướng dẫn học viên cải thiện vóc dáng và thể lực toàn diện.",
          coachRating: item.coachRating ?? null,
          coachExperienceYears: item.coachExperienceYears ?? null,
          price: item.price ?? 0,
          capacity: item.capacity,
          registeredCount: item.currentEnrolled || 0,
          availableSpots: item.availableSpots ?? Math.max(0, item.capacity - (item.currentEnrolled || 0)),
          dateStr,
          description:
            item.description ||
            `Lớp học ${item.className} cùng ${coachName} giúp đốt mỡ, săn chắc cơ bắp và nâng cao sức bền tối ưu.`,
        };
      });
      setGroupClasses(mappedClasses);

      const counterPendingIds = getCounterPendingIds();
      const dbBookings = (memberSchedule?.classBookings || []).map((booking: any) => {
        const start = new Date(booking.scheduleTime);
        const end = new Date(start.getTime() + Number(booking.durationMinutes || 60) * 60000);
        const date = [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, "0"),
          String(start.getDate()).padStart(2, "0"),
        ].join("-");
        const coachAccount = coachById.get(String(booking.coachId));
        const coachName = booking.coachName || coachAccount?.fullName || "Huấn luyện viên phụ trách";
        const coachAvatar = getRealCoachAvatar(coachName, booking.coachAvatar || coachAccount?.avatarUrl, booking.coachId);

        const isCounterPending = counterPendingIds.includes(String(booking.classId));
        const effectiveStatus = isCounterPending ? "pending" : booking.status || "confirmed";

        return {
          id: booking.classId,
          bookingId: booking.bookingId || booking.id,
          classId: booking.classId,
          name: booking.className,
          sport: booking.sportName || "Lớp nhóm",
          level: "Lớp nhóm",
          type: "group",
          date,
          startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
          endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
          room: booking.facilityName || "Studio Thể thao",
          coachId: booking.coachId || "",
          coachName,
          coachAvatar,
          coachSpecialty: booking.coachSpecialty || "Huấn luyện viên Thể hình",
          coachPhone: booking.coachPhone || "0901 234 567",
          coachBio: booking.coachBio || "Huấn luyện viên phụ trách lớp học.",
          coachRating: booking.coachRating ?? null,
          coachExperienceYears: booking.coachExperienceYears ?? null,
          price: booking.price ?? 0,
          capacity: 0,
          registeredCount: 0,
          status: effectiveStatus,
          bookingStatus: effectiveStatus,
        };
      });

      const dbPtBookings = (memberSchedule?.ptSessions || []).map((session: any) => {
        const start = new Date(session.scheduleTime);
        const end = new Date(start.getTime() + Number(session.durationMinutes || 60) * 60000);
        const date = [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, "0"),
          String(start.getDate()).padStart(2, "0"),
        ].join("-");
        const coachAccount = coachById.get(String(session.coachId));
        const coachName = session.coachName || coachAccount?.fullName || "Personal Trainer";

        return {
          id: session.sessionId,
          name: "Buổi tập Kèm riêng 1-1",
          sport: "PT 1-1",
          level: "1-1 PT",
          type: "pt",
          date,
          startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
          endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
          room: "Khu vực PT 1-1",
          coachId: session.coachId || "",
          coachName,
          coachAvatar: getRealCoachAvatar(coachName, session.coachAvatar || coachAccount?.avatarUrl, session.coachId),
          coachSpecialty: session.coachSpecialty || "Chuyên gia HLV Thể hình 1-1",
          coachPhone: session.coachPhone || "0901 234 567",
          coachRating: session.coachRating ?? null,
          capacity: 1,
          registeredCount: 1,
          status: session.status || "confirmed",
        };
      });

      setMySessions([...dbBookings, ...dbPtBookings]);
      setPtSlots(Array.isArray(availablePtSlots) ? availablePtSlots : []);
    } catch (error: any) {
      console.error("Không thể tải dữ liệu đặt lịch từ database:", error);
      if (!silent) {
        setGroupClasses([]);
        setGroupClassesError(error?.message || "Không thể kết nối đến dữ liệu lịch học. Vui lòng thử lại.");
      }
    } finally {
      if (silent) setRefreshingGroupClasses(false);
      else setLoadingGroupClasses(false);
    }
  }, []);

  useEffect(() => {
    void loadGroupClasses();
  }, [loadGroupClasses]);

  const normalizeBookingStatus = useCallback((status: unknown) =>
    String(status ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d"), []);

  const getBookingStatus = useCallback((session: MemberSessionItem) =>
    (session as any).bookingStatus ?? (session as any).status, []);

  const isInactiveBookingStatus = useCallback((status: unknown) => {
    const normalized = normalizeBookingStatus(status);
    return (
      normalized.includes("cancel") ||
      normalized.includes("huy") ||
      normalized === "rejected" ||
      normalized === "class_cancelled" ||
      normalized === "attended" ||
      normalized === "no_show" ||
      normalized === "no-show"
    );
  }, [normalizeBookingStatus]);

  const findActiveBooking = useCallback((classId: string, date?: string) =>
    mySessions.find(
      (session) =>
        String((session as any).classId ?? session.id).toLowerCase() === String(classId).toLowerCase() &&
        (!date || session.date === date) &&
        !isInactiveBookingStatus(getBookingStatus(session))
    ), [mySessions, isInactiveBookingStatus, getBookingStatus]);

  const isBooked = useCallback((classId: string, date: string) => Boolean(findActiveBooking(classId, date)), [findActiveBooking]);

  const myActiveClasses = useMemo(
    () => mySessions.filter((s) => !isInactiveBookingStatus(getBookingStatus(s))),
    [mySessions, isInactiveBookingStatus, getBookingStatus]
  );

  return {
    groupClasses,
    setGroupClasses,
    mySessions,
    setMySessions,
    ptSlots,
    setPtSlots,
    coaches,
    loadingGroupClasses,
    refreshingGroupClasses,
    groupClassesError,
    loadGroupClasses,
    normalizeBookingStatus,
    getBookingStatus,
    isInactiveBookingStatus,
    findActiveBooking,
    isBooked,
    myActiveClasses,
  };
}
