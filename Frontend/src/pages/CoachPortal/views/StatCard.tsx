import React from "react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub: string;
  highlight?: boolean;
  onClick?: () => void;
}

export function StatCard({ icon, label, value, sub, highlight, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 transition-all ${
        highlight
          ? "border-amber-300 dark:border-amber-700/60 shadow-sm"
          : "border-slate-200/90 dark:border-slate-800 shadow-sm"
      } ${onClick ? "cursor-pointer hover:border-slate-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
