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

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

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
    loadingGroupClasses,
    refreshingGroupClasses,
    groupClassesError,
    loadGroupClasses,
    getBookingStatus,
    isInactiveBookingStatus,
    findActiveBooking,
    isBooked,
    myActiveClasses,
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
    bookingPtSlot,
    setBookingPtSlot,
    ptGoal,
    setPtGoal,
    ptNote,
    setPtNote,
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

  const handleStartChatWithCoach = (coachName: string, coachId?: string, coachAvatar?: string) => {
    try {
      localStorage.setItem("chat_target_coach", JSON.stringify({ coachId: coachId || "", coachName, coachAvatar: coachAvatar || "" }));
    } catch { }
    if (bookingSuccessInfo) setBookingSuccessInfo(null);
    if (selectedClassDetail) setSelectedClassDetail(null);
    onNavigate("chat");
  };

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
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className={feedback.type === "error" ? "text-rose-600" : "text-emerald-600"}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner & 3-Tabs & Coach Carousel */}
      <BookingHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        groupClassesCount={groupClasses.length}
        ptSlotsCount={ptSlots.length}
        myActiveClassesCount={myActiveClasses.length}
        coaches={coaches}
        selectedCoachId={selectedCoachId}
        setSelectedCoachId={setSelectedCoachId}
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
      />

      {/* TAB 1: GROUP CLASSES */}
      {activeTab === "group" && (
        <GroupClassesTab
          loading={loadingGroupClasses}
          error={groupClassesError}
          refreshing={refreshingGroupClasses}
          classes={filteredGroupClasses}
          mySessions={mySessions}
          onRetry={() => void loadGroupClasses()}
          onOpenDetail={setSelectedClassDetail}
          onInitiateBook={handleInitiateBookClass}
          onCancelBooking={setCancelTarget}
          findActiveBooking={findActiveBooking}
          getBookingStatus={getBookingStatus}
          isInactiveBookingStatus={isInactiveBookingStatus}
        />
      )}

      {/* TAB 2: PT 1-1 */}
      {activeTab === "pt" && <PtSlotsTab slots={filteredPtSlots} onBookPtSlot={setBookingPtSlot} />}

      {/* TAB 3: MY CLASSES */}
      {activeTab === "my_classes" && (
        <MyClassesTab
          myActiveClasses={myActiveClasses}
          getBookingStatus={getBookingStatus}
          onStartChatWithCoach={handleStartChatWithCoach}
          onCancelBooking={setCancelTarget}
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
        bookingPtSlot={bookingPtSlot}
        onClosePtBookingModal={() => setBookingPtSlot(null)}
        ptGoal={ptGoal}
        setPtGoal={setPtGoal}
        ptNote={ptNote}
        setPtNote={setPtNote}
        onConfirmPtBooking={handleConfirmPtBooking}
      />
    </div>
  );
}
