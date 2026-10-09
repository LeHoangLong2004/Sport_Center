import React from "react";
import { A, Stepper } from "./shared";

export function FailedScreen({
  onRetry,
  onChangeMethod,
}: {
  onRetry: () => void
  onChangeMethod: () => void
}) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px]">
          <div className="bg-[#fef2f2] flex items-center justify-center rounded-[40px] size-20">
            <img src={`${A}/ef3a3.svg`} className="size-10" alt="" />
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Giao Dịch Thất Bại</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Hệ thống không thể xử lý thanh toán từ tài khoản của bạn
            </p>
          </div>

          <div className="bg-[#fef2f2] border border-[#dc2626] border-[0.5px] flex flex-col gap-2.5 items-start p-5 rounded-[12px] w-full">
            <p className="font-['Inter'] font-bold text-[#dc2626] text-[15px]">Lý do lỗi thanh toán:</p>
            <p className="font-['Inter'] font-normal text-[#0f172a] text-sm leading-[20px]">
              Tài khoản không đủ số dư khả dụng (Error Code: bank_9921) hoặc quá thời hạn giao dịch chuyển khoản cho phép từ cổng thanh toán QR.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-start w-full">
            <div className="flex gap-4 items-start w-full">
              <button
                type="button"
                onClick={onChangeMethod}
                className="border border-[#64748b] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-[15px] hover:bg-[#f8fafc] transition-colors"
              >
                Chọn phương thức khác
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="bg-teal-500 flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-teal-600 transition-colors"
              >
                Thử lại ngay
              </button>
            </div>
            <div className="flex gap-1.5 items-start justify-center w-full text-[13px]">
              <span className="font-['Inter'] font-normal text-[#64748b]">Cần hỗ trợ kỹ thuật?</span>
              <span className="font-['Inter'] font-bold text-teal-600 cursor-pointer">Liên hệ ngay 1900 1234 (Miễn phí)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}