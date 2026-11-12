import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TIME_ROWS, type UnifiedScheduleItem } from "./types";
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

// Tính toán thời gian kết thúc hợp lệ theo giờ bắt đầu
function getEndTimeOptions(startTime: string): { time: string; label: string }[] {
  const startTotalMinutes = toMinutes(startTime || "08:00");

  const durations = [
    { mins: 45, desc: "45 phút" },
    { mins: 60, desc: "60 phút (1 giờ)" },
    { mins: 75, desc: "75 phút" },
    { mins: 90, desc: "90 phút (1h30p)" },
    { mins: 120, desc: "120 phút (2 giờ)" },
  ];

  const result: { time: string; label: string }[] = [];
  const addedTimes = new Set<string>();

  for (const d of durations) {
    const endTotal = startTotalMinutes + d.mins;
    if (endTotal <= 23 * 60 + 30) {
      const h = Math.floor(endTotal / 60);
      const m = endTotal % 60;
      const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      if (!addedTimes.has(timeStr)) {
        addedTimes.add(timeStr);
        result.push({ time: timeStr, label: `${timeStr} (${d.desc})` });
      }
    }
  }

  // Thêm các khung giờ chẵn nửa tiếng tiếp theo đến 23:00 nếu chưa có
  for (let mins = startTotalMinutes + 30; mins <= 23 * 60; mins += 30) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    if (!addedTimes.has(timeStr)) {
      addedTimes.add(timeStr);
      result.push({ time: timeStr, label: timeStr });
    }
  }

  return result.sort((a, b) => a.time.localeCompare(b.time));
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
  const [openSlotStartTime, setOpenSlotStartTime] = useState("");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("");
  const [openSlotSport, setOpenSlotSport] = useState("");
  const [openSlotRoom, setOpenSlotRoom] = useState("");
  const [openSlotNote, setOpenSlotNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOpenSlotDate(initialDate || "");
      setOpenSlotStartTime(initialStartTime || "");
      setOpenSlotEndTime("");
      setOpenSlotSport("");
      setOpenSlotRoom("");
      setOpenSlotNote("");
      setError("");
    }
  }, [isOpen, initialDate, initialStartTime]);

  // Sinh danh sách giờ kết thúc động dựa trên giờ bắt đầu đã chọn
  const endTimeOptions = useMemo(() => {
    if (!openSlotStartTime) return [];
    return getEndTimeOptions(openSlotStartTime);
  }, [openSlotStartTime]);

  // Tự động xóa giờ kết thúc nếu không còn nằm trong danh sách lựa chọn
  useEffect(() => {
    if (openSlotEndTime && endTimeOptions.length > 0) {
      const exists = endTimeOptions.some((o) => o.time === openSlotEndTime);
      if (!exists) {
        setOpenSlotEndTime("");
      }
    }
  }, [openSlotStartTime, endTimeOptions, openSlotEndTime]);

  // Kiểm tra khung giờ trong quá khứ (chỉ kiểm tra khi HLV đã chọn ngày và giờ)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSlotDate) {
      setError("Vui lòng chọn hoặc nhập ngày mở ca rảnh.");
      return;
    }

    if (!openSlotStartTime) {
      setError("Vui lòng chọn giờ bắt đầu ca rảnh.");
      return;
    }

    if (!openSlotEndTime) {
      setError("Vui lòng chọn giờ kết thúc ca rảnh.");
      return;
    }

    if (!openSlotSport) {
      setError("Vui lòng chọn bộ môn nhận dạy.");
      return;
    }

    if (!openSlotRoom) {
      setError("Vui lòng chọn phòng / khu vực tập.");
      return;
    }

    if (isPastTime) {
      setError("Không thể đăng lịch rảnh trong quá khứ. Vui lòng chọn ngày hoặc khung giờ sau thời điểm hiện tại.");
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

    setSubmitting(true);
    try {
      await onSuccess(newItem);
      setOpenSlotNote("");
      onClose();
    } catch (submitError: any) {
      setError(submitError?.message || "Không thể đăng lịch rảnh. Vui lòng thử lại.");
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Giờ bắt đầu: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={openSlotStartTime}
                  onChange={(e) => {
                    setOpenSlotStartTime(e.target.value);
                    setOpenSlotEndTime("");
                    setError("");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="">-- Chọn giờ bắt đầu --</option>
                  {TIME_ROWS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Giờ kết thúc: <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={!openSlotStartTime}
                  value={openSlotEndTime}
                  onChange={(e) => {
                    setOpenSlotEndTime(e.target.value);
                    setError("");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {openSlotStartTime ? "-- Chọn giờ kết thúc --" : "-- Chọn giờ bắt đầu trước --"}
                  </option>
                  {endTimeOptions.map((opt) => (
                    <option key={opt.time} value={opt.time}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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
            ) : openSlotDate && openSlotStartTime && openSlotEndTime ? (
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/20 p-2.5 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Khung giờ rảnh hợp lệ (Không trùng ca dạy nào).
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Bộ môn nhận dạy: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={openSlotSport}
                  onChange={(e) => {
                    setOpenSlotSport(e.target.value);
                    setError("");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
                >
                  <option value="">-- Chọn bộ môn --</option>
                  {sportOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Phòng / Khu vực tập: <span className="text-rose-500">*</span>
                </label>
                <select
                  value={openSlotRoom}
                  onChange={(e) => {
                    setOpenSlotRoom(e.target.value);
                    setError("");
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer font-medium"
                >
                  <option value="">-- Chọn phòng tập --</option>
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
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
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
                isPastTime
              }
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {submitting
                ? "Đang xử lý..."
                : conflictSession
                ? "Bị trùng ca dạy khác"
                : isPastTime
                ? "Khung giờ trong quá khứ"
                : "Đăng lịch rảnh 1–1"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
