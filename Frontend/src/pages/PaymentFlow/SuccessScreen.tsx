import React from "react";
import { A, Stepper, BillingPeriod } from "./shared";

export function SuccessScreen({
  pkg,
  period,
  formData,
  onActivate,
  onHome,
  onInvoice,
}: {
  pkg: any
  period: BillingPeriod
  formData: any
  onActivate: () => void
  onHome: () => void
  onInvoice: () => void
}) {
  const listPrice = period === "yearly" ? Math.round(pkg.yearly * 1.2) : Math.round(pkg.monthly * 1.15)
  const discount = listPrice - (period === "yearly" ? pkg.yearly : pkg.monthly)
  const total = period === "yearly" ? pkg.yearly : pkg.monthly
  const periodLabel = period === "yearly" ? "Gói 12 tháng" : "Gói 1 tháng"
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ"

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Stepper active={4} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px] shadow-sm">
          <div className="relative size-20">
            <img src={`${A}/48b1a.svg`} className="absolute block inset-0 size-full" alt="" />
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[28px]">Đăng Ký Thành Viên Thành Công!</p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-sm">
              Chào mừng hội viên <span className="font-['Inter:Bold'] font-bold text-[#0f172a]">{formData.fullName || "Khách hàng mới"}</span> gia nhập câu lạc bộ SportCenter
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full">
            {[
              ["Mã đơn đăng ký", "#SC-" + new Date().getTime().toString().slice(-6)],
              ["Gói thành viên", `${pkg.name} - ${periodLabel}`],
              ["Ngày kích hoạt", formData.startDate ? formData.startDate.split('-').reverse().join('/') : '...'],
              ["Cơ sở kích hoạt", formData.branch],
            ].map(([label, val]) => (
              <div key={label} className="flex items-start justify-between w-full">
                <span className="font-['Inter:Medium'] font-medium text-[#64748b] text-[13px]">{label}</span>
                <span className="font-['Inter:Bold'] font-bold text-[#0f172a] text-sm">{val}</span>
              </div>
            ))}
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/6be3b.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-sm">Tổng tiền đã thanh toán</span>
              <span className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-xl">{fmt(total)}</span>
            </div>
          </div>

          <div className="bg-teal-50 flex gap-2.5 items-center p-[16px] rounded-[12px] w-full border border-teal-200">
            <svg className="w-[20px] h-[20px] text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="font-['Inter:Medium'] font-medium text-teal-800 text-[13px] flex-1 leading-[18px]">
              Mã kích hoạt thẻ và hướng dẫn đặt lịch đã được gửi đến số điện thoại của bạn. Hãy hoàn thành kích hoạt thẻ trực tuyến ngay tiếp theo.
            </p>
          </div>

          <div className="flex gap-2 items-start justify-center w-full">
            <button
              type="button"
              onClick={onInvoice}
              className="bg-white border border-[#cbd5e1] flex-1 flex items-center justify-center py-[12px] rounded-[10px] font-['Inter:Semi_Bold'] font-semibold text-[#64748b] text-sm hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors"
            >
              Xem hóa đơn điện tử
            </button>
          </div>

          <div className="flex gap-[16px] items-start w-full">
            <button
              type="button"
              onClick={onHome}
              className="bg-white border border-[#cbd5e1] flex flex-1 items-center justify-center py-[16px] rounded-[12px] font-['Inter:Bold'] font-bold text-[#0f172a] text-[15px] hover:bg-[#f8fafc] transition-colors"
            >
              Về trang chủ
            </button>
            <button
              type="button"
              onClick={onActivate}
              className="bg-teal-500 flex flex-1 items-center justify-center py-[16px] rounded-[12px] font-['Inter:Bold'] font-bold text-white text-[15px] hover:bg-teal-600 transition-colors"
            >
              Kích hoạt thẻ thành viên ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}