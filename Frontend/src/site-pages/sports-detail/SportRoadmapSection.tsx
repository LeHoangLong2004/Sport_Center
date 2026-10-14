import React from "react";
import type { SportInfo } from "../sportsDirectoryData";
import { imgStar, testimonials } from "../sportsDetailData";

interface SportRoadmapSectionProps {
  sport: SportInfo;
}

function StarRow() {
  return (
    <div className="flex gap-[4px] items-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-center size-[16px]">
          <img alt="" src={imgStar} style={{ width: 13, height: 13 }} />
        </div>
      ))}
    </div>
  );
}

export const SportRoadmapSection: React.FC<SportRoadmapSectionProps> = ({ sport }) => {
  return (
    <>
      {/* Roadmap */}
      <div className="bg-[#f8fafc] flex flex-col gap-[28px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[6px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[26px]">
            Lộ trình đào tạo chuẩn hóa
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
            Mục tiêu đầu ra rõ ràng cho từng cấp độ từ cơ bản đến nâng cao.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {sport.roadmap.map((r) => (
            <div
              key={r.level}
              className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[16px] p-[28px] rounded-[16px] shadow-xs"
            >
              <div className="flex gap-[10px] items-center">
                <span className="bg-[rgba(37,99,235,0.1)] text-[#2563eb] font-bold text-[11px] px-[12px] py-[4px] rounded-full">
                  {r.level}
                </span>
                <span className="text-[#64748b] text-[13px] font-medium">{r.period}</span>
              </div>
              <h3 className="font-extrabold text-[#1e293b] text-[18px]">{r.title}</h3>
              <p className="text-[#64748b] text-[13px] leading-[1.6]">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-white flex flex-col gap-[28px] items-start p-[80px] w-full shrink-0">
        <div className="flex flex-col gap-[6px] items-start w-full">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[26px]">
            Đánh giá thực tế từ học viên
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px]">
            Trải nghiệm thực tế từ các hội viên đang tham gia tập luyện tại trung tâm.
          </p>
        </div>
        <div className="flex gap-[24px] items-start w-full">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[16px] p-[28px] rounded-[16px]"
            >
              <StarRow />
              <p className="text-[#64748b] text-[14px] leading-[1.6] italic">{t.text}</p>
              <div className="flex gap-[12px] items-center pt-2">
                <img alt={t.name} className="size-[38px] rounded-full object-cover" src={t.avatar} />
                <span className="font-bold text-[#1e293b] text-[14px]">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
