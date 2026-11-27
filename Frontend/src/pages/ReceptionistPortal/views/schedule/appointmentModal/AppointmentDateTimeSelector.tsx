import React from "react";
import { DateInput } from "../../../../../components/DateInput";

interface AppointmentDateTimeSelectorProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

export const AppointmentDateTimeSelector: React.FC<AppointmentDateTimeSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}) => (
  <>
    <div className="flex flex-col gap-1.5">
      <label htmlFor="appointment-date" className="font-semibold text-slate-700 text-sm">
        Ngày hẹn *
      </label>
      <p className="text-[10px] text-slate-400">Đặt trước ít nhất 24 giờ và tối đa 7 ngày.</p>
      <DateInput
        id="appointment-date"
        required
        value={selectedDate}
        onChange={setSelectedDate}
        placeholder="dd/mm/yyyy"
        className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <label htmlFor="appointment-time" className="font-semibold text-slate-700 text-sm">
        Khung giờ hẹn *
      </label>
      <input
        id="appointment-time"
        type="time"
        required
        value={selectedTime}
        onChange={(event) => setSelectedTime(event.target.value)}
        className="w-full px-3.5 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white"
      />
    </div>
  </>
);
