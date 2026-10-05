import React from 'react';
import { breadcrumbs, A } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';

export function TopBar({ breadcrumb, title, shiftLabel, onProfileClick }: { breadcrumb: string; title: string; shiftLabel?: string; onProfileClick?: () => void }) {
  const userStr = localStorage.getItem("user");
  let userName = "Lễ tân";
  let avatarUrl = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userName = user.fullName || user.name || user.email?.split('@')[0] || "Lễ tân";
      avatarUrl = user.avatarUrl;
    } catch(e) {}
  }

  return (
    <header className="flex justify-between items-center px-6 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{breadcrumb}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {shiftLabel ?? "Ca sáng • Trực tuyến"}
        </div>
        <button 
          className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <img src={`${A}/06b01.svg`} alt="" className="size-5 brightness-50 dark:brightness-150" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-purple-500 border-2 border-slate-100 dark:border-slate-800 rounded-full" />
        </button>
        <UserAvatar 
          src={avatarUrl} 
          name={userName}
          className="rounded-full size-11 object-cover cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors shadow-sm" 
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}
