import { useState, useMemo, useEffect } from "react";
import type { MemberScreen } from "../types";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useMemberBookingData } from "./booking/useMemberBookingData";
import { useMemberBookingActions } from "./booking/useMemberBookingActions";
import { BookingHeader } from "./booking/BookingHeader";
import { BookingFilters } from "./booking/BookingFilters";
import { GroupClassesTab } from "./booking/GroupClassesTab";
import { PtSlotsTab } from "./booking/PtSlotsTab";
import { MyClassesTab } from "./booking/MyClassesTab";
import { BookingModals } from "./booking/BookingModals";
import { parseScheduleTime } from "../../../utils/scheduleTimeHelper";
import { MemberAPI } from "../services/api";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

const isPtCourse = (item: any) => {
  const labels = [item.name, item.className, item.level, item.sport, item.sportName]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /pt\s*1\s*[-:]\s*1|1\s*[-:]\s*1\s*pt|personal\s*training|kèm\s*(riêng|1\s*[-:]\s*1)/i.test(labels);
};

/**
 * Màn hình Đặt lịch lớp học & Huấn luyện viên cá nhân (Member Booking View).
 * Cung cấp giao diện lọc theo ngày, bộ môn, HLV và đặt chỗ:
 * - Tab Lớp học nhóm (Group Classes): Đặt chỗ tham gia lớp học thể thao theo lịch.
 * - Tab Thuê PT (1-on-1 PT Slots): Đặt lịch tập riêng với HLV cá nhân.
 * - Tab Lớp đã đặt (My Classes): Xem danh sách lớp đã đăng ký và hỗ trợ hủy lịch.
 * 
 * @param onNavigate Hàm chuyển hướng trang
 */
export default function MemberBooking({ onNavigate }: Props) {
  const [activeTab, setActiveTab] = useState<"group" | "pt" | "my_classes">("group");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedCoachId, setSelectedCoachId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    groupClasses,
    setGroupClasses,
    mySessions,
    setMySessions,
    ptSlots,
    setPtSlots,
    coaches,
    sportOptions,
    loadingGroupClasses,
    memberScheduleStatus,
    refreshingGroupClasses,
    groupClassesError,
    loadGroupClasses,
    getBookingStatus,
    isInactiveBookingStatus,
    findActiveBooking,
    isBooked,
    myActiveClasses,
    myUpcomingClasses,
    myRegisteredClassesCount,
  } = useMemberBookingData();

  const {
    selectedClassDetail,
    setSelectedClassDetail,
    classToBook,
    setClassToBook,
    paymentMethod,
    setPaymentMethod,
    isProcessingPayment,
    paymentError,
    bookingSuccessInfo,
    setBookingSuccessInfo,
    cancelTarget,
    setCancelTarget,
    isCancelling,
    bookingPtSlot,
    setBookingPtSlot,
    ptBookingError,
    setPtBookingError,
    isProcessingPtBooking,
    ptGoal,
    setPtGoal,
    ptNote,
    setPtNote,
    membership,
    activeOrders,
    feedback,
    setFeedback,
    handleInitiateBookClass,
    handleConfirmPaymentAndBook,
    handleCancelBooking,
    handleConfirmPtBooking,
  } = useMemberBookingActions({
    loadGroupClasses,
    setGroupClasses,
    setMySessions,
    setPtSlots,
    isBooked,
  });

  const handleOpenClassDetail = async (classItem: any) => {
    setSelectedClassDetail(classItem);
    try {
      const detail = await MemberAPI.getClassDetail(String(classItem.id));
      if (!detail) return;

      setSelectedClassDetail((current: any) => current?.id === classItem.id
        ? {
            ...current,
            sessions: detail.sessions ?? detail.Sessions ?? [],
            totalSessions: detail.totalSessions ?? detail.TotalSessions ?? current.totalSessions,
          }
        : current);
    } catch (error) {
      console.warn("Không thể tải lịch chi tiết khóa học:", error);
    }
  };

  useEffect(() => {
    const hasOpenModal = Boolean(selectedClassDetail || classToBook || bookingSuccessInfo || bookingPtSlot || cancelTarget);
    if (hasOpenModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedClassDetail, classToBook, bookingSuccessInfo, bookingPtSlot, cancelTarget]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleStartChatWithCoach = (coachName: string, coachId?: string, coachAvatar?: string) => {
    try {
      localStorage.setItem("chat_target_coach", JSON.stringify({ coachId: coachId || "", coachName, coachAvatar: coachAvatar || "" }));
    } catch { }
    if (bookingSuccessInfo) setBookingSuccessInfo(null);
    if (selectedClassDetail) setSelectedClassDetail(null);
    onNavigate("chat");
  };

  const filteredAvailableClasses = useMemo(() => {
    const nowTime = Date.now();
    return groupClasses.filter((c) => {
      // Ẩn hoàn toàn các lớp học đã kết thúc (thời gian kết thúc <= thời gian hiện tại)
      const endMs =
        c.endMs ??
        (c.scheduleTime
          ? parseScheduleTime(c.scheduleTime).getTime() + Number(c.durationMinutes || 60) * 60000
          : 0);
      if (endMs > 0 && endMs <= nowTime) return false;

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

  // PT 1–1 được tạo như một khóa học định kỳ trong bảng classes, khác với
  // các ca PT lẻ được HLV mở trong coach_availability_slots.
  const filteredPtCourses = useMemo(
    () => filteredAvailableClasses.filter(isPtCourse),
    [filteredAvailableClasses]
  );
  const filteredGroupClasses = useMemo(
    () => filteredAvailableClasses.filter((item) => !isPtCourse(item)),
    [filteredAvailableClasses]
  );

  const filteredPtSlots = useMemo(() => {
    const nowTime = Date.now();
    return ptSlots.filter((slot) => {
      // Đảm bảo ca PT diễn ra trong tương lai so với thời gian thực tế
      if (slot?.date) {
        let slotDateStr = String(slot.date).trim();
        if (slotDateStr.includes("/")) {
          const [d, m, y] = slotDateStr.split("/");
          slotDateStr = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
        const timeStr = slot.startTime || "00:00";
        const slotStart = new Date(`${slotDateStr}T${timeStr}:00`).getTime();
        if (!isNaN(slotStart) && slotStart <= nowTime) return false;
      }

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

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all ${feedback.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className={feedback.type === "error" ? "text-rose-600" : "text-emerald-600"}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & 3-Tabs */}
      <BookingHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        groupClassesCount={filteredGroupClasses.length}
        ptSlotsCount={filteredPtSlots.length + filteredPtCourses.length}
        myRegisteredClassesCount={myRegisteredClassesCount}
      />

      {/* Filter Toolbar */}
      <BookingFilters
        activeTab={activeTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        selectedCoachId={selectedCoachId}
        setSelectedCoachId={setSelectedCoachId}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        coaches={coaches}
        sports={sportOptions}
      />

      {/* TAB 1: GROUP CLASSES */}
      {activeTab === "group" && (
        <GroupClassesTab
          loading={loadingGroupClasses}
          error={groupClassesError}
          refreshing={refreshingGroupClasses}
          classes={filteredGroupClasses}
          mySessions={mySessions}
          membership={membership}
          onNavigate={onNavigate}
          onRetry={() => void loadGroupClasses()}
          onOpenDetail={handleOpenClassDetail}
          onInitiateBook={handleInitiateBookClass}
          onCancelBooking={setCancelTarget}
          findActiveBooking={findActiveBooking}
          getBookingStatus={getBookingStatus}
          isInactiveBookingStatus={isInactiveBookingStatus}
        />
      )}

      {/* TAB 2: PT 1-1 */}
      {activeTab === "pt" && (
        <div className="space-y-8">
          {filteredPtCourses.length > 0 && (
            <section className="space-y-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Khóa PT 1–1 theo chu kỳ</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Các buổi tập định kỳ hàng tuần do HLV hoặc quản lý mở đăng ký.</p>
              </div>
              <GroupClassesTab
                loading={loadingGroupClasses}
                error={groupClassesError}
                refreshing={refreshingGroupClasses}
                classes={filteredPtCourses}
                mySessions={mySessions}
                membership={membership}
                onNavigate={onNavigate}
                onRetry={() => void loadGroupClasses()}
                onOpenDetail={handleOpenClassDetail}
                onInitiateBook={handleInitiateBookClass}
                onCancelBooking={setCancelTarget}
                findActiveBooking={findActiveBooking}
                getBookingStatus={getBookingStatus}
                isInactiveBookingStatus={isInactiveBookingStatus}
              />
            </section>
          )}
          <section className="space-y-3">
            {filteredPtCourses.length > 0 && (
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Ca PT 1–1 linh hoạt</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Các khung giờ trống lẻ do HLV đăng ký.</p>
              </div>
            )}
            <PtSlotsTab
              slots={filteredPtSlots}
              onBookPtSlot={setBookingPtSlot}
              membership={membership}
              activeOrders={activeOrders}
              mySessions={mySessions}
            />
          </section>
        </div>
      )}

      {/* TAB 3: MY CLASSES */}
      {activeTab === "my_classes" && (
        <MyClassesTab
          myActiveClasses={myActiveClasses}
          mySessions={mySessions}
          getBookingStatus={getBookingStatus}
          onStartChatWithCoach={handleStartChatWithCoach}
          onCancelBooking={setCancelTarget}
          membership={membership}
        />
      )}

      {/* MODALS */}
      <BookingModals
        selectedClassDetail={selectedClassDetail}
        onCloseClassDetail={() => setSelectedClassDetail(null)}
        isBooked={selectedClassDetail ? isBooked(selectedClassDetail.id, selectedClassDetail.dateStr) : false}
        onInitiateBook={handleInitiateBookClass}
        onStartChatWithCoach={handleStartChatWithCoach}
        classToBook={classToBook}
        onCloseClassToBook={() => setClassToBook(null)}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isProcessingPayment={isProcessingPayment}
        paymentError={paymentError}
        onConfirmPayment={handleConfirmPaymentAndBook}
        bookingSuccessInfo={bookingSuccessInfo}
        onCloseSuccessModal={() => setBookingSuccessInfo(null)}
        onViewMyClasses={() => {
          setBookingSuccessInfo(null);
          setActiveTab("my_classes");
        }}
        cancelTarget={cancelTarget}
        onCloseCancelModal={() => setCancelTarget(null)}
        onConfirmCancel={handleCancelBooking}
        isCancelling={isCancelling}
        bookingPtSlot={bookingPtSlot}
        onClosePtBookingModal={() => setBookingPtSlot(null)}
        ptGoal={ptGoal}
        setPtGoal={setPtGoal}
        ptNote={ptNote}
        setPtNote={setPtNote}
        membership={membership}
        activeOrders={activeOrders}
        mySessions={mySessions}
        memberScheduleStatus={memberScheduleStatus}
        ptBookingError={ptBookingError}
        isProcessingPtBooking={isProcessingPtBooking}
        onConfirmPtBooking={handleConfirmPtBooking}
      />
    </div>
  );
}

