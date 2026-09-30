import React from 'react';
import { avatarTopbar, iSearch, iBell } from '../shared';

export function TopBar({ breadcrumb, title, onProfileClick }: { breadcrumb: string; title: string; onProfileClick?: () => void }) {
  return (
    <header className="bg-white border-b border-[#e2e8f0] flex h-[78px] items-center justify-between px-8 shrink-0 w-full">
      <div className="flex flex-col gap-1">
        <p className="text-[#94a3b8] text-[11px]">{breadcrumb}</p>
        <p className="font-extrabold text-[#0f172a] text-xl">{title}</p>
      </div>
      <div className="flex gap-4 items-center">
        <div className="bg-[#f1f5f9] flex gap-2 items-center px-3 py-2 rounded-lg w-[240px]">
          <img src={iSearch} alt="" className="size-4 shrink-0" />
          <span className="text-[#94a3b8] text-[12px] flex-1">Tìm nhanh hội viên, lớp...</span>
        </div>
        <button className="border border-[#e2e8f0] flex items-center justify-center rounded-full size-10">
          <img src={iBell} alt="" className="size-[18px]" />
        </button>
        <img 
          src={avatarTopbar} 
          alt="" 
          className="rounded-full size-[38px] object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors" 
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}
