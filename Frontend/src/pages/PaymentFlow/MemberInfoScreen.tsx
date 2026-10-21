import React, { useState } from "react";
import { A, BillingPeriod, FlowPackage, getPaymentSummary, Stepper, CustomDatePicker } from "./shared";
import { FadeUp } from "../../components/Motion";


export function MemberInfoScreen({
  pkg,
  period,
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  pkg: FlowPackage
  period: BillingPeriod
  formData: any
  setFormData: (val: any) => void
  onNext: () => void
  onBack: () => void
}) {
  const [agreed, setAgreed] = useState(true)
  const { listPrice, discount, total, periodLabel } = getPaymentSummary(pkg, period)
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ"



  const isLoggedIn = typeof window !== "undefined" && !!(localStorage.getItem("token") || localStorage.getItem("accessToken"))

  React.useEffect(() => {
    if (!formData.phone) {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const u = JSON.parse(userStr);
          const p = u.phoneNumber || u.phone;
          if (p) {
            setFormData((prev: any) => ({ ...prev, phone: p }));
          }
        }
      } catch {}
    }
  }, [formData.phone, setFormData]);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full min-h-screen pb-20">
      <Stepper active={2} />
      
      <div className="w-full max-w-[1120px] px-4 md:px-8 pb-6 pt-2">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
          >
            <span className="text-base group-hover:-translate-x-1 transition-transform">←</span>
            <span>Quay lại</span>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-['Inter:Extra_Bold'] font-extrabold text-[#0f172a] text-2xl md:text-3xl tracking-tight">
              Xác nhận hồ sơ & Thiết lập gói tập
            </h1>
            <p className="font-['Inter:Regular'] font-normal text-[#64748b] text-xs md:text-sm mt-0.5">
              Vui lòng kiểm tra thông tin cá nhân và thời gian kích hoạt trước khi thanh toán.
            </p>
          </div>
        </div>

        {!isLoggedIn && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 w-full mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">
                Bạn chưa đăng nhập. Vui lòng đăng nhập để liên kết gói tập vào tài khoản hội viên của bạn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { window.location.hash = "login" }}
              className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>

      <div className="flex items-start justify-center w-full px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-[32px] items-start w-full max-w-[1120px]">
          <FadeUp delay={0.2} className="flex flex-1 flex-col gap-[24px] items-start min-w-0 w-full">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[24px] items-start p-[32px] rounded-[16px] w-full shadow-xs">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-[16px] w-full">
                <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">
                  Thông tin cá nhân hội viên
                </h2>
                {isLoggedIn && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Thông tin từ tài khoản
                  </span>
                )}
              </div>
              
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
                  <select
                    value={formData.gender || ""}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-[8px] w-full md:col-span-2">
                  <label className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px]">Liên hệ khẩn cấp (Người thân & SĐT)</label>
                  <input value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} className="bg-white border border-[#cbd5e1] focus:border-[#2563eb] outline-none px-[16px] py-[12px] rounded-[10px] w-full font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px]" placeholder="VD: Nguyễn Văn A - 0912 345 678" />
                </div>
              </div>
            </div>


          </FadeUp>

          <FadeUp delay={0.3} className="flex flex-col items-start w-full lg:w-[400px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full shadow-lg shadow-blue-900/5 sticky top-24">
              <div className="flex items-center justify-between gap-3 w-full">
                <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[20px]">
                Tóm tắt gói tập
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chi tiết</span>
              </div>
              
              <div className="flex items-start justify-between gap-3 w-full bg-[#f8fafc] p-4 rounded-[12px] border border-[#e2e8f0]">
                <div className="min-w-0 flex-1">
                  <p className="font-['Inter:Bold'] font-bold text-[#0f172a] text-[18px]">{pkg.name}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{pkg.tagline}</p>
                </div>
                <div className="bg-teal-50 text-teal-600 flex items-start px-3 py-1 rounded-full border border-teal-200 shrink-0">
                  <p className="font-['Inter:Bold'] font-bold text-[12px] uppercase tracking-wider">{periodLabel}</p>
                </div>
              </div>

              {pkg.description && <p className="w-full text-[13px] leading-5 text-slate-600">{pkg.description}</p>}

              {pkg.details && pkg.details.length > 0 && (
                <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-[13px]">
                  {pkg.details.map(({ label, value }) => (
                    <div key={label} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-xs text-slate-500">{label}</dt>
                      <dd className="break-words font-semibold leading-5 text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              
              <div className="w-full rounded-xl border border-slate-100 bg-white p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Quyền lợi</p>
                <div className="flex flex-col gap-2.5 w-full">
                  {pkg.features.map((f: string, i: number) => (
                    <div key={i} className="flex gap-2 items-start w-full">
                      <div className="bg-[#dcfce7] p-1 rounded-full mt-0.5 shrink-0">
                        <svg className="w-3 h-3 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <p className="font-['Inter:Medium'] font-medium text-[#475569] text-[13px] flex-1 leading-5">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
              {pkg.terms && pkg.terms.length > 0 && (
                <div className="w-full border-t border-slate-200 pt-3">
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">Lưu ý gói tập</p>
                  <ul className="w-full list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
                    {pkg.terms.map((term, index) => <li key={`${term}-${index}`}>{term}</li>)}
                  </ul>
                </div>
              )}
              
              <div className="w-full border-t border-slate-200 pt-4" />
              
              <div className="flex flex-col gap-2.5 w-full text-[13px]">
                <div className="flex items-start justify-between gap-3 w-full">
                  <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter:Semi_Bold'] font-semibold text-right text-[#0f172a]">{fmt(listPrice)}</span>
                </div>
                <div className="flex items-start justify-between gap-3 w-full">
                  <span className="font-['Inter:Medium'] font-medium text-[#64748b]">Ưu đãi thanh toán</span>
                  <span className="font-['Inter:Bold'] font-bold text-right text-[#10b981]">-{fmt(discount)}</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-3 w-full border-t border-dashed border-[#e2e8f0] pt-4">
                <div>
                  <span className="block font-['Inter:Semi_Bold'] font-semibold text-[#0f172a] text-[16px]">Tổng thanh toán</span>
                  <span className="mt-1 block text-[11px] text-slate-400">Đã bao gồm ưu đãi</span>
                </div>
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
                    if (!userStr) {
                      if (window.confirm("Bạn cần đăng nhập tài khoản để tiến hành thanh toán và liên kết gói tập. Bạn có muốn chuyển đến trang Đăng nhập ngay bây giờ?")) {
                        window.location.hash = "login";
                      }
                      return;
                    }
                    const user = JSON.parse(userStr)
                    const token = localStorage.getItem("accessToken") || localStorage.getItem("token")
                    const response = await fetch(`/api/users/${user.id}/profile`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({
                        fullName: formData.fullName,
                        phoneNumber: formData.phone,
                        email: formData.email,
                        dateOfBirth: formData.dob || null,
                        gender: formData.gender,
                        emergencyContact: formData.emergencyContact || null
                      })
                    })
                    if (!response.ok) {
                      const errorBody = await response.json().catch(() => ({}))
                      throw new Error(errorBody.message || errorBody.title || `Không thể cập nhật hồ sơ (${response.status}).`)
                    }

                    const updatedUser = {
                      ...user,
                      fullName: formData.fullName,
                      phoneNumber: formData.phone,
                      email: formData.email,
                      dateOfBirth: formData.dob || null,
                      gender: formData.gender
                    }
                    localStorage.setItem("user", JSON.stringify(updatedUser))
                    window.dispatchEvent(new Event('local-storage-update'))
                  } catch (error) {
                    alert(error instanceof Error ? error.message : "Không thể cập nhật hồ sơ hội viên.")
                    return
                  }

                  onNext()
                }}
                disabled={!agreed}
                className={`bg-teal-500 flex items-center justify-center py-[16px] rounded-[12px] w-full font-['Inter:Bold'] font-bold text-white text-[16px] transition-all ${agreed ? 'hover:bg-teal-600' : 'opacity-50 cursor-not-allowed grayscale'}`}
              >
                Tiếp tục đến thanh toán →
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
