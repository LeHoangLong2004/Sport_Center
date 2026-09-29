import { iDotBlue, iDotTeal, iDotOrange, iDotPurple, reportBarData, reportMonths } from '../shared';


export default function ReportsTabRevenue() {
  const maxH = Math.max(...reportBarData)
  return (
    <div className="flex gap-5">
      {/* bar chart */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[#0f172a] text-base">Biểu đồ doanh thu 12 tháng gần nhất</p>
            <p className="text-[#64748b] text-[12px] mt-1">Đơn vị: Triệu VNĐ</p>
          </div>
          <div className="flex gap-1.5 items-center">
            <img src={iDotBlue} alt="" className="size-2" />
            <span className="text-[#64748b] text-[12px]">Doanh thu gói dịch vụ</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 h-40 items-end px-4">
            {reportBarData.map((h, i) => (
              <div key={i} className="flex flex-col flex-1 h-full items-start justify-end min-w-0 relative">
                {i === 11 && (
                  <div className="absolute bg-[#0f172a] flex items-center px-2 py-1 rounded top-[-30px] left-0">
                    <span className="font-semibold text-white text-[10px] whitespace-nowrap">1,28 tỷ</span>
                  </div>
                )}
                <div
                  className="bg-[#2563eb] w-full rounded-t-md"
                  style={{ height: `${Math.round((h / maxH) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4">
            {reportMonths.map(m => (
              <span key={m} className="text-[#94a3b8] text-[11px] text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* donut */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[380px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ nguồn doanh thu</p>
        <div className="flex h-40 items-center justify-center">
          <div className="relative size-[140px]">
            <div className="absolute inset-0">
              <svg viewBox="0 0 140 140" className="size-full">
                <circle cx="70" cy="70" r="55" fill="none" stroke="#e2e8f0" strokeWidth="18" />
                <circle cx="70" cy="70" r="55" fill="none" stroke="#2563eb" strokeWidth="18" strokeDasharray="209.5 153.3" strokeDashoffset="0" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="55" fill="none" stroke="#14b8a6" strokeWidth="18" strokeDasharray="79.3 283.5" strokeDashoffset="-209.5" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="55" fill="none" stroke="#f97316" strokeWidth="18" strokeDasharray="43.4 319.4" strokeDashoffset="-288.8" transform="rotate(-90 70 70)" />
                <circle cx="70" cy="70" r="55" fill="none" stroke="#a855f7" strokeWidth="18" strokeDasharray="28.9 333.9" strokeDashoffset="-332.2" transform="rotate(-90 70 70)" />
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#64748b] text-[11px]">Doanh thu</span>
              <span className="font-extrabold text-[#0f172a] text-base">1,28 tỷ</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { dot: iDotBlue, label: "Gói hội viên", pct: "58%" },
            { dot: iDotTeal, label: "PT cá nhân", pct: "22%" },
            { dot: iDotOrange, label: "Lớp nhóm", pct: "12%" },
            { dot: iDotPurple, label: "Dịch vụ khác", pct: "8%" },
          ].map(l => (
            <div key={l.label} className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <img src={l.dot} alt="" className="size-2" />
                <span className="text-[#0f172a] text-[12px]">{l.label}</span>
              </div>
              <span className="font-bold text-[#0f172a] text-[12px]">{l.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* bottom row */}
    </div>
  )
}
