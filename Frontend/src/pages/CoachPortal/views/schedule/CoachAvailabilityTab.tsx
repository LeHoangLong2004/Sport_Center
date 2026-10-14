import { Clock, User } from "lucide-react";
import type { AvailabilitySlot } from "../../services/api";
import { DAYS_NAMES } from "./types";

interface Props {
  availabilitySlots: AvailabilitySlot[];
  onToggleSlot: (slotId: string) => void;
}

export default function CoachAvailabilityTab({
  availabilitySlots,
  onToggleSlot,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Khung giờ nhận dạy kèm 1–1 (Personal Trainer)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Bật các khung giờ bạn có thể nhận học viên. Học viên sẽ dựa trên lịch này để đặt lịch hẹn cá nhân trực tiếp.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {availabilitySlots.map((slot) => {
            const dayName = DAYS_NAMES[slot.dayOfWeek - 1] || `Thứ ${slot.dayOfWeek + 1}`;
            const hasBooking = !!slot.bookedMemberName;
            return (
              <div
                key={slot.id}
                className={`p-5 rounded-xl border transition-all ${
                  hasBooking
                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : slot.isOpen
                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    : "bg-slate-50 dark:bg-slate-850/60 border-slate-200/60 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{dayName}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Ca {slot.period}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      slot.isOpen
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                        : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {slot.isOpen ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mb-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{slot.startTime} – {slot.endTime}</span>
                </div>

                {hasBooking ? (
                  <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                    <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Đã có học viên đặt:
                    </div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {slot.bookedMemberName} — {slot.bookedMemberPhone}
                    </div>
                    {slot.goal && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Mục tiêu: {slot.goal}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {slot.isOpen ? "Sẵn sàng đón nhận học viên mới" : "Không nhận lịch trong khung giờ này"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleSlot(slot.id)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline"
                    >
                      {slot.isOpen ? "Tắt nhận ca" : "Bật nhận ca"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
