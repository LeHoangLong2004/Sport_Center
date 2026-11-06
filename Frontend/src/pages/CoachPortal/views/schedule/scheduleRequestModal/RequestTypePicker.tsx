import React from "react";

export type ScheduleRequestType = "dời lịch" | "dạy thay" | "báo vắng";

interface RequestTypePickerProps {
  requestType: ScheduleRequestType;
  onRequestTypeChange: (type: ScheduleRequestType) => void;
}

export const RequestTypePicker: React.FC<RequestTypePickerProps> = ({
  requestType,
  onRequestTypeChange,
}) => {
  const types: ScheduleRequestType[] = ["dời lịch", "dạy thay", "báo vắng"];

  return (
    <div>
      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
        Loại yêu cầu:
      </label>
      <div className="grid grid-cols-3 gap-2">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onRequestTypeChange(t)}
            className={`p-2.5 rounded-lg border text-center font-semibold capitalize transition-all cursor-pointer ${
              requestType === t
                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
