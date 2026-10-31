import React, { useRef } from "react";
import { Calendar } from "lucide-react";
import { DateInput } from "../../../../../components/DateInput";
import type { DateQuickChoiceType } from "../types";
import {
  TIME_SLOTS,
  getTodayIso,
  getTomorrowIso,
  isSlotInPast,
} from "../constants";

interface AppointmentDateTimeSelectorProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dateQuickChoice: DateQuickChoiceType;
  setDateQuickChoice: (choice: DateQuickChoiceType) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  isCustomTime: boolean;
  setIsCustomTime: (custom: boolean) => void;
}

export const AppointmentDateTimeSelector: React.FC<AppointmentDateTimeSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  dateQuickChoice,
  setDateQuickChoice,
  selectedTime,
  setSelectedTime,
  isCustomTime,
  setIsCustomTime,
}) => {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* 4. Date Selection */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            4. Ngày hẹn *
          </span>
          <span className="text-[11px] text-purple-600 font-medium">
            {selectedDate
              ? (() => {
                  const parts = selectedDate.split("-");
                  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;
                })()
              : ""}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setDateQuickChoice("today");
              setSelectedDate(getTodayIso());
            }}
            className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
              dateQuickChoice === "today"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            Hôm nay
          </button>

          <button
            type="button"
            onClick={() => {
              setDateQuickChoice("tomorrow");
              setSelectedDate(getTomorrowIso());
            }}
            className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
              dateQuickChoice === "tomorrow"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            Ngày mai
          </button>

          <button
            type="button"
            onClick={() => {
              setDateQuickChoice("custom");
            }}
            className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
              dateQuickChoice === "custom"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            Chọn ngày khác
          </button>
        </div>

        {dateQuickChoice === "custom" && (
          <div className="relative flex items-center">
            <DateInput
              value={selectedDate}
              onChange={(iso) => setSelectedDate(iso)}
              placeholder="dd/mm/yyyy"
              className="w-full mt-0.5 pl-3 pr-9 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white font-mono"
            />
            <button
              type="button"
              onClick={() => {
                if (hiddenDateInputRef.current) {
                  try {
                    hiddenDateInputRef.current.showPicker();
                  } catch {
                    hiddenDateInputRef.current.focus();
                  }
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 cursor-pointer transition"
              title="Mở lịch chọn ngày"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <input
              ref={hiddenDateInputRef}
              type="date"
              min={getTodayIso()}
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                }
              }}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* 5. Time Selection */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            5. Khung giờ hẹn *
          </span>
          <button
            type="button"
            onClick={() => setIsCustomTime(!isCustomTime)}
            className="text-[11px] text-purple-600 hover:underline cursor-pointer"
          >
            {isCustomTime ? "Khung giờ sẵn" : "Giờ khác"}
          </button>
        </div>

        {isCustomTime ? (
          <input
            type="time"
            required
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-purple-500"
          />
        ) : (
          <div className="grid grid-cols-5 gap-1.5">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              const inPast = isSlotInPast(slot, selectedDate);
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={inPast}
                  onClick={() => !inPast && setSelectedTime(slot)}
                  className={`py-1 rounded text-[11px] font-mono font-bold border transition ${
                    inPast
                      ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs cursor-pointer"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer"
                  }`}
                  title={inPast ? "Khung giờ này đã trôi qua trong ngày hôm nay" : undefined}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
