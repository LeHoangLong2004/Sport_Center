import React, { useState } from "react";
import { A, BillingPeriod, PackageId, packages, Header, Stepper } from "./shared";
import { FadeUp } from "../../components/Motion";

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
    <div className="bg-slate-50 dark:bg-[#0f172a] flex flex-col items-center w-full min-h-screen transition-colors duration-300 pb-20">
      <div className="w-full self-start"><Header /></div>
      <Stepper active={2} />
      
      <FadeUp delay={0.1} className="flex flex-col gap-3 items-center pb-8 pt-4 w-full text-center px-4">
        <h1 className="font-sans font-extrabold text-slate-900 dark:text-white text-3xl md:text-4xl tracking-tight">
          Xác nhận hồ sơ & Thiết lập gói tập
        </h1>
        <p className="font-sans font-normal text-slate-500 dark:text-slate-400 text-base max-w-2xl">
          Vui lòng kiểm tra thông tin cá nhân và thời gian kích hoạt trước khi thanh toán.
        </p>
      </FadeUp>

      <div className="flex items-start justify-center w-full px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-[1100px]">
          <FadeUp delay={0.2} className="flex flex-1 flex-col gap-6 items-start min-w-0 w-full">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-6 items-start p-6 md:p-8 rounded-2xl w-full shadow-sm transition-colors duration-300">
              <h2 className="font-sans font-bold text-slate-900 dark:text-white text-xl border-b border-slate-100 dark:border-slate-700 pb-4 w-full">
                Thông tin cá nhân hội viên
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="flex flex-col gap-2 w-full md:col-span-2">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Họ và tên *</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">Nguyễn Lan Anh</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Số điện thoại *</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">0901 234 567</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Email nhận thông báo *</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm truncate">lananh.nguyen@email.com</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Ngày sinh</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">15/08/1998</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Giới tính</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">Nữ</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:col-span-2">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Liên hệ khẩn cấp (Người thân & SĐT)</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">Nguyễn Văn A - 0912 345 678</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-6 items-start p-6 md:p-8 rounded-2xl w-full shadow-sm transition-colors duration-300">
              <h2 className="font-sans font-bold text-slate-900 dark:text-white text-xl border-b border-slate-100 dark:border-slate-700 pb-4 w-full">
                Thiết lập thời gian & Địa điểm
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Ngày bắt đầu *</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm">21/09/2026</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <label className="font-sans font-semibold text-slate-700 dark:text-slate-300 text-sm">Cơ sở tập luyện chính *</label>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 py-3 rounded-xl w-full">
                    <span className="font-sans font-medium text-slate-900 dark:text-white text-sm truncate">Chi nhánh Quận 1 - Flagship Center</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 flex gap-3 items-center p-4 rounded-xl w-full">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="font-sans font-medium text-blue-700 dark:text-blue-300 text-sm flex-1 leading-relaxed">
                  Gói tập 6 tháng của bạn sẽ có hiệu lực từ ngày 21/09/2026 đến hết ngày 21/03/2027.
                </p>
              </div>
            </div>

            <div className="flex items-start w-full pt-2">
              <button
                type="button"
                onClick={onBack}
                className="group flex items-center px-6 py-3 rounded-xl font-sans font-semibold text-slate-500 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Quay lại chọn gói khác
              </button>
            </div>
          </FadeUp>

          <FadeUp delay={0.3} className="flex flex-col items-start w-full lg:w-[420px] shrink-0">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-6 items-start p-6 md:p-8 rounded-2xl w-full shadow-lg shadow-blue-900/5 transition-colors duration-300 sticky top-24">
              <h2 className="font-sans font-bold text-slate-900 dark:text-white text-xl w-full">
                Tóm tắt gói tập
              </h2>
              
              <div className="flex items-center justify-between w-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="font-sans font-bold text-slate-900 dark:text-white text-lg">{packages[pkg].name}</p>
                <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-start px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">
                  <p className="font-sans font-bold text-xs uppercase tracking-wider">Gói 6 tháng</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                {packages[pkg].features.map((f, i) => (
                  <div key={i} className="flex gap-3 items-start w-full">
                    <div className="bg-teal-100 dark:bg-teal-900/40 p-1 rounded-full mt-0.5">
                      <svg className="w-3 h-3 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <p className="font-sans font-medium text-slate-600 dark:text-slate-300 text-sm flex-1 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
              
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2" />
              
              <div className="flex flex-col gap-3 w-full text-sm">
                <div className="flex items-start justify-between w-full">
                  <span className="font-sans font-medium text-slate-500 dark:text-slate-400">Giá niêm yết</span>
                  <span className="font-sans font-semibold text-slate-900 dark:text-white">12.000.000 đ</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-sans font-medium text-slate-500 dark:text-slate-400">Ưu đãi thanh toán</span>
                  <span className="font-sans font-bold text-teal-600 dark:text-teal-400">-1.100.000 đ</span>
                </div>
              </div>
              
              <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700 my-2" />
              
              <div className="flex items-end justify-between w-full">
                <span className="font-sans font-semibold text-slate-900 dark:text-white text-base">Tổng thanh toán</span>
                <span className="font-sans font-black text-blue-600 dark:text-blue-400 text-3xl tracking-tight">10.900.000 đ</span>
              </div>
              
              <label className="flex gap-3 items-start w-full mt-2 cursor-pointer group">
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${agreed ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-500'}`}>
                  {agreed && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                </div>
                <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
                <p className="font-sans font-medium text-slate-500 dark:text-slate-400 text-xs leading-relaxed flex-1 select-none">
                  Tôi đã đọc và đồng ý với Quy chế hoạt động và Điều khoản hội viên của SportCenter.
                </p>
              </label>
              
              <button
                type="button"
                onClick={onNext}
                disabled={!agreed}
                className={`bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center py-4 rounded-xl w-full font-sans font-bold text-white text-base shadow-lg shadow-blue-500/25 transition-all ${agreed ? 'hover:-translate-y-0.5 hover:shadow-blue-500/40 active:translate-y-0' : 'opacity-50 cursor-not-allowed grayscale'}`}
              >
                Tiến hành thanh toán →
              </button>
              
              <div className="flex gap-2 items-center justify-center w-full bg-slate-50 dark:bg-slate-900/50 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.965 11.965 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                <span className="font-sans font-medium text-slate-500 dark:text-slate-400 text-xs">Thanh toán bảo mật & Kích hoạt tức thì</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  )
}