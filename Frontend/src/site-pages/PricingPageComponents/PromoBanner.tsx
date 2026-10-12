import React from 'react';

export default function PromoBanner() {
  return (
    <>
      {/* Promo Banner */}
      <section className="bg-[#f8fafc] px-[80px] pb-[80px] w-full">
        <div className="bg-[#2563eb] rounded-[20px] flex flex-col items-center gap-[24px] px-[80px] py-[64px] w-full">
          <span className="bg-white/20 text-white font-['Inter:Bold'] font-bold text-[12px] uppercase tracking-[1.5px] px-[16px] py-[8px] rounded-full">
            ƯU ĐÃI LỚN NHẤT THÁNG
          </span>
          <h2 className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[32px] text-center leading-tight max-w-[640px]">
            Giảm ngay 20% gói 12 tháng khi đăng ký trong tháng này
          </h2>
          <p className="font-['Inter:Regular'] font-normal text-white/80 text-[16px] text-center leading-relaxed max-w-[540px]">
            Tặng kèm bộ quà tặng bình giữ nhiệt cao cấp và 02 buổi tập cùng Master Trainer.
          </p>
          <button
            data-name="btn-register"
            className="bg-white text-[#2563eb] font-['Inter:Bold'] font-bold text-[15px] px-[32px] py-[14px] rounded-[10px] hover:bg-[#f8fafc] transition-colors cursor-pointer"
          >
            Nhận ưu đãi ngay
          </button>
        </div>
      </section>
    </>
  );
}
