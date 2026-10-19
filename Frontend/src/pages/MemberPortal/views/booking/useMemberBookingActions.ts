import { useState } from "react";
import { MemberAPI } from "../../services/api";
import {
  type BookingFeedback,
  addCounterPendingId,
  removeCounterPendingId,
} from "./bookingTypes";

interface UseMemberBookingActionsProps {
  loadGroupClasses: (silent?: boolean) => Promise<void>;
  setGroupClasses: React.Dispatch<React.SetStateAction<any[]>>;
  setMySessions: React.Dispatch<React.SetStateAction<any[]>>;
  setPtSlots: React.Dispatch<React.SetStateAction<any[]>>;
  isBooked: (classId: string, date: string) => boolean;
}

export function useMemberBookingActions({
  loadGroupClasses,
  setGroupClasses,
  setMySessions,
  setPtSlots,
  isBooked,
}: UseMemberBookingActionsProps) {
  const [selectedClassDetail, setSelectedClassDetail] = useState<any | null>(null);
  const [classToBook, setClassToBook] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card" | "counter">("qr");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ classId: string; className: string } | null>(null);
  const [bookingPtSlot, setBookingPtSlot] = useState<any | null>(null);
  const [ptGoal, setPtGoal] = useState("Tăng cơ & Siết nét");
  const [ptNote, setPtNote] = useState("");
  const [feedback, setFeedback] = useState<BookingFeedback | null>(null);

  const showFeedback = (message: string, type: BookingFeedback["type"] = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const handleInitiateBookClass = (classItem: any) => {
    if (isBooked(classItem.id, classItem.dateStr)) {
      showFeedback(`Bạn đã đăng ký lớp "${classItem.name}" rồi.`, "error");
      return;
    }
    setPaymentError(null);
    setClassToBook(classItem);
    setSelectedClassDetail(null);
  };

  const handleConfirmPaymentAndBook = async () => {
    if (!classToBook) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const response = await MemberAPI.payAndBookClass(
        classToBook.id,
        paymentMethod,
        classToBook.price || 150000
      );

      if (paymentMethod === "counter") addCounterPendingId(classToBook.id);

      setBookingSuccessInfo({
        classItem: classToBook,
        paidAmount: classToBook.price || 150000,
        paymentMethod,
        invoiceId: response?.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
        bookingStatus: paymentMethod === "counter" ? "pending" : "confirmed",
      });

      if (classToBook.coachName) {
        try {
          const userStr = localStorage.getItem("user");
          const currentUser = userStr ? JSON.parse(userStr) : null;
          const memberId = currentUser?.id || "";
          const memberName = currentUser?.fullName || currentUser?.name || "Hội viên";

          void MemberAPI.startConversation({
            targetId: classToBook.coachId || classToBook.coachName,
            targetName: classToBook.coachName,
            role: "coach",
            memberId,
            memberName,
            avatar: classToBook.coachAvatar || "",
            subtitle: `HLV phụ trách lớp ${classToBook.name}`,
          });
        } catch { }
      }

      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "ORDER_CREATED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch { }

      setClassToBook(null);
      void loadGroupClasses(true);
    } catch (error: any) {
      setPaymentError(error?.message || "Không thể hoàn tất thanh toán và đặt lớp. Vui lòng thử lại.");
      showFeedback(error?.message || "Không thể hoàn tất thanh toán và đặt lớp. Vui lòng thử lại.", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    setCancelTarget(null);
    try {
      await MemberAPI.cancelClassBooking(classId);
      removeCounterPendingId(classId);
      setGroupClasses((classes) =>
        classes.map((c) =>
          c.id === classId
            ? { ...c, registeredCount: Math.max(0, c.registeredCount - 1), availableSpots: Math.min(c.capacity, c.availableSpots + 1) }
            : c
        )
      );
      setMySessions((sessions) =>
        sessions.map((s) => ((s as any).classId === classId ? { ...s, status: "đã hủy" as any, bookingStatus: "cancelled" } : s))
      );
      void loadGroupClasses(true);
      setSelectedClassDetail(null);
      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "ORDER_CREATED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch { }
      showFeedback("Đã hủy đặt lớp thành công.");
    } catch (error: any) {
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

      if (bookingPtSlot.coachName) {
        try {
          const userStr = localStorage.getItem("user");
          const currentUser = userStr ? JSON.parse(userStr) : null;
          const memberId = currentUser?.id || "";
          const memberName = currentUser?.fullName || currentUser?.name || "Hội viên";

          void MemberAPI.startConversation({
            targetId: bookingPtSlot.coachId || bookingPtSlot.coachName,
            targetName: bookingPtSlot.coachName,
            role: "coach",
            memberId,
            memberName,
            avatar: bookingPtSlot.coachAvatar || "",
            subtitle: `HLV kèm riêng 1-1 môn ${bookingPtSlot.sport}`,
          });
        } catch { }
      }

      setPtSlots((slots) => slots.filter((s) => s.id !== bookingPtSlot.id));
      setBookingPtSlot(null);
      setPtNote("");
      showFeedback("Đã đặt lịch kèm riêng 1–1 thành công.");
      void loadGroupClasses(true);
    } catch (error: any) {
      showFeedback(error?.message || "Không thể đặt lịch kèm riêng 1–1.", "error");
    }
  };

  return {
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
    showFeedback,
    handleInitiateBookClass,
    handleConfirmPaymentAndBook,
    handleCancelBooking,
    handleConfirmPtBooking,
  };
}
