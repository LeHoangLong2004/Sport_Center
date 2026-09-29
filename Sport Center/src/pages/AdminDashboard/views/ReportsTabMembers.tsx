import { reportMonths } from '../shared';
import SimpleLineChart from '../components/SimpleLineChart';

export default function ReportsTabMembers() {
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Xu hướng tăng trưởng hội viên</p>
          <div className="flex gap-4">
            {[{ c: "#2563eb", l: "Hội viên mới" }, { c: "#ef4444", l: "Hội viên hủy" }].map(i => (
              <div key={i.l} className="flex gap-1.5 items-center">
                <div className="rounded-full size-2" style={{ background: i.c }} />
                <span className="text-[#64748b] text-[12px]">{i.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 text-[11px] text-[#94a3b8] justify-between px-0">
            {["120", "90", "60", "30", "0"].map(v => <span key={v}>{v}</span>)}
          </div>
          <SimpleLineChart />
          <div className="flex items-center justify-between px-0">
            {reportMonths.map(m => <span key={m} className="text-[#94a3b8] text-[11px]">{m}</span>)}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[350px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ theo loại gói</p>
        <div className="flex h-32 items-center justify-center">
          <div className="relative size-[130px]">
            <svg viewBox="0 0 130 130" className="size-full">
              <circle cx="65" cy="65" r="50" fill="none" stroke="#e2e8f0" strokeWidth="16" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="131.9 202.6" strokeDashoffset="0" transform="rotate(-90 65 65)" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="#14b8a6" strokeWidth="16" strokeDasharray="88.1 246.4" strokeDashoffset="-131.9" transform="rotate(-90 65 65)" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="47.1 287.4" strokeDashoffset="-220" transform="rotate(-90 65 65)" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="31.4 303.1" strokeDashoffset="-267.1" transform="rotate(-90 65 65)" />
              <circle cx="65" cy="65" r="50" fill="none" stroke="#94a3b8" strokeWidth="16" strokeDasharray="15.7 318.8" strokeDashoffset="-298.5" transform="rotate(-90 65 65)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#64748b] text-[10px]">Hội viên</span>
              <span className="font-extrabold text-[#0f172a] text-[13px]">Q3 2026</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { dot: "#2563eb", label: "Premium", pct: "42%" },
            { dot: "#14b8a6", label: "Fitness Plus", pct: "28%" },
            { dot: "#f97316", label: "Swim Focus", pct: "15%" },
            { dot: "#f59e0b", label: "Yoga", pct: "10%" },
            { dot: "#94a3b8", label: "Khác", pct: "5%" },
          ].map(l => (
            <div key={l.label} className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="rounded-full size-2 shrink-0" style={{ background: l.dot }} />
                <span className="text-[#0f172a] text-[12px]">{l.label}</span>
              </div>
              <span className="font-bold text-[#0f172a] text-[12px]">{l.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
