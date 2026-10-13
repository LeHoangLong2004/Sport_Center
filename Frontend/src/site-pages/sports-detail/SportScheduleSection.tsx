import React from "react";
import type { SportInfo } from "../sportsDirectoryData";

interface SportScheduleSectionProps {
  sport: SportInfo;
}

export const SportScheduleSection: React.FC<SportScheduleSectionProps> = ({ sport }) => {
  return (
    <div className="bg-[#f8fafc] flex flex-col gap-[28px] items-start p-[80px] w-full shrink-0">
      <div className="flex flex-col gap-[6px] items-start w-full">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[26px]">
          Lịch lớp {sport.name} tuần này
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
          Đăng ký suất tập sớm để đảm bảo vị trí và được HLV kèm sát kỹ thuật.
        </p>
      </div>
      <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-clip rounded-[12px] w-full shadow-xs">
        <div className="bg-[#1e293b] flex gap-[20px] items-start p-[16px] w-full text-white font-bold text-[13px]">
          <span className="w-[180px]">Thời gian</span>
          <span className="w-[220px]">Lớp học</span>
          <span className="w-[200px]">Huấn luyện viên</span>
          <span className="w-[180px]">Khu vực / Phòng</span>
          <span className="w-[150px]">Suất trống</span>
          <span className="flex-1 text-right">Đăng ký</span>
        </div>
        {sport.schedule.map((row, i) => (
          <div
            key={i}
            className={`flex gap-[20px] items-center p-[16px] w-full ${
              i < sport.schedule.length - 1 ? "border-b border-[#e2e8f0]" : ""
            }`}
          >
            <span className="font-semibold text-[#1e293b] text-[13px] w-[180px]">{row.time}</span>
            <span className="font-bold text-[#2563eb] text-[13px] w-[220px]">{row.name}</span>
            <span className="text-[#1e293b] text-[13px] w-[200px]">{row.coach}</span>
            <span className="text-[#64748b] text-[13px] w-[180px]">{row.room}</span>
            <span
              className={`font-semibold text-[13px] w-[150px] ${
                row.full ? "text-[#94a3b8]" : "text-[#059669]"
              }`}
            >
              {row.slots}
            </span>
            <div className="flex flex-1 items-start justify-end">
              <button
                type="button"
                disabled={row.full}
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.hash = "#pricing";
                }}
                className={`px-[16px] py-[7px] rounded-[6px] text-white font-bold text-[12px] transition-colors ${
                  row.full
                    ? "bg-[#94a3b8] cursor-not-allowed"
                    : "bg-[#10b981] hover:bg-[#059669] cursor-pointer"
                }`}
              >
                {row.full ? "Đầy chỗ" : "Đăng ký ngay"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
