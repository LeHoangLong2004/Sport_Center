import React from 'react';
import { Page, navItems, avatarByPage } from '../shared';

export function Sidebar({ page, onNavigate, onLogout }: { page: Page; onNavigate: (p: Page) => void; onLogout: () => void }) {
  return (
    <div className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[230px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar">
      {/* Brand */}
      <div className="flex gap-[12px] items-center shrink-0 w-full">
        <div className="bg-[#a855f7] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-purple-500/20">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#a855f7] text-[9px] whitespace-nowrap tracking-wider">RECEPTIONIST</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-full">
        {navItems.map((item) => {
          const active = page === item.id || (page === "detail" && item.id === "lookup")
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${active ? "bg-[#a855f7] shadow-md shadow-purple-500/20" : "bg-transparent hover:bg-white/5"}`}
            >
              <img src={item.icon} alt="" className={`shrink-0 size-[18px] ${active ? "brightness-200" : ""}`} />
              <span className={`flex-1 font-['Manrope:${active ? "Bold" : "Medium"}'] ${active ? "font-bold text-white" : "font-medium text-[#cbd5e1]"} text-[14px] leading-normal`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Support card */}
      <div className="bg-[#1e293b] border border-[#334155] border-solid flex flex-col gap-[8px] items-start p-[16px] rounded-[12px] shrink-0 w-full">
        <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white w-full">Hỗ trợ Lễ Tân</span>
        <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-purple-400 text-[11px] w-full">
          Ấn nút F2 để mở nhanh ô quét mã check-in tức thì.
        </span>
      </div>

      {/* User profile */}
      <div className="pt-4 w-full mt-auto">
        <div className="cursor-pointer hover:bg-white/5 p-3 -mx-3 -mb-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => onNavigate("profile")}>
          <img src={avatarByPage[page]} alt="" className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#a855f7] transition-colors" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <p className="font-bold text-white text-[13px] truncate">Ngọc Mai</p>
            <p className="text-[#94a3b8] text-[11px] truncate">Bộ phận Lễ tân</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-[#0f172a]/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; }}
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Trang chủ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onLogout(); window.location.hash = "home"; window.location.reload(); }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
