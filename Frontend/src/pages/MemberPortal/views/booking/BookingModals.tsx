import React from "react";
import { ClassDetailModal } from "./ClassDetailModal";
import { PayAndBookModal } from "./PayAndBookModal";
import { BookingSuccessModal } from "./BookingSuccessModal";
import { CancelBookingModal } from "./CancelBookingModal";
import { PtBookingModal } from "./PtBookingModal";
import type { CancelBookingTarget } from "./bookingTypes";

interface BookingModalsProps {
  selectedClassDetail: any | null;
  onCloseClassDetail: () => void;
  isBooked: boolean;
  onInitiateBook: (classItem: any) => void;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;

  classToBook: any | null;
  onCloseClassToBook: () => void;
  paymentMethod: "qr" | "counter" | "wallet";
  setPaymentMethod: (m: "qr" | "counter" | "wallet") => void;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onConfirmPayment: (amount?: number, paymentMemo?: string) => void;

  bookingSuccessInfo: any | null;
  onCloseSuccessModal: () => void;
  onViewMyClasses: () => void;

  cancelTarget: CancelBookingTarget | null;
  onCloseCancelModal: () => void;
  onConfirmCancel: (classId: string, type?: "class" | "pt") => void;
  isCancelling?: boolean;

  bookingPtSlot: any | null;
  onClosePtBookingModal: () => void;
  ptGoal: string;
  setPtGoal: (goal: string) => void;
  ptNote: string;
  setPtNote: (note: string) => void;
  membership?: any | null;
  activeOrders?: any[];
  mySessions?: any[];
  ptBookingError?: string | null;
  isProcessingPtBooking?: boolean;
  onConfirmPtBooking: (e: React.FormEvent, paymentData?: any) => void;
}

export function BookingModals({
  selectedClassDetail,
  onCloseClassDetail,
  isBooked,
  onInitiateBook,
  onStartChatWithCoach,
  classToBook,
  onCloseClassToBook,
  paymentMethod,
  setPaymentMethod,
  isProcessingPayment,
  paymentError,
  onConfirmPayment,
  bookingSuccessInfo,
  onCloseSuccessModal,
  onViewMyClasses,
  cancelTarget,
  onCloseCancelModal,
  onConfirmCancel,
  isCancelling,
  bookingPtSlot,
  onClosePtBookingModal,
  ptGoal,
  setPtGoal,
  ptNote,
  setPtNote,
  membership,
  activeOrders,
  mySessions,
  ptBookingError,
  isProcessingPtBooking,
  onConfirmPtBooking,
}: BookingModalsProps) {
  return (
    <>
      <ClassDetailModal
        classDetail={selectedClassDetail}
        onClose={onCloseClassDetail}
        isBooked={isBooked}
        onInitiateBook={onInitiateBook}
        onStartChatWithCoach={onStartChatWithCoach}
        mySessions={mySessions}
      />

      <PayAndBookModal
        classToBook={classToBook}
        onClose={onCloseClassToBook}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isProcessingPayment={isProcessingPayment}
        paymentError={paymentError}
        onConfirmPayment={onConfirmPayment}
        mySessions={mySessions}
      />

      <BookingSuccessModal
        bookingSuccessInfo={bookingSuccessInfo}
        onClose={onCloseSuccessModal}
        onViewMyClasses={onViewMyClasses}
        onStartChatWithCoach={onStartChatWithCoach}
      />

      <CancelBookingModal
        cancelTarget={cancelTarget}
        onClose={onCloseCancelModal}
        onConfirmCancel={onConfirmCancel}
        isCancelling={isCancelling}
        membership={membership}
      />

      <PtBookingModal
        bookingPtSlot={bookingPtSlot}
        onClose={onClosePtBookingModal}
        ptGoal={ptGoal}
        setPtGoal={setPtGoal}
        ptNote={ptNote}
        setPtNote={setPtNote}
        membership={membership}
        activeOrders={activeOrders}
        mySessions={mySessions}
        ptBookingError={ptBookingError}
        isProcessingPtBooking={isProcessingPtBooking}
        onConfirmPtBooking={onConfirmPtBooking}
      />
    </>
  );
}
