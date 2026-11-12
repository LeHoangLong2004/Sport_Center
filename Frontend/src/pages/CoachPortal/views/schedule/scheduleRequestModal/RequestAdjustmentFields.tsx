import React from "react";
import { AlertTriangle } from "lucide-react";
import { DateInput } from "../../../../../components/DateInput";
import type { ScheduleRequestType } from "./RequestTypePicker";

interface CoachOption {
  id: string;
  fullName: string;
  specialty?: string;
}

interface RequestAdjustmentFieldsProps {
  requestType: ScheduleRequestType;
  newDate: string;
  onNewDateChange: (val: string) => void;
  newTime: string;
  onNewTimeChange: (val: string) => void;
  conflictWarning?: string | null;
  substituteCoachId: string;
  onSubstituteCoachChange: (coachId: string, coachName: string) => void;
  filteredCoaches: CoachOption[];
  loadingCoaches: boolean;
  reason: string;
  onReasonChange: (val: string) => void;
}

export const RequestAdjustmentFields: React.FC<RequestAdjustmentFieldsProps> = ({
  requestType,
  newDate,
  onNewDateChange,
  newTime,
  onNewTimeChange,
  conflictWarning,
  substituteCoachId,
  onSubstituteCoachChange,
  filteredCoaches,
  loadingCoaches,
  reason,
  onReasonChange,
}) => {
  const [startTime, endTime] = React.useMemo(() => {
    if (!newTime) return ["", ""];
    const parts = newTime.split("-").map((s) => s.trim());
    return [parts[0] || "", parts[1] || ""];
  }, [newTime]);

  const [timeError, setTimeError] = React.useState<string | null>(null);

  const validateAndUpdate = (start: string, end: string) => {
    if (start && end && start >= end) {
      setTimeError("Giờ kết thúc phải sau giờ bắt đầu.");
    } else {
      setTimeError(null);
    }
    if (start && end) {
      onNewTimeChange(`${start} - ${end}`);
    } else if (start) {
      onNewTimeChange(start);
    } else {
      onNewTimeChange("");
    }
  };

  const handleStartTimeChange = (newStart: string) => {
    let targetEnd = endTime;
    if (!targetEnd && newStart) {
      // Tự động gợi ý giờ kết thúc là +1 tiếng
      const [h, m] = newStart.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        const endH = (h + 1) % 24;
        targetEnd = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }
    validateAndUpdate(newStart, targetEnd);
  };

  const handleEndTimeChange = (newEnd: string) => {
    validateAndUpdate(startTime, newEnd);
  };

  return (
    <>
      {/* 1. Dời lịch fields */}
      {requestType === "dời lịch" && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Ngày mới đề xuất: <span className="text-rose-500">*</span>
            </label>
            <DateInput
              value={newDate}
              onChange={onNewDateChange}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Khung giờ mới đề xuất: <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Giờ bắt đầu:
                </span>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                  Giờ kết thúc:
                </span>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer text-xs"
                />
              </div>
            </div>
            {timeError && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{timeError}</p>
            )}

            {/* Cảnh báo xung đột lịch nếu khung giờ mới trùng với lớp khác của HLV */}
            {conflictWarning && (
              <div className="mt-2.5 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                  <span className="font-bold block text-rose-800 dark:text-rose-200 mb-0.5">
                    Phát hiện xung đột lịch dạy!
                  </span>
                  {conflictWarning}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Dạy thay fields */}
      {requestType === "dạy thay" && (
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
            Chọn Huấn luyện viên dạy thay (tùy chọn):
          </label>
          <select
            value={substituteCoachId}
            onChange={(e) => {
              const selectedId = e.target.value;
              const coach = filteredCoaches.find((c) => c.id === selectedId);
              onSubstituteCoachChange(selectedId, coach?.fullName || "");
            }}
            disabled={loadingCoaches}
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="">-- Để ban quản lý phân công HLV phù hợp --</option>
            {filteredCoaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} {c.specialty ? `(${c.specialty})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Reason textarea */}
      <div>
        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
          Lý do cụ thể: <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          required
          placeholder="Điền lý do cụ thể gửi tới ban quản lý..."
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>
    </>
  );
};
