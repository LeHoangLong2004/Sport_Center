import React from 'react';
import { breadcrumbs } from '../shared';

export default function StatusBadge({ text, color }: { text: string; color: "green" | "orange" | "red" }) {
  const styles = {
    green: "bg-[#dcfce7] text-[#15803d]",
    orange: "bg-[#fff1e8] text-[#ea580c]",
    red: "bg-[#fee2e2] text-[#b91c1c]",
  }[color]
  return (
    <span className={`${styles} font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] whitespace-nowrap`}>
      {text}
    </span>
  )
}
