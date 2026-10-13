import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TIME_ROWS, type UnifiedScheduleItem } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: UnifiedScheduleItem) => void;
}

export default function OpenPtSlotModal({ isOpen, onClose, onSuccess }: Props) {
  const [openSlotDate, setOpenSlotDate] = useState("");
  const [openSlotStartTime, setOpenSlotStartTime] = useState("08:00");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("09:30");
  const [openSlotSport, setOpenSlotSport] = useState("Gym");
  const [openSlotRoom, setOpenSlotRoom] = useState("Khu PT 1-1");
  const [openSlotNote, setOpenSlotNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSlotDate) return;

    const newItem: UnifiedScheduleItem = {
      id: "custom-open-" + Date.now(),
      type: "open_pt",
      className: `Lịch trống 1–1: ${openSlotSport}`,
      sport: openSlotSport,
      level: "1-1 PT",
      date: openSlotDate,
      startTime: openSlotStartTime,
      endTime: openSlotEndTime,
      room: openSlotRoom,
      coachName: "HLV",
      registeredCount: 0,
      capacity: 1,
      status: "sắp diễn ra",
      note: openSlotNote,
    };

    onSuccess(newItem);
    setOpenSlotNote("");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Đăng lịch trống 1–1 (Mở nhận HV)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Ngày mở ca trống: <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={openSlotDate}
                onChange={(e) => setOpenSlotDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Giờ bắt đầu:
                </label>
                <select
                  value={openSlotStartTime}
                  onChange={(e) => setOpenSlotStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {TIME_ROWS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Giờ kết thúc:
                </label>
                <select
                  value={openSlotEndTime}
                  onChange={(e) => setOpenSlotEndTime(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {["07:30", "08:30", "09:30", "10:30", "15:30", "16:30", "18:30", "19:30", "20:30"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Bộ môn nhận dạy:
                </label>
                <select
                  value={openSlotSport}
                  onChange={(e) => setOpenSlotSport(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {["Gym", "Boxing", "Yoga", "Swimming", "Pilates", "Zumba", "Fitness"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phòng / Khu vực:
                </label>
                <select
                  value={openSlotRoom}
                  onChange={(e) => setOpenSlotRoom(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {["Khu PT 1-1", "Võ Đài", "Studio 1", "Studio 2", "Hồ Bơi", "Khu Thể Lực", "Khu Tạ Tự Do"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Ghi chú / Thông điệp gửi học viên:
              </label>
              <textarea
                rows={3}
                placeholder="VD: Nhận kèm cá nhân tập trung siết cơ, giảm mỡ nhanh hoặc cải thiện thể lực..."
                value={openSlotNote}
                onChange={(e) => setOpenSlotNote(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
            >
              Đăng lịch trống
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
