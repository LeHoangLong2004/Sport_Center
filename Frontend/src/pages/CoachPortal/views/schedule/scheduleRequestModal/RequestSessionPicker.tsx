import React from "react";
import type { UnifiedScheduleItem } from "../types";

interface RequestSessionPickerProps {
  sessions: UnifiedScheduleItem[];
  selectedSessionId: string;
  onSelectSessionId: (id: string) => void;
}

export const RequestSessionPicker: React.FC<RequestSessionPickerProps> = ({
  sessions,
  selectedSessionId,
  onSelectSessionId,
}) => {
  return (
    <div>
      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
        Chọn ca dạy cần điều chỉnh: <span className="text-rose-500">*</span>
      </label>
      {sessions.length === 0 ? (
        <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs">
          Không có ca dạy nào sắp diễn ra trong tương lai để điều chỉnh. Các ca dạy trong quá khứ đã kết thúc nên không thể dời lịch, dạy thay hoặc báo vắng.
        </div>
      ) : (
        <select
          value={selectedSessionId}
          onChange={(e) => onSelectSessionId(e.target.value)}
          className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.date} ({s.startTime} - {s.endTime}) • {s.className}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
