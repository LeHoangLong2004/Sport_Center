import { useState } from "react"

const A = "/assets"

type Page = "checkin" | "register" | "schedule" | "pos" | "lookup" | "detail"

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "checkin", label: "Check-in / Check-out", icon: `${A}/38b67.svg` },
  { id: "register", label: "Đăng ký mới", icon: `${A}/7e980.svg` },
  { id: "schedule", label: "Lịch hẹn", icon: `${A}/d225c.svg` },
  { id: "pos", label: "Bán hàng", icon: `${A}/d1f41.svg` },
  { id: "lookup", label: "Tra cứu thông tin", icon: `${A}/5031c.svg` },
]

const avatarByPage: Record<Page, string> = {
  checkin: `${A}/ce215.png`,
  register: `${A}/90dad.png`,
  schedule: `${A}/d749b.png`,
  pos: `${A}/7d869.png`,
  lookup: `${A}/8a918.png`,
  detail: `${A}/8a918.png`,
}

function Sidebar({ page, onNavigate, onLogout }: { page: Page; onNavigate: (p: Page) => void; onLogout: () => void }) {
  return (
    <div className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] self-stretch shrink-0 w-[260px]">
      {/* Brand */}
      <div className="flex gap-[12px] items-center shrink-0 w-full">
        <div className="bg-[#14b8a6] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[15px] text-white whitespace-nowrap">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#14b8a6] text-[9px] whitespace-nowrap">RECEPTIONIST</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-full">
        {navItems.map((item) => {
          const active = page === item.id || (page === "detail" && item.id === "lookup")
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left ${active ? "bg-[#3b82f6]" : "bg-transparent"}`}
            >
              <img src={item.icon} alt="" className="shrink-0 size-[18px]" />
              <span className={`flex-1 font-['Manrope:${active ? "Bold" : "Medium"}'] ${active ? "font-bold text-white" : "font-medium text-[#cbd5e1]"} text-[14px] leading-normal`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Support card */}
      <div className="bg-[#1e293b] border border-[#334155] border-solid flex flex-col gap-[8px] items-start p-[16px] rounded-[12px] shrink-0 w-full">
        <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white w-full">Hỗ trợ Lễ Tân</span>
        <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-[#94a3b8] text-[11px] w-full">
          Ấn nút F2 để mở nhanh ô quét mã check-in tức thì.
        </span>
      </div>

      {/* User profile */}
      <div className="border-[#1e293b] border-t border-solid flex gap-[12px] items-center pt-[16px] shrink-0 w-full">
        <img src={avatarByPage[page]} alt="" className="shrink-0 size-[40px] rounded-full object-cover" />
        <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
          <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white w-full">Ngọc Mai</span>
          <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[11px] w-full">Bộ phận Lễ tân</span>
        </div>
        <button type="button" onClick={onLogout} title="Đăng xuất" className="text-[#64748b] hover:text-white text-[11px] font-['Manrope:Medium'] shrink-0">
          Thoát
        </button>
      </div>
    </div>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────────

function TopBar({ breadcrumb, title, shiftLabel }: { breadcrumb: string; title: string; shiftLabel?: string }) {
  return (
    <div className="bg-white border-[#e2e8f0] border-b border-solid flex h-[78px] items-center justify-between px-[32px] shrink-0 w-full">
      <div className="flex flex-col gap-[4px] items-start shrink-0">
        <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[11px]">{breadcrumb}</span>
        <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[20px]">{title}</span>
      </div>
      <div className="flex gap-[16px] items-center shrink-0">
        <div className="bg-[#ecfdf5] flex items-center px-[10px] py-[4px] rounded-[99px] shrink-0">
          <span className="font-['Manrope:Bold'] font-bold text-[#047857] text-[11px] whitespace-nowrap">
            {shiftLabel ?? "Ca sáng • Trực tuyến"}
          </span>
        </div>
        <div className="border border-[#e2e8f0] border-solid flex flex-col items-center justify-center rounded-[20px] shrink-0 size-[40px]">
          <img src={`${A}/06b01.svg`} alt="" className="size-[18px]" />
        </div>
      </div>
    </div>
  )
}

// ─── 1. Check-in / Check-out ──────────────────────────────────────────────────

const historyRows = [
  { time: "08:15 AM", avatar: `${A}/12161.png`, name: "Lê Minh Triết", code: "MB-4021", pkg: "Fitness 6 tháng", status: "Hợp lệ", statusColor: "green", gate: "Cửa chính", gateColor: "#22c55e" },
  { time: "08:02 AM", avatar: `${A}/b5ad1.png`, name: "Vũ Thu Trang", code: "MB-1870", pkg: "Yoga 6 tháng", status: "Hợp lệ", statusColor: "green", gate: "Yoga Room", gateColor: "#22c55e" },
  { time: "07:55 AM", avatar: `${A}/b6742.png`, name: "Trần Minh Khoa", code: "MB-2017", pkg: "Fitness 6 tháng", status: "Hợp lệ", statusColor: "green", gate: "Cửa chính", gateColor: "#22c55e" },
  { time: "07:40 AM", avatar: `${A}/6c23d.png`, name: "Lê Gia Hân", code: "MB-1984", pkg: "Swim 3 tháng", status: "Sắp hết hạn", statusColor: "orange", gate: "Bể bơi", gateColor: "#22c55e" },
  { time: "07:12 AM", avatar: `${A}/86369.png`, name: "Phạm Đức Long", code: "MB-1902", pkg: "Premium 12 tháng", status: "Tạm khóa", statusColor: "red", gate: "Từ chối", gateColor: "#ef4444" },
]

function StatusBadge({ text, color }: { text: string; color: "green" | "orange" | "red" }) {
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

function CheckInPage() {
  const [scanValue, setScanValue] = useState("MB-2048")
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="flex flex-col gap-[24px] items-start p-[32px] w-full">
      {/* Stats */}
      <div className="flex gap-[16px] items-start shrink-0 w-full">
        {[
          { icon: `${A}/9e21f.svg`, bg: "bg-[#3b82f6]", label: "Tổng check-in hôm nay", value: "127" },
          { icon: `${A}/fe113.svg`, bg: "bg-[#22c55e]", label: "Đang tập tại trung tâm", value: "34" },
          { icon: `${A}/53e60.svg`, bg: "bg-[#ea580c]", label: "Lớp học sắp bắt đầu", value: "3 lớp" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-[#e2e8f0] flex flex-1 gap-[16px] items-start min-w-0 p-[20px] rounded-[12px]">
            <div className={`${stat.bg} flex items-center justify-center rounded-[8px] shrink-0 size-[44px]`}>
              <img src={stat.icon} alt="" className="size-[20px]" />
            </div>
            <div className="flex flex-col gap-[4px] items-start shrink-0">
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[13px]">{stat.label}</span>
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[24px]">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scan + Result */}
      <div className="flex gap-[20px] items-start shrink-0 w-full">
        {/* Scanner */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[16px] items-start min-w-0 p-[24px] rounded-[12px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Nhập mã hoặc quét thẻ hội viên</span>
          <div className="bg-[#f1f5f9] flex gap-[12px] items-center p-[16px] rounded-[8px] shrink-0 w-full">
            <img src={`${A}/f6f1f.svg`} alt="" className="size-[20px] shrink-0" />
            <input
              className="flex-1 bg-transparent font-['Manrope:Regular'] text-[#0f172a] text-[15px] outline-none min-w-0"
              value={scanValue}
              onChange={(e) => { setScanValue(e.target.value); setConfirmed(false) }}
              placeholder="Nhập mã hội viên..."
            />
            <span className="bg-[#3b82f6] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] text-white whitespace-nowrap shrink-0">
              ĐANG CHỜ QUÉT
            </span>
          </div>
          <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px]">
            Gợi ý: Quét vân tay hoặc barcode từ thẻ cứng hội viên của khách để check-in tức thì.
          </span>
        </div>

        {/* Member result */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[480px]">
          <div className="flex items-center justify-between shrink-0 w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#94a3b8] text-[13px]">HỘI VIÊN TÌM THẤY</span>
            <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[10px] py-[4px] rounded-[99px] text-[#15803d] text-[12px]">Đang hoạt động</span>
          </div>
          <div className="flex gap-[16px] items-center shrink-0 w-full">
            <img src={`${A}/87fb4.png`} alt="" className="shrink-0 size-[64px] rounded-full object-cover" />
            <div className="flex flex-col gap-[4px] items-start shrink-0">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Nguyễn Lan Anh</span>
              <div className="flex gap-[8px] items-center shrink-0">
                <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[13px]">Mã: MB-2048</span>
                <span className="bg-[#eef2ff] border border-[#c7d2fe] font-['Manrope:Bold'] font-bold px-[6px] py-px rounded-[4px] text-[#4f46e5] text-[9px]">PREMIUM</span>
              </div>
            </div>
          </div>
          <div className="bg-[#f1f5f9] h-px shrink-0 w-full" />
          <div className="flex items-start justify-between shrink-0 text-[13px] w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Ngày hết hạn gói:</span>
            <span className="font-['Manrope:Bold'] font-bold text-[#0f172a]">18/12/2026</span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmed(true)}
            className={`flex gap-[8px] items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full transition-colors ${confirmed ? "bg-[#16a34a]" : "bg-[#22c55e]"}`}
          >
            <img src={`${A}/b6b07.svg`} alt="" className="size-[18px]" />
            <span className="font-['Manrope:Bold'] font-bold text-[15px] text-white">
              {confirmed ? "✓ ĐÃ CHECK-IN THÀNH CÔNG" : "XÁC NHẬN CHECK-IN"}
            </span>
          </button>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full">
        <div className="bg-white flex items-start p-[20px] shrink-0 w-full">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử check-in hôm nay</span>
        </div>
        <div className="bg-[#f1f5f9] flex font-['Manrope:Bold'] font-bold h-[44px] items-center px-[24px] shrink-0 text-[#64748b] text-[12px] w-full">
          <span className="w-[120px] shrink-0">THỜI GIAN</span>
          <span className="flex-1 min-w-0">HỘI VIÊN</span>
          <span className="w-[150px] shrink-0">MÃ SỐ</span>
          <span className="w-[180px] shrink-0">GÓI ĐĂNG KÝ</span>
          <span className="w-[150px] shrink-0">TRẠNG THÁI</span>
          <span className="w-[100px] shrink-0 text-right">ĐIỂM DANH</span>
        </div>
        {historyRows.map((row) => (
          <div key={row.code} className="border border-[#f1f5f9] border-solid flex h-[54px] items-center px-[24px] shrink-0 w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[13px] w-[120px] shrink-0">{row.time}</span>
            <div className="flex flex-1 gap-[10px] items-center min-w-0">
              <img src={row.avatar} alt="" className="shrink-0 size-[28px] rounded-full object-cover" />
              <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] whitespace-nowrap">{row.name}</span>
            </div>
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[150px] shrink-0">{row.code}</span>
            <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[13px] w-[180px] shrink-0">{row.pkg}</span>
            <div className="flex items-start w-[150px] shrink-0">
              <StatusBadge text={row.status} color={row.statusColor as "green" | "orange" | "red"} />
            </div>
            <span className="font-['Manrope:Regular'] font-normal text-right w-[100px] shrink-0 text-[13px]" style={{ color: row.gateColor }}>{row.gate}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 2. Đăng ký hội viên mới ─────────────────────────────────────────────────

const plans = [
  { id: "premium", icon: `${A}/7d611.svg`, name: "Premium Class (Full access)", desc: "Đầy đủ gym, bể bơi, tủ đồ riêng, phòng tắm sauna", price: "14.500.000đ" },
  { id: "fitness", icon: `${A}/2e287.svg`, name: "Gym & Fitness Standard", desc: "Trọn gói tập gym cơ bản tại trung tâm", price: "9.800.000đ" },
  { id: "swim", icon: `${A}/2e287.svg`, name: "Swimming Exclusive", desc: "Vé bơi 12 tháng tại hồ nước mặn 4 mùa", price: "11.200.000đ" },
  { id: "yoga", icon: `${A}/2e287.svg`, name: "Yoga & Pilates Morning", desc: "Chỉ áp dụng ca sáng từ 06:00 – 11:30", price: "8.500.000đ" },
]

function RegisterPage() {
  const [selectedPlan, setSelectedPlan] = useState("premium")
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Left: Personal info */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[28px] rounded-[12px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Thông tin cá nhân hội viên</span>
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Họ và tên khách hàng *</label>
            <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="Lê Hoài Nam" />
          </div>
          <div className="flex gap-[16px] items-start w-full">
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Số điện thoại *</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="0912 345 678" />
            </div>
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Địa chỉ Email</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#94a3b8] text-[14px] w-full outline-none" defaultValue="nam.le@gmail.com" />
            </div>
          </div>
          <div className="flex gap-[16px] items-start w-full">
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Ngày sinh *</label>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between p-[12px] rounded-[8px] w-full">
                <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[14px]">15/08/1996</span>
                <img src={`${A}/2ebce.svg`} alt="" className="size-[16px] shrink-0" />
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0">
              <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Số CCCD/Passport *</label>
              <input className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none" defaultValue="012345678912" />
            </div>
          </div>
          <div className="flex flex-col gap-[8px] items-start w-full">
            <label className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Ghi chú y tế / Thể trạng</label>
            <textarea className="bg-[#f8fafc] border border-[#e2e8f0] font-['Manrope:Regular'] p-[12px] rounded-[8px] text-[#94a3b8] text-[14px] w-full outline-none resize-none h-[80px]" defaultValue="Khách muốn tập trung giảm mỡ bụng, có tiền sử hơi đau khớp gối nhẹ..." />
          </div>
        </div>

        {/* Right: Package selection */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[28px] rounded-[12px] shrink-0 w-[580px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Chọn gói tập hội viên</span>
          <div className="flex flex-col gap-[10px] items-start w-full">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`flex items-center justify-between p-[14px] rounded-[8px] shrink-0 w-full text-left transition-colors ${active ? "bg-[#eff6ff] border-[#3b82f6] border-[1.5px] border-solid" : "border border-[#e2e8f0] border-solid"}`}
                >
                  <div className="flex gap-[12px] items-center shrink-0">
                    <img src={plan.icon} alt="" className="size-[20px]" />
                    <div className="flex flex-col gap-[2px] items-start shrink-0">
                      <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">{plan.name}</span>
                      <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">{plan.desc}</span>
                    </div>
                  </div>
                  <span className={`font-['Manrope:ExtraBold'] font-extrabold text-[15px] whitespace-nowrap ${active ? "text-[#3b82f6]" : "text-[#0f172a]"}`}>{plan.price}</span>
                </button>
              )
            })}
          </div>

          {/* Payment method */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b] text-[14px]">Phương thức thanh toán *</span>
            <div className="bg-white border border-[#e2e8f0] border-solid flex items-center justify-between p-[12px] rounded-[8px] w-full">
              <div className="flex gap-[8px] items-center shrink-0">
                <img src={`${A}/a9018.svg`} alt="" className="size-[16px]" />
                <span className="font-['Manrope:Regular'] font-normal text-[#0f172a] text-[14px]">Chuyển khoản Ngân hàng (QR Code)</span>
              </div>
              <img src={`${A}/45d62.svg`} alt="" className="size-[14px] shrink-0" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className={`flex items-center justify-center p-[14px] rounded-[8px] shrink-0 w-full transition-colors ${submitted ? "bg-[#16a34a]" : "bg-[#3b82f6]"}`}
          >
            <span className="font-['Manrope:Bold'] font-bold text-[15px] text-white">
              {submitted ? "✓ ĐÃ ĐĂNG KÝ THÀNH CÔNG" : "HOÀN TẤT ĐĂNG KÝ HỘI VIÊN"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 3. Lịch hẹn ─────────────────────────────────────────────────────────────

const apptSlots = [
  {
    time: "08:00",
    bg: "bg-[#eff6ff]",
    border: "border-[#bfdbfe]",
    title: "Lớp Yoga mở màn (Tư vấn hội viên)",
    sub: "Khách: Đặng Hồng Liên • Coach Minh Tuyết",
    badgeBg: "bg-[#dbeafe]",
    badgeText: "text-[#1e40af]",
    badge: "Đã hoàn tất",
  },
  {
    time: "10:00",
    bg: "bg-[#fffbeb]",
    border: "border-[#fef08a]",
    title: "Tập thử buổi 1 - PT kèm riêng 1:1",
    sub: "Khách: Trần Trung Kiên • PT Trần Khoa",
    badgeBg: "bg-[#fef3c7]",
    badgeText: "text-[#b45309]",
    badge: "Đang chờ khách",
  },
  {
    time: "14:00",
    bg: "bg-[#f8fafc]",
    border: "border-[#e2e8f0]",
    title: "Tư vấn gia hạn gói tập vàng",
    sub: "Khách: Vũ Phương Thảo • Lễ tân Ngọc Mai",
    badgeBg: "bg-[#e2e8f0]",
    badgeText: "text-[#64748b]",
    badge: "Đã hủy",
  },
]

function SchedulePage() {
  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Timeline */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[24px] rounded-[12px]">
          <div className="flex items-center justify-between shrink-0 w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[18px]">Lịch hẹn hôm nay</span>
            <button type="button" className="bg-[#3b82f6] flex items-center px-[14px] py-[8px] rounded-[6px] shrink-0">
              <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white">+ Tạo lịch hẹn</span>
            </button>
          </div>
          <div className="flex flex-col gap-[16px] items-start w-full">
            {apptSlots.map((slot) => (
              <div key={slot.time} className="flex gap-[16px] items-center shrink-0 w-full">
                <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">{slot.time}</span>
                <div className={`${slot.bg} border ${slot.border} border-solid flex flex-1 items-center justify-between min-w-0 p-[12px] rounded-[8px]`}>
                  <div className="flex flex-col gap-[4px] items-start shrink-0">
                    <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">{slot.title}</span>
                    <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">{slot.sub}</span>
                  </div>
                  <span className={`${slot.badgeBg} ${slot.badgeText} font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[11px] whitespace-nowrap shrink-0`}>{slot.badge}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-[16px] items-center shrink-0 w-full">
              <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[13px] w-[60px] shrink-0">16:00</span>
              <div className="border border-[#e2e8f0] border-dashed flex flex-1 items-center min-w-0 p-[12px] rounded-[8px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#94a3b8] text-[13px]">Không có lịch hẹn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[24px] rounded-[12px] shrink-0 w-[400px]">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Tổng quan lịch hẹn</span>
          <div className="flex flex-col gap-[12px] items-start w-full">
            {[
              { dot: `${A}/93b20.svg`, label: "Tổng số lịch hẹn", value: "8" },
              { dot: `${A}/0d428.svg`, label: "Đã hoàn tất", value: "6" },
              { dot: `${A}/5a32b.svg`, label: "Đang chờ khách", value: "1" },
              { dot: `${A}/45516.svg`, label: "Đã hủy", value: "1" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between shrink-0 w-full">
                <div className="flex gap-[8px] items-center shrink-0">
                  <img src={s.dot} alt="" className="size-[8px] shrink-0" />
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[14px]">{s.label}</span>
                </div>
                <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[14px]">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#f1f5f9] h-px w-full" />
          <div className="bg-[#eff6ff] flex flex-col gap-[8px] items-start p-[16px] rounded-[8px] w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#1e40af] text-[13px]">Lưu ý lễ tân</span>
            <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-[#1e40af] text-[12px]">
              Vui lòng gọi điện nhắc khách trước 30 phút đối với các lịch hẹn có HLV cá nhân tập thử.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Bán hàng (POS) ────────────────────────────────────────────────────────

type CartItem = { name: string; unitPrice: number; qty: number }

const allProducts = [
  { img: `${A}/cf835.png`, cat: "Đồ uống", name: "Nước khoáng Dasani 500ml", price: 15000 },
  { img: `${A}/c5e97.png`, cat: "Đồ uống", name: "Nước tăng lực Redbull", price: 25000 },
  { img: `${A}/d9215.png`, cat: "Đồ uống", name: "Sữa đạm Whey Protein", price: 65000 },
  { img: `${A}/44a36.png`, cat: "Thực phẩm", name: "Thanh ngũ cốc năng lượng Fit", price: 35000 },
  { img: `${A}/28ab4.png`, cat: "Thực phẩm", name: "Bánh bông lan ức gà", price: 45000 },
  { img: `${A}/1b6aa.png`, cat: "Phụ kiện", name: "Khăn lau mồ hôi Microfiber", price: 50000 },
  { img: `${A}/235a3.png`, cat: "Phụ kiện", name: "Găng tay tập gym cao cấp", price: 150000 },
  { img: `${A}/d497c.png`, cat: "Phụ kiện", name: "Băng quấn cổ tay bảo vệ", price: 80000 },
  { img: `${A}/06c7f.png`, cat: "Gói tập", name: "Vé tập ngày vãng lai (Daily)", price: 120000 },
]

const tabs = ["Tất cả sản phẩm", "Đồ uống", "Thực phẩm", "Phụ kiện", "Gói tập"]

function PosPage() {
  const [activeTab, setActiveTab] = useState("Tất cả sản phẩm")
  const [cart, setCart] = useState<CartItem[]>([
    { name: "Găng tay tập gym cao cấp", unitPrice: 150000, qty: 1 },
    { name: "Nước tăng lực Redbull", unitPrice: 25000, qty: 2 },
    { name: "Vé tập ngày vãng lai (Daily)", unitPrice: 120000, qty: 1 },
    { name: "Khăn lau mồ hôi Microfiber", unitPrice: 50000, qty: 1 },
  ])
  const [paid, setPaid] = useState(false)

  const products = activeTab === "Tất cả sản phẩm" ? allProducts : allProducts.filter((p) => p.cat === activeTab)

  function addToCart(name: string, price: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === name)
      if (existing) return prev.map((i) => i.name === name ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { name, unitPrice: price, qty: 1 }]
    })
    setPaid(false)
  }

  function changeQty(name: string, delta: number) {
    setCart((prev) => {
      const updated = prev.map((i) => i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0)
      return updated
    })
    setPaid(false)
  }

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0)
  const discount = 10000
  const total = subtotal - discount

  return (
    <div className="flex flex-1 gap-[24px] items-start min-h-0 p-[32px] w-full">
      {/* Products */}
      <div className="flex flex-1 flex-col gap-[20px] h-full items-start min-w-0">
        {/* Tabs */}
        <div className="flex gap-[8px] items-start shrink-0 w-full flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-start px-[16px] py-[10px] rounded-[8px] shrink-0 transition-colors ${activeTab === tab ? "bg-white border-[#3b82f6] border-[1.5px] border-solid text-[#3b82f6] font-['Manrope:Bold'] font-bold" : "bg-white border border-[#e2e8f0] border-solid text-[#64748b] font-['Manrope:Medium'] font-medium"} text-[14px]`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-[16px] items-start w-full">
          {[0, 3, 6].map((start) => (
            <div key={start} className="flex gap-[16px] items-start w-full">
              {products.slice(start, start + 3).map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => addToCart(p.name, p.price)}
                  className="bg-white border border-[#e2e8f0] flex flex-1 flex-col items-start min-w-0 overflow-hidden rounded-[12px] text-left hover:border-[#3b82f6] transition-colors"
                >
                  <div className="h-[100px] relative shrink-0 w-full overflow-hidden">
                    <img src={p.img} alt="" className="absolute inset-0 max-w-none object-cover size-full" />
                  </div>
                  <div className="flex flex-col gap-[4px] items-start p-[12px] w-full">
                    <span className="font-['Manrope:SemiBold'] font-semibold text-[#14b8a6] text-[11px] uppercase">{p.cat}</span>
                    <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">{p.name}</span>
                    <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#3b82f6] text-[14px]">{p.price.toLocaleString("vi-VN")}₫</span>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] h-full items-start p-[24px] rounded-[12px] shrink-0 w-[450px]">
        <div className="flex items-center justify-between shrink-0 w-full">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Giỏ hàng đang chọn</span>
          <div className="bg-[#eef2ff] flex items-start px-[8px] py-[2px] rounded-[10px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#4f46e5] text-[12px]">{cart.reduce((s, i) => s + i.qty, 0)} món</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-start min-h-0 w-full overflow-y-auto">
          {cart.length === 0 && (
            <div className="flex items-center justify-center w-full py-[40px]">
              <span className="font-['Manrope:Regular'] text-[#94a3b8] text-[14px]">Chưa có sản phẩm trong giỏ</span>
            </div>
          )}
          {cart.map((item) => (
            <div key={item.name} className="border-[#e2e8f0] border-b border-solid flex gap-[12px] items-center py-[12px] shrink-0 w-full">
              <div className="flex flex-1 flex-col gap-[2px] items-start min-w-0">
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[12px]">Đơn giá: {item.unitPrice.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex gap-[8px] items-center shrink-0">
                <button type="button" onClick={() => changeQty(item.name, -1)} className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px]">
                  <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">-</span>
                </button>
                <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px]">{item.qty}</span>
                <button type="button" onClick={() => changeQty(item.name, +1)} className="border border-[#e2e8f0] flex flex-col items-center justify-center rounded-[4px] shrink-0 size-[24px]">
                  <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">+</span>
                </button>
              </div>
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[13px] text-right w-[80px] shrink-0">
                {(item.unitPrice * item.qty).toLocaleString("vi-VN")}₫
              </span>
            </div>
          ))}
        </div>

        <div className="bg-[#e2e8f0] h-px shrink-0 w-full" />
        <div className="flex flex-col gap-[12px] items-start shrink-0 w-full">
          <div className="flex items-start justify-between shrink-0 text-[14px] w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Tạm tính:</span>
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a]">{subtotal.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="flex items-start justify-between shrink-0 text-[14px] w-full">
            <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">Giảm giá:</span>
            <span className="font-['Manrope:SemiBold'] font-semibold text-[#ef4444]">-{discount.toLocaleString("vi-VN")}₫</span>
          </div>
          <div className="border-[#e2e8f0] border-t border-solid flex items-start justify-between pt-[8px] shrink-0 w-full">
            <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[16px]">Tổng thanh toán:</span>
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#22c55e] text-[20px]">{total.toLocaleString("vi-VN")}₫</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPaid(true)}
          className={`flex gap-[8px] items-center justify-center p-[16px] rounded-[8px] shrink-0 w-full transition-colors ${paid ? "bg-[#16a34a]" : "bg-[#22c55e]"}`}
        >
          <img src={`${A}/43093.svg`} alt="" className="size-[18px] shrink-0" />
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[16px] text-white">
            {paid ? "✓ THANH TOÁN THÀNH CÔNG" : "XÁC NHẬN THANH TOÁN (F8)"}
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── 5. Tra cứu thông tin ─────────────────────────────────────────────────────

const lookupMembers = [
  { code: "MB-2048", avatar: `${A}/0f594.png`, name: "Nguyễn Lan Anh", phone: "0912 345 678", pkg: "Premium 12 tháng", expiry: "18/12/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-4021", avatar: `${A}/31d01.png`, name: "Lê Minh Triết", phone: "0988 777 666", pkg: "Fitness 6 tháng", expiry: "15/09/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-1870", avatar: `${A}/68727.png`, name: "Vũ Thu Trang", phone: "0904 123 987", pkg: "Yoga 6 tháng", expiry: "02/08/2026", status: "Đang hoạt động", statusColor: "green" as const },
  { code: "MB-1984", avatar: `${A}/c630e.png`, name: "Lê Gia Hân", phone: "0936 999 888", pkg: "Swim 3 tháng", expiry: "10/06/2026", status: "Sắp hết hạn", statusColor: "orange" as const },
  { code: "MB-2017", avatar: `${A}/89d24.png`, name: "Trần Minh Khoa", phone: "0977 444 333", pkg: "Fitness 6 tháng", expiry: "28/05/2026", status: "Sắp hết hạn", statusColor: "orange" as const },
  { code: "MB-1902", avatar: `${A}/c51fd.png`, name: "Phạm Đức Long", phone: "0915 222 111", pkg: "Premium 12 tháng", expiry: "12/04/2026", status: "Tạm khóa", statusColor: "red" as const },
]

function LookupPage({ onDetail }: { onDetail: () => void }) {
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

function DetailPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col gap-[24px] items-start min-h-0 overflow-y-auto p-[32px] w-full">
      {/* Header card */}
      <div className="bg-white border border-[#e2e8f0] flex items-center justify-between p-[24px] rounded-[12px] shrink-0 w-full">
        <div className="flex gap-[20px] items-center shrink-0">
          <img src={`${A}/04936.png`} alt="" className="shrink-0 size-[72px] rounded-full object-cover" />
          <div className="flex flex-col gap-[6px] items-start shrink-0">
            <div className="flex gap-[12px] items-center shrink-0">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[22px]">Nguyễn Lan Anh</span>
              <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[8px] py-[4px] rounded-[6px] text-[#15803d] text-[11px]">Đang hoạt động</span>
            </div>
            <div className="flex gap-[16px] items-center shrink-0 text-[14px]">
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6]">Mã thẻ: MB-2048</span>
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b]">•</span>
              <span className="font-['Manrope:SemiBold'] font-semibold text-[#64748b]">Hội viên Premium</span>
            </div>
          </div>
        </div>
        <div className="flex gap-[12px] items-start shrink-0">
          <button type="button" className="bg-[#3b82f6] flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[14px] text-white">Gia hạn gói tập</span>
          </button>
          <button type="button" className="bg-white border border-[#e2e8f0] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[14px]">In thẻ thành viên</span>
          </button>
          <button type="button" className="bg-[#fee2e2] border border-[#fee2e2] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#ef4444] text-[14px]">Tạm khóa thẻ</span>
          </button>
          <button type="button" onClick={onBack} className="border border-[#e2e8f0] border-solid flex items-start px-[18px] py-[10px] rounded-[8px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#64748b] text-[14px]">← Quay lại</span>
          </button>
        </div>
      </div>

      {/* Split */}
      <div className="flex flex-1 gap-[24px] items-start min-h-0 w-full">
        {/* Left column */}
        <div className="flex flex-col gap-[24px] items-start shrink-0 w-[450px]">
          {/* Personal info */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <div className="flex items-center justify-between w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Thông tin cá nhân</span>
              <img src={`${A}/bc662.svg`} alt="Chỉnh sửa" className="size-[16px]" />
            </div>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {[
              { label: "Ngày sinh:", value: "15/08/1996" },
              { label: "Giới tính:", value: "Nữ" },
              { label: "Số điện thoại:", value: "0912 345 678" },
              { label: "Email:", value: "lananh@email.com" },
              { label: "Địa chỉ:", value: "Số 15 Ngõ 102, Chùa Bộc, Đống Đa, Hà Nội" },
              { label: "Liên hệ khẩn cấp:", value: "Nguyễn Văn Hùng (Bố) - 0988 123 456" },
            ].map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[130px] shrink-0">{row.label}</span>
                <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] text-[13px] flex-1 min-w-0">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Membership */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start p-[24px] rounded-[12px] w-full">
            <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Thông tin gói tập hiện tại</span>
            <div className="bg-[#e2e8f0] h-px w-full" />
            {[
              { label: "Gói đăng ký:", value: "Premium 12 tháng", highlight: true },
              { label: "Ngày đăng ký:", value: "18/01/2026" },
              { label: "Hạn sử dụng:", value: "18/12/2026" },
              { label: "Tổng tiền gói tập:", value: "12,500,000 đ" },
            ].map((row) => (
              <div key={row.label} className="flex gap-[12px] items-start w-full text-[13px]">
                <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">{row.label}</span>
                {row.highlight
                  ? <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#3b82f6]">{row.value}</span>
                  : <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a]">{row.value}</span>
                }
              </div>
            ))}
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">Số ngày còn lại:</span>
              <span className="bg-[#eff6ff] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#3b82f6] text-[12px]">324 ngày</span>
            </div>
            <div className="flex gap-[12px] items-start w-full text-[13px]">
              <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[140px] shrink-0">Trạng thái thanh toán:</span>
              <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[8px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">Đã thanh toán 100%</span>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-1 flex-col gap-[24px] items-start min-w-0">
          {/* Training history */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử tập luyện gần đây</span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">Xem tất cả</span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY</span>
                <span className="flex-1 min-w-0">PHÒNG / HOẠT ĐỘNG</span>
                <span className="w-[120px] shrink-0">HLV HƯỚNG DẪN</span>
                <span className="w-[100px] shrink-0">THỜI LƯỢNG</span>
                <span className="w-[100px] shrink-0 text-right">GIỜ CHECK-IN</span>
              </div>
              {[
                { date: "15/02/2026", activity: "Yoga Advanced Class", trainer: "HLV Minh Tuyết", duration: "60 phút", checkin: "18:05" },
                { date: "12/02/2026", activity: "Cardio & Fitness Gym", trainer: "Tự do", duration: "90 phút", checkin: "17:30" },
                { date: "09/02/2026", activity: "Swimming pool", trainer: "Tự do", duration: "45 phút", checkin: "07:15" },
              ].map((r) => (
                <div key={r.date} className="bg-white border-[#e2e8f0] border-b border-solid flex items-center px-[16px] py-[12px] text-[13px] w-full last:border-b-0">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 text-[#0f172a]">{r.activity}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[120px] shrink-0">{r.trainer}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] w-[100px] shrink-0">{r.duration}</span>
                  <span className="font-['Manrope:Bold'] font-bold text-[#15803d] text-right w-[100px] shrink-0">{r.checkin}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[16px] items-start px-[24px] py-[20px] rounded-[12px] w-full">
            <div className="flex items-center justify-between shrink-0 w-full">
              <span className="font-['Manrope:ExtraBold'] font-extrabold text-[#0f172a] text-[16px]">Lịch sử giao dịch thanh toán</span>
              <span className="font-['Manrope:Bold'] font-bold text-[#3b82f6] text-[13px] cursor-pointer">Xem tất cả hóa đơn</span>
            </div>
            <div className="border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[8px] w-full">
              <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[16px] py-[10px] text-[#64748b] text-[12px] w-full">
                <span className="w-[110px] shrink-0">NGÀY GD</span>
                <span className="flex-1 min-w-0">NỘI DUNG THANH TOÁN</span>
                <span className="w-[120px] shrink-0">HÌNH THỨC</span>
                <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
                <span className="w-[110px] shrink-0 text-right">SỐ TIỀN</span>
              </div>
              {[
                { date: "18/01/2026", content: "Thanh toán gói Premium 12 tháng", method: "Chuyển khoản QR", amount: "12,500,000 đ" },
                { date: "15/01/2026", content: "Mua nước khoáng Lavie & Khăn tập", method: "Tiền mặt", amount: "150,000 đ" },
              ].map((r) => (
                <div key={r.date + r.content} className="bg-white border-[#e2e8f0] border-b border-solid flex items-center px-[16px] py-[12px] w-full last:border-b-0">
                  <span className="font-['Manrope:SemiBold'] font-semibold text-[#0f172a] text-[13px] w-[110px] shrink-0">{r.date}</span>
                  <span className="flex-1 font-['Manrope:SemiBold'] font-semibold min-w-0 overflow-hidden text-[#0f172a] text-[13px] text-ellipsis whitespace-nowrap">{r.content}</span>
                  <span className="font-['Manrope:Regular'] font-normal text-[#64748b] text-[13px] w-[120px] shrink-0">{r.method}</span>
                  <div className="flex items-start w-[120px] shrink-0">
                    <span className="bg-[#dcfce7] font-['Manrope:Bold'] font-bold px-[6px] py-[2px] rounded-[4px] text-[#15803d] text-[11px]">Thành công</span>
                  </div>
                  <span className="font-['Manrope:Bold'] font-bold text-[#0f172a] text-[13px] text-right w-[110px] shrink-0">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ReceptionistPortal ──────────────────────────────────────────────────

const breadcrumbs: Record<Page, { bc: string; title: string; shift?: string }> = {
  checkin: { bc: "Lễ tân / Quét thẻ & Điểm danh", title: "Check-in / Check-out hội viên" },
  register: { bc: "Lễ tân / Thêm hồ sơ & Mua gói", title: "Đăng ký hội viên mới" },
  schedule: { bc: "Lễ tân / Lịch Coach & Tư vấn", title: "Quản lý lịch hẹn của khách" },
  pos: { bc: "Lễ tân / Nghiệp vụ POS", title: "Bán hàng tại quầy", shift: "Ca làm việc: Ngọc Mai" },
  lookup: { bc: "Lễ tân / Danh sách hệ thống", title: "Tra cứu thông tin hội viên", shift: "Ca làm việc: Ngọc Mai" },
  detail: { bc: "Lễ tân / Tra cứu hội viên / Chi tiết", title: "Chi tiết hội viên", shift: "Ca làm việc: Ngọc Mai" },
}

export default function ReceptionistPortal({ onExit }: { onExit: () => void }) {
  const [page, setPage] = useState<Page>("checkin")

  const { bc, title, shift } = breadcrumbs[page]

  return (
    <div className="bg-[#f8fafc] flex items-start" style={{ minHeight: "100dvh" }}>
      <Sidebar page={page} onNavigate={setPage} onLogout={onExit} />
      <div className="flex flex-1 flex-col items-start min-w-0 self-stretch">
        <TopBar breadcrumb={bc} title={title} shiftLabel={shift} />
        <div className="flex flex-1 flex-col items-start min-h-0 w-full overflow-y-auto">
          {page === "checkin" && <CheckInPage />}
          {page === "register" && <RegisterPage />}
          {page === "schedule" && <SchedulePage />}
          {page === "pos" && <PosPage />}
          {page === "lookup" && <LookupPage onDetail={() => setPage("detail")} />}
          {page === "detail" && <DetailPage onBack={() => setPage("lookup")} />}
        </div>
      </div>
    </div>
  )
}
