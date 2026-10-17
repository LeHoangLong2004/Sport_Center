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
  CreditCard,
  QrCode,
  MessageCircle,
  Star,
  Award,
  Phone,
  ShieldCheck,
  Receipt,
  ChevronRight,
  ExternalLink,
  Check,
  Building,
} from "lucide-react";
import { DateInput } from "../../../components/DateInput";
import { CoachAvatar, getRealCoachAvatar } from "../utils/coachAvatar";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

type Feedback = {
  message: string;
  type: "success" | "error";
};

export default function MemberBooking({ onNavigate }: Props) {
  // Tabs: "group" (Khám phá lớp nhóm), "pt" (Kèm riêng 1-1), "my_classes" (Lớp đã đăng ký)
  const [activeTab, setActiveTab] = useState<"group" | "pt" | "my_classes">("group");

  // Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedCoachId, setSelectedCoachId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [mySessions, setMySessions] = useState<MemberSessionItem[]>([]);
  const [groupClasses, setGroupClasses] = useState<any[]>([]);
  const [ptSlots, setPtSlots] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loadingGroupClasses, setLoadingGroupClasses] = useState(true);
  const [refreshingGroupClasses, setRefreshingGroupClasses] = useState(false);
  const [groupClassesError, setGroupClassesError] = useState<string | null>(null);

  // Modals & Action States
  const [selectedClassDetail, setSelectedClassDetail] = useState<any | null>(null);
  const [classToBook, setClassToBook] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card" | "counter">("qr");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ classId: string; className: string } | null>(null);
  const [bookingPtSlot, setBookingPtSlot] = useState<any | null>(null);
  const [ptGoal, setPtGoal] = useState("Tăng cơ & Siết nét");
  const [ptNote, setPtNote] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showFeedback = (message: string, type: Feedback["type"] = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  // Load classes, my bookings, pt slots, and all coaches
  const loadGroupClasses = async (silent = false) => {
    if (silent) {
      setRefreshingGroupClasses(true);
    } else {
      setLoadingGroupClasses(true);
    }
    setGroupClassesError(null);
    try {
      const [availableClasses, memberSchedule, availablePtSlots, coachesList] = await Promise.all([
        MemberAPI.getAvailableClasses(),
        MemberAPI.getMemberSchedule().catch(() => ({ classBookings: [], ptSessions: [] })),
        MemberAPI.getAvailablePtSlots().catch(() => []),
        MemberAPI.getCoaches().catch(() => []),
      ]);

      if (Array.isArray(coachesList)) {
        setCoaches(coachesList);
      }

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

        const coachName = item.coachName || "HLV Chuyên Nghiệp";
        const coachAvatar = getRealCoachAvatar(coachName, item.coachAvatar, item.coachId);

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
          coachName: coachName,
          coachAvatar: coachAvatar,
          coachSpecialty: item.coachSpecialty || "Huấn luyện viên Thể hình & Lớp nhóm",
          coachPhone: item.coachPhone || "0901 234 567",
          coachBio:
            item.coachBio ||
            "Huấn luyện viên giàu kinh nghiệm, tận tâm hướng dẫn học viên cải thiện vóc dáng và thể lực toàn diện.",
          coachRating: item.coachRating || 4.9,
          coachExperienceYears: item.coachExperienceYears || 5,
          price: item.price || 150000,
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

      const dbBookings = (memberSchedule?.classBookings || []).map((booking: any) => {
        const start = new Date(booking.scheduleTime);
        const end = new Date(start.getTime() + Number(booking.durationMinutes || 60) * 60000);
        const date = [
          start.getFullYear(),
          String(start.getMonth() + 1).padStart(2, "0"),
          String(start.getDate()).padStart(2, "0"),
        ].join("-");
        const coachName = booking.coachName || "Huấn luyện viên phụ trách";
        const coachAvatar = getRealCoachAvatar(coachName, booking.coachAvatar, booking.coachId);

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
          coachName: coachName,
          coachAvatar: coachAvatar,
          coachSpecialty: booking.coachSpecialty || "Huấn luyện viên Thể hình",
          coachPhone: booking.coachPhone || "0901 234 567",
          coachBio: booking.coachBio || "Huấn luyện viên phụ trách lớp học.",
          coachRating: booking.coachRating || 4.9,
          coachExperienceYears: booking.coachExperienceYears || 5,
          price: booking.price || 150000,
          capacity: 0,
          registeredCount: 0,
          status: booking.status || "confirmed",
          bookingStatus: booking.status || "confirmed",
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
        const coachName = session.coachName || "Personal Trainer";

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
          coachName: coachName,
          coachAvatar: getRealCoachAvatar(coachName, session.coachAvatar, session.coachId),
          coachSpecialty: session.coachSpecialty || "Chuyên gia HLV Thể hình 1-1",
          coachPhone: session.coachPhone || "0901 234 567",
          coachRating: session.coachRating || 4.9,
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

  // Lock body scroll on modal open
  useEffect(() => {
    if (selectedClassDetail || classToBook || bookingSuccessInfo || bookingPtSlot || cancelTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedClassDetail, classToBook, bookingSuccessInfo, bookingPtSlot, cancelTarget]);

  // Booking status helpers
  const normalizeBookingStatus = (status: unknown) =>
    String(status ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const getBookingStatus = (session: MemberSessionItem) =>
    (session as any).bookingStatus ?? (session as any).status;

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

  const findActiveBooking = (classId: string, date: string) =>
    mySessions.find(
      (session) =>
        String((session as any).classId ?? session.id).toLowerCase() === String(classId).toLowerCase() &&
        session.date === date &&
        !isInactiveBookingStatus(getBookingStatus(session))
    );

  const isBooked = (classId: string, date: string) => {
    return Boolean(findActiveBooking(classId, date));
  };

  // Lấy danh sách lớp đã đăng ký còn hoạt động của Member
  const myActiveClasses = useMemo(() => {
    return mySessions.filter((s) => !isInactiveBookingStatus(getBookingStatus(s)));
  }, [mySessions]);

  // Mở modal thanh toán đặt lớp (thành viên Basic đặt với giá gốc)
  const handleInitiateBookClass = (item: any) => {
    if (item.registeredCount >= item.capacity) {
      showFeedback("Lớp học đã đủ chỗ. Vui lòng chọn ca tập hoặc lớp khác.", "error");
      return;
    }
    if (isBooked(item.id, item.dateStr)) {
      showFeedback("Bạn đã đặt lớp học này rồi.", "error");
      return;
    }
    setSelectedClassDetail(null);
    setClassToBook(item);
  };

  // Xác nhận thanh toán với giá gốc và hoàn tất đặt lớp
  const handleConfirmPaymentAndBook = async () => {
    if (!classToBook) return;
    setIsProcessingPayment(true);
    try {
      const priceToPay = classToBook.price || 150000;
      await MemberAPI.payAndBookClass(classToBook.id, paymentMethod, priceToPay);

      const localBooking = {
        id: classToBook.id,
        classId: classToBook.id,
        name: classToBook.name,
        sport: classToBook.sport,
        level: classToBook.level || "Lớp nhóm",
        type: "group" as const,
        date: classToBook.dateStr,
        startTime: classToBook.startTime,
        endTime: classToBook.endTime,
        room: classToBook.room,
        coachId: classToBook.coachId || "",
        coachName: classToBook.coachName,
        coachAvatar: classToBook.coachAvatar,
        coachSpecialty: classToBook.coachSpecialty,
        coachPhone: classToBook.coachPhone,
        coachBio: classToBook.coachBio,
        coachRating: classToBook.coachRating,
        coachExperienceYears: classToBook.coachExperienceYears,
        price: priceToPay,
        capacity: classToBook.capacity,
        registeredCount: classToBook.registeredCount + 1,
        status: "confirmed" as any,
        bookingStatus: "confirmed",
      } as MemberSessionItem & { classId: string; bookingStatus: string };

      setGroupClasses((currentClasses) =>
        currentClasses.map((currentClass) =>
          currentClass.id === classToBook.id
            ? {
                ...currentClass,
                registeredCount: Math.min(currentClass.registeredCount + 1, currentClass.capacity),
                availableSpots: Math.max(0, currentClass.availableSpots - 1),
              }
            : currentClass
        )
      );

      setMySessions((currentSessions) => [localBooking, ...currentSessions]);

      // Mở modal thông báo thành công và hiển thị profile Coach
      setBookingSuccessInfo({
        classItem: classToBook,
        bookingId: `BK-${Date.now().toString().slice(-6)}`,
        invoiceId: `INV-${Date.now().toString().slice(-6)}`,
        paidAmount: priceToPay,
        paymentMethod: paymentMethod,
        bookedAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      });

      setClassToBook(null);
      void loadGroupClasses(true);
    } catch (error: any) {
      showFeedback(error?.message || "Không thể hoàn tất thanh toán và đặt lớp. Vui lòng thử lại.", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Hủy đặt lớp
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
          (session as any).classId === classId ? { ...session, status: "đã hủy" as any, bookingStatus: "cancelled" } : session
        )
      );
      void loadGroupClasses(true);
      setSelectedClassDetail(null);
      showFeedback("Đã hủy đặt lớp thành công.");
    } catch (error: any) {
      void loadGroupClasses(true);
      showFeedback(error?.message || "Không thể hủy đặt lớp.", "error");
    }
  };

  // Đặt lịch PT 1-1
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

  // Chuyển sang chat với Coach
  const handleStartChatWithCoach = (coachName: string, coachId?: string, coachAvatar?: string) => {
    try {
      localStorage.setItem(
        "chat_target_coach",
        JSON.stringify({
          coachId: coachId || "",
          coachName: coachName,
          coachAvatar: coachAvatar || "",
        })
      );
    } catch {}
    if (bookingSuccessInfo) setBookingSuccessInfo(null);
    if (selectedClassDetail) setSelectedClassDetail(null);
    onNavigate("chat");
  };

  // Filter Group Classes (hỗ trợ lọc All Coach, Bộ môn, Ngày, Tìm kiếm)
  const filteredGroupClasses = useMemo(() => {
    return groupClasses.filter((c) => {
      const matchDate = !selectedDate || c.dateStr === selectedDate;
      const matchSport = selectedSport === "all" || c.sport.toLowerCase() === selectedSport.toLowerCase();
      const matchCoach =
        selectedCoachId === "all" ||
        String(c.coachId || "").toLowerCase() === selectedCoachId.toLowerCase() ||
        String(c.coachName || "").toLowerCase().includes(selectedCoachId.toLowerCase());
      const matchQuery =
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.coachName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sport.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchSport && matchCoach && matchQuery;
    });
  }, [groupClasses, selectedDate, selectedSport, selectedCoachId, searchQuery]);

  const filteredPtSlots = useMemo(() => {
    return ptSlots.filter((slot) => {
      const matchDate = !selectedDate || slot.date === selectedDate;
      const matchSport = selectedSport === "all" || String(slot.sport || "").toLowerCase() === selectedSport.toLowerCase();
      const matchCoach =
        selectedCoachId === "all" ||
        String(slot.coachId || "").toLowerCase() === selectedCoachId.toLowerCase() ||
        String(slot.coachName || "").toLowerCase().includes(selectedCoachId.toLowerCase());
      const matchQuery =
        !searchQuery ||
        String(slot.coachName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(slot.sport || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchSport && matchCoach && matchQuery;
    });
  }, [ptSlots, selectedDate, selectedSport, selectedCoachId, searchQuery]);

  const selectedClassBooked = selectedClassDetail
    ? isBooked(selectedClassDetail.id, selectedClassDetail.dateStr)
    : false;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${
            feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className={
              feedback.type === "error"
                ? "text-rose-600 hover:text-rose-800"
                : "text-emerald-600 hover:text-emerald-800"
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER & 3 TABS SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
              Hệ thống đặt lịch linh hoạt
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-500">Mọi hạng thành viên đều được đặt lịch</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Khám phá & Đặt lịch lớp học
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Khám phá trọn vẹn danh sách lớp học của tất cả Huấn luyện viên. Hội viên cơ bản (Basic) thanh toán với giá gốc niêm yết mà không bị giới hạn.
          </p>
        </div>

        {/* 3 TABS */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start lg:self-center border border-slate-200/80 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("group")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "group"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lớp nhóm ({groupClasses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pt")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pt"
                ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Kèm riêng 1–1 ({ptSlots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my_classes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "my_classes"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Lớp đã đăng ký</span>
            {myActiveClasses.length > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {myActiveClasses.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* QUICK COACH CAROUSEL (Khám phá All Coach) */}
      {activeTab === "group" && coaches.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Đội ngũ Huấn luyện viên ({coaches.length} HLV)
              </h3>
            </div>
            {selectedCoachId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCoachId("all")}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
              >
                Xem tất cả HLV
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCoachId("all")}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedCoachId === "all"
                  ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black">
                ALL
              </div>
              <span>Tất cả Huấn luyện viên</span>
            </button>

            {coaches.map((c) => {
              const isSelected = selectedCoachId === c.id;
              const coachAvatar = getRealCoachAvatar(c.fullName, c.avatarUrl, c.id);

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCoachId(isSelected ? "all" : c.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                    isSelected
                      ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500"
                  }`}
                >
                  <CoachAvatar
                    src={c.avatarUrl}
                    name={c.fullName}
                    className="w-7 h-7 rounded-full shrink-0"
                  />
                  <div className="text-left">
                    <p className="font-bold text-xs leading-tight">{c.fullName}</p>
                    <p
                      className={`text-[10px] leading-tight ${
                        isSelected ? "text-teal-100" : "text-slate-400"
                      }`}
                    >
                      {c.specialty || "Huấn luyện viên"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TOOLBAR FILTERS (Dành cho Group và PT) */}
      {activeTab !== "my_classes" && (
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
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
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
              <option value="Yoga" className="bg-white dark:bg-slate-800">Yoga & Pilates</option>
              <option value="Boxing" className="bg-white dark:bg-slate-800">Boxing & Kickfit</option>
              <option value="Bơi lội" className="bg-white dark:bg-slate-800">Bơi lội 4 mùa</option>
              <option value="Zumba" className="bg-white dark:bg-slate-800">Zumba Dance</option>
            </select>
          </div>

          {/* Coach Filter Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Huấn luyện viên:</span>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="all" className="bg-white dark:bg-slate-800">Tất cả HLV ({coaches.length})</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">
                  {c.fullName || c.name}
                </option>
              ))}
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
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* TAB 1: KHÁM PHÁ LỚP NHÓM (GROUP CLASSES) */}
      {activeTab === "group" && (
        loadingGroupClasses ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Đang tải lịch lớp học của toàn bộ Huấn luyện viên...
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
          <div className="space-y-4">
            {refreshingGroupClasses && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-300">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Đang đồng bộ trạng thái đặt lớp...</span>
              </div>
            )}

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-opacity ${
                refreshingGroupClasses ? "opacity-70" : ""
              }`}
            >
              {filteredGroupClasses.length === 0 ? (
                <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Không có lớp học phù hợp với bộ lọc
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Vui lòng thử chọn Huấn luyện viên khác, bộ môn hoặc ngày học khác.
                  </p>
                </div>
              ) : (
                filteredGroupClasses.map((item) => {
                  const bookedSession = findActiveBooking(item.id, item.dateStr);
                  const booked = Boolean(bookedSession);
                  const isFull = item.registeredCount >= item.capacity;

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Badges */}
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                            {item.sport} • {item.level}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.price ? `${item.price.toLocaleString("vi-VN")} đ` : "150.000 đ"}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {item.name}
                        </h3>

                        {booked && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <Check className="w-3 h-3" /> Đã đăng ký lớp này
                          </span>
                        )}

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* COACH PROFILE CARD BOX */}
                        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <CoachAvatar
                              src={item.coachAvatar}
                              name={item.coachName}
                              className="w-10 h-10 rounded-full border-2 border-teal-500 shrink-0"
                            />
                            <div>
                              <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                                {item.coachName}
                              </p>
                              <p className="text-[10px] font-medium text-teal-600 dark:text-teal-400 line-clamp-1">
                                {item.coachSpecialty}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{item.coachRating || 4.9}</span>
                          </div>
                        </div>

                        {/* Time & Room Specs */}
                        <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3.5 h-3.5" /> Khung giờ:
                            </span>
                            <span className="font-bold text-teal-700 dark:text-teal-300">
                              {item.startTime} - {item.endTime} ({item.dateStr || "Hôm nay"})
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3.5 h-3.5" /> Địa điểm:
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.room}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Users className="w-3.5 h-3.5" /> Chỗ trống:
                            </span>
                            <span
                              className={`font-bold ${
                                isFull ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {isFull ? "Đã hết chỗ" : `Còn ${item.capacity - item.registeredCount} / ${item.capacity} chỗ`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedClassDetail(item)}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
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
                            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-xs transition-colors border border-rose-200 dark:border-rose-800"
                          >
                            Hủy đặt
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isFull}
                            onClick={() => handleInitiateBookClass(item)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                              isFull
                                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 active:scale-95"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Đặt lịch & Thanh toán</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )
      )}

      {/* TAB 2: KÈM RIÊNG 1-1 (PT SLOTS) */}
      {activeTab === "pt" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPtSlots.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                <Dumbbell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Chưa có lịch trống kèm riêng phù hợp
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Vui lòng chọn ngày khác hoặc liên hệ bộ phận Lễ tân để được hỗ trợ sắp xếp lịch riêng.
                </p>
              </div>
            ) : (
              filteredPtSlots.map((slot) => {
                const coachAvatar = getRealCoachAvatar(slot.coachName, slot.coachAvatar, slot.coachId);

                return (
                  <div
                    key={slot.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
                          {slot.sport || "PT 1-1"} • Kèm riêng cá nhân
                        </span>
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                          Slot 60 phút
                        </span>
                      </div>

                      <div className="flex items-center gap-3 my-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                        <CoachAvatar
                          src={slot.coachAvatar}
                          name={slot.coachName}
                          className="w-11 h-11 rounded-full border-2 border-purple-500 shrink-0"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {slot.coachName}
                          </h4>
                          <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            Chuyên gia huấn luyện thể hình
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Thời gian:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {slot.startTime} - {slot.endTime} • Ngày {slot.date}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Phòng tập:</span>
                          <span className="font-semibold">{slot.room || "Khu PT chuyên biệt"}</span>
                        </div>
                        {slot.note && (
                          <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                            {slot.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingPtSlot(slot)}
                      className="mt-5 w-full py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Đặt lịch kèm 1-1 ngay</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LỚP ĐÃ ĐĂNG KÝ CỦA TÔI (MY REGISTERED CLASSES & COACH INFO) */}
      {activeTab === "my_classes" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-5 rounded-3xl border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Danh sách lớp học đã đăng ký thành công ({myActiveClasses.length} lớp)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xem chi tiết lịch học, thông tin Huấn luyện viên phụ trách và kênh nhắn tin trao đổi trực tiếp với HLV.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("group")}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors shrink-0"
            >
              + Đặt thêm lớp mới
            </button>
          </div>

          {myActiveClasses.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-16 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Bạn chưa đăng ký lớp học nào
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Hãy chuyển qua tab "Lớp nhóm" để khám phá các lớp học đầy đủ của tất cả Huấn luyện viên và tiến hành đặt lịch!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("group")}
                className="mt-6 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-600/20 transition-all"
              >
                Khám phá lớp học ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {myActiveClasses.map((booking) => {
                const status = normalizeBookingStatus(getBookingStatus(booking));
                const isPending = status === "pending";

                return (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Booking Status Badge & Class Title */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 block mb-1">
                            {booking.sport} • {booking.type === "pt" ? "Kèm riêng 1-1" : "Lớp nhóm"}
                          </span>
                          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {booking.name}
                          </h4>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black border shrink-0 ${
                            isPending
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {isPending ? "⏳ Chờ xác nhận" : "🟢 Đã thanh toán & Xác nhận"}
                        </span>
                      </div>

                      {/* Time and Location Box */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                          <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>
                            {booking.startTime} - {booking.endTime} • Ngày {booking.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>{booking.room}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Receipt className="w-4 h-4 text-teal-600 shrink-0" />
                          <span>
                            Thanh toán: <strong className="text-slate-800 dark:text-slate-200">Giá gốc (150.000 đ)</strong>
                          </span>
                        </div>
                      </div>

                      {/* FULL COACH PROFILE CARD BOX */}
                      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-teal-200/80 dark:border-teal-900/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Huấn luyện viên phụ trách
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-teal-100 dark:border-slate-700">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {booking.coachRating || 4.9}
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5">
                          <CoachAvatar
                            src={booking.coachAvatar}
                            name={booking.coachName}
                            className="w-12 h-12 rounded-full border-2 border-teal-500 shadow-sm shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {booking.coachName}
                            </h5>
                            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 truncate">
                              {booking.coachSpecialty || "Huấn luyện viên Thể hình"}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {booking.coachPhone || "0901 234 567"}
                            </p>
                          </div>
                        </div>

                        {booking.coachBio && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-2.5 pt-2 border-t border-teal-100 dark:border-slate-700 leading-relaxed">
                            "{booking.coachBio}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Booking Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleStartChatWithCoach(
                            booking.coachName,
                            booking.coachId,
                            booking.coachAvatar
                          )
                        }
                        className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Nhắn tin cho HLV</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCancelTarget({
                            classId: (booking as any).classId || booking.id,
                            className: booking.name,
                          })
                        }
                        className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                      >
                        Hủy lớp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CHI TIẾT LỚP HỌC & HỒ SƠ HLV */}
      {selectedClassDetail &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedClassDetail(null);
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Chi tiết lớp học • {selectedClassDetail.sport}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedClassDetail.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {selectedClassDetail.description}
                </p>

                {/* Sơ lược thời gian, địa điểm, giá */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Thời gian:</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedClassDetail.startTime} - {selectedClassDetail.endTime} (Ngày {selectedClassDetail.dateStr || "Hôm nay"})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Địa điểm:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedClassDetail.room}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sĩ số lớp:</span>
                    <strong>{selectedClassDetail.registeredCount}/{selectedClassDetail.capacity} người</strong>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 font-semibold">Mức phí áp dụng:</span>
                    <strong className="text-teal-700 dark:text-teal-300 font-black text-sm">
                      Giá gốc: {selectedClassDetail.price ? `${selectedClassDetail.price.toLocaleString("vi-VN")} đ` : "150.000 đ"}
                    </strong>
                  </div>
                </div>

                {/* THẺ HỒ SƠ HUẤN LUYỆN VIÊN PHỤ TRÁCH ĐẦY ĐỦ */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-slate-800 dark:to-slate-850 border border-teal-200 dark:border-teal-800/80">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                      <Award className="w-4 h-4 text-teal-600" /> Huấn luyện viên phụ trách
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-100">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedClassDetail.coachRating || 4.9}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <CoachAvatar
                      src={selectedClassDetail.coachAvatar}
                      name={selectedClassDetail.coachName}
                      className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {selectedClassDetail.coachName}
                      </h4>
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                        {selectedClassDetail.coachSpecialty}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kinh nghiệm: {selectedClassDetail.coachExperienceYears || 5}+ năm • ĐT: {selectedClassDetail.coachPhone}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 italic pt-2.5 border-t border-teal-200/60 dark:border-slate-700">
                    "{selectedClassDetail.coachBio}"
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleStartChatWithCoach(
                        selectedClassDetail.coachName,
                        selectedClassDetail.coachId,
                        selectedClassDetail.coachAvatar
                      )
                    }
                    className="mt-3 w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-xs hover:bg-teal-50 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Nhắn tin hỏi đáp với HLV</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Chính sách linh hoạt:
                  </p>
                  <p className="text-[11px] mt-1 leading-relaxed text-blue-800 dark:text-blue-300">
                    Hội viên ở mọi gói (kể cả Hạng Cơ bản) đều được đặt lịch. Nếu là thành viên Cơ bản, bạn chỉ cần thanh toán đúng giá gốc của lớp học mà không phải trả thêm phí thường niên.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedClassDetail(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={selectedClassBooked}
                  onClick={() => handleInitiateBookClass(selectedClassDetail)}
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                    selectedClassBooked
                      ? "cursor-not-allowed bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-white bg-teal-600 hover:bg-teal-700 shadow-teal-600/20 active:scale-95"
                  }`}
                >
                  {selectedClassBooked ? (
                    <>
                      <Check className="w-4 h-4" /> Đã đăng ký lớp này
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Đặt lịch & Thanh toán giá gốc
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 2: THANH TOÁN GIÁ GỐC & ĐẶT LỊCH LỚP HỌC */}
      {classToBook &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isProcessingPayment) setClassToBook(null);
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Xác nhận thanh toán & Đặt chỗ
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {classToBook.name}
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setClassToBook(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Lớp & Coach info box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CoachAvatar
                      src={classToBook.coachAvatar}
                      name={classToBook.coachName}
                      className="w-12 h-12 rounded-full border-2 border-teal-500 shrink-0"
                    />
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {classToBook.name}
                      </p>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        HLV phụ trách: {classToBook.coachName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {classToBook.startTime} - {classToBook.endTime} • {classToBook.room}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BẢNG CHI TIẾT THANH TOÁN GIÁ GỐC */}
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700 space-y-2.5">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Chi tiết hóa đơn đăng ký
                  </h4>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Hạng thành viên của bạn:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">🥉 Cơ bản (Basic Member)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Giá gốc niêm yết buổi học:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {(classToBook.price || 150000).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Ưu đãi thành viên:</span>
                    <span className="font-bold text-slate-500">0 đ (Áp dụng 100% giá gốc)</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-teal-200 dark:border-slate-700 text-sm">
                    <span className="font-extrabold text-slate-900 dark:text-white">Tổng tiền thanh toán:</span>
                    <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                      {(classToBook.price || 150000).toLocaleString("vi-VN")} đ
                    </strong>
                  </div>
                </div>

                {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
                <div>
                  <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mb-2 block">
                    Chọn phương thức thanh toán:
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qr")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "qr"
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-teal-600 shrink-0" />
                      <span className="text-[11px] font-bold">Mã VietQR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "card"
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-teal-600 shrink-0" />
                      <span className="text-[11px] font-bold">Thẻ ATM / Visa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("counter")}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        paymentMethod === "counter"
                          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                          : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Building className="w-5 h-5 text-teal-600 shrink-0" />
                      <span className="text-[11px] font-bold">Tại quầy lễ tân</span>
                    </button>
                  </div>
                </div>

                {/* NỘI DUNG THANH TOÁN TƯƠNG ỨNG */}
                {paymentMethod === "qr" && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                    <p className="text-[11px] text-slate-500">Quét mã VietQR qua bất kỳ ứng dụng ngân hàng nào:</p>
                    <div className="w-36 h-36 mx-auto bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                          `2|99|0901234567|SPORT CENTER|0|0|150000|SC BOOK ${classToBook.name}`
                        )}`}
                        alt="VietQR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      <span>Ngân hàng: <strong>MB Bank</strong> • STK: <strong>8888999901</strong></span>
                      <br />
                      <span>Số tiền: <strong className="text-emerald-600">{(classToBook.price || 150000).toLocaleString("vi-VN")} đ</strong></span>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cổng thanh toán thẻ bảo mật 256-bit
                    </div>
                    <input
                      placeholder="Số thẻ (VD: 9704 0000 ....)"
                      defaultValue="9704 1988 2026 8888"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                      />
                      <input
                        placeholder="CVV"
                        defaultValue="888"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === "counter" && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
                    <p className="font-bold text-xs">Thanh toán trực tiếp khi đến trung tâm:</p>
                    <p className="text-[11px] leading-relaxed">
                      Chỗ học của bạn sẽ được giữ trước. Bạn vui lòng có mặt tại quầy lễ tân trước giờ bắt đầu lớp 10 phút để thanh toán giá gốc và nhận thẻ vào phòng tập.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => setClassToBook(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPaymentAndBook}
                  className="px-6 py-2.5 font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý thanh toán...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Thanh toán {(classToBook.price || 150000).toLocaleString("vi-VN")} đ & Đặt chỗ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 3: ĐẶT LỚP & THANH TOÁN THÀNH CÔNG (HIỂN THỊ ĐẦY ĐỦ THÔNG TIN COACH PHỤ TRÁCH) */}
      {bookingSuccessInfo &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setBookingSuccessInfo(null);
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              {/* Success Banner */}
              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center relative overflow-hidden shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 inline-block mb-1">
                  Giao dịch thành công
                </span>
                <h3 className="text-xl font-black">Đặt lớp & Thanh toán thành công!</h3>
                <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
                  Đơn đặt lớp của bạn đã được xác nhận. Dưới đây là thông tin lớp học và Huấn luyện viên phụ trách.
                </p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Tóm tắt lớp học */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center font-extrabold text-sm text-slate-900 dark:text-white">
                    <span>{bookingSuccessInfo.classItem.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {bookingSuccessInfo.paidAmount?.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Mã hóa đơn:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {bookingSuccessInfo.invoiceId}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Thời gian học:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {bookingSuccessInfo.classItem.startTime} - {bookingSuccessInfo.classItem.endTime} (Ngày {bookingSuccessInfo.classItem.dateStr || "Hôm nay"})
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Phòng tập:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {bookingSuccessInfo.classItem.room}
                    </span>
                  </div>
                </div>

                {/* CARD HUẤN LUYỆN VIÊN PHỤ TRÁCH ĐẦY ĐỦ */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-teal-600" /> Huấn luyện viên phụ trách lớp của bạn
                    </span>
                    <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-100">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {bookingSuccessInfo.classItem.coachRating || 4.9}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <CoachAvatar
                      src={bookingSuccessInfo.classItem.coachAvatar}
                      name={bookingSuccessInfo.classItem.coachName}
                      className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-md shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        {bookingSuccessInfo.classItem.coachName}
                      </h4>
                      <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                        {bookingSuccessInfo.classItem.coachSpecialty}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                        <Phone className="w-3 h-3 text-slate-400" /> {bookingSuccessInfo.classItem.coachPhone}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{bookingSuccessInfo.classItem.coachBio || "Chào mừng bạn tham gia lớp học! Huấn luyện viên rất mong chờ được đồng hành cùng bạn trong buổi tập sắp tới."}"
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleStartChatWithCoach(
                        bookingSuccessInfo.classItem.coachName,
                        bookingSuccessInfo.classItem.coachId,
                        bookingSuccessInfo.classItem.coachAvatar
                      )
                    }
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn tin trò chuyện với HLV {bookingSuccessInfo.classItem.coachName}</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={() => setBookingSuccessInfo(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSuccessInfo(null);
                    setActiveTab("my_classes");
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  Xem lớp đã đăng ký →
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL 4: XÁC NHẬN HỦY ĐẶT LỚP */}
      {cancelTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setCancelTarget(null);
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Xác nhận hủy đặt lớp
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Bạn có chắc chắn muốn hủy chỗ tại lớp học này không?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelTarget(null)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
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

      {/* MODAL 5: ĐẶT LỊCH KÈM 1-1 */}
      {bookingPtSlot &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setBookingPtSlot(null);
            }}
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmPtBooking} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
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
                      placeholder="VD: Em cần tập trung cải thiện kỹ thuật Squat và Bench Press..."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setBookingPtSlot(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
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
