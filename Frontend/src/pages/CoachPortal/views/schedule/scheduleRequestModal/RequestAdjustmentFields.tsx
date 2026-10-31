import React from "react";
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
  substituteCoachId,
  onSubstituteCoachChange,
  filteredCoaches,
  loadingCoaches,
  reason,
  onReasonChange,
}) => {
  return (
    <>
      {/* 1. Dời lịch fields */}
      {requestType === "dời lịch" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Ngày mới đề xuất:
            </label>
            <DateInput
              value={newDate}
              onChange={onNewDateChange}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Khung giờ mới:
            </label>
            <input
              type="text"
              placeholder="VD: 08:00 - 09:30"
              value={newTime}
              onChange={(e) => onNewTimeChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            />
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
