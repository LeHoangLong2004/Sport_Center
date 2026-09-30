import React from 'react';
import { breadcrumbs, A } from '../shared';

export function TopBar({ breadcrumb, title, shiftLabel, onProfileClick }: { breadcrumb: string; title: string; shiftLabel?: string; onProfileClick?: () => void }) {
  return (
    <div className="bg-white border-[#e2e8f0] border-b border-solid flex h-[78px] items-center justify-between px-[32px] shrink-0 w-full">
      <div className="flex flex-col gap-[4px] items-start shrink-0">
        <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[11px]">{breadcrumb}</span>
        <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[20px]">{title}</span>
      </div>
      <div className="flex gap-[16px] items-center shrink-0">
        <div className="bg-[#ecfdf5] flex items-center px-[10px] py-[4px] rounded-[99px] shrink-0">
          <span className="font-['Manrope:Bold'] font-bold text-[#047857] text-[11px] whitespace-nowrap">
            {shiftLabel ?? "Ca sáng • Trực tuyến"}
          </span>
        </div>
        <div className="border border-[#e2e8f0] border-solid flex flex-col items-center justify-center rounded-[20px] shrink-0 size-[40px]">
          <img src={`${A}/06b01.svg`} alt="" className="size-[18px]" />
        </div>
        <img 
          src={`${A}/8a918.png`} 
          alt="Avatar" 
          className="rounded-full size-[38px] object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors" 
          onClick={onProfileClick}
        />
      </div>
    </div>
  )
}
