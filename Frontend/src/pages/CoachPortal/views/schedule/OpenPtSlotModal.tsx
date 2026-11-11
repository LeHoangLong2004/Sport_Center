import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { TIME_ROWS, type UnifiedScheduleItem } from "./types";
import { DateInput } from "../../../../components/DateInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: UnifiedScheduleItem) => void | Promise<void>;
  sportOptions: string[];
  roomOptions: string[];
  initialDate?: string;
}

// Tính toán thời gian kết thúc hợp lệ theo giờ bắt đầu
function getEndTimeOptions(startTime: string): { time: string; label: string }[] {
  const [startH, startM] = (startTime || "08:00").split(":").map(Number);
  const startTotalMinutes = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);

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

export default function OpenPtSlotModal({ isOpen, onClose, onSuccess, sportOptions, roomOptions, initialDate }: Props) {
  const [openSlotDate, setOpenSlotDate] = useState("");
  const [openSlotStartTime, setOpenSlotStartTime] = useState("08:00");
  const [openSlotEndTime, setOpenSlotEndTime] = useState("09:00");
  const [openSlotSport, setOpenSlotSport] = useState("");
  const [openSlotRoom, setOpenSlotRoom] = useState("");
  const [openSlotNote, setOpenSlotNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOpenSlotDate(initialDate || new Date().toISOString().split("T")[0]);
      setError("");
    }
  }, [isOpen, initialDate]);

  // Sinh danh sách giờ kết thúc động dựa trên giờ bắt đầu đã chọn
  const endTimeOptions = useMemo(() => getEndTimeOptions(openSlotStartTime), [openSlotStartTime]);

  // Tự động điều chỉnh giờ kết thúc khi giờ bắt đầu thay đổi
  useEffect(() => {
    if (endTimeOptions.length > 0) {
      const exists = endTimeOptions.some((o) => o.time === openSlotEndTime);
      if (!exists) {
        // Mặc định chọn khung 60 phút
        const defaultOneHour = endTimeOptions.find((o) => o.label.includes("60 phút")) || endTimeOptions[0];
        if (defaultOneHour) setOpenSlotEndTime(defaultOneHour.time);
      }
    }
  }, [openSlotStartTime, endTimeOptions, openSlotEndTime]);

  if (!isOpen) return null;

  const defaultRooms = ["Khu tập PT 1-1 / Sàn chính", "Phòng tập chức năng", "Khu vực Boxing", "Bể bơi 4 mùa"];
  const availableRooms = roomOptions.length > 0 ? roomOptions : defaultRooms;
  const selectedSport = openSlotSport || sportOptions[0] || "Gym & Thể lực";
  const selectedRoom = openSlotRoom || availableRooms[0] || "Khu tập PT 1-1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openSlotDate) return;
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {endTimeOptions.map((opt) => (
                    <option key={opt.time} value={opt.time}>
                      {opt.label}
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
                  value={selectedSport}
                  onChange={(e) => setOpenSlotSport(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
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
                {sportOptions.length === 0 && (
                  <p className="mt-1 text-[11px] text-slate-500 font-medium">Đang dùng bộ môn mặc định của trung tâm.</p>
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
                  {availableRooms.map((r) => (
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
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 rounded-lg shadow-sm transition-colors"
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
