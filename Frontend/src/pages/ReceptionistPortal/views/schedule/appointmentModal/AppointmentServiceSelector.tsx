import React from "react";
import type { Coach } from "../types";
import { PRESET_SERVICES } from "../constants";

interface AppointmentServiceSelectorProps {
  isCustomService: boolean;
  setIsCustomService: (custom: boolean) => void;
  customTitle: string;
  setCustomTitle: (title: string) => void;
  selectedServiceIndex: number;
  setSelectedServiceIndex: (index: number) => void;
  coaches: Coach[];
  selectedCoachId: string;
  setSelectedCoachId: (coachId: string) => void;
}

export const AppointmentServiceSelector: React.FC<AppointmentServiceSelectorProps> = ({
  isCustomService,
  setIsCustomService,
  customTitle,
  setCustomTitle,
  selectedServiceIndex,
  setSelectedServiceIndex,
  coaches,
  selectedCoachId,
  setSelectedCoachId,
}) => {
  return (
    <>
      {/* 2. Service Selection */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            2. Dịch vụ / Buổi hẹn
          </span>
          <button
            type="button"
            onClick={() => setIsCustomService(!isCustomService)}
            className="text-[11px] text-purple-600 hover:underline cursor-pointer"
          >
            {isCustomService ? "Chọn có sẵn" : "Nhập tay"}
          </button>
        </div>

        {isCustomService ? (
          <input
            type="text"
            required
            placeholder="Nhập tên dịch vụ lịch hẹn..."
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-purple-500"
          />
        ) : (
          <select
            value={selectedServiceIndex}
            onChange={(e) => setSelectedServiceIndex(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-purple-500 bg-white cursor-pointer"
          >
            {PRESET_SERVICES.map((s, idx) => (
              <option key={idx} value={idx}>
                {s.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 3. Coach Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
          3. Huấn luyện viên phụ trách *
        </span>
        <select
          value={selectedCoachId}
          onChange={(e) => setSelectedCoachId(e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-purple-500 bg-white cursor-pointer"
        >
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.fullName} — {c.specialty || "HLV Cá nhân"} ({c.phoneNumber || "N/A"})
            </option>
          ))}
        </select>
      </div>
    </>
  );
};
