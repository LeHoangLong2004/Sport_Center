import React, { useState, useEffect } from "react";
import { imgCheck } from "./sportsDetailData";
import { SportCoachesSection } from "./sports-detail/SportCoachesSection";
import { SportScheduleSection } from "./sports-detail/SportScheduleSection";
import { SportRoadmapSection } from "./sports-detail/SportRoadmapSection";
import { SPORTS_DIRECTORY, type SportInfo } from "./sportsDirectoryData";

function getSportFromHash(): SportInfo {
  const hash = window.location.hash;
  const match = hash.match(/sport=([a-zA-Z0-9_-]+)/);
  const sportId = match ? match[1] : "boi-loi";
  return SPORTS_DIRECTORY[sportId] || SPORTS_DIRECTORY["boi-loi"];
}

export default function ChiTietBoMonPage() {
  const [sport, setSport] = useState<SportInfo>(getSportFromHash);

  useEffect(() => {
    const handleHash = () => setSport(getSportFromHash());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      {/* Hero */}
      <div className="relative flex flex-col gap-[24px] items-start px-[80px] py-[64px] w-full shrink-0 min-h-[320px]">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img
            alt=""
            className="absolute inset-0 object-cover size-full max-w-none"
            src={sport.heroImg}
          />
          <div className="absolute inset-0 bg-[rgba(15,23,42,0.85)]" />
        </div>
        <div className="relative flex gap-[8px] items-center text-[14px]">
          <a href="#home" className="font-['Inter:Medium'] font-medium text-[#94a3b8] hover:text-white transition-colors">Trang chủ</a>
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">{`>`}</p>
          <a href="#bomon" className="font-['Inter:Medium'] font-medium text-[#94a3b8] hover:text-white transition-colors">Bộ môn</a>
          <p className="font-['Inter:Medium'] font-medium text-[#94a3b8]">{`>`}</p>
          <p className="font-['Inter:Semi_Bold'] font-semibold text-white">{sport.name}</p>
        </div>
        <div className="relative flex items-center">
          <div className="bg-[#10b981] flex items-center px-[14px] py-[6px] rounded-[100px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[12px] whitespace-nowrap">
              ĐANG MỞ ĐĂNG KÝ
            </p>
          </div>
        </div>
        <h1 className="relative font-['Inter:Extra_Bold'] font-extrabold text-white text-[44px] leading-tight">
          {sport.name}
        </h1>
        <p className="relative font-['Inter:Regular'] font-normal text-[#94a3b8] text-[17px] leading-[1.6] max-w-[680px]">
          {sport.tagline}
        </p>
      </div>

      {/* Overview & Facility */}
      <div className="bg-white flex gap-[64px] items-center p-[80px] w-full shrink-0">
        <div className="relative h-[380px] rounded-[16px] shrink-0 w-[560px] overflow-hidden shadow-lg">
          <img
            alt={sport.facilityTitle}
            className="absolute inset-0 object-cover size-full max-w-none rounded-[16px]"
            src={sport.facilityImg}
          />
        </div>
        <div className="flex flex-1 flex-col gap-[20px] items-start min-w-0">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[30px] w-full">
            {sport.facilityTitle}
          </p>
          <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[15px] leading-[1.6] w-full">
            {sport.facilityDesc}
          </p>
          <div className="flex flex-col gap-[14px] items-start w-full">
            {sport.features.map((point) => (
              <div key={point} className="flex gap-[12px] items-center w-full">
                <div className="bg-[rgba(37,99,235,0.1)] flex items-center justify-center rounded-[12px] size-[24px] shrink-0">
                  <img alt="" src={imgCheck} style={{ width: 11, height: 11 }} />
                </div>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Table Component */}
      <SportScheduleSection sport={sport} />

      {/* Coaches Component */}
      <SportCoachesSection />

      {/* Roadmap & Testimonials Component */}
      <SportRoadmapSection sport={sport} />

      {/* CTA */}
      <div className="bg-[#0f172a] flex flex-col gap-[20px] items-center p-[80px] w-full shrink-0">
        <p className="font-extrabold text-white text-[30px] text-center">
          Trải nghiệm tập thử {sport.name} miễn phí hôm nay!
        </p>
        <p className="text-[#94a3b8] text-[15px] text-center max-w-[600px]">
          Nhận ngay 01 buổi tập trải nghiệm cùng HLV chuyên nghiệp và đo chỉ số InBody miễn phí.
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            window.location.hash = "#pricing";
          }}
          className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-[14px] px-[32px] py-[14px] rounded-[8px] transition-colors cursor-pointer"
        >
          Nhận vé tập thử ngay
        </button>
      </div>
    </div>
  );
}
