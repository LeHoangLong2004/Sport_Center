import React from "react";
import { ClassDetailModal } from "./ClassDetailModal";
import { PayAndBookModal } from "./PayAndBookModal";
import { BookingSuccessModal } from "./BookingSuccessModal";
import { CancelBookingModal } from "./CancelBookingModal";
import { PtBookingModal } from "./PtBookingModal";

interface BookingModalsProps {
  selectedClassDetail: any | null;
  onCloseClassDetail: () => void;
  isBooked: boolean;
  onInitiateBook: (classItem: any) => void;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;

  classToBook: any | null;
  onCloseClassToBook: () => void;
  paymentMethod: "qr" | "card" | "counter";
  setPaymentMethod: (m: "qr" | "card" | "counter") => void;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onConfirmPayment: () => void;

  bookingSuccessInfo: any | null;
  onCloseSuccessModal: () => void;
  onViewMyClasses: () => void;

  cancelTarget: { classId: string; className: string } | null;
  onCloseCancelModal: () => void;
  onConfirmCancel: (classId: string) => void;

  bookingPtSlot: any | null;
  onClosePtBookingModal: () => void;
  ptGoal: string;
  setPtGoal: (goal: string) => void;
  ptNote: string;
  setPtNote: (note: string) => void;
  onConfirmPtBooking: (e: React.FormEvent) => void;
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
  bookingPtSlot,
  onClosePtBookingModal,
  ptGoal,
  setPtGoal,
  ptNote,
  setPtNote,
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
      />

      <PayAndBookModal
        classToBook={classToBook}
        onClose={onCloseClassToBook}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isProcessingPayment={isProcessingPayment}
        paymentError={paymentError}
        onConfirmPayment={onConfirmPayment}
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
      />

      <PtBookingModal
        bookingPtSlot={bookingPtSlot}
        onClose={onClosePtBookingModal}
        ptGoal={ptGoal}
        setPtGoal={setPtGoal}
        ptNote={ptNote}
        setPtNote={setPtNote}
        onConfirmPtBooking={onConfirmPtBooking}
      />
    </>
  );
}
