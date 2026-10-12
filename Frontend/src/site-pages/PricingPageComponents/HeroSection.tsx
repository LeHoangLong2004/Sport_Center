import React from 'react';


import { billingTabs } from '../pricingData';

export default function HeroSection({
  billing,
  setBilling,
  packageCategory,
  setPackageCategory
}: {
  billing: string;
  setBilling: (b: any) => void;
  packageCategory: string;
  setPackageCategory: (c: any) => void;
}) {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#0f172a] flex flex-col items-center gap-[32px] px-[80px] py-[80px] w-full">
        <span className="bg-[#10b981]/20 text-[#10b981] font-['Inter:Semi_Bold'] font-semibold text-[12px] uppercase tracking-[1.5px] px-[16px] py-[8px] rounded-full">
          BẢNG GIÁ MINH BẠCH - KHÔNG PHÍ ẨN
        </span>
        <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[44px] text-center leading-tight max-w-[640px]">
          Đầu tư cho phiên bản tốt hơn của bạn
        </h1>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center leading-relaxed max-w-[560px]">
          Hệ thống gói tập linh hoạt, minh bạch chi phí — thiết kế riêng cho từng mục tiêu và lịch trình cá nhân của bạn.
        </p>

        {/* Category Tabs */}
        <div className="flex bg-[#1e293b] rounded-full p-1 gap-2 mt-4 mb-2">
          <button
            onClick={() => setPackageCategory("member")}
            className={`px-8 py-3 rounded-full text-[15px] transition-colors cursor-pointer ${
              packageCategory === "member"
                ? "bg-teal-500 font-bold text-white shadow-lg"
                : "font-medium text-[#94a3b8] hover:text-white"
            }`}
          >
            Gói thành viên
          </button>
          <button
            onClick={() => setPackageCategory("training")}
            className={`px-8 py-3 rounded-full text-[15px] transition-colors cursor-pointer ${
              packageCategory === "training"
                ? "bg-teal-500 font-bold text-white shadow-lg"
                : "font-medium text-[#94a3b8] hover:text-white"
            }`}
          >
            Gói tập
          </button>
        </div>

        {/* Billing Toggle (Only for membership, or applies to both?) */}
        <div className="flex bg-[#1e293b] rounded-[12px] p-[4px] gap-[4px]">
          {billingTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBilling(key)}
              className={`px-[24px] py-[10px] rounded-[8px] text-[14px] transition-colors cursor-pointer ${
                billing === key
                  ? "bg-[#2563eb] font-['Inter:Bold'] font-bold text-white"
                  : "font-['Inter:Medium'] font-medium text-[#94a3b8] hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
