import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Clock } from "lucide-react";
import type { UnifiedScheduleItem } from "./types";
import { DateInput } from "../../../../components/DateInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: UnifiedScheduleItem) => void | Promise<void>;
  sportOptions: string[];
  roomOptions: string[];
}

export default function OpenPtSlotModal({ isOpen, onClose, onSuccess, sportOptions, roomOptions }: Props) {
  const [openSlotDate, setOpenSlotDate] = useState("");
  const [openSlotStartTime, setOpenSlotStartTime] = useState("08:00");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("09:00");
  const [timeError, setTimeError] = useState("");
  const [openSlotSport, setOpenSlotSport] = useState("");
  const [openSlotRoom, setOpenSlotRoom] = useState("");
  const [openSlotNote, setOpenSlotNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedSport = openSlotSport || sportOptions[0] || "";
  const selectedRoom = openSlotRoom || roomOptions[0] || "";

  const handleStartTimeChange = (newStart: string) => {
    setOpenSlotStartTime(newStart);
    if (!newStart) return;

    let targetEnd = openSlotEndTime;
    // Tự động gợi ý giờ kết thúc là +1 tiếng nếu chưa có hoặc giờ kết thúc đang trước giờ bắt đầu
    if (!targetEnd || targetEnd <= newStart) {
      const [h, m] = newStart.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const endH = (h + 1) % 24;
        targetEnd = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        setOpenSlotEndTime(targetEnd);
      }
    }

    if (targetEnd && newStart >= targetEnd) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu.");
    } else {
      setTimeError("");
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setOpenSlotEndTime(newEnd);
    if (openSlotStartTime && newEnd && openSlotStartTime >= newEnd) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu.");
    } else {
      setTimeError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSlotDate) {
      setError("Vui lòng chọn ngày mở ca trống.");
      return;
    }
    if (!openSlotStartTime || !openSlotEndTime) {
      setError("Vui lòng nhập đầy đủ giờ bắt đầu và giờ kết thúc.");
      return;
    }
    if (openSlotStartTime >= openSlotEndTime) {
      setError("Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }
    setError("");

    const newItem: UnifiedScheduleItem = {
      id: "custom-open-" + Date.now(),
      type: "open_pt",
      className: `Lịch trống 1–1: ${selectedSport}`,
      sport: selectedSport,
      level: "1-1 PT",
      date: openSlotDate,
      startTime: openSlotStartTime,
      endTime: openSlotEndTime,
      room: selectedRoom,
      coachName: "HLV",
      registeredCount: 0,
      capacity: 1,
      status: "sắp diễn ra",
      note: openSlotNote,
    };

    setSubmitting(true);
    try {
      await onSuccess(newItem);
      setOpenSlotNote("");
      onClose();
    } catch (submitError: any) {
      setError(submitError?.message || "Không thể đăng lịch trống. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Ngày mở ca trống: <span className="text-rose-500">*</span>
              </label>
              <DateInput
                required
                value={openSlotDate}
                onChange={setOpenSlotDate}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Khung giờ mở nhận học viên: <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Giờ bắt đầu:
                  </span>
                  <input
                    type="time"
                    required
                    value={openSlotStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                    Giờ kết thúc:
                  </span>
                  <input
                    type="time"
                    required
                    value={openSlotEndTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>
              {timeError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{timeError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Bộ môn nhận dạy:
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setOpenSlotSport(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {sportOptions.length === 0 ? (
                    <option value="">Chưa được phân công môn</option>
                  ) : (
                    sportOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  )}
                </select>
                {sportOptions.length === 0 && (
                  <p className="mt-1 text-[11px] text-slate-600 font-medium">Bạn chưa được Quản lý phân công môn nào để đăng lịch 1–1.</p>
                )}
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phòng / Khu vực:
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setOpenSlotRoom(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {roomOptions.map((r) => (
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
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !!timeError}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {submitting ? "Đang kiểm tra..." : "Đăng lịch trống"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
