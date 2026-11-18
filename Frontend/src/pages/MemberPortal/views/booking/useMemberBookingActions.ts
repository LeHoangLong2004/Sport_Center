import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MemberAPI } from "../../services/api";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../../services/walletService";
import { PackageAPI, getMembershipStatus, type MembershipStatus } from "../../../../services/packageApi";
import { parseScheduleTime } from "../../../../utils/scheduleTimeHelper";
import {
  type BookingFeedback,
  type CancelBookingTarget,
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
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "counter" | "wallet">("wallet");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [bookingSuccessInfo, setBookingSuccessInfo] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CancelBookingTarget | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingPtSlot, setBookingPtSlot] = useState<any | null>(null);
  const [ptGoal, setPtGoal] = useState(() => {
    try {
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      if (userStr) {
        const u = JSON.parse(userStr);
        return u.fitnessGoal || u.goal || "Rèn luyện thể lực";
      }
    } catch {}
    return "Rèn luyện thể lực";
  });
  const [ptNote, setPtNote] = useState("");
  const [feedback, setFeedback] = useState<BookingFeedback | null>(null);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      PackageAPI.getMyOrders().catch(() => []),
      PackageAPI.getPackages().catch(() => []),
    ]).then(([orders, catalog]) => {
      if (!cancelled) {
        setMembership(getMembershipStatus(orders, catalog));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showFeedback = (message: string, type: BookingFeedback["type"] = "success") => {
    setFeedback({ message, type });
    window.setTimeout(() => setFeedback(null), 4000);
  };

  const handleInitiateBookClass = (classItem: any) => {
    if (isBooked(classItem.id, classItem.dateStr)) {
      showFeedback(`Bạn đã đăng ký lớp "${classItem.name}" rồi.`, "error");
      return;
    }

    const now = Date.now();
    let classStartMs: number | null = null;
    if (classItem.dateStr && classItem.startTime) {
      let datePart = classItem.dateStr;
      if (datePart.includes("/")) {
        const [d, m, y] = datePart.split("/");
        datePart = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      const [h, min] = classItem.startTime.split(":").map(Number);
      const [y, mon, d] = datePart.split("-").map(Number);
      if (!isNaN(y) && !isNaN(mon) && !isNaN(d) && !isNaN(h) && !isNaN(min)) {
        classStartMs = new Date(y, mon - 1, d, h, min, 0).getTime();
      }
    }
    if (classStartMs === null && classItem.scheduleTime) {
      classStartMs = parseScheduleTime(classItem.scheduleTime).getTime();
    }

    if (classStartMs !== null) {
      // 1. Ràng buộc thời gian: Chỉ cần trước giờ học (chưa bắt đầu)
      if (classStartMs <= now) {
        const msg = "Không thể đặt chỗ. Lớp học đã bắt đầu hoặc đã kết thúc.";
        showFeedback(msg, "error");
        toast.error(msg);
        return;
      }

      // 2. Ràng buộc thời gian tối đa theo Hạng thành viên (Cơ bản: 24h, Plus: 72h, Premium: 120h)
      const advanceHours =
        membership?.bookingAdvanceHours && membership.bookingAdvanceHours > 0
          ? membership.bookingAdvanceHours
          : membership?.tier === "premium"
          ? 120
          : membership?.tier === "plus"
          ? 72
          : 24;

      if (classStartMs - now > advanceHours * 3600 * 1000) {
        const tierName =
          membership?.name ||
          (membership?.tier === "premium" ? "Premium" : membership?.tier === "plus" ? "Plus" : "Cơ bản");
        const advanceText =
          advanceHours >= 24 ? `${Math.round(advanceHours / 24)} ngày (${advanceHours} giờ)` : `${advanceHours} giờ`;
        const msg = `Lớp học này chưa mở đặt chỗ cho hạng của bạn (Hạng ${tierName} chỉ được đặt trước tối đa ${advanceText}). Hãy nâng cấp hạng để đặt lịch sớm hơn!`;
        showFeedback(msg, "error");
        toast.error(msg);
        return;
      }
    }

    setPaymentError(null);
    setClassToBook(classItem);
    setSelectedClassDetail(null);
  };

  const handleConfirmPaymentAndBook = async (customAmount?: number) => {
    if (!classToBook) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    const paidAmount = customAmount ?? (classToBook.price ?? 150000);
    const effectivePaymentMethod = paidAmount === 0 ? "package" : paymentMethod;

    try {
      const response = await MemberAPI.payAndBookClass(
        classToBook.id,
        effectivePaymentMethod,
        paidAmount
      );

      if (effectivePaymentMethod === "counter") addCounterPendingId(classToBook.id);

      setBookingSuccessInfo({
        classItem: classToBook,
        paidAmount,
        paymentMethod: effectivePaymentMethod,
        invoiceId: response?.invoiceId || `INV-${Date.now().toString().slice(-6)}`,
        bookingStatus: effectivePaymentMethod === "counter" ? "pending" : "confirmed",
      });

      // Bắn sự kiện cập nhật ví khi thanh toán thành công
      try {
        window.dispatchEvent(new Event("wallet_updated"));
        window.dispatchEvent(new Event(MEMBER_WALLET_UPDATED_EVENT));
      } catch { }

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
      const errorMsg = error?.message || "Không thể hoàn tất thanh toán và đặt lớp. Vui lòng thử lại.";
      setPaymentError(errorMsg);
      showFeedback(errorMsg, "error");
      toast.error(errorMsg);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    setIsCancelling(true);
    try {
      const res: any = await MemberAPI.cancelClassBooking(classId);
      removeCounterPendingId(classId);
      setGroupClasses((classes) =>
        classes.map((c) =>
          c.id === classId
            ? { ...c, registeredCount: Math.max(0, c.registeredCount - 1), availableSpots: Math.min(c.capacity, c.availableSpots + 1) }
            : c
        )
      );
      setMySessions((sessions) =>
        sessions.map((s) => {
          const matches = String((s as any).classId ?? s.id).toLowerCase() === String(classId).toLowerCase();
          return matches ? { ...s, status: "đã hủy" as any, bookingStatus: "cancelled" } : s;
        })
      );
      void loadGroupClasses(true);
      setSelectedClassDetail(null);
      setCancelTarget(null);

      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "ORDER_CREATED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch { }

      // Cập nhật và phát event số dư ví hội viên được hoàn tiền tức thì
      if (res?.refunded && typeof res?.newBalance === "number") {
        window.dispatchEvent(
          new CustomEvent(MEMBER_WALLET_UPDATED_EVENT, { detail: { balance: res.newBalance } })
        );
      } else {
        void WalletService.getWallet(undefined, true).then((w) => {
          if (typeof w?.balance === "number") {
            window.dispatchEvent(
              new CustomEvent(MEMBER_WALLET_UPDATED_EVENT, { detail: { balance: w.balance } })
            );
          }
        });
      }

      const successMsg = res?.message || "Đã hủy đặt lớp thành công.";
      showFeedback(successMsg);
      toast.success(successMsg);
    } catch (error: any) {
      setCancelTarget(null);
      void loadGroupClasses(true);
      const errorMsg = error?.message || "Không thể hủy đặt lớp.";
      showFeedback(errorMsg, "error");
      toast.error(errorMsg);
    } finally {
      setIsCancelling(false);
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
    isCancelling,
    bookingPtSlot,
    setBookingPtSlot,
    ptGoal,
    setPtGoal,
    ptNote,
    setPtNote,
    membership,
    feedback,
    setFeedback,
    showFeedback,
    handleInitiateBookClass,
    handleConfirmPaymentAndBook,
    handleCancelBooking,
    handleConfirmPtBooking,
  };
}
