import React from 'react';
import { faqs } from '../pricingData';

export default function FAQSection() {
  return (
    <>
      {/* FAQ Section */}
      <section className="bg-white flex flex-col items-center gap-[48px] px-[80px] py-[80px] w-full">
        <div className="flex flex-col items-center gap-[12px]">
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[32px]">
            Câu hỏi thường gặp
          </h2>
          <div className="bg-[#2563eb] h-[3px] rounded-full w-[48px]" />
        </div>
        <div className="grid grid-cols-2 gap-[20px] w-full max-w-[1120px]">
          {faqs.map((faq: any) => (
            <div
              key={faq.q}
              className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] flex flex-col gap-[12px] p-[28px]"
            >
              <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[15px] leading-snug">{faq.q}</p>
              <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-[14px] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
