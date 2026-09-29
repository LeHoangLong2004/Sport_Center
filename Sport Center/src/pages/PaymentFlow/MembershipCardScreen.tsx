import React from "react";
import { A, Header } from "./shared";

export function MembershipCardScreen({ onHome }: { onHome: () => void }) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <div className="flex flex-col gap-8 items-center pb-20 pt-10 px-20 w-full">
        <div className="flex flex-col gap-3 items-center w-full">
          <div className="bg-[#f0fdf4] flex items-center justify-center rounded-[32px] size-16">
            <img src={`${A}/288cc.svg`} className="size-8" alt="" />
          </div>
          <p className="font-['Inter'] font-extrabold text-[#0b1f3a] text-[32px] text-center">
            Chúc Mừng Thẻ Thành Viên Đã Sẵn Sàng!
          </p>
          <p className="font-['Inter'] font-normal text-[#64748b] text-[16px] text-center w-[640px]">
            Thẻ thành viên điện tử (Digital Membership Card) của bạn đã được kích hoạt thành công trên hệ thống SportCenter Việt Nam.
          </p>
        </div>

        <div className="bg-[#0b1f3a] flex items-start overflow-hidden rounded-[24px] shadow-[0px_16px_32px_0px_rgba(30,58,138,0.16)] w-[760px]">
          <div className="flex flex-1 flex-col h-[420px] items-start justify-between min-w-0 p-10">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2 items-center">
                <div className="bg-white flex items-center justify-center rounded-[6px] size-7">
                  <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SC</span>
                </div>
                <span className="font-['Manrope'] font-extrabold text-white text-[14px]">SPORTCENTER</span>
              </div>
              <div className="bg-[#2563eb] flex items-start px-3 py-1 rounded-[12px]">
                <span className="font-['Inter'] font-bold text-white text-[11px] uppercase">Fitness Plus</span>
              </div>
            </div>

            <div className="flex gap-5 items-center w-full">
              <div className="bg-white flex flex-col items-start overflow-hidden rounded-[36px] size-[72px] shrink-0">
                <img src={`${A}/dd66b.png`} className="size-full object-cover" alt="Hội viên" />
              </div>
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-extrabold text-white text-lg">Nguyễn Lan Anh</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">
                  Mã hội viên: <span className="font-['Inter'] font-bold text-[#10b981]">SC-2026-001234</span>
                </p>
              </div>
            </div>

            <div className="flex gap-10 items-start w-full">
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] uppercase">Cơ sở kích hoạt</p>
                <p className="font-['Inter'] font-semibold text-white text-[13px]">Flagship Center Q.1</p>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] uppercase">Ngày hết hạn</p>
                <p className="font-['Inter'] font-semibold text-white text-[13px]">21/03/2027</p>
              </div>
            </div>
          </div>

          <div className="bg-[#112240] flex flex-col gap-4 h-[420px] items-center justify-center p-10 shrink-0 w-[260px]">
            <div className="bg-white flex flex-col items-start p-3 rounded-[16px]">
              <div className="flex items-center justify-center overflow-hidden size-[120px]">
                <img src={`${A}/68b48.svg`} className="size-[120px]" alt="QR Code" />
              </div>
            </div>
            <p className="font-['Inter'] font-semibold text-[#64748b] text-[11px] text-center w-full">
              Quét mã tại quầy lễ tân để check-in và nhận phòng tập
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-start w-[760px]">
          <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 items-start min-w-0 p-6 rounded-[16px]">
            <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[16px]">Đặt lịch tập với huấn luyện viên</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-[13px] leading-[18px] w-full">
              Bạn có đặc quyền 2 buổi PT định hướng thể chất miễn phí. Hãy thiết lập ngay.
            </p>
            <button type="button" className="border border-[#2563eb] flex items-center justify-center py-2 rounded-[6px] w-full font-['Inter'] font-bold text-[#2563eb] text-[13px] hover:bg-[#eff6ff] transition-colors">
              Đặt lịch PT miễn phí
            </button>
          </div>
          <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 items-start min-w-0 p-6 rounded-[16px]">
            <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[16px]">Khám phá lớp học Group-X</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-[13px] leading-[18px] w-full">
              Đăng ký đặt chỗ trước các lớp học cao cấp Yoga, Zumba, và Spinning hàng tuần.
            </p>
            <button type="button" className="bg-[#2563eb] flex items-center justify-center py-2 rounded-[6px] w-full font-['Inter'] font-bold text-white text-[13px] hover:bg-[#1d4ed8] transition-colors">
              Khám phá lịch lớp học
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onHome}
          className="font-['Inter'] font-semibold text-[#64748b] text-sm hover:text-[#0f172a] transition-colors"
        >
          ← Quay về trang chủ
        </button>
      </div>
    </div>
  )
}