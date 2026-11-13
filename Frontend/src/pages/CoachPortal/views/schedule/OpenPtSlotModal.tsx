import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { UnifiedScheduleItem } from "./types";
import { DateInput } from "../../../../components/DateInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: UnifiedScheduleItem) => void | Promise<void>;
  sportOptions: string[];
  roomOptions: string[];
  initialDate?: string;
  initialStartTime?: string;
  existingSessions?: UnifiedScheduleItem[];
}

function toMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function OpenPtSlotModal({
  isOpen,
  onClose,
  onSuccess,
  sportOptions,
  roomOptions,
  initialDate,
  initialStartTime,
  existingSessions = [],
}: Props) {
  const [openSlotDate, setOpenSlotDate] = useState("");
  const [openSlotStartTime, setOpenSlotStartTime] = useState("08:00");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("09:00");
  const [timeError, setTimeError] = useState("");
  const [openSlotSport, setOpenSlotSport] = useState("");
  const [openSlotRoom, setOpenSlotRoom] = useState("");
  const [openSlotNote, setOpenSlotNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const todayStr = getTodayString();
      const targetDate = initialDate || todayStr;
      setOpenSlotDate(targetDate);

      let start = "08:00";
      if (initialStartTime) {
        start = initialStartTime;
      } else if (targetDate === todayStr) {
        const now = new Date();
        const nextHour = Math.min(21, now.getHours() + 1);
        start = `${String(nextHour).padStart(2, "0")}:00`;
      }
      setOpenSlotStartTime(start);

      // Auto suggest end time + 1h
      const [h, m] = start.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const endH = (h + 1) % 24;
        setOpenSlotEndTime(`${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      } else {
        setOpenSlotEndTime("09:00");
      }

      setTimeError("");
      setError("");
    }
  }, [isOpen, initialDate, initialStartTime]);

  const handleStartTimeChange = (newStart: string) => {
    setOpenSlotStartTime(newStart);
    if (!newStart) return;

    let targetEnd = openSlotEndTime;
    // Tự động gợi ý giờ kết thúc là +1 tiếng nếu chưa có hoặc giờ kết thúc đang trước/bằng giờ bắt đầu
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

  // Kiểm tra khung giờ trong quá khứ
  const isPastTime = useMemo(() => {
    if (!openSlotDate || !openSlotStartTime) return false;
    const todayStr = getTodayString();
    if (openSlotDate < todayStr) return true;
    if (openSlotDate === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = toMinutes(openSlotStartTime);
      return startMinutes <= currentMinutes;
    }
    return false;
  }, [openSlotDate, openSlotStartTime]);

  // KIỂM TRA TRÙNG LỊCH:
  // Ca rảnh 1-1 chỉ được đăng khi không trùng với bất kỳ ca lớp nhóm, ca PT hoặc ca rảnh nào khác
  const conflictSession = useMemo(() => {
    if (!openSlotDate || !openSlotStartTime || !openSlotEndTime || !existingSessions.length) return null;
    const newStart = toMinutes(openSlotStartTime);
    const newEnd = toMinutes(openSlotEndTime);
    if (newEnd <= newStart) return null;

    return existingSessions.find((s) => {
      if (s.date !== openSlotDate) return false;
      if (s.status === "đã hủy") return false;

      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      // Hai khoảng thời gian giao nhau: newStart < sEnd && newEnd > sStart
      return newStart < sEnd && newEnd > sStart;
    });
  }, [openSlotDate, openSlotStartTime, openSlotEndTime, existingSessions]);

  if (!isOpen) return null;

  const defaultRooms = ["Khu tập PT 1-1 / Sàn chính", "Phòng tập chức năng", "Khu vực Boxing", "Bể bơi 4 mùa"];
  const availableRooms = roomOptions.length > 0 ? roomOptions : defaultRooms;
  const selectedSport = openSlotSport || sportOptions[0] || "Gym & Thể lực";
  const selectedRoom = openSlotRoom || availableRooms[0] || "Khu tập PT 1-1";

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

    if (isPastTime) {
      setError("Không thể đăng lịch trống trong quá khứ. Vui lòng chọn ngày hoặc khung giờ sau thời điểm hiện tại.");
      return;
    }

    if (conflictSession) {
      setError(
        `Không thể đăng lịch vì trùng với ca "${conflictSession.className}" (${conflictSession.startTime} – ${conflictSession.endTime}). Vui lòng chọn khung giờ khác.`
      );
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Đăng lịch dạy 1–1 (Mở ca rảnh nhận HV)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đăng ký khung giờ bạn đang rảnh để học viên có thể đặt lịch kèm riêng 1–1.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Ngày mở ca rảnh: <span className="text-rose-500">*</span>
              </label>
              <DateInput
                required
                value={openSlotDate}
                onChange={setOpenSlotDate}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Khung giờ mở nhận học viên: <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    Giờ bắt đầu:
                  </span>
                  <input
                    type="time"
                    required
                    value={openSlotStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1 font-medium">
                    Giờ kết thúc:
                  </span>
                  <input
                    type="time"
                    required
                    value={openSlotEndTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              {timeError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{timeError}</p>
              )}
            </div>

            {/* CẢNH BÁO TRÙNG LỊCH HOẶC QUÁ KHỨ */}
            {conflictSession ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 dark:border-amber-800/80 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">Khung giờ này đã bị trùng với ca dạy khác!</p>
                  <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
                    Bạn đã có lịch <span className="font-bold">"{conflictSession.className}"</span> ({conflictSession.startTime} – {conflictSession.endTime}) tại {conflictSession.room}.
                  </p>
                  <p className="text-[11px] mt-1 text-amber-700 dark:text-amber-400 font-medium">
                    👉 HLV vui lòng chọn khung giờ rảnh khác để không bị trùng ca dạy.
                  </p>
                </div>
              </div>
            ) : isPastTime ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50/90 dark:border-amber-800/80 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-xs">Khung giờ này đã qua trong quá khứ!</p>
                  <p className="text-[11px] mt-0.5 text-amber-800 dark:text-amber-300">
                    Backend quy định không thể mở ca rảnh trong quá khứ.
                  </p>
                  <p className="text-[11px] mt-1 text-amber-700 dark:text-amber-400 font-medium">
                    👉 HLV vui lòng chọn ngày mai hoặc khung giờ sau thời điểm hiện tại.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/20 p-2.5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Khung giờ rảnh hợp lệ (Không trùng ca dạy nào).
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Bộ môn nhận dạy:
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setOpenSlotSport(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
                >
                  {sportOptions.length === 0 ? (
                    <option value="Gym & Thể lực">Gym & Thể lực (Mặc định)</option>
                  ) : (
                    sportOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phòng / Khu vực tập:
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setOpenSlotRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Ghi chú / Thông điệp gửi học viên:
              </label>
              <textarea
                rows={2}
                placeholder="VD: Nhận kèm cá nhân tập trung siết cơ, cải thiện thể lực hoặc phục hồi chức năng..."
                value={openSlotNote}
                onChange={(e) => setOpenSlotNote(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !openSlotDate ||
                !openSlotStartTime ||
                !openSlotEndTime ||
                !openSlotSport ||
                !openSlotRoom ||
                Boolean(conflictSession) ||
                isPastTime ||
                Boolean(timeError)
              }
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {submitting
                ? "Đang xử lý..."
                : conflictSession
                ? "Bị trùng ca dạy khác"
                : isPastTime
                ? "Khung giờ trong quá khứ"
                : timeError
                ? "Giờ không hợp lệ"
                : "Đăng lịch rảnh 1–1"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
