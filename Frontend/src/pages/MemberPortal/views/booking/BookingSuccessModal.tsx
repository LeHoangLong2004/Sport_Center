import React from "react";
import { createPortal } from "react-dom";
import { BookingSuccessBanner } from "./bookingSuccess/BookingSuccessBanner";
import { BookingClassSummary } from "./bookingSuccess/BookingClassSummary";
import { BookingCoachCard } from "./bookingSuccess/BookingCoachCard";

interface BookingSuccessModalProps {
  bookingSuccessInfo: any | null;
  onClose: () => void;
  onViewMyClasses: () => void;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  bookingSuccessInfo,
  onClose,
  onViewMyClasses,
  onStartChatWithCoach,
}) => {
  if (!bookingSuccessInfo) return null;

  const isCounter = bookingSuccessInfo.paymentMethod === "counter";

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Banner */}
        <BookingSuccessBanner paymentMethod={bookingSuccessInfo.paymentMethod} />

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <BookingClassSummary info={bookingSuccessInfo} />
          <BookingCoachCard
            coach={bookingSuccessInfo.classItem}
            onStartChatWithCoach={onStartChatWithCoach}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onViewMyClasses}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors shadow-sm text-white cursor-pointer ${
              isCounter
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isCounter ? "Xem lớp đang giữ chỗ →" : "Xem lớp đã đăng ký →"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
