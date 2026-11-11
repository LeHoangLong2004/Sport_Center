import React from 'react';

export default function KpiCard({
  label, value, sub, badge, badgeColor, icon, iconBg
}: {
  label: string; value: string; sub: string; badge?: string
  badgeColor?: "green" | "yellow" | "red"; icon?: string; iconBg?: string
}) {
  const badgeStyle = badgeColor === "green" ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
    : badgeColor === "yellow" ? "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
  
  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg transition-all duration-200 flex flex-1 flex-col justify-between min-w-0 p-6 rounded-2xl group relative overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider flex-1 min-w-0">{label}</p>
        <span className="size-2 rounded-full bg-emerald-500 shrink-0 group-hover:scale-125 transition-transform" />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <p className="font-black text-slate-900 dark:text-white text-3xl tracking-tight">{value}</p>
        <div className="flex flex-wrap gap-2 items-center">
          {badge && (
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${badgeStyle}`}>{badge}</span>
          )}
          <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{sub}</span>
        </div>
      </div>
    </div>
  )
}
