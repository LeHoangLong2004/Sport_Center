import React, { useState } from "react";
import { A, BillingPeriod, Stepper, CustomDatePicker } from "./shared";
import { FadeUp } from "../../components/Motion";


export function MemberInfoScreen({
  pkg,
  period,
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  pkg: any
  period: BillingPeriod
  formData: any
  setFormData: (val: any) => void
  onNext: () => void
  onBack: () => void
}) {
  const [agreed, setAgreed] = useState(true)
  const listPrice = period === "yearly" ? Math.round(pkg.yearly * 1.2) : Math.round(pkg.monthly * 1.15)
  const discount = listPrice - (period === "yearly" ? pkg.yearly : pkg.monthly)
  const total = period === "yearly" ? pkg.yearly : pkg.monthly
  const periodLabel = period === "yearly" ? "Thanh toán năm" : "Thanh toán tháng"
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ"



  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-screen pb-20">
      <Stepper active={2} />
      
      <FadeUp delay={0.1} className="flex flex-col gap-3 items-center pb-8 pt-4 w-full text-center px-4">
        <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-3xl md:text-4xl tracking-tight">
          Xác nhận hồ sơ & Thiết lập gói tập
        </h1>
        <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-base max-w-2xl">
          Vui lòng kiểm tra thông tin cá nhân và thời gian kích hoạt trước khi thanh toán.
        </p>
      </FadeUp>

      <div className="flex items-start justify-center w-full px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-[32px] items-start w-full max-w-[1120px]">
          <FadeUp delay={0.2} className="flex flex-1 flex-col gap-[24px] items-start min-w-0 w-full">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[24px] items-start p-[32px] rounded-[16px] w-full">
              <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px] border-b border-[#e2e8f0] pb-[16px] w-full">
                Thông tin cá nhân hội viên
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full">
                <div className="flex flex-col gap-[8px] w-full md:col-span-2">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Họ và tên *</label>
                  <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]" placeholder="Nhập họ và tên" />
                </div>
                
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Số điện thoại *</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]" placeholder="Nhập số điện thoại" />
                </div>
                
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Email nhận thông báo *</label>
                  <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]" placeholder="Nhập email" />
                </div>
                
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Ngày sinh</label>
                  <CustomDatePicker value={formData.dob} onChange={v => setFormData({...formData, dob: v})} />
                </div>
                
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Giới tính</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]">
                    <option>Nam</option>
                    <option>Nữ</option>
                    <option>Khác</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-[8px] w-full md:col-span-2">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Liên hệ khẩn cấp (Người thân & SĐT)</label>
                  <input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]" placeholder="VD: Nguyễn Văn A - 0912 345 678" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[24px] items-start p-[32px] rounded-[16px] w-full">
              <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px] border-b border-[#e2e8f0] pb-[16px] w-full">
                Thiết lập thời gian & Địa điểm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] w-full">
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Ngày bắt đầu *</label>
                  <CustomDatePicker value={formData.startDate} onChange={v => setFormData({...formData, startDate: v})} />
                </div>
                <div className="flex flex-col gap-[8px] min-w-0">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Cơ sở tập luyện chính *</label>
                  <select value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]">
                    <option>Chi nhánh Quận 1 - Flagship Center</option>
                    <option>Chi nhánh Quận 2 - Premium Center</option>
                    <option>Chi nhánh Quận 7 - Standard Center</option>
                  </select>
                </div>
              </div>
              <div className="bg-[#eff6ff] border border-[#bfdbfe] flex gap-[12px] items-center p-[16px] rounded-[12px] w-full">
                <svg className="w-[20px] h-[20px] text-[#2563eb] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="font-['Inter:Medium'] font-medium text-[#1e40af] text-[14px] flex-1 leading-relaxed">
                  Gói tập của bạn sẽ có hiệu lực từ ngày {formData.startDate ? formData.startDate.split('-').reverse().join('/') : '...'}.
                </p>
              </div>
            </div>

            <div className="flex items-start w-full pt-[8px]">
              <button
                type="button"
                onClick={onBack}
                className="group flex items-center px-[24px] py-[12px] rounded-[12px] font-['Inter:Semi_Bold'] font-semibold text-[#64748b] text-[14px] hover:text-[#0f172a] hover:bg-white transition-colors"
              >
                <svg className="w-[16px] h-[16px] mr-[8px] group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Quay lại chọn gói khác
              </button>
            </div>
          </FadeUp>

          <FadeUp delay={0.3} className="flex flex-col items-start w-full lg:w-[400px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[24px] items-start p-[32px] rounded-[16px] w-full shadow-lg shadow-blue-900/5 sticky top-24">
              <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px] w-full">
                Tóm tắt gói tập
              </h2>
              
              <div className="flex items-center justify-between w-full bg-[#f8fafc] p-[16px] rounded-[12px] border border-[#e2e8f0]">
                <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">{pkg.name}</p>
                <div className="bg-teal-50 text-teal-600 flex items-start px-[12px] py-[4px] rounded-full border border-teal-200">
                  <p className="font-['Inter:Bold'] font-bold text-[12px] uppercase tracking-wider">{periodLabel}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-[12px] w-full">
                {pkg.features.map((f: string, i: number) => (
                  <div key={i} className="flex gap-[12px] items-start w-full">
                    <div className="bg-[#dcfce7] p-[4px] rounded-full mt-[2px]">
                      <svg className="w-[12px] h-[12px] text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="font-['Inter:Medium'] font-medium text-[#475569] text-[14px] flex-1 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
              
              <div className="w-full h-px bg-[#e2e8f0] my-[8px]" />
              
              <div className="flex flex-col gap-[12px] w-full text-[14px]">
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a]">{fmt(listPrice)}</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Ưu đãi thanh toán</span>
                  <span className="font-['Inter:Bold'] font-bold text-[#10b981]">-{fmt(discount)}</span>
                </div>
              </div>
              
              <div className="w-full border-t-2 border-dashed border-[#e2e8f0] my-[8px]" />
              
              <div className="flex items-end justify-between w-full">
                <span className="font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[16px]">Tổng thanh toán</span>
                <span className="font-['Inter:Extra_Bold'] font-extrabold text-teal-600 text-[28px] tracking-tight">{fmt(total)}</span>
              </div>
              
              <label className="flex gap-[12px] items-start w-full mt-[8px] cursor-pointer group">
                <div className={`mt-[2px] w-[20px] h-[20px] rounded border flex items-center justify-center transition-colors shrink-0 ${agreed ? 'bg-teal-500 border-teal-500' : 'bg-white border-[#cbd5e1] group-hover:border-teal-500'}`}>
                  {agreed && <svg className="w-[14px] h-[14px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
                <p className="font-['Inter:Medium'] font-medium text-[#64748b] text-[13px] leading-relaxed flex-1 select-none">
                  Tôi đã đọc và đồng ý với Quy chế hoạt động và Điều khoản hội viên của SportCenter.
                </p>
              </label>
              
              <button
                type="button"
                onClick={async () => {
                  if (!formData.fullName || !formData.phone || !formData.email || !formData.startDate) {
                    alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*).")
                    return;
                  }

                  try {
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                      const user = JSON.parse(userStr);
                      const response = await fetch(`/api/users/${user.id}/profile`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          fullName: formData.fullName,
                          phoneNumber: formData.phone,
                          email: formData.email,
                          dateOfBirth: formData.dob || null,
                          gender: formData.gender,
                          emergencyContact: formData.emergencyContact || null
                        })
                      });
                      
                      if (response.ok) {
                        const updatedUser = { ...user, fullName: formData.fullName, phoneNumber: formData.phone, email: formData.email, dateOfBirth: formData.dob || null, gender: formData.gender };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        window.dispatchEvent(new Event('local-storage-update'));
                      }
                    }
                  } catch (e) {
                    console.error("Failed to update profile", e);
                  }

                  onNext()
                }}
                disabled={!agreed}
                className={`bg-teal-500 flex items-center justify-center py-[16px] rounded-[12px] w-full font-['Inter:Bold'] font-bold text-white text-[16px] transition-all ${agreed ? 'hover:bg-teal-600' : 'opacity-50 cursor-not-allowed grayscale'}`}
              >
                Tiến hành thanh toán →
              </button>
              
              <div className="flex gap-[8px] items-center justify-center w-full bg-[#f8fafc] py-[8px] rounded-[8px] border border-[#e2e8f0]">
                <svg className="w-[16px] h-[16px] text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span className="font-['Inter:Medium'] font-medium text-[#64748b] text-[13px]">Thanh toán bảo mật & Kích hoạt tức thì</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}
