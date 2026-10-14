import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import type { CoachScreen } from "../types";
import {
  type SessionStatus,
  type MockSession,
  type ScheduleChangeRequest,
  type AvailabilitySlot,
  CoachAPI
} from "../services/api";
import {
  Calendar,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Send,
  Plus,
  CalendarPlus,
  Sparkles,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  CalendarCheck,
  User,
  X,
  Target
} from "lucide-react";

type MainTab = "schedule" | "availability" | "requests";
type ViewMode = "week" | "list";
type TypeFilter = "all" | "group" | "pt" | "open_pt";
type SportFilter = "all" | string;
type StatusFilter = "all" | SessionStatus;

interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

import { scheduleSync, type SyncedSession } from "../../../services/sync/scheduleSync";

export interface UnifiedScheduleItem {
  id: string;
  type: "group" | "pt" | "open_pt";
  classId?: string;
  className: string;
  sport: string;
  level: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;
  room: string;
  coachName: string;
  capacity?: number;
  registeredCount: number;
  status: SessionStatus;
  attendanceStatus?: string;
  // PT specific
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  goal?: string;
  note?: string;
  coachNote?: string;
  cancelReason?: string;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "sắp diễn ra", label: "Sắp diễn ra" },
  { value: "đang diễn ra", label: "Đang diễn ra" },
  { value: "hoàn thành", label: "Hoàn thành" },
  { value: "đã hủy", label: "Đã hủy" },
];

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "đang diễn ra": { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
  "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

const REQUEST_STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "chờ duyệt": { label: "Chờ duyệt", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
  "đã duyệt": { label: "Đã duyệt", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "từ chối": { label: "Từ chối", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

const DAYS_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
const TIME_ROWS = ["06:00", "07:00", "08:00", "09:00", "14:00", "15:00", "17:00", "18:00", "19:00"];

export default function CoachSchedule({ navigateTo }: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("schedule");
  const [view, setView] = useState<ViewMode>("week"); // Default: Week Grid like image 1
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all"); // "all" | "group" | "pt" like image 3
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0);

  const [rawSessions, setRawSessions] = useState<MockSession[]>([]);
  const [requests, setRequests] = useState<ScheduleChangeRequest[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<string>("");
  const [requestType, setRequestType] = useState<"dời lịch" | "dạy thay" | "báo vắng">("dời lịch");
  const [substituteCoach, setSubstituteCoach] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Open 1-1 slots state
  const [openSlots, setOpenSlots] = useState<UnifiedScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem("coach_custom_open_pt_slots");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isOpenSlotModalOpen, setIsOpenSlotModalOpen] = useState(false);
  const [openSlotDate, setOpenSlotDate] = useState("");
  const [openSlotStartTime, setOpenSlotStartTime] = useState("08:00");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("09:30");
  const [openSlotSport, setOpenSlotSport] = useState("Gym");
  const [openSlotRoom, setOpenSlotRoom] = useState("Khu PT 1-1");
  const [openSlotNote, setOpenSlotNote] = useState("");
  const [selectedOpenSlot, setSelectedOpenSlot] = useState<UnifiedScheduleItem | null>(null);

  // PT Attendance Modal State
  const [selectedPtForAttendance, setSelectedPtForAttendance] = useState<UnifiedScheduleItem | null>(null);
  const [ptAttendanceStatus, setPtAttendanceStatus] = useState<"có mặt" | "vắng" | "có phép">("có mặt");
  const [ptCoachNote, setPtCoachNote] = useState("");
  const [syncedSessionsList, setSyncedSessionsList] = useState<SyncedSession[]>(() => scheduleSync.getSyncedSessions());

  // Subscribe to real-time member bookings & cancellations
  useEffect(() => {
    const unsub = scheduleSync.subscribe(() => {
      setSyncedSessionsList(scheduleSync.getSyncedSessions());
    });
    return unsub;
  }, []);

  // Lock body scroll when any modal is open to eliminate double scrollbars
  useEffect(() => {
    if (isRequestModalOpen || isOpenSlotModalOpen || selectedOpenSlot || selectedPtForAttendance) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isRequestModalOpen, isOpenSlotModalOpen, selectedOpenSlot, selectedPtForAttendance]);

  // Helper to compute week dates (Monday to Sunday) based on offset
  const weekDates = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }, [weekOffset]);

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

  // Construct combined schedule with BOTH group classes and 1-1 PT bookings
  const allUnifiedSessions: UnifiedScheduleItem[] = useMemo(() => {
    const mDate = weekDates[0];
    const tuDate = weekDates[1];
    const wDate = weekDates[2];
    const thDate = weekDates[3];
    const fDate = weekDates[4];
    const saDate = weekDates[5];
    const suDate = weekDates[6];

    // 1. Group classes mapped to current week
    const groupItems: UnifiedScheduleItem[] = [
      {
        id: "s1",
        type: "group",
        classId: "cls-yoga",
        className: "Yoga Cơ Bản – Lớp A",
        sport: "Yoga",
        level: "Cơ bản",
        date: mDate,
        startTime: "07:00",
        endTime: "08:00",
        room: "Studio 2",
        coachName: "HLV Enam",
        capacity: 10,
        registeredCount: 8,
        status: "hoàn thành",
      },
      {
        id: "s2",
        type: "group",
        classId: "cls-gym",
        className: "Gym Group BodyCombat",
        sport: "Gym",
        level: "Nâng cao",
        date: mDate,
        startTime: "09:00",
        endTime: "10:30",
        room: "Khu Tạ Tự Do",
        coachName: "HLV Enam",
        capacity: 8,
        registeredCount: 7,
        status: "đang diễn ra",
      },
      {
        id: "s3",
        type: "group",
        classId: "cls-zumba",
        className: "Zumba Dance",
        sport: "Zumba",
        level: "Trung bình",
        date: mDate,
        startTime: "17:00",
        endTime: "18:00",
        room: "Studio 1",
        coachName: "HLV Enam",
        capacity: 20,
        registeredCount: 16,
        status: "sắp diễn ra",
      },
      {
        id: "s4",
        type: "group",
        classId: "cls-swim",
        className: "Bơi Lội Sáng Sớm",
        sport: "Swimming",
        level: "Trung bình",
        date: tuDate,
        startTime: "06:00",
        endTime: "07:00",
        room: "Hồ Bơi",
        coachName: "HLV Enam",
        capacity: 15,
        registeredCount: 12,
        status: "sắp diễn ra",
      },
      {
        id: "s5",
        type: "group",
        classId: "cls-boxing",
        className: "Boxing Cơ Bản",
        sport: "Boxing",
        level: "Cơ bản",
        date: tuDate,
        startTime: "07:00",
        endTime: "08:30",
        room: "Võ Đài",
        coachName: "HLV Enam",
        capacity: 6,
        registeredCount: 6,
        status: "sắp diễn ra",
      },
      {
        id: "s6",
        type: "group",
        classId: "cls-pilates",
        className: "Pilates Nâng Cao",
        sport: "Pilates",
        level: "Nâng cao",
        date: wDate,
        startTime: "14:00",
        endTime: "15:00",
        room: "Studio 1",
        coachName: "HLV Enam",
        capacity: 12,
        registeredCount: 10,
        status: "sắp diễn ra",
      },
      {
        id: "s7",
        type: "group",
        classId: "cls-yoga-rec",
        className: "Yoga Phục Hồi",
        sport: "Yoga",
        level: "Cơ bản",
        date: suDate,
        startTime: "19:00",
        endTime: "20:00",
        room: "Studio 2",
        coachName: "HLV Enam",
        capacity: 15,
        registeredCount: 14,
        status: "hoàn thành",
      },
      {
        id: "s8",
        type: "group",
        classId: "cls-gym-core",
        className: "Gym Core & Abs",
        sport: "Gym",
        level: "Trung bình",
        date: thDate,
        startTime: "07:00",
        endTime: "08:30",
        room: "Khu Tạ Tự Do",
        coachName: "HLV Enam",
        capacity: 10,
        registeredCount: 8,
        status: "sắp diễn ra",
      },
      {
        id: "s9",
        type: "group",
        classId: "cls-boxing-adv",
        className: "Boxing Nâng Cao",
        sport: "Boxing",
        level: "Nâng cao",
        date: fDate,
        startTime: "15:00",
        endTime: "16:30",
        room: "Võ Đài",
        coachName: "HLV Enam",
        capacity: 6,
        registeredCount: 6,
        status: "sắp diễn ra",
      },
      {
        id: "s10",
        type: "group",
        classId: "cls-gym-strength",
        className: "Gym Strength & Fit",
        sport: "Gym",
        level: "Nâng cao",
        date: saDate,
        startTime: "09:00",
        endTime: "10:30",
        room: "Khu Thể Lực",
        coachName: "HLV Enam",
        capacity: 12,
        registeredCount: 10,
        status: "sắp diễn ra",
      },
    ];

    // 2. PT 1-1 Bookings mapped to the week
    const ptItems: UnifiedScheduleItem[] = [
      {
        id: "pt-1",
        type: "pt",
        className: "Kèm 1-1: Nguyễn Văn An",
        sport: "Gym",
        level: "1-1 PT",
        date: mDate,
        startTime: "07:00",
        endTime: "08:30",
        room: "Khu PT 1-1",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "hoàn thành",
        memberName: "Nguyễn Văn An",
        memberPhone: "0912345678",
        goal: "Tăng cơ giảm mỡ",
      },
      {
        id: "pt-2",
        type: "pt",
        className: "Kèm 1-1: Lê Thu Hà",
        sport: "Gym",
        level: "1-1 PT",
        date: tuDate,
        startTime: "08:00",
        endTime: "09:30",
        room: "Studio 1",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Lê Thu Hà",
        memberPhone: "0987654321",
        goal: "Cải thiện vóc dáng",
      },
      {
        id: "pt-3",
        type: "pt",
        className: "Kèm 1-1: Phạm Tuấn Kiệt",
        sport: "Gym",
        level: "1-1 PT",
        date: wDate,
        startTime: "18:00",
        endTime: "19:30",
        room: "Khu PT 1-1",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Phạm Tuấn Kiệt",
        memberPhone: "0903332211",
        goal: "Sức bền tim mạch",
      },
      {
        id: "pt-4",
        type: "pt",
        className: "Kèm 1-1: Anam",
        sport: "Boxing",
        level: "1-1 PT",
        date: fDate,
        startTime: "07:00",
        endTime: "08:30",
        room: "Võ Đài",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Anam",
        memberPhone: "0989123789",
        goal: "Phản xạ & Sức bền",
      },
      {
        id: "pt-5",
        type: "pt",
        className: "Kèm 1-1: Member Two",
        sport: "Fitness",
        level: "1-1 PT",
        date: saDate,
        startTime: "08:00",
        endTime: "09:30",
        room: "Studio 2",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Member Two",
        memberPhone: "0901234568",
        goal: "Sức khỏe & Săn chắc",
      },
      {
        id: "pt-6",
        type: "pt",
        className: "Kèm 1-1: Trần Minh Đức",
        sport: "Gym",
        level: "1-1 PT",
        date: thDate,
        startTime: "15:00",
        endTime: "16:30",
        room: "Khu PT 1-1",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Trần Minh Đức",
        memberPhone: "0977889900",
        goal: "Tăng cơ ngực & vai",
      },
      {
        id: "pt-7",
        type: "pt",
        className: "Kèm 1-1: Đỗ Quốc Bảo",
        sport: "Swimming",
        level: "1-1 PT",
        date: suDate,
        startTime: "14:00",
        endTime: "15:30",
        room: "Hồ Bơi",
        coachName: "HLV Enam",
        registeredCount: 1,
        capacity: 1,
        status: "sắp diễn ra",
        memberName: "Đỗ Quốc Bảo",
        memberPhone: "0909123456",
        goal: "Bơi sải & Thể lực",
      },
    ];

    // 3. Open 1-1 slots available for members to book
    const defaultOpenItems: UnifiedScheduleItem[] = [
      {
        id: "open-slot-1",
        type: "open_pt",
        className: "Lịch trống 1–1 (Mở nhận HV)",
        sport: "Gym",
        level: "1-1 PT",
        date: tuDate,
        startTime: "14:00",
        endTime: "15:30",
        room: "Khu PT 1-1",
        coachName: "HLV Enam",
        registeredCount: 0,
        capacity: 1,
        status: "sắp diễn ra",
        note: "Sẵn sàng nhận hội viên tập tăng cơ, giảm mỡ & siết cơ",
      },
      {
        id: "open-slot-2",
        type: "open_pt",
        className: "Lịch trống 1–1 (Mở nhận HV)",
        sport: "Boxing",
        level: "1-1 PT",
        date: thDate,
        startTime: "09:00",
        endTime: "10:30",
        room: "Võ Đài",
        coachName: "HLV Enam",
        registeredCount: 0,
        capacity: 1,
        status: "sắp diễn ra",
        note: "Kèm phản xạ, thể lực & kỹ thuật boxing",
      },
      {
        id: "open-slot-3",
        type: "open_pt",
        className: "Lịch trống 1–1 (Mở nhận HV)",
        sport: "Yoga",
        level: "1-1 PT",
        date: saDate,
        startTime: "15:00",
        endTime: "16:30",
        room: "Studio 2",
        coachName: "HLV Enam",
        registeredCount: 0,
        capacity: 1,
        status: "sắp diễn ra",
        note: "Kèm dẻo dai & giãn cơ sâu phục hồi thể lực",
      },
    ];

    // 4. Real-time synced sessions (Member bookings, cancellations, attendance)
    const syncedItems: UnifiedScheduleItem[] = syncedSessionsList.map((s) => ({
      id: s.id,
      type: s.type,
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
      registeredCount: s.registeredCount,
      status: s.status as SessionStatus,
      attendanceStatus: s.attendanceStatus,
      memberName: s.memberName,
      memberPhone: s.memberPhone,
      memberEmail: s.memberEmail,
      goal: s.goal,
      note: s.userNote || s.coachNote,
      coachNote: s.coachNote,
      cancelReason: s.cancelReason,
    }));

    const syncedIds = new Set(syncedItems.map((s) => s.id));
    const filteredPtItems = ptItems.filter((p) => !syncedIds.has(p.id));
    const filteredOpenItems = defaultOpenItems.filter((o) => !syncedIds.has(o.id));

    return [...groupItems, ...syncedItems, ...filteredPtItems, ...filteredOpenItems, ...openSlots];
  }, [weekDates, openSlots, syncedSessionsList]);

  // Distinct sport options for filter
  const SPORT_OPTIONS = useMemo(
    () => ["all", "Gym", "Yoga", "Boxing", "Pilates", "Zumba", "Swimming", "Fitness"],
    []
  );

  // Filtered sessions based on (Type, Sport, Status)
  const filteredSessions = useMemo(() => {
    return allUnifiedSessions
      .filter((s) => {
        // Filter by Type (Hình thức: Tất cả / Lớp nhóm / Kèm 1-1)
        if (typeFilter !== "all" && s.type !== typeFilter) return false;
        // Filter by Sport
        if (sportFilter !== "all" && s.sport.toLowerCase() !== sportFilter.toLowerCase()) return false;
        // Filter by Status
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [allUnifiedSessions, typeFilter, sportFilter, statusFilter]);

  // Grouped by date for list view
  const byDate = useMemo(() => {
    const map: Record<string, UnifiedScheduleItem[]> = {};
    filteredSessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredSessions]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleOpenRequestModal = (sessionId?: string) => {
    if (sessionId) {
      setSelectedSessionForRequest(sessionId);
    } else if (allUnifiedSessions.length > 0) {
      setSelectedSessionForRequest(allUnifiedSessions[0].id);
    }
    setRequestType("dời lịch");
    setSubstituteCoach("");
    setNewDate("");
    setNewTime("");
    setReason("");
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Vui lòng điền lý do cụ thể.");
      return;
    }
    const sessionObj = allUnifiedSessions.find((s) => s.id === selectedSessionForRequest);
    setSubmittingRequest(true);
    try {
      const res = await CoachAPI.createScheduleRequest({
        sessionId: selectedSessionForRequest,
        className: sessionObj?.className || "Lớp học",
        requestType,
        substituteCoachName: substituteCoach,
        newDate,
        newTime,
        reason,
      });
      if (res?.data) {
        setRequests((prev) => [res.data, ...prev]);
      } else {
        const fallbackReq: ScheduleChangeRequest = {
          id: `req-${Date.now()}`,
          sessionId: selectedSessionForRequest,
          className: sessionObj?.className || "Lớp học",
          requestType,
          substituteCoachName: substituteCoach,
          newDate,
          newTime,
          reason,
          status: "chờ duyệt",
          createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
        setRequests((prev) => [fallbackReq, ...prev]);
      }
      setIsRequestModalOpen(false);
      setFeedbackMsg("Yêu cầu đã được gửi tới Quản lý và đang chờ phê duyệt.");
      setTimeout(() => setFeedbackMsg(null), 4000);
      setActiveTab("requests");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi gửi yêu cầu.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCreateOpenSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSlotDate) {
      alert("Vui lòng chọn ngày mở lịch.");
      return;
    }
    const newSlot: UnifiedScheduleItem = {
      id: `open-${Date.now()}`,
      type: "open_pt",
      className: `Lịch trống 1–1: ${openSlotSport}`,
      sport: openSlotSport,
      level: "1-1 PT",
      date: openSlotDate,
      startTime: openSlotStartTime,
      endTime: openSlotEndTime,
      room: openSlotRoom,
      coachName: "HLV Enam",
      registeredCount: 0,
      capacity: 1,
      status: "sắp diễn ra",
      note: openSlotNote.trim() || "Chờ học viên đăng ký buổi học 1-1",
    };
    const updated = [newSlot, ...openSlots];
    setOpenSlots(updated);
    localStorage.setItem("coach_custom_open_pt_slots", JSON.stringify(updated));

    // Push into real-time cross-portal scheduleSync
    scheduleSync.createOpenPtSlot({
      id: newSlot.id,
      date: openSlotDate,
      startTime: openSlotStartTime,
      endTime: openSlotEndTime,
      sport: openSlotSport,
      room: openSlotRoom,
      coachName: coachName || "HLV Hồ Xuân Ánh Nam",
      note: openSlotNote.trim() || "Chờ học viên đăng ký buổi học 1-1",
    });

    setIsOpenSlotModalOpen(false);
    setOpenSlotNote("");
    setFeedbackMsg(`Đã đăng lịch trống 1-1 (${openSlotSport} ngày ${openSlotDate} lúc ${openSlotStartTime}) thành công! Hội viên đã có thể thấy và đăng ký.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleDeleteOpenSlot = (slotId: string) => {
    const updated = openSlots.filter((s) => s.id !== slotId);
    setOpenSlots(updated);
    localStorage.setItem("coach_custom_open_pt_slots", JSON.stringify(updated));
    scheduleSync.deleteOpenPtSlot(slotId);
    setSelectedOpenSlot(null);
    setFeedbackMsg("Đã đóng/hủy lịch trống 1-1 này.");
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleSlot = async (slotId: string) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, isOpen: !slot.isOpen } : slot))
    );
    try {
      await CoachAPI.toggleAvailabilitySlot(slotId);
    } catch {
      // optimistic update
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">HLV / LỊCH DẠY</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lịch dạy & Ca làm việc
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setOpenSlotDate(todayStr);
              setIsOpenSlotModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            <CalendarPlus className="w-4 h-4" />
            Đăng lịch trống 1–1
          </button>

          <button
            type="button"
            onClick={() => handleOpenRequestModal()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Yêu cầu ca dạy / Dạy thay
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* SCHEDULE VIEW (FILTERS LIKE IMAGE 3 + WEEK GRID LIKE IMAGE 1) */}
      {activeTab === "schedule" && (
        <div className="flex flex-col gap-5">
          {/* Filters Bar Styled Exactly Like Image 3 */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex flex-wrap items-center gap-5">
              {/* 1. Dropdown Bộ môn (Image 3) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bộ môn
                </label>
                <div className="relative">
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[150px] shadow-xs cursor-pointer"
                  >
                    {SPORT_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o === "all" ? "Tất cả bộ môn" : o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Dropdown Hình thức (Image 3) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Hình thức
                </label>
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                    className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[185px] shadow-xs cursor-pointer"
                  >
                    <option value="all">Tất cả lịch dạy</option>
                    <option value="group">Lớp học nhóm</option>
                    <option value="pt">Dạy kèm 1–1 (Đã có HV)</option>
                    <option value="open_pt">Lịch trống 1–1 (Chờ HV đặt)</option>
                  </select>
                </div>
              </div>

              {/* 3. Dropdown Trạng thái */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trạng thái
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-w-[150px] shadow-xs cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right: View toggle & Week pagination */}
            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto mt-2 sm:mt-0">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setView("list")}
                  className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    view === "list"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <List className="w-3.5 h-3.5" /> Danh sách
                </button>
                <button
                  type="button"
                  onClick={() => setView("week")}
                  className={`p-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    view === "week"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Theo tuần
                </button>
              </div>

              {/* Pagination Controls */}
              {view === "week" && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setWeekOffset((v) => v - 1)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Tuần trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className={`text-xs font-semibold px-3.5 py-2 border rounded-xl transition-colors ${
                      weekOffset === 0
                        ? "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800 font-bold"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeekOffset((v) => v + 1)}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Tuần sau"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* WEEK VIEW GRID (EXACTLY AS SHOWN IN IMAGE 1) */}
          {view === "week" && (
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
              <div className="min-w-[960px]">
                {/* Header Row: Giờ | Thứ 2 | Thứ 3 | Thứ 4 | Thứ 5 | Thứ 6 | Thứ 7 | Chủ nhật */}
                <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850">
                  <div className="p-3 text-xs font-semibold text-slate-400 text-center border-r border-slate-200 dark:border-slate-800">
                    Giờ
                  </div>
                  {DAYS_NAMES.map((d, di) => {
                    const dateStr = weekDates[di];
                    const isToday = dateStr === todayStr;
                    return (
                      <div
                        key={d}
                        className={`p-3 text-xs font-semibold text-center border-r border-slate-200 dark:border-slate-800 last:border-0 ${
                          isToday
                            ? "bg-orange-50/60 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div>{d}</div>
                        <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                          {dateStr?.split("-").slice(1).reverse().join("/")}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grid Rows by Time */}
                {TIME_ROWS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-8 min-h-[92px] border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <div className="p-2 text-xs text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
                      {hour}
                    </div>

                    {DAYS_NAMES.map((_, di) => {
                      const colDate = weekDates[di];
                      // Find all sessions in this day matching the hour row (starts with same hour)
                      const cellSessions = filteredSessions.filter((s) => {
                        const isSameDay = s.date === colDate;
                        const isSameHour = s.startTime.startsWith(hour.slice(0, 2));
                        return isSameDay && isSameHour;
                      });

                      return (
                        <div
                          key={di}
                          className="p-1.5 border-r border-slate-100 dark:border-slate-800/60 last:border-0 relative space-y-1.5"
                        >
                          {cellSessions.map((sessionItem) => {
                            const isPT = sessionItem.type === "pt";
                            const isOpenPT = sessionItem.type === "open_pt";
                            return (
                              <button
                                key={sessionItem.id}
                                type="button"
                                onClick={() => {
                                  if (isOpenPT) {
                                    setSelectedOpenSlot(sessionItem);
                                  } else if (isPT) {
                                    setSelectedPtForAttendance(sessionItem);
                                    setPtAttendanceStatus((sessionItem.attendanceStatus as any) || "có mặt");
                                    setPtCoachNote(sessionItem.coachNote || "");
                                  } else {
                                    navigateTo("class-detail", { sessionId: sessionItem.id });
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                                  isOpenPT
                                    ? "bg-sky-50/70 dark:bg-sky-950/30 border-dashed border-sky-300 dark:border-sky-700 hover:border-sky-500 hover:bg-sky-50"
                                    : isPT
                                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-800/60 hover:border-amber-400"
                                    : "bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                      className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.2 rounded ${
                                        isOpenPT
                                          ? "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                                          : isPT
                                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      }`}
                                    >
                                      {isOpenPT ? "Trống 1–1" : isPT ? "PT 1–1" : sessionItem.sport}
                                    </span>

                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {sessionItem.startTime}
                                    </span>
                                  </div>

                                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                                    {isOpenPT ? sessionItem.className : isPT ? sessionItem.memberName : sessionItem.className}
                                  </div>
                                </div>

                                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                                  <span className="truncate">{sessionItem.room}</span>
                                  {isOpenPT ? (
                                    <span className="text-sky-600 dark:text-sky-400 font-semibold truncate flex items-center gap-0.5">
                                      <Sparkles className="w-2.5 h-2.5" /> Mở nhận HV
                                    </span>
                                  ) : isPT ? (
                                    <span className="text-amber-600 dark:text-amber-400 font-medium truncate max-w-[80px]">
                                      {sessionItem.goal}
                                    </span>
                                  ) : (
                                    <span>{sessionItem.registeredCount} HV</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LIST VIEW OPTION */}
          {view === "list" && (
            <div className="flex flex-col gap-6">
              {loading ? (
                <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  Đang tải lịch dạy...
                </div>
              ) : byDate.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
                  Không tìm thấy buổi học nào phù hợp với bộ lọc đã chọn.
                </div>
              ) : (
                byDate.map(([date, daySessions]) => {
                  const d = new Date(date);
                  const isToday = date === todayStr;
                  const label = d.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                  });
                  return (
                    <div key={date} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            isToday
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300 dark:border-orange-800"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {label} {isToday && "• Hôm nay"}
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {daySessions.map((s) => {
                          const badge = STATUS_BADGE[s.status] || {
                            label: s.status,
                            bg: "bg-slate-100",
                            text: "text-slate-600",
                          };
                          const isPT = s.type === "pt";
                          const isOpenPT = s.type === "open_pt";
                          return (
                            <div
                              key={s.id}
                              className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                                isOpenPT
                                  ? "border-sky-300 dark:border-sky-700 bg-sky-50/20 dark:bg-sky-950/20 hover:border-sky-400"
                                  : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                                  <span className="font-semibold text-base text-slate-900 dark:text-white">
                                    {s.className}
                                  </span>
                                  <span
                                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                      isOpenPT
                                        ? "bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/50 dark:text-sky-300"
                                        : isPT
                                        ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/50 dark:text-amber-300"
                                        : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                                    }`}
                                  >
                                    {isOpenPT ? "Lịch Trống 1–1" : isPT ? "Kèm 1–1 (PT)" : "Lớp Nhóm"}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    {s.sport}
                                  </span>
                                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                    isOpenPT
                                      ? "bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950/50 dark:border-sky-800 dark:text-sky-300"
                                      : `${badge.bg} ${badge.text}`
                                  }`}>
                                    {isOpenPT ? "Mở nhận học viên" : badge.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    {s.startTime} – {s.endTime}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    {s.room}
                                  </span>
                                  {isOpenPT ? (
                                    <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
                                      <Sparkles className="w-3.5 h-3.5" />
                                      {s.note || "Chờ học viên đăng ký"}
                                    </span>
                                  ) : isPT ? (
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-bold">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        Học viên: {s.memberName || "Hồ Xuân Ánh Nam"}
                                      </span>
                                      {s.memberPhone && (
                                        <span className="text-slate-500 font-mono text-[11px]">({s.memberPhone})</span>
                                      )}
                                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                                        <Target className="w-3.5 h-3.5" />
                                        Mục tiêu: {s.goal}
                                      </span>
                                      {s.attendanceStatus === "có mặt" && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Có mặt
                                        </span>
                                      )}
                                      {s.cancelReason && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                          Lý do hủy: {s.cancelReason}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="flex items-center gap-1.5">
                                      <Users className="w-3.5 h-3.5 text-slate-400" />
                                      {s.registeredCount}/{s.capacity} học viên
                                    </span>
                                  )}
                                </div>
                                {isPT && s.coachNote && (
                                  <div className="mt-2 text-xs italic text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5">
                                    <span>💬 Đã nhận xét: "{s.coachNote}"</span>
                                  </div>
                                )}
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-2 shrink-0">
                                {isOpenPT ? (
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOpenSlot(s)}
                                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
                                  >
                                    Đóng / Hủy ca trống
                                  </button>
                                ) : (
                                  <>
                                    {isPT ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedPtForAttendance(s);
                                          setPtAttendanceStatus((s.attendanceStatus as any) || "có mặt");
                                          setPtCoachNote(s.coachNote || "");
                                        }}
                                        className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 ${
                                          s.attendanceStatus === "có mặt"
                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        }`}
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>{s.attendanceStatus === "có mặt" ? "Đã điểm danh" : "Điểm danh & Nhận xét"}</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => navigateTo("attendance", { sessionId: s.id })}
                                        className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-sm"
                                      >
                                        Điểm danh
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRequestModal(s.id)}
                                      className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                                    >
                                      Dời ca
                                    </button>
                                    {!isPT && (
                                      <button
                                        type="button"
                                        onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                                        className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                      >
                                        Chi tiết →
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVAILABILITY (BẬT / TẮT KHUNG GIỜ RẢNH 1-1 NHƯ ẢNH 2) */}
      {activeTab === "availability" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Khung giờ nhận dạy kèm 1–1 (Personal Trainer)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bật các khung giờ bạn có thể nhận học viên. Học viên sẽ dựa trên lịch này để đặt lịch hẹn cá nhân trực tiếp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {availabilitySlots.map((slot) => {
                const dayName = DAYS_NAMES[slot.dayOfWeek - 1] || `Thứ ${slot.dayOfWeek + 1}`;
                const hasBooking = !!slot.bookedMemberName;
                return (
                  <div
                    key={slot.id}
                    className={`p-5 rounded-xl border transition-all ${
                      hasBooking
                        ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                        : slot.isOpen
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        : "bg-slate-50 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{dayName}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Ca {slot.period}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          slot.isOpen
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {slot.isOpen ? "Đang mở" : "Đã đóng"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{slot.startTime} – {slot.endTime}</span>
                    </div>

                    {hasBooking ? (
                      <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                        <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Đã có học viên đặt:
                        </div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {slot.bookedMemberName} — {slot.bookedMemberPhone}
                        </div>
                        {slot.goal && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Mục tiêu: {slot.goal}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          {slot.isOpen ? "Sẵn sàng đón nhận học viên mới" : "Không nhận lịch trong khung giờ này"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleSlot(slot.id)}
                          className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline"
                        >
                          {slot.isOpen ? "Tắt nhận ca" : "Bật nhận ca"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REQUESTS (YÊU CẦU ĐỔI LỊCH / DẠY THAY) */}
      {activeTab === "requests" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Lịch sử Yêu cầu Điều chỉnh Ca dạy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tất cả yêu cầu được gửi đến Quản lý trung tâm để xem xét và phê duyệt.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenRequestModal()}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tạo yêu cầu mới
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl">
                Chưa có yêu cầu nào được gửi.
              </div>
            ) : (
              requests.map((req) => {
                const badge = REQUEST_STATUS_BADGE[req.status] || {
                  label: req.status,
                  bg: "bg-slate-100",
                  text: "text-slate-600",
                };
                return (
                  <div
                    key={req.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white text-sm">
                          {req.className}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                          {req.requestType}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {req.requestType === "dạy thay" && req.substituteCoachName && (
                          <div>
                            HLV thay thế đề xuất: <strong className="text-slate-800 dark:text-slate-100">{req.substituteCoachName}</strong>
                          </div>
                        )}
                        {req.newDate && (
                          <div>
                            Thời gian mới đề xuất: <strong className="text-slate-800 dark:text-slate-100">{req.newDate} {req.newTime}</strong>
                          </div>
                        )}
                        <div>
                          Lý do: <span className="italic text-slate-500">"{req.reason}"</span>
                        </div>
                        {req.managerNote && (
                          <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                            Phản hồi quản lý: {req.managerNote}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 shrink-0">
                      Gửi lúc: {req.createdAt}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* REQUEST MODAL - CHUẨN GIỐNG 'TẠO GIÁO ÁN MỚI' */}
      {isRequestModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Gửi yêu cầu điều chỉnh ca dạy
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Chọn ca dạy cần điều chỉnh: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedSessionForRequest}
                      onChange={(e) => setSelectedSessionForRequest(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      {allUnifiedSessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.date} ({s.startTime} - {s.endTime}) • {s.className}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Loại yêu cầu:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["dời lịch", "dạy thay", "báo vắng"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setRequestType(t)}
                          className={`p-2.5 rounded-lg border text-center font-semibold capitalize transition-all ${
                            requestType === t
                              ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {requestType === "dạy thay" && (
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Huấn luyện viên thay thế đề xuất:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: HLV Trần Minh Tuấn..."
                        value={substituteCoach}
                        onChange={(e) => setSubstituteCoach(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                      />
                    </div>
                  )}

                  {requestType === "dời lịch" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Ngày mới đề xuất:
                        </label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Khung giờ mới:
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 08:00 - 09:30"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Lý do cụ thể: <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Điền lý do cụ thể gửi tới ban quản lý..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submittingRequest ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 1: ĐĂNG LỊCH TRỐNG 1-1 - CHUẨN GIỐNG 'TẠO GIÁO ÁN MỚI' */}
      {isOpenSlotModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Đăng lịch trống 1–1 (Mở nhận HV)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOpenSlotModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateOpenSlot} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ngày mở ca trống: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={openSlotDate}
                      onChange={(e) => setOpenSlotDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Giờ bắt đầu:
                      </label>
                      <select
                        value={openSlotStartTime}
                        onChange={(e) => setOpenSlotStartTime(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {TIME_ROWS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Giờ kết thúc:
                      </label>
                      <select
                        value={openSlotEndTime}
                        onChange={(e) => setOpenSlotEndTime(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["07:30", "08:30", "09:30", "10:30", "15:30", "16:30", "18:30", "19:30", "20:30"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Bộ môn nhận dạy:
                      </label>
                      <select
                        value={openSlotSport}
                        onChange={(e) => setOpenSlotSport(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["Gym", "Boxing", "Yoga", "Swimming", "Pilates", "Zumba", "Fitness"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Phòng / Khu vực:
                      </label>
                      <select
                        value={openSlotRoom}
                        onChange={(e) => setOpenSlotRoom(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                      >
                        {["Khu PT 1-1", "Võ Đài", "Studio 1", "Studio 2", "Hồ Bơi", "Khu Thể Lực", "Khu Tạ Tự Do"].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ghi chú / Thông điệp gửi học viên:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="VD: Nhận kèm cá nhân tập trung siết cơ, giảm mỡ nhanh hoặc cải thiện thể lực..."
                      value={openSlotNote}
                      onChange={(e) => setOpenSlotNote(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsOpenSlotModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
                  >
                    Đăng lịch trống
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 2: CHI TIẾT & HỦY / ĐÓNG LỊCH TRỐNG 1-1 */}
      {selectedOpenSlot &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Lịch trống 1–1 (Đang mở nhận HV)
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedOpenSlot(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3 text-xs">
                <div className="space-y-2.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Bộ môn:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedOpenSlot.sport} (1–1)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Ngày dạy:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Khung giờ:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.startTime} – {selectedOpenSlot.endTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Phòng / Khu vực:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedOpenSlot.room}</span>
                  </div>
                  {selectedOpenSlot.note && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-400 font-medium block mb-1">Ghi chú cho hội viên:</span>
                      <p className="italic text-slate-600 dark:text-slate-300">"{selectedOpenSlot.note}"</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => handleDeleteOpenSlot(selectedOpenSlot.id)}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hủy ca trống này
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOpenSlot(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 3: ĐIỂM DANH & NHẬN XÉT HỌC VIÊN CA KÈM 1-1 */}
      {selectedPtForAttendance &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-emerald-50/50 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      Điểm danh & Nhận xét buổi tập PT 1-1
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Đồng bộ trực tiếp sang tài khoản của Hội viên
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPtForAttendance(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedPtForAttendance) return;
                  scheduleSync.recordAttendance(
                    selectedPtForAttendance.id,
                    ptAttendanceStatus,
                    ptCoachNote
                  );
                  setFeedbackMsg(
                    `Đã cập nhật điểm danh "${ptAttendanceStatus === "có mặt" ? "Có mặt" : ptAttendanceStatus}" và gửi nhận xét cho học viên ${selectedPtForAttendance.memberName || "Hồ Xuân Ánh Nam"} thành công!`
                  );
                  setSelectedPtForAttendance(null);
                  setTimeout(() => setFeedbackMsg(null), 4000);
                }}
              >
                <div className="p-5 flex flex-col gap-4 text-xs">
                  {/* Member & Session Info Card */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Học viên:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {selectedPtForAttendance.memberName || "Hồ Xuân Ánh Nam"}
                      </span>
                    </div>
                    {selectedPtForAttendance.memberPhone && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Số điện thoại:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {selectedPtForAttendance.memberPhone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Thời gian & Địa điểm:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedPtForAttendance.date} ({selectedPtForAttendance.startTime} - {selectedPtForAttendance.endTime}) • {selectedPtForAttendance.room}
                      </span>
                    </div>
                    {selectedPtForAttendance.goal && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">Mục tiêu tập luyện:</span>
                        <span className="font-bold text-amber-800 dark:text-amber-300">
                          {selectedPtForAttendance.goal}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Attendance Status Selector */}
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 mb-2 block">
                      Trạng thái điểm danh:
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "có mặt", label: "Có mặt", color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
                        { id: "vắng", label: "Vắng mặt", color: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
                        { id: "có phép", label: "Nghỉ có phép", color: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setPtAttendanceStatus(st.id as any)}
                          className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                            ptAttendanceStatus === st.id
                              ? `${st.color} shadow-xs`
                              : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {ptAttendanceStatus === st.id && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                          <span>{st.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Coach Feedback & Note */}
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 mb-1.5 block">
                      Lời nhận xét & đánh giá chuyên môn của HLV:
                    </label>
                    <textarea
                      rows={4}
                      placeholder="VD: Học viên tập rất tích cực, hoàn thành tốt 4 hiệp Squat và Bench Press. Form động tác chuẩn, cần giữ lưng thẳng hơn ở hiệp cuối..."
                      value={ptCoachNote}
                      onChange={(e) => setPtCoachNote(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      💡 Nhận xét này sẽ hiển thị ngay trên màn hình "Lịch tập của tôi" của Hội viên {selectedPtForAttendance.memberName || "Hồ Xuân Ánh Nam"}.
                    </span>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setSelectedPtForAttendance(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu điểm danh & Gửi nhận xét</span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
