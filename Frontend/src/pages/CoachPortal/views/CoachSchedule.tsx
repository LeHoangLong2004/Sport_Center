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
import CoachScheduleView from "./CoachScheduleView";
import { buildUnifiedSchedule } from "./coachScheduleData";
import type { UnifiedScheduleItem } from "./coachScheduleData";
type MainTab = "schedule" | "availability" | "requests";
type ViewMode = "week" | "list";
type TypeFilter = "all" | "group" | "pt" | "open_pt";
type SportFilter = "all" | string;
type StatusFilter = "all" | SessionStatus;
interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
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
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<string>("");
  const [requestType, setRequestType] = useState<"dời lịch" | "dạy thay" | "báo vắng">("dời lịch");
  const [substituteCoach, setSubstituteCoach] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [reason, setReason] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
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
  useEffect(() => {
    if (isRequestModalOpen || isOpenSlotModalOpen || selectedOpenSlot) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isRequestModalOpen, isOpenSlotModalOpen, selectedOpenSlot]);
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
  const allUnifiedSessions: UnifiedScheduleItem[] = useMemo(
    () => buildUnifiedSchedule(weekDates, openSlots),
    [weekDates, openSlots]
  );
  const SPORT_OPTIONS = useMemo(
    () => ["all", "Gym", "Yoga", "Boxing", "Pilates", "Zumba", "Swimming", "Fitness"],
    []
  );
  const filteredSessions = useMemo(() => {
    return allUnifiedSessions
      .filter((s) => {
        if (typeFilter !== "all" && s.type !== typeFilter) return false;
        if (sportFilter !== "all" && s.sport.toLowerCase() !== sportFilter.toLowerCase()) return false;
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [allUnifiedSessions, typeFilter, sportFilter, statusFilter]);
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
    setIsOpenSlotModalOpen(false);
    setOpenSlotNote("");
    setFeedbackMsg(`Đã đăng lịch trống 1-1 (${openSlotSport} ngày ${openSlotDate} lúc ${openSlotStartTime}) thành công! Hội viên đã có thể thấy và đăng ký.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };
  const handleDeleteOpenSlot = (slotId: string) => {
    const updated = openSlots.filter((s) => s.id !== slotId);
    setOpenSlots(updated);
    localStorage.setItem("coach_custom_open_pt_slots", JSON.stringify(updated));
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
    }
  };
  return <CoachScheduleView
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    view={view}
    setView={setView}
    typeFilter={typeFilter}
    setTypeFilter={setTypeFilter}
    sportFilter={sportFilter}
    setSportFilter={setSportFilter}
    statusFilter={statusFilter}
    setStatusFilter={setStatusFilter}
    weekOffset={weekOffset}
    setWeekOffset={setWeekOffset}
    requests={requests}
    setRequests={setRequests}
    availabilitySlots={availabilitySlots}
    setAvailabilitySlots={setAvailabilitySlots}
    loading={loading}
    isRequestModalOpen={isRequestModalOpen}
    setIsRequestModalOpen={setIsRequestModalOpen}
    selectedSessionForRequest={selectedSessionForRequest}
    setSelectedSessionForRequest={setSelectedSessionForRequest}
    requestType={requestType}
    setRequestType={setRequestType}
    substituteCoach={substituteCoach}
    setSubstituteCoach={setSubstituteCoach}
    newDate={newDate}
    setNewDate={setNewDate}
    newTime={newTime}
    setNewTime={setNewTime}
    reason={reason}
    setReason={setReason}
    submittingRequest={submittingRequest}
    feedbackMsg={feedbackMsg}
    openSlots={openSlots}
    setOpenSlots={setOpenSlots}
    isOpenSlotModalOpen={isOpenSlotModalOpen}
    setIsOpenSlotModalOpen={setIsOpenSlotModalOpen}
    openSlotDate={openSlotDate}
    setOpenSlotDate={setOpenSlotDate}
    openSlotStartTime={openSlotStartTime}
    setOpenSlotStartTime={setOpenSlotStartTime}
    openSlotEndTime={openSlotEndTime}
    setOpenSlotEndTime={setOpenSlotEndTime}
    openSlotSport={openSlotSport}
    setOpenSlotSport={setOpenSlotSport}
    openSlotRoom={openSlotRoom}
    setOpenSlotRoom={setOpenSlotRoom}
    openSlotNote={openSlotNote}
    setOpenSlotNote={setOpenSlotNote}
    selectedOpenSlot={selectedOpenSlot}
    setSelectedOpenSlot={setSelectedOpenSlot}
    weekDates={weekDates}
    allUnifiedSessions={allUnifiedSessions}
    SPORT_OPTIONS={SPORT_OPTIONS}
    filteredSessions={filteredSessions}
    byDate={byDate}
    todayStr={todayStr}
    navigateTo={navigateTo}
    handleOpenRequestModal={handleOpenRequestModal}
    handleSubmitRequest={handleSubmitRequest}
    handleCreateOpenSlot={handleCreateOpenSlot}
    handleDeleteOpenSlot={handleDeleteOpenSlot}
    handleToggleSlot={handleToggleSlot}
    STATUS_OPTIONS={STATUS_OPTIONS}
    STATUS_BADGE={STATUS_BADGE}
    REQUEST_STATUS_BADGE={REQUEST_STATUS_BADGE}
    DAYS_NAMES={DAYS_NAMES}
    TIME_ROWS={TIME_ROWS}
  />;
}
