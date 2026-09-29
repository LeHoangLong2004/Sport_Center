import React from "react";
import { A, Header, Stepper } from "./shared";

export function SuccessScreen({
  onActivate,
  onHome,
  onInvoice,
}: {
  onActivate: () => void
  onHome: () => void
  onInvoice: () => void
}) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px]">
          <div className="relative size-20">
            <img src={`${A}/48b1a.svg`} className="absolute block inset-0 size-full" alt="" />
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Đăng Ký Thành Viên Thành Công!</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Chào mừng hội viên Nguyễn Lan Anh gia nhập câu lạc bộ SportCenter
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full">
            {[
              ["Mã đơn đăng ký", "#SC-2026-09-001"],
              ["Gói thành viên", "Fitness Plus - 6 Tháng"],
              ["Thời gian hiệu lực", "21/09/2026 → 21/03/2027"],
              ["Cơ sở kích hoạt", "Chi nhánh Quận 1 - Flagship Center"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-start justify-between w-full">
                <span className="font-['Inter'] font-normal text-[#64748b] text-[13px]">{label}</span>
                <span className="font-['Inter'] font-bold text-[#0f172a] text-sm">{val}</span>
              </div>
            ))}
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/6be3b.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">Tổng tiền đã thanh toán</span>
              <span className="font-['Inter'] font-extrabold text-[#16a34a] text-xl">10.900.000 đ</span>
            </div>
          </div>

          <div className="bg-[#eff6ff] flex gap-2.5 items-center p-3 rounded-[12px] w-full">
            <img src={`${A}/db498.svg`} className="size-4 shrink-0" alt="" />
            <p className="font-['Inter'] font-medium text-[#2563eb] text-[13px] flex-1 leading-[18px]">
              Mã kích hoạt thẻ và hướng dẫn đặt lịch đã được gửi đến số điện thoại của bạn. Hãy hoàn thành kích hoạt thẻ trực tuyến ngay tiếp theo.
            </p>
          </div>

          <div className="flex gap-2 items-start justify-center w-full">
            <button
              type="button"
              onClick={onInvoice}
              className="border border-[#64748b] flex-1 flex items-center justify-center py-2 rounded-[6px] font-['Inter'] font-semibold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
            >
              Xem hóa đơn điện tử
            </button>
          </div>

          <div className="flex gap-4 items-start w-full">
            <button
              type="button"
              onClick={onHome}
              className="border-[1.5px] border-[#0b1f3a] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#0b1f3a] text-[15px] hover:bg-[#f8fafc] transition-colors"
            >
              Về trang chủ
            </button>
            <button
              type="button"
              onClick={onActivate}
              className="bg-[#2563eb] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
            >
              Kích hoạt thẻ thành viên ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}