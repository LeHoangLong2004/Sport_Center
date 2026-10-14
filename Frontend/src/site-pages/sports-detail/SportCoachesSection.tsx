import React from "react";
import { coaches } from "../sportsDetailData";

export const SportCoachesSection: React.FC = () => {
  return (
    <div className="bg-white flex flex-col gap-[32px] items-start p-[80px] w-full shrink-0">
      <div className="flex flex-col gap-[8px] items-start w-full">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[28px]">
          Chuyên gia dẫn dắt lớp bơi lội
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px]">
          Đội ngũ HLV chuyên môn cao với bằng cấp sư phạm thể chất và chứng
          nhận cứu hộ quốc tế.
        </p>
      </div>
      <div className="flex gap-[24px] items-start w-full">
        {coaches.map((c) => (
          <div
            key={c.name}
            className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-clip rounded-[16px]"
          >
            <div className="relative h-[260px] w-full shrink-0">
              <img
                alt={c.name}
                className="absolute inset-0 object-cover size-full max-w-none"
                src={c.img}
              />
            </div>
            <div className="flex flex-col gap-[12px] items-start p-[20px] w-full">
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] whitespace-nowrap">
                {c.name}
              </p>
              <p className="font-['Inter:Semi_Bold'] font-semibold text-[#2563eb] text-[14px] whitespace-nowrap">
                {c.spec}
              </p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] leading-[1.4] w-full">
                {c.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
