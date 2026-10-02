import React from 'react';

export default function KpiCard({
  label, value, sub, badge, badgeColor, icon, iconBg
}: {
  label: string; value: string; sub: string; badge?: string
  badgeColor?: "green" | "yellow" | "red"; icon: string; iconBg: string
}) {
  const badgeStyle = badgeColor === "green" ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
    : badgeColor === "yellow" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
    : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
  
  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:shadow-xl transition-shadow flex flex-1 flex-col gap-4 min-w-0 p-6 rounded-2xl group">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wide flex-1 min-w-0">{label}</p>
        <div className={`flex items-center justify-center rounded-xl size-12 ${iconBg} group-hover:scale-110 transition-transform`}>
          <img src={icon} alt="" className="size-6 brightness-0 dark:invert opacity-70" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-black text-slate-900 dark:text-white text-3xl tracking-tight">{value}</p>
        <div className="flex gap-2 items-center">
          {badge && (
            <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider ${badgeStyle}`}>{badge}</span>
          )}
          <span className="text-slate-500 dark:text-slate-400 font-medium text-xs">{sub}</span>
        </div>
      </div>
    </div>
  )
}
