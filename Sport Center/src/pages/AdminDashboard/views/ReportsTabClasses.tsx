import React, { useState } from 'react';
import SimpleLineChart from '../components/SimpleLineChart';

export default function ReportsTabClasses() {
  const classTypes = ["Yoga", "HIIT", "Pilates", "Zumba", "Boxing", "Swimming"]
  const fills: number[] = []
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ lấp đầy theo loại lớp</p>
          <div className="flex gap-4">
            {[{ c: "#94a3b8", l: "Sức chứa" }, { c: "#14b8a6", l: "Đăng ký thực tế (>85%)" }, { c: "#f97316", l: "Đăng ký thực tế (70-85%)" }].map(i => (
              <div key={i.l} className="flex gap-1.5 items-center">
                <div className="rounded-full size-2 shrink-0" style={{ background: i.c }} />
                <span className="text-[#64748b] text-[10px]">{i.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-end justify-around h-36 px-4">
          {classTypes.map((t, i) => (
            <div key={t} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex gap-1 items-end w-full" style={{ height: 120 }}>
                <div className="bg-[#e2e8f0] rounded-t-sm flex-1" style={{ height: "100%" }} />
                <div className={`rounded-t-sm flex-1 ${fills[i] >= 85 ? "bg-[#14b8a6]" : "bg-[#f97316]"}`} style={{ height: `${fills[i]}%` }} />
              </div>
              <span className="text-[#64748b] text-[11px]">{t}</span>
              <span className="text-[#64748b] text-[10px]">{fills[i]}% fill</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl shrink-0 w-[300px]">
        <p className="font-extrabold text-[#0f172a] text-base">Lớp học phổ biến nhất</p>
        {[
          { rank: "1.", name: "Yoga Flow Morning", coach: "Coach Tuyết", pct: 95, color: "#14b8a6" },
          { rank: "2.", name: "HIIT Extreme", coach: "Coach Khoa", pct: 93, color: "#14b8a6" },
          { rank: "3.", name: "Pilates Core", coach: "Coach Linh", pct: 88, color: "#14b8a6" },
          { rank: "4.", name: "Aqua Fitness", coach: "Coach Hải", pct: 85, color: "#f97316" },
          { rank: "5.", name: "Boxing Cardio", coach: "Coach Nam", pct: 82, color: "#f97316" },
        ].map(c => (
          <div key={c.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0f172a] text-[13px]">{c.rank} {c.name}</p>
                <p className="text-[#64748b] text-[11px]">{c.coach}</p>
              </div>
              <span className="font-bold text-[#0f172a] text-[13px]">{c.pct}%</span>
            </div>
            <div className="bg-[#f1f5f9] h-1.5 rounded-full w-full">
              <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
