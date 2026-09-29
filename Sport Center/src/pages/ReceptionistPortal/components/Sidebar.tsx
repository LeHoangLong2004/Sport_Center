import React from 'react';
import { Page, navItems, avatarByPage } from '../shared';

export function Sidebar({ page, onNavigate, onLogout }: { page: Page; onNavigate: (p: Page) => void; onLogout: () => void }) {
  return (
    <div className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] self-stretch shrink-0 w-[260px]">
      {/* Brand */}
      <div className="flex gap-[12px] items-center shrink-0 w-full">
        <div className="bg-[#14b8a6] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[15px] text-white whitespace-nowrap">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#14b8a6] text-[9px] whitespace-nowrap">RECEPTIONIST</span>
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
              className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left ${active ? "bg-[#3b82f6]" : "bg-transparent"}`}
            >
              <img src={item.icon} alt="" className="shrink-0 size-[18px]" />
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
        <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-[#94a3b8] text-[11px] w-full">
          Ấn nút F2 để mở nhanh ô quét mã check-in tức thì.
        </span>
      </div>

      {/* User profile */}
      <div className="border-[#1e293b] border-t border-solid flex gap-[12px] items-center pt-[16px] shrink-0 w-full">
        <img src={avatarByPage[page]} alt="" className="shrink-0 size-[40px] rounded-full object-cover" />
        <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
          <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white w-full">Ngọc Mai</span>
          <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[11px] w-full">Bộ phận Lễ tân</span>
        </div>
        <button type="button" onClick={onLogout} title="Đăng xuất" className="text-[#64748b] hover:text-white text-[11px] font-['Manrope:Medium'] shrink-0">
          Thoát
        </button>
      </div>
    </div>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
