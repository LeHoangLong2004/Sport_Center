import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen, MemberSessionItem } from "../types";
import { MemberAPI } from "../services/api";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Dumbbell,
  Plus,
  Sparkles,
  Filter,
  LoaderCircle,
} from "lucide-react";
import { DateInput } from "../../../components/DateInput";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

type Feedback = {
  message: string;
  type: "success" | "error";
};

// Group classes are loaded from the database API.

// Open PT slots helper
export default function MemberBooking({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"group" | "pt">("group");

  // Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // My booked sessions
  const [mySessions, setMySessions] = useState<MemberSessionItem[]>([]);
  const [groupClasses, setGroupClasses] = useState<any[]>([]);
  const [ptSlots, setPtSlots] = useState<any[]>([]);
  const [loadingGroupClasses, setLoadingGroupClasses] = useState(true);
  const [refreshingGroupClasses, setRefreshingGroupClasses] = useState(false);
  const [groupClassesError, setGroupClassesError] = useState<string | null>(null);

  // PT slots state
  const loadGroupClasses = async (silent = false) => {
    if (silent) {
      setRefreshingGroupClasses(true);
    } else {
      setLoadingGroupClasses(true);
    }
    setGroupClassesError(null);
    try {
      const [availableClasses, memberSchedule, availablePtSlots] = await Promise.all([
        MemberAPI.getAvailableClasses(),
        MemberAPI.getMemberSchedule(),
        MemberAPI.getAvailablePtSlots().catch(() => []),
      ]);

      const mappedClasses = (Array.isArray(availableClasses) ? availableClasses : []).map((item: any) => {
        const start = new Date(item.scheduleTime);
        const end = new Date(start.getTime() + Number(item.durationMinutes || 60) * 60000);
        const dateStr = [start.getFullYear(), String(start.getMonth() + 1).padStart(2, "0"), String(start.getDate()).padStart(2, "0")].join("-");
        const time = (value: Date) => `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;

        return {
          ...item,
          name: item.className,
          sport: item.sportName,
          level: "",
          startTime: time(start),
          endTime: time(end),
          room: item.facilityName,
          coachName: item.coachName || "Chưa phân công",
          capacity: item.capacity,
          registeredCount: item.currentEnrolled,
          availableSpots: item.availableSpots,
          dateStr,
          description: "",
        };
      });
      setGroupClasses(mappedClasses);

      const dbBookings = (memberSchedule?.classBookings || []).map((booking: any) => {
        const start = new Date(booking.scheduleTime);
        const end = new Date(start.getTime() + Number(booking.durationMinutes || 60) * 60000);
        const date = [start.getFullYear(), String(start.getMonth() + 1).padStart(2, "0"), String(start.getDate()).padStart(2, "0")].join("-");
        return {
          id: booking.classId,
          classId: booking.classId,
          name: booking.className,
          sport: booking.sportName,
          level: "",
          type: "group",
          date,
          startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
          endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
          room: booking.facilityName,
          coachId: "",
          coachName: booking.coachName,
          capacity: 0,
          registeredCount: 0,
          // Preserve the real database status. Hard-coding this as an upcoming
          // status made cancelled/attended bookings look active in the UI.
          status: booking.status,
          bookingStatus: booking.status,
        };
      });
      const dbPtBookings = (memberSchedule?.ptSessions || []).map((session: any) => {
        const start = new Date(session.scheduleTime);
        const end = new Date(start.getTime() + Number(session.durationMinutes || 60) * 60000);
        const date = [start.getFullYear(), String(start.getMonth() + 1).padStart(2, "0"), String(start.getDate()).padStart(2, "0")].join("-");
        return {
          id: session.sessionId,
          name: "PT 1-1 session",
          sport: "PT 1-1",
          level: "1-1 PT",
          type: "pt",
          date,
          startTime: `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`,
          endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
          room: "",
          coachId: "",
          coachName: session.coachName,
          capacity: 1,
          registeredCount: 1,
          status: session.status,
        };
      });
      setMySessions([...dbBookings, ...dbPtBookings]);
      setPtSlots(Array.isArray(availablePtSlots) ? availablePtSlots : []);
    } catch (error: any) {
      console.error("Không thể tải dữ liệu đặt lịch từ database:", error);
      if (!silent) {
        setGroupClasses([]);
        setGroupClassesError(
        error?.message || "Không thể kết nối đến dữ liệu lịch học. Vui lòng thử lại."
        );
      }
    } finally {
      if (silent) {
        setRefreshingGroupClasses(false);
      } else {
        setLoadingGroupClasses(false);
      }
    }
  };

  useEffect(() => {
    void loadGroupClasses();
  }, []);

  // Modal State
  const [selectedClassDetail, setSelectedClassDetail] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ classId: string; className: string } | null>(null);
  const [bookingPtSlot, setBookingPtSlot] = useState<any | null>(null);
  const [ptGoal, setPtGoal] = useState("Tăng cơ & Siết nét");
  const [ptNote, setPtNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showFeedback = (message: string, type: Feedback["type"] = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  // Lock body scroll on modal open
  useEffect(() => {
    if (selectedClassDetail) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedClassDetail]);

  // Check if session is already booked
  const normalizeBookingStatus = (status: unknown) =>
    String(status ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const getBookingStatus = (session: MemberSessionItem) =>
    (session as any).bookingStatus ?? (session as any).status;

  const findActiveBooking = (classId: string, date: string) =>
    mySessions.find(
      (session) =>
        String((session as any).classId ?? session.id).toLowerCase() === String(classId).toLowerCase() &&
        session.date === date &&
        !isInactiveBookingStatus(getBookingStatus(session))
    );

  const isInactiveBookingStatus = (status: unknown) => {
    const normalizedStatus = normalizeBookingStatus(status);
    return (
      normalizedStatus.includes("cancel") ||
      normalizedStatus.includes("huy") ||
      normalizedStatus === "rejected" ||
      normalizedStatus === "class_cancelled" ||
      normalizedStatus === "attended" ||
      normalizedStatus === "no_show" ||
      normalizedStatus === "no-show"
    );
  };

  const isBooked = (classId: string, date: string) => {
    return Boolean(findActiveBooking(classId, date));
  };

  // Group-class bookings are persisted by the backend database.
  const handleBookGroupClass = async (item: any) => {
    if (item.registeredCount >= item.capacity) {
      showFeedback("Lớp đã đủ chỗ.", "error");
      return;
    }
    if (isBooked(item.id, item.dateStr)) {
      showFeedback("Bạn đã đặt lớp học này rồi.", "error");
      return;
    }

    try {
      await MemberAPI.bookClass(item.id);

      const localBooking = {
        id: item.id,
        classId: item.id,
        name: item.name,
        sport: item.sport,
        level: item.level || "",
        type: "group" as const,
        date: item.dateStr,
        startTime: item.startTime,
        endTime: item.endTime,
        room: item.room,
        coachId: item.coachId || "",
        coachName: item.coachName,
        capacity: item.capacity,
        registeredCount: item.registeredCount + 1,
        // The API creates group-class bookings as pending until Manager approves.
        status: "pending" as any,
        bookingStatus: "pending",
      } as MemberSessionItem & { classId: string; bookingStatus: string };

      setGroupClasses((currentClasses) =>
        currentClasses.map((currentClass) =>
          currentClass.id === item.id
            ? {
                ...currentClass,
                registeredCount: Math.min(currentClass.registeredCount + 1, currentClass.capacity),
                availableSpots: Math.max(0, currentClass.availableSpots - 1),
              }
            : currentClass
        )
      );
      setMySessions((currentSessions) =>
        currentSessions.some((session) => (session as any).classId === item.id && session.date === item.dateStr)
          ? currentSessions
          : [...currentSessions, localBooking]
      );
      void loadGroupClasses(true);
      setSelectedClassDetail(null);
      showFeedback(`Yêu cầu đặt lớp "${item.name}" đã được gửi và đang chờ Manager duyệt.`);
    } catch (error: any) {
      showFeedback(error?.message || "Không thể đặt lớp học.", "error");
    }
  };

  // Group-class cancellations are persisted by the backend database.
  const handleCancelBooking = async (classId: string) => {
    setCancelTarget(null);
    try {
      await MemberAPI.cancelClassBooking(classId);

      setGroupClasses((currentClasses) =>
        currentClasses.map((currentClass) =>
          currentClass.id === classId
            ? {
                ...currentClass,
                registeredCount: Math.max(0, currentClass.registeredCount - 1),
                availableSpots: Math.min(currentClass.capacity, currentClass.availableSpots + 1),
              }
            : currentClass
        )
      );
      setMySessions((currentSessions) =>
        currentSessions.map((session) =>
          (session as any).classId === classId ? { ...session, status: "đã hủy" as any } : session
        )
      );
      void loadGroupClasses(true);
      setSelectedClassDetail(null);
      showFeedback("Đã hủy đặt lớp thành công.");
    } catch (error: any) {
      // Đồng bộ lại với database để UI tự sửa trạng thái nếu booking đã bị hủy
      // từ tab hoặc thiết bị khác trước đó.
      void loadGroupClasses(true);
      showFeedback(error?.message || "Không thể hủy đặt lớp.", "error");
    }
  };

  const handleConfirmPtBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingPtSlot) return;

    try {
      await MemberAPI.bookPtSlot({
        slotId: bookingPtSlot.id,
        sport: bookingPtSlot.sport,
        date: bookingPtSlot.date,
        startTime: bookingPtSlot.startTime,
        endTime: bookingPtSlot.endTime,
        room: bookingPtSlot.room,
        coachId: bookingPtSlot.coachId,
        coachName: bookingPtSlot.coachName,
        goal: ptGoal,
        coachNote: ptNote,
      });
      setPtSlots((currentSlots) => currentSlots.filter((slot) => slot.id !== bookingPtSlot.id));
      setBookingPtSlot(null);
      setPtNote("");
      showFeedback("Đã đặt lịch kèm riêng 1–1 thành công.");
      void loadGroupClasses(true);
    } catch (error: any) {
      showFeedback(error?.message || "Không thể đặt lịch kèm riêng 1–1.", "error");
    }
  };

  // Filtered Group Classes
  const filteredGroupClasses = useMemo(() => {
    return groupClasses.filter((c) => {
      const matchDate = !selectedDate || c.dateStr === selectedDate;
      const matchSport = selectedSport === "all" || c.sport.toLowerCase() === selectedSport.toLowerCase();
      const matchQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.coachName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchSport && matchQuery;
    });
  }, [groupClasses, selectedDate, selectedSport, searchQuery]);

  const filteredPtSlots = useMemo(() => {
    return ptSlots.filter((slot) => {
      const matchDate = !selectedDate || slot.date === selectedDate;
      const matchSport = selectedSport === "all" || String(slot.sport || "").toLowerCase() === selectedSport.toLowerCase();
      const matchQuery =
        !searchQuery ||
        String(slot.coachName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(slot.sport || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchSport && matchQuery;
    });
  }, [ptSlots, selectedDate, selectedSport, searchQuery]);
  const selectedClassBooked = selectedClassDetail
    ? isBooked(selectedClassDetail.id, selectedClassDetail.dateStr)
    : false;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md ${
          feedback.type === "error"
            ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
            : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className={feedback.type === "error" ? "text-rose-600 hover:text-rose-800" : "text-emerald-600 hover:text-emerald-800"}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER & TABS SWITCHER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Khám phá & Đặt lịch tập
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chọn lớp nhóm sôi động hoặc đặt lịch tập kèm riêng 1-1 với Huấn luyện viên
          </p>
        </div>

        {/* 2 TABS */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-center border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "group"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lớp nhóm (Group Classes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "pt"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Kèm riêng 1–1 (PT)</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        {/* Date filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Ngày học:</span>
          <DateInput
            value={selectedDate}
            onChange={setSelectedDate}
            className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          />
        </div>

        {/* Sport Filter */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-500 font-medium">Bộ môn:</span>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-800">Tất cả bộ môn</option>
            <option value="Gym" className="bg-white dark:bg-slate-800">Gym & Thể lực</option>
            <option value="Yoga" className="bg-white dark:bg-slate-800">Yoga</option>
            <option value="Boxing" className="bg-white dark:bg-slate-800">Boxing</option>
            <option value="Pilates" className="bg-white dark:bg-slate-800">Pilates</option>
            <option value="Zumba" className="bg-white dark:bg-slate-800">Zumba</option>
            <option value="Bơi lội" className="bg-white dark:bg-slate-800">Bơi lội</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === "group" ? "Tìm theo tên lớp, HLV..." : "Tìm HLV hoặc môn tập..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TAB CONTENT: GROUP CLASSES */}
      {activeTab === "group" && (
        loadingGroupClasses ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Đang tải lịch lớp học...
            </h4>
          </div>
        ) : groupClassesError ? (
          <div className="bg-rose-50 dark:bg-rose-950/30 p-8 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-300">
              Không thể tải lịch học
            </h4>
            <p className="text-xs text-rose-600/80 dark:text-rose-300/80 mt-1">
              {groupClassesError}
            </p>
            <button
              type="button"
              onClick={() => void loadGroupClasses()}
              className="mt-4 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Thử tải lại
            </button>
          </div>
        ) : (
        <div className="space-y-3">
          {refreshingGroupClasses && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Đang đồng bộ trạng thái đặt lớp...</span>
            </div>
          )}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity ${refreshingGroupClasses ? "opacity-70" : ""}`}>
          {filteredGroupClasses.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không có lớp học phù hợp
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng thử ngày, bộ môn hoặc từ khóa khác.
              </p>
            </div>
          ) : filteredGroupClasses.map((item) => {
            const bookedSession = findActiveBooking(item.id, item.dateStr);
            const booked = Boolean(bookedSession);
            const bookingStatus = normalizeBookingStatus(bookedSession ? getBookingStatus(bookedSession) : "");
            const isPending = bookingStatus === "pending";
            const isFull = item.registeredCount >= item.capacity;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                      {item.sport} • {item.level}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isFull
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {isFull ? "Đã hết chỗ" : `Còn ${item.capacity - item.registeredCount} chỗ`}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.name}
                  </h3>

                  {booked && (
                    <span
                      className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                        isPending
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {isPending ? "Đang chờ duyệt" : "Đã được duyệt"}
                    </span>
                  )}

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.coachName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClassDetail(item)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Xem chi tiết
                  </button>

                  {booked ? (
                    <button
                      type="button"
                      onClick={() => {
                        const s = mySessions.find(
                          (x) =>
                            String((x as any).classId ?? x.id).toLowerCase() === String(item.id).toLowerCase() &&
                            x.date === item.dateStr &&
                            !isInactiveBookingStatus(getBookingStatus(x))
                        );
                        if (s) setCancelTarget({ classId: s.id, className: item.name });
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 font-semibold text-xs transition-colors border border-rose-200 dark:border-rose-800"
                    >
                      Hủy đặt
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => handleBookGroupClass(item)}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs ${
                        isFull
                          ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                      }`}
                    >
                      Đặt chỗ ngay
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        )
      )}

      {/* TAB CONTENT: 1-ON-1 PT SLOTS */}
      {activeTab === "pt" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <p className="font-bold">Lịch kèm riêng 1-1 từ hệ thống</p>
              <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
                Các ca PT chỉ hiển thị khi đã được tạo và mở từ dữ liệu hệ thống.
              </p>
            </div>
          </div>

          {filteredPtSlots.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có ca tập 1-1 nào đang mở trong ngày đã chọn
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Vui lòng chọn ngày khác trên thanh lọc hoặc liên hệ trực tiếp HLV qua tin nhắn để đặt lịch riêng.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPtSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-purple-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                        {slot.sport} • PT 1-1
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          slot.isBooked
                            ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {slot.isBooked ? "Đã có người đặt" : "Ca trống sẵn sàng"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {slot.coachName}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                      "{slot.note}"
                    </p>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => setBookingPtSlot(slot)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        slot.isBooked
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                          : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{slot.isBooked ? "Đã được đăng ký" : "Đặt lịch kèm 1–1 ngay"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CHI TIẾT LỚP HỌC (PORTAL TO DOCUMENT.BODY) */}
      {selectedClassDetail &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {selectedClassDetail.sport} • {selectedClassDetail.level}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedClassDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">{selectedClassDetail.description}</p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedClassDetail.startTime} - {selectedClassDetail.endTime} (Ngày {selectedClassDetail.dateStr || selectedDate})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Địa điểm:</span>
                    <strong>{selectedClassDetail.room}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Huấn luyện viên:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{selectedClassDetail.coachName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sĩ số lớp:</span>
                    <strong>{selectedClassDetail.registeredCount}/{selectedClassDetail.capacity} người</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Về Huấn luyện viên</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedClassDetail.coachBio}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold">Lưu ý khi tham gia:</p>
                  <p className="text-[11px] mt-0.5">
                    Hội viên vui lòng có mặt trước giờ tập 5-10 phút để khởi động và ổn định vị trí. Hủy lịch trước tối thiểu 2 giờ nếu bận đột xuất.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={selectedClassBooked}
                  onClick={() => handleBookGroupClass(selectedClassDetail)}
                  className={`px-5 py-2 font-semibold rounded-lg shadow-sm transition-colors ${
                    selectedClassBooked
                      ? "cursor-not-allowed bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                  }`}
                >
                  {selectedClassBooked
                    ? normalizeBookingStatus(
                        getBookingStatus(findActiveBooking(selectedClassDetail.id, selectedClassDetail.dateStr) as MemberSessionItem)
                      ) === "pending"
                      ? "Đang chờ duyệt"
                      : "Đã được duyệt"
                    : "Xác nhận đặt lớp"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL: XÁC NHẬN HỦY ĐẶT LỚP */}
      {cancelTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setCancelTarget(null);
            }}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-booking-title"
            >
              <div className="flex items-start gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 id="cancel-booking-title" className="text-base font-bold text-slate-900 dark:text-white">
                    Xác nhận hủy đặt lớp
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Bạn có chắc chắn muốn hủy lịch đã đặt không? Thao tác này sẽ cập nhật ngay vào lịch cá nhân của bạn.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Đóng hộp thoại"
                  onClick={() => setCancelTarget(null)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5">
                <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm font-semibold text-slate-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-slate-200">
                  {cancelTarget.className}
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Giữ lại lịch
                </button>
                <button
                  type="button"
                  onClick={() => void handleCancelBooking(cancelTarget.classId)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-500"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 2: ĐẶT LỊCH KÈM 1-1 (PORTAL TO DOCUMENT.BODY) */}
      {bookingPtSlot &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Đặt lịch kèm riêng 1-1
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Buổi tập với {bookingPtSlot.coachName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingPtSlot(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleConfirmPtBooking} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  {/* Slot summary card */}
                  <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-slate-200 space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span>Thời gian:</span>
                      <span className="text-purple-700 dark:text-purple-300">
                        {bookingPtSlot.startTime} - {bookingPtSlot.endTime} • Ngày {bookingPtSlot.date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bộ môn & Phòng:</span>
                      <span>{bookingPtSlot.sport} • {bookingPtSlot.room}</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mục tiêu trọng tâm buổi tập: *
                    </label>
                    <select
                      value={ptGoal}
                      onChange={(e) => setPtGoal(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-medium"
                    >
                      <option>Tăng cơ & Siết nét (Hypertrophy)</option>
                      <option>Giảm mỡ & Đốt calo cường độ cao</option>
                      <option>Cải thiện kỹ thuật động tác chuẩn</option>
                      <option>Giãn cơ sâu & Phục hồi thể lực</option>
                      <option>Tập sức mạnh tối đa (Strength)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Ghi chú / Nhắn gửi Huấn luyện viên:
                    </label>
                    <textarea
                      rows={3}
                      value={ptNote}
                      onChange={(e) => setPtNote(e.target.value)}
                      placeholder="VD: Em hơi đau mỏi vai nhẹ, hôm nay thầy tập trung cho em phần thân dưới nhé..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setBookingPtSlot(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg shadow-sm transition-colors"
                  >
                    Xác nhận đặt lịch PT
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
