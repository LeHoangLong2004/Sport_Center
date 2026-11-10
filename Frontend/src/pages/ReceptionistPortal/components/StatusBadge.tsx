import React from 'react';
import { breadcrumbs } from '../shared';

export default function StatusBadge({ text, color }: { text: string; color: "green" | "orange" | "red" }) {
  const styles = {
    green: "bg-emerald-50 text-emerald-700",
    orange: "bg-slate-100 text-slate-700",
    red: "bg-[#fee2e2] text-[#b91c1c]",
  }[color]
  return (
    <span className={`${styles} font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] whitespace-nowrap`}>
      {text}
    </span>
  )
}
