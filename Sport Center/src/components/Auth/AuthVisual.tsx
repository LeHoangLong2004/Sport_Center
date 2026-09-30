import React from 'react';
import { assets } from './shared';

export function Brand() {
  return (
    <div className="flex gap-3 items-center z-10 relative">
      <div className="bg-[#14b8a6] flex items-center justify-center rounded-[10px] w-12 h-12 shadow-lg shadow-teal-500/20">
        <span className="font-extrabold text-white dark:text-[#0f172a] text-xl">SC</span>
      </div>
      <div className="flex flex-col">
        <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-wider">SPORTCENTER</span>
        <span className="font-bold text-[#14b8a6] text-[10px] tracking-widest uppercase">Operating System</span>
      </div>
    </div>
  )
}

export function AuthVisual({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <section className="relative hidden lg:flex flex-col justify-between w-1/2 bg-slate-50 dark:bg-[#0f172a] p-12 overflow-hidden transition-colors duration-300">
      <img 
        className="absolute inset-0 w-full h-full object-cover dark:opacity-60" 
        src={`${assets}/sport_center_auth_bg.jpg`} 
        alt="Premium Sport Center" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/60 to-transparent dark:from-[#0f172a] dark:via-[#0f172a]/60 transition-colors duration-300" />
      
      <Brand />

      <div className="z-10 relative mt-auto mb-16">
        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-400 dark:bg-orange-400/10 rounded-full border dark:border-orange-400/20 transition-colors duration-300">
          VẬN HÀNH ĐA BỘ MÔN
        </span>
        <h1 className={`text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300 ${emphasized ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-[#cbd5e1]' : ''}`}>
          Năng lượng cho<br />mọi chuyển động.
        </h1>
        <p className="text-slate-600 dark:text-[#94a3b8] text-lg max-w-md leading-relaxed transition-colors duration-300">
          Một hệ thống thống nhất cho thành viên, lớp học, thanh toán và huấn
          luyện thông minh.
        </p>
      </div>

      <p className="z-10 relative text-sm text-slate-500 dark:text-[#64748b] font-medium transition-colors duration-300">
        © 2026 Sports Center • Bảo mật dữ liệu vận hành
      </p>
    </section>
  )
}