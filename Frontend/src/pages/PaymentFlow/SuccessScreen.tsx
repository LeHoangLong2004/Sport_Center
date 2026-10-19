import React from "react";
import { A, getPaymentSummary, FlowPackage, Stepper, BillingPeriod } from "./shared";

export function SuccessScreen({
  pkg,
  period,
  formData,
  onActivate,
  onHome,
  onInvoice,
}: {
  pkg: FlowPackage
  period: BillingPeriod
  formData: any
  onActivate: () => void
  onHome: () => void
  onInvoice: () => void
}) {
  const { total, periodLabel } = getPaymentSummary(pkg, period)
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ"

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Stepper active={4} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px] shadow-sm">
          <div className="relative size-20">
            {pkg.orderStatus === "paid" ? (
              <img src={`${A}/48b1a.svg`} className="absolute block inset-0 size-full" alt="" />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-amber-100 text-3xl text-amber-600 border-2 border-amber-300">
                🎫
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-[28px]">
              {pkg.orderStatus === "paid" ? "Thanh toán thành công!" : "Đã tạo phiếu đăng ký tại quầy!"}
            </p>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-sm max-w-lg">
              {pkg.orderStatus === "paid"
                ? <>Chào mừng hội viên <span className="font-['Inter:Bold'] font-bold text-[#0f172a]">{formData.fullName || "Khách hàng mới"}</span> gia nhập câu lạc bộ SportCenter</>
                : <>Phiếu đăng ký của <span className="font-['Inter:Bold'] font-bold text-[#0f172a]">{formData.fullName || "hội viên"}</span> đã được gửi tới quầy lễ tân. Vui lòng hoàn tất thanh toán trong <strong>24 giờ</strong> để kích hoạt gói tập.</>}
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[16px] w-full">
            {[
              ["Mã đơn đăng ký", pkg.orderId || "#SC-" + new Date().getTime().toString().slice(-6)],
              ["Gói đã chọn", `${pkg.name} - ${periodLabel}`],
              [pkg.orderStatus === "paid" ? "Ngày hiệu lực" : "Ngày hiệu lực dự kiến", pkg.startDate ? new Date(pkg.startDate).toLocaleDateString("vi-VN") : formData.startDate ? formData.startDate.split('-').reverse().join('/') : '...'],
              ["Cơ sở kích hoạt", formData.branch],
            ].map(([label, val]) => (
              <div key={label} className="flex items-start justify-between w-full">
                <span className="font-['Inter:Medium'] font-medium text-[#64748b] text-[13px]">{label}</span>
                <span className="font-['Inter:Bold'] font-bold text-[#0f172a] text-sm">{val}</span>
              </div>
            ))}
            {pkg.description && <p className="w-full text-sm leading-6 text-slate-600">{pkg.description}</p>}
            {pkg.details?.map(({ label, value }) => (
              <div key={label} className="flex w-full items-start justify-between gap-4 text-sm">
                <span className="text-slate-500">{label}</span>
                <span className="text-right font-semibold text-slate-800">{value}</span>
              </div>
            ))}
            {pkg.features.length > 0 && (
              <div className="w-full">
                <p className="mb-2 text-sm font-semibold text-slate-700">Quyền lợi</p>
                <ul className="space-y-1 text-sm text-slate-600">
                  {pkg.features.map((feature, index) => <li key={`${feature}-${index}`}>• {feature}</li>)}
                </ul>
              </div>
            )}
            {pkg.terms && pkg.terms.length > 0 && (
              <div className="w-full">
                <p className="mb-2 text-sm font-semibold text-slate-700">Điều kiện sử dụng</p>
                <ul className="list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
                  {pkg.terms.map((term, index) => <li key={`${term}-${index}`}>{term}</li>)}
                </ul>
              </div>
            )}
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/6be3b.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-sm">
                {pkg.orderStatus === "paid" ? "Tổng tiền đã thanh toán" : "Tổng tiền đơn hàng"}
              </span>
              <span className="font-['Inter:Extra_Bold'] font-extrabold text-[#10b981] text-xl">{fmt(total)}</span>
            </div>
          </div>

          {pkg.orderStatus === "paid" ? (
            <div className="bg-teal-50 flex gap-2.5 items-center p-[16px] rounded-[12px] w-full border border-teal-200">
              <svg className="w-[20px] h-[20px] text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="font-['Inter:Medium'] font-medium text-teal-800 text-[13px] flex-1 leading-[18px]">
                Gói tập đã được thanh toán thành công và quyền lợi được áp dụng theo thời hạn hiển thị trong đơn hàng.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 flex gap-3 items-start p-[16px] rounded-[12px] w-full border border-amber-300">
              <span className="text-xl shrink-0">📍</span>
              <div className="flex flex-col gap-1 text-[13px] text-amber-900">
                <p className="font-['Inter:Bold'] font-bold">Hướng dẫn thanh toán tại quầy lễ tân:</p>
                <p className="leading-5">
                  1. Đến quầy lễ tân tại cơ sở <strong>{formData.branch || "SportCenter"}</strong> trong vòng <strong>24 giờ</strong>.<br />
                  2. Đọc <strong>Số điện thoại</strong> ({formData.phone || "đã đăng ký"}) hoặc đưa <strong>Mã đơn hàng</strong> cho lễ tân.<br />
                  3. Thanh toán bằng tiền mặt hoặc quẹt thẻ POS. Lễ tân sẽ xác nhận thu tiền và kích hoạt thẻ/quyền lợi cho bạn ngay lập tức.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 items-start justify-center w-full">
            <button
              type="button"
              onClick={onInvoice}
              className="bg-white border border-[#cbd5e1] flex-1 flex items-center justify-center py-[12px] rounded-[10px] font-['Inter:Semi_Bold'] font-semibold text-[#64748b] text-sm hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors"
            >
              {pkg.orderStatus === "paid" ? "Xem hóa đơn điện tử" : "Xem phiếu hẹn tạm tính"}
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
            {pkg.orderStatus === "paid" ? (
              pkg.category !== "sport" && (
                <button
                  type="button"
                  onClick={onActivate}
                  className="bg-teal-500 flex flex-1 items-center justify-center py-[16px] rounded-[12px] font-['Inter:Bold'] font-bold text-white text-[15px] hover:bg-teal-600 transition-colors"
                >
                  Kích hoạt thẻ thành viên ngay →
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={onHome}
                className="bg-amber-600 flex flex-1 items-center justify-center py-[16px] rounded-[12px] font-['Inter:Bold'] font-bold text-white text-[15px] hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Đã hiểu, về trang chủ →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}