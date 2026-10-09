import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

export function RegisterPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  React.useEffect(() => {
    fetch("/api/packages/plans")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlans(data)
          if (data.length > 0) setSelectedPlan(data[0].id)
        }
      })
      .catch(console.error)
  }, [])

  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Left: Personal info */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[28px] rounded-[12px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Thông tin cá nhân hội viên</span>
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Họ và tên khách hàng *</label>
            <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="Lê Hoài Nam" />
          </div>
          <div className="flex gap-[16px] items-start w-full">
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Số điện thoại *</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="0912 345 678" />
            </div>
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Địa chỉ Email</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#94a3b8] text-[14px] w-full outline-none" defaultValue="nam.le@gmail.com" />
            </div>
          </div>
          <div className="flex gap-[16px] items-start w-full">
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Ngày sinh *</label>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between p-[12px] rounded-[8px] w-full">
                <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[14px]">15/08/1996</span>
                <img src={`${A}/2ebce.svg`} alt="" className="size-[16px] shrink-0" />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Số CCCD/Passport *</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="012345678912" />
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Ghi chú y tế / Thể trạng</label>
            <textarea className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#94a3b8] text-[14px] w-full outline-none resize-none h-[80px]" defaultValue="Khách muốn tập trung giảm mỡ bụng, có tiền sử hơi đau khớp gối nhẹ..." />
          </div>
        </div>

        {/* Right: Package selection */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[28px] rounded-[12px] shrink-0 w-[580px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Chọn gói tập hội viên</span>
          <div className="flex flex-col gap-[10px] items-start w-full">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`flex items-center justify-between p-[14px] rounded-[8px] shrink-0 w-full text-left transition-colors ${active ? "bg-[#eff6ff] border-[#3b82f6] border-[1.5px] border-solid" : "border border-[#e2e8f0] border-solid"}`}
                >
                  <div className="flex gap-[12px] items-center shrink-0">
                    <img src={`${A}/7d611.svg`} alt="" className="size-[20px]" />
                    <div className="flex flex-col gap-[2px] items-start shrink-0">
                      <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">{plan.planName}</span>
                      <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">{plan.description}</span>
                    </div>
                  </div>
                  <span className={`font-['Manrope:ExtraBold'] font-extrabold text-[15px] whitespace-nowrap ${active ? "text-[#3b82f6]" : "text-[#0f172a]"}`}>{plan.price.toLocaleString("vi-VN")}đ</span>
                </button>
              )
            })}
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Phương thức thanh toán *</span>
            <div className="bg-white border border-[#e2e8f0] border-solid flex items-center justify-between p-[12px] rounded-[8px] w-full">
              <div className="flex gap-[8px] items-center shrink-0">
                <img src={`${A}/a9018.svg`} alt="" className="size-[16px]" />
                <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[14px]">Chuyển khoản Ngân hàng (QR Code)</span>
              </div>
              <img src={`${A}/45d62.svg`} alt="" className="size-[14px] shrink-0" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className={`flex items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full transition-colors ${submitted ? "bg-[#16a34a]" : "bg-[#3b82f6]"}`}
          >
            <span className="font-['Manrope:Bold'] font-bold text-[15px] text-white">
              {submitted ? "✓ ĐÃ ĐĂNG KÝ THÀNH CÔNG" : "HOÀN TẤT ĐĂNG KÝ HỘI VIÊN"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

