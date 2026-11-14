import React from "react";

export type ScheduleRequestType = "dời lịch" | "dạy thay";

interface RequestTypePickerProps {
  requestType: ScheduleRequestType;
  onRequestTypeChange: (type: ScheduleRequestType) => void;
}

export const RequestTypePicker: React.FC<RequestTypePickerProps> = ({
  requestType,
  onRequestTypeChange,
}) => {
  const types: { key: ScheduleRequestType; label: string }[] = [
    { key: "dời lịch", label: "Dời Lịch" },
    { key: "dạy thay", label: "Dạy Thay" },
  ];

  return (
    <div>
      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
        Loại yêu cầu:
      </label>
      <div className="grid grid-cols-2 gap-2">
        {types.map((t) => {
          const isSelected = requestType === t.key;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onRequestTypeChange(t.key)}
              className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 shadow-sm"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
