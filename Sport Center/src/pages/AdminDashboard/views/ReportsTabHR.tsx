import { hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4 } from '../shared';

export default function ReportsTabHR() {
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ nhân sự theo bộ phận</p>
        <div className="flex gap-8 items-center">
          <div className="relative size-[140px] shrink-0">
            <svg viewBox="0 0 140 140" className="size-full">
              <circle cx="70" cy="70" r="55" fill="none" stroke="#2563eb" strokeWidth="20" strokeDasharray="130.8 235" strokeDashoffset="0" transform="rotate(-90 70 70)" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#14b8a6" strokeWidth="20" strokeDasharray="60 305.8" strokeDashoffset="-130.8" transform="rotate(-90 70 70)" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="46 319.8" strokeDashoffset="-190.8" transform="rotate(-90 70 70)" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="37.7 328.1" strokeDashoffset="-236.8" transform="rotate(-90 70 70)" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="51.8 314" strokeDashoffset="-274.5" transform="rotate(-90 70 70)" />
              <circle cx="70" cy="70" r="55" fill="none" stroke="#94a3b8" strokeWidth="20" strokeDasharray="29.9 335.9" strokeDashoffset="-326.3" transform="rotate(-90 70 70)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-[#0f172a] text-xl">48</span>
              <span className="text-[#64748b] text-[10px]">Nhân viên</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              { dot: "#2563eb", label: "HLV/PT", count: "18 người (38%)" },
              { dot: "#14b8a6", label: "Lễ tân", count: "8 người (17%)" },
              { dot: "#f97316", label: "Kỹ thuật", count: "6 người (13%)" },
              { dot: "#f59e0b", label: "Chăm sóc KH", count: "5 người (10%)" },
              { dot: "#a855f7", label: "Vệ sinh", count: "7 người (15%)" },
              { dot: "#94a3b8", label: "Quản lý", count: "4 người (8%)" },
            ].map(l => (
              <div key={l.label} className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="rounded-full size-2 shrink-0" style={{ background: l.dot }} />
                  <span className="text-[#0f172a] text-[12px]">{l.label}</span>
                </div>
                <span className="text-[#64748b] text-[12px]">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
        {/* HLV ranking table */}
        <div className="flex flex-col mt-2">
          <p className="font-extrabold text-[#0f172a] text-base mb-3">Bảng xếp hạng HLV theo hiệu suất</p>
          <div className="bg-[#f1f5f9] flex gap-3 font-bold px-4 py-2.5 text-[#475569] text-[12px]">
            {["#", "HLV", "SỐ LỚP", "HỌC VIÊN TB/LỚP", "ĐÁNH GIÁ", "DOANH THU PT"].map(h => (
              <span key={h} className={h === "#" ? "w-8" : h === "HLV" ? "flex-1" : "w-[110px]"}>{h}</span>
            ))}
          </div>
          {[
            { rank: 1, name: "Nguyễn Minh Tuyết", classes: "24 lớp", avg: "17.5 học viên/lớp", rating: "4.9", rev: "42.000.000 đ" },
            { rank: 2, name: "Trần Đức Khoa", classes: "20 lớp", avg: "19.2 học viên/lớp", rating: "4.7", rev: "38.000.000 đ" },
            { rank: 3, name: "Lê Thu Linh", classes: "18 lớp", avg: "15.8 học viên/lớp", rating: "4.6", rev: "28.000.000 đ" },
          ].map(r => (
            <div key={r.rank} className="border-b border-[#e2e8f0] flex gap-3 items-center px-4 py-3">
              <span className="text-[#64748b] text-[13px] w-8">{r.rank}</span>
              <span className="font-semibold text-[#0f172a] text-sm flex-1">{r.name}</span>
              <span className="text-[#0f172a] text-sm w-[110px]">{r.classes}</span>
              <span className="text-[#0f172a] text-sm w-[110px]">{r.avg}</span>
              <span className="text-[#f59e0b] text-sm w-[110px]">★ {r.rating}</span>
              <span className="font-semibold text-[#0f172a] text-sm w-[110px]">{r.rev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* attendance + leave */}
      <div className="flex flex-col gap-5 shrink-0 w-[300px]">
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ chấm công tháng này</p>
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-[100px]">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="12" strokeDasharray="242.7 14.1" strokeDashoffset="0" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-[#0f172a] text-lg">96.2%</span>
                <span className="text-[#64748b] text-[10px]">Chỉ số chấm công</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {[{ c: "#14b8a6", l: "Đúng giờ", v: "94.1%" }, { c: "#f59e0b", l: "Đi muộn", v: "3.8%" }, { c: "#ef4444", l: "Vắng mặt", v: "2.1%" }].map(i => (
              <div key={i.l} className="flex items-center justify-between">
                <div className="flex gap-2 items-center"><div className="rounded-full size-2" style={{ background: i.c }} /><span className="text-[#0f172a] text-[12px]">{i.l}</span></div>
                <span className="font-semibold text-[12px]" style={{ color: i.c }}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl">
          <p className="font-extrabold text-[#0f172a] text-base">Lịch nghỉ phép sắp tới</p>
          <div className="flex flex-col gap-3">
            {[
              { avatar: hrAvatar1, name: "Coach Tuyết", type: "Nghỉ phép", dates: "28/09 – 30/09", dot: "#2563eb" },
              { avatar: hrAvatar2, name: "NV Lễ tân Hoa", type: "Việc cá nhân", dates: "01/10 – 03/10", dot: "#94a3b8" },
              { avatar: hrAvatar3, name: "Coach Nam", type: "Nghỉ bù", dates: "05/10", dot: "#f59e0b" },
              { avatar: hrAvatar4, name: "KTV Minh", type: "Nghỉ ốm", dates: "07/10 – 08/10", dot: "#ef4444" },
            ].map(e => (
              <div key={e.name} className="flex gap-3 items-center">
                <img src={e.avatar} alt="" className="rounded-full size-8 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0f172a] text-[13px]">{e.name}</p>
                  <div className="flex gap-1 items-center">
                    <div className="rounded-full size-1.5" style={{ background: e.dot }} />
                    <span className="text-[#64748b] text-[11px]">{e.type} • {e.dates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BUDGET PAGE ──────────────────────────────────────────────────────────────