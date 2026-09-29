import React, { useState } from 'react';
import { A } from '../shared';
import StatusBadge from '../components/StatusBadge';

const lookupMembers = [
  { code: "MB-2048", avatar: `${A}/0f594.png`, name: "Nguyễn Lan Anh", phone: "0912 345 678", pkg: "Premium 12 tháng", expiry: "18/12/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-4021", avatar: `${A}/31d01.png`, name: "Lê Minh Triết", phone: "0988 777 666", pkg: "Fitness 6 tháng", expiry: "15/09/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-1870", avatar: `${A}/68727.png`, name: "Vũ Thu Trang", phone: "0904 123 987", pkg: "Yoga 6 tháng", expiry: "02/08/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-1984", avatar: `${A}/c630e.png`, name: "Lê Gia Hân", phone: "0936 999 888", pkg: "Swim 3 tháng", expiry: "10/06/2026", status: "Sắp hết hạn", statusColor: "orange" as const },
  { code: "MB-2017", avatar: `${A}/89d24.png`, name: "Trần Minh Khoa", phone: "0977 444 333", pkg: "Fitness 6 tháng", expiry: "28/05/2026", status: "Sắp hết hạn", statusColor: "orange" as const },
  { code: "MB-1902", avatar: `${A}/c51fd.png`, name: "Phạm Đức Long", phone: "0915 222 111", pkg: "Premium 12 tháng", expiry: "12/04/2026", status: "Tạm khóa", statusColor: "red" as const },
]

export function LookupPage({ onDetail }: { onDetail: () => void }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("Tất cả")

  const filtered = lookupMembers.filter((m) => {
    const matchQ = query === "" || `${m.name} ${m.phone} ${m.code}`.toLowerCase().includes(query.toLowerCase())
    const matchF = filter === "Tất cả" || (filter === "Premium" && m.pkg.includes("Premium")) || (filter === "Fitness" && m.pkg.includes("Fitness")) || (filter === "Hết hạn" && m.status !== "Đang hoạt động")
    return matchQ && matchF
  })

  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 p-[32px] w-full">
      {/* Search card */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="bg-[#f1f5f9] flex gap-[12px] items-center p-[14px] rounded-[8px] w-full">
          <img src={`${A}/28923.svg`} alt="" className="size-[20px] shrink-0" />
          <input
            className="flex-1 bg-transparent font-['Manrope:Regular'] text-[#0f172a] text-[15px] outline-none min-w-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã thẻ..."
          />
          <span className="bg-white border border-[#e2e8f0] font-['Manrope:SemiBold'] font-semibold px-[6px] py-[2px] rounded-[4px] text-[#64748b] text-[11px] shrink-0">F3</span>
        </div>
        <div className="flex items-center justify-between shrink-0 w-full">
          <div className="flex gap-[8px] items-start shrink-0">
            {["Tất cả", "Premium", "Fitness", "Hết hạn"].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                className={`flex items-start px-[14px] py-[8px] rounded-[6px] shrink-0 transition-colors ${filter === chip ? "bg-[#3b82f6] text-white font-['Manrope:Bold'] font-bold" : "bg-[#f1f5f9] text-[#64748b] font-['Manrope:Medium'] font-medium"} text-[13px]`}
              >
                {chip}
              </button>
            ))}
          </div>
          <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">
            Tổng số kết quả: <span className="font-['Manrope:Bold'] font-bold text-[#0f172a]">1,247 hội viên</span>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full">
        <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[24px] py-[14px] text-[#64748b] text-[13px] w-full">
          <span className="w-[120px] shrink-0">MÃ HỘI VIÊN</span>
          <span className="flex-1 min-w-0">HỌ VÀ TÊN</span>
          <span className="w-[180px] shrink-0">SỐ ĐIỆN THOẠI</span>
          <span className="w-[200px] shrink-0">GÓI ĐĂNG KÝ</span>
          <span className="w-[160px] shrink-0">HẠN SỬ DỤNG</span>
          <span className="w-[150px] shrink-0">TRẠNG THÁI</span>
          <span className="w-[100px] shrink-0 text-right">THAO TÁC</span>
        </div>
        <div className="flex flex-col items-start w-full">
          {filtered.map((m) => (
            <div key={m.code} className="border-[#e2e8f0] border-b border-solid flex items-center px-[24px] py-[12px] shrink-0 w-full">
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] w-[120px] shrink-0">{m.code}</span>
              <div className="flex flex-1 gap-[10px] items-center min-w-0">
                <img src={m.avatar} alt="" className="shrink-0 size-[28px] rounded-full object-cover" />
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] whitespace-nowrap">{m.name}</span>
              </div>
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[180px] shrink-0">{m.phone}</span>
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] text-[13px] w-[200px] shrink-0">{m.pkg}</span>
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[160px] shrink-0">{m.expiry}</span>
              <div className="flex items-start w-[150px] shrink-0">
                <StatusBadge text={m.status} color={m.statusColor} />
              </div>
              <div className="flex items-start justify-end w-[100px] shrink-0">
                <button type="button" onClick={onDetail} className="border border-[#e2e8f0] border-solid flex items-start px-[12px] py-[6px] rounded-[6px] shrink-0">
                  <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[12px]">Chi tiết</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 6. Chi tiết hội viên ─────────────────────────────────────────────────────
