import { CoachScreen } from "../types";
import { breadcrumbs, pageTitles } from "../constants";
import { IconBell } from "../Icons";

export default function CoachTopbar({ screen }: { screen: CoachScreen }) {
  return (
    <header className="flex justify-between items-center px-6 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{breadcrumbs[screen]}</p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{pageTitles[screen]}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-full border border-orange-200/50 dark:border-orange-500/20">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Đang trực tuyến • Ca chiều
        </div>
        <button 
          className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors" 
          aria-label="Thông báo" 
          type="button"
        >
          <IconBell />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-100 dark:border-slate-800 rounded-full" />
        </button>
      </div>
    </header>
  )
}