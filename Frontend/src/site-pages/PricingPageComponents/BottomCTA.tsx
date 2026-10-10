import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoveRight } from 'lucide-react';

export default function BottomCTA() {
  const navigate = useNavigate();
  return (
    <>
      {/* Bottom CTA */}
      <section className="bg-[#f8fafc] px-[80px] pb-[80px] w-full">
        <div className="bg-[#0f172a] rounded-[20px] flex flex-col items-center gap-[32px] px-[80px] py-[64px] w-full">
          <div className="flex flex-col items-center gap-[16px]">
            <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] text-center">
              Chưa chắc chắn chọn gói nào?
            </h2>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] text-center leading-relaxed max-w-[560px]">
              Đăng ký tập thử MIỄN PHÍ 01 buổi trải nghiệm dịch vụ chuẩn quốc tế cùng HLV hướng dẫn chuyên nghiệp.
            </p>
          </div>
          <div className="flex gap-[12px] items-center w-full max-w-[640px]">
            <input
              type="text"
              placeholder="Họ và tên của bạn"
              className="bg-[#1e293b] text-white placeholder-[#64748b] font-['Inter:Regular'] font-normal text-[14px] px-[18px] py-[14px] rounded-[10px] flex-1 outline-none border border-[#1e293b] focus:border-[#2563eb] transition-colors"
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              className="bg-[#1e293b] text-white placeholder-[#64748b] font-['Inter:Regular'] font-normal text-[14px] px-[18px] py-[14px] rounded-[10px] flex-1 outline-none border border-[#1e293b] focus:border-[#2563eb] transition-colors"
            />
            <button
              data-name="btn-submit"
              className="bg-[#10b981] text-white font-['Inter:Bold'] font-bold text-[14px] px-[24px] py-[14px] rounded-[10px] whitespace-nowrap hover:bg-[#059669] transition-colors cursor-pointer shrink-0"
            >
              Đăng ký tập thử ngay
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
