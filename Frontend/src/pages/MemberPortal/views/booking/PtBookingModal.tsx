import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface PtBookingModalProps {
  bookingPtSlot: any | null;
  onClose: () => void;
  ptGoal: string;
  setPtGoal: (goal: string) => void;
  ptNote: string;
  setPtNote: (note: string) => void;
  onConfirmPtBooking: (e: React.FormEvent) => void;
}

export const PtBookingModal: React.FC<PtBookingModalProps> = ({
  bookingPtSlot,
  onClose,
  ptGoal,
  setPtGoal,
  ptNote,
  setPtNote,
  onConfirmPtBooking
}) => {
  if (!bookingPtSlot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onConfirmPtBooking} className="flex-1 flex flex-col overflow-hidden">
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
              onClick={onClose}
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
  );
};
