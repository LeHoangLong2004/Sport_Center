import React from 'react';
import { addons } from '../pricingData';
import { Check } from 'lucide-react'; // Check is used in ComparisonTable

export default function AddOnServices() {
  return (
    <>
      {/* Add-on Services */}
      <section className="bg-[#f8fafc] flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Dịch vụ bổ sung theo yêu cầu
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="flex gap-[24px] w-full max-w-[1120px]">
          {addons.map((addon) => (
            <div
              key={addon.title}
              className="bg-white border border-[#e2e8f0] rounded-[16px] flex flex-col gap-[16px] p-[28px] flex-1"
            >
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">{addon.title}</p>
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-[22px]">{addon.price}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-relaxed">
                {addon.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
