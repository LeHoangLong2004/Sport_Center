import React from "react";
import { A, Header, Stepper } from "./shared";

export function ProcessingScreen() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[640px]">
          <div className="relative size-20">
            <div className="absolute inset-0 border-4 border-[#e2e8f0] rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#2563eb] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={`${A}/cb2ea.svg`} className="size-8" alt="" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Đang xử lý thanh toán...</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Vui lòng không đóng trang này. Giao dịch của bạn đang được xử lý an toàn.
            </p>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3 items-start p-6 rounded-[16px] w-full">
            {[
              { label: "Đã nhận mã OTP", done: true },
              { label: "Đang xác thực giao dịch...", active: true },
              { label: "Kích hoạt thành viên", done: false },
            ].map(({ label, done, active }) => (
              <div key={label} className="flex gap-3 items-center">
                <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-[#16a34a]" : active ? "border-2 border-[#2563eb] animate-pulse" : "border-2 border-[#e2e8f0]"
                }`}>
                  {done && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={`font-['Inter'] text-sm ${
                  done ? "font-semibold text-[#16a34a]" : active ? "font-semibold text-[#2563eb]" : "font-normal text-[#94a3b8]"
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}