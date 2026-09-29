import React, { useState } from "react";
import { A, BillingPeriod, PackageId, packages, Header, Stepper } from "./shared";

export function MemberInfoScreen({
  pkg,
  period,
  onNext,
  onBack,
}: {
  pkg: PackageId
  period: BillingPeriod
  onNext: () => void
  onBack: () => void
}) {
  const [agreed, setAgreed] = useState(true)

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={2} />
      <div className="flex flex-col gap-2 items-center pb-4 pt-4 w-full text-center">
        <p className="font-['Inter'] font-bold text-[#0f172a] text-[28px] leading-[36px]">Xác nhận hồ sơ & Thiết lập gói tập</p>
        <p className="font-['Inter'] font-normal text-[#64748b] text-[15px] w-[720px]">
          Vui lòng kiểm tra thông tin cá nhân và thời gian kích hoạt trước khi thanh toán.
        </p>
      </div>

      <div className="flex items-start justify-center pb-20 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Thông tin cá nhân hội viên</p>
              <div className="flex flex-col gap-[7px] w-full">
                <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Họ và tên *</label>
                <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                  <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nguyễn Lan Anh</span>
                </div>
              </div>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Số điện thoại *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">0901 234 567</span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Email nhận thông báo *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">lananh.nguyen@email.com</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Ngày sinh</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">15/08/1998</span>
                    <img src={`${A}/a54a6.svg`} className="size-[14px]" alt="" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Giới tính</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nữ</span>
                    <img src={`${A}/8e3c6.svg`} className="h-[6px] w-[10px]" alt="" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[7px] w-full">
                <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Liên hệ khẩn cấp (Người thân &amp; SĐT)</label>
                <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                  <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nguyễn Văn A - 0912 345 678</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Thiết lập thời gian &amp; Địa điểm tập luyện</p>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Ngày bắt đầu kích hoạt gói *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">21/09/2026</span>
                    <img src={`${A}/a54a6.svg`} className="size-[14px]" alt="" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Cơ sở tập luyện chính *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Chi nhánh Quận 1 - Flagship Center</span>
                    <img src={`${A}/8e3c6.svg`} className="h-[6px] w-[10px]" alt="" />
                  </div>
                </div>
              </div>
              <div className="bg-[#eff6ff] flex gap-2.5 items-center p-3 rounded-[8px] w-full">
                <img src={`${A}/db498.svg`} className="size-4 shrink-0" alt="" />
                <p className="font-['Inter'] font-medium text-[#2563eb] text-[13px] flex-1 leading-[18px]">
                  Gói tập 6 tháng của bạn sẽ có hiệu lực từ ngày 21/09/2026 đến hết ngày 21/03/2027.
                </p>
              </div>
            </div>

            <div className="flex items-start w-full">
              <button
                type="button"
                onClick={onBack}
                className="bg-white border-[1.5px] border-[#64748b] flex items-center px-6 py-3 rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
              >
                ← Quay lại chọn gói khác
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start w-[416px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Tóm tắt gói tập đã chọn</p>
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{packages[pkg].name}</p>
                <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
                  <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">Gói 6 tháng</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {packages[pkg].features.map((f) => (
                  <div key={f} className="flex gap-2 items-center w-full">
                    <img src={`${A}/6b931.svg`} className="size-[14px] shrink-0" alt="" />
                    <p className="font-['Inter'] font-normal text-[#334155] text-[13px] flex-1">{f}</p>
                  </div>
                ))}
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full text-sm">
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter'] font-semibold text-[#0f172a]">12.000.000 đ</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
                  <span className="font-['Inter'] font-bold text-[#16a34a]">-1.100.000 đ</span>
                </div>
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
                <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">10.900.000 đ</span>
              </div>
              <div className="flex gap-2.5 items-start w-full">
                <div className="bg-[#2563eb] flex items-center justify-center rounded-[4px] size-[18px] shrink-0">
                  <img src={`${A}/20925.svg`} className="size-[10px]" alt="" />
                </div>
                <p
                  className="font-['Inter'] font-normal text-[#64748b] text-[12px] leading-[18px] flex-1 cursor-pointer"
                  onClick={() => setAgreed(!agreed)}
                >
                  Tôi đồng ý với Quy chế hoạt động và Điều khoản thành viên của trung tâm thể thao.
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="bg-[#2563eb] flex items-center justify-center py-[14px] rounded-[8px] w-full font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
              >
                Tiến hành thanh toán →
              </button>
              <div className="flex gap-1.5 items-start justify-center w-full">
                <img src={`${A}/5a31b.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
                <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Thanh toán bảo mật và kích hoạt ngay lập tức</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}