import React from 'react';
import { FadeUp } from "../../components/Motion";

export default function CTABanner() {
  return (
    <>
      {/* ── CTA Banner ── */}
      <section className="bg-[#f8fafc] px-[80px] pb-[64px] pt-[32px] w-full shrink-0 overflow-hidden">
        <FadeUp className="bg-[#0f172a] flex flex-col gap-[32px] items-start p-[56px] rounded-[24px] w-full shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-transparent pointer-events-none rounded-[24px]" />
          <div className="flex flex-col gap-[12px] items-center text-center w-full relative z-10">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[34px] leading-[1.2] m-0">
              Sẵn sàng đổi thay cuộc đời?
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-[1.6] max-w-[560px] m-0">
              Đăng ký tham quan không gian thực tế miễn phí và nhận ngay vé trải nghiệm hồ bơi Aqua trị liệu VIP.
            </p>
          </div>

          <div className="flex gap-[12px] items-stretch w-full">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="bg-[#1e293b] border border-[#334155] focus:border-[#10b981] outline-none text-white flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px] font-['Inter:Regular'] text-[14px] placeholder:text-[#94a3b8]"
            />
            <input
              type="tel"
              placeholder="Số điện thoại liên hệ"
              className="bg-[#1e293b] border border-[#334155] focus:border-[#10b981] outline-none text-white flex flex-1 items-start min-w-0 px-[16px] py-[14px] rounded-[8px] font-['Inter:Regular'] text-[14px] placeholder:text-[#94a3b8]"
            />
            <button
              type="button"
              className="bg-[#10b981] hover:bg-[#059669] transition-colors flex flex-1 items-center justify-center min-w-0 px-[24px] py-[14px] rounded-[8px] cursor-pointer border-0"
              data-name="btn-submit"
            >
              <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[14px] whitespace-nowrap">Đăng ký tham quan ngay</p>
            </button>
          </div>

          <div className="flex gap-[32px] items-center w-full border-t border-[#1e293b] pt-[24px] relative z-10">
            {[
              ["✓", "Tham quan miễn phí 100%"],
              ["✓", "Vé trải nghiệm hồ bơi VIP"],
              ["✓", "Tư vấn giáo án cá nhân"],
            ].map(([icon, text]) => (
              <div key={text} className="flex gap-[8px] items-center">
                <span className="font-['Inter:Bold'] font-bold text-[#10b981] text-[14px]">{icon}</span>
                <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] m-0">{text}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>
    </>
  );
}
