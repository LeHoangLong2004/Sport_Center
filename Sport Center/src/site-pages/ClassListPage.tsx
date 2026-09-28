import { useState } from "react"

const A = "/assets"

const imgZap = `${A}/92d4d.svg`
const imgChevronDown = `${A}/f6e35.svg`
const imgSearch = `${A}/8a46c.svg`
const imgUser = `${A}/9b7e7.svg`
const imgClock = `${A}/0d849.svg`
const imgMapPin = `${A}/b6ae5.svg`
const imgZap1 = `${A}/87505.svg`
const imgPhone = `${A}/1632b.svg`
const imgFacebook = `${A}/6efbf.svg`
const imgInstagram = `${A}/520a2.svg`
const imgYoutube = `${A}/27371.svg`
const imgLinkedin = `${A}/d1c41.svg`

const classImages = [
  `${A}/283eb.png`,
  `${A}/b457c.png`,
  `${A}/5abf7.png`,
  `${A}/9cc9c.png`,
  `${A}/b2001.png`,
  `${A}/7116f.png`,
  `${A}/d9fae.png`,
  `${A}/ff25a.png`,
]

type ClassStatus = "available" | "full" | "almost"

interface ClassItem {
  id: string
  title: string
  status: ClassStatus
  statusLabel: string
  trainer: string
  schedule: string
  location: string
  spots: string
  img: string
}

const classes: ClassItem[] = [
  {
    id: "aqua",
    title: "Aqua Basic Therapy",
    status: "available",
    statusLabel: "Còn chỗ",
    trainer: "HLV. Alexander Trần",
    schedule: "Thứ Ba, Thứ Năm - 08:00",
    location: "Hồ Bơi Lớn A",
    spots: "Còn 5 suất trống",
    img: classImages[0],
  },
  {
    id: "yoga",
    title: "Vinyasa Flow Yoga",
    status: "available",
    statusLabel: "Còn chỗ",
    trainer: "HLV. Minh Thư",
    schedule: "Thứ Tư, Thứ Sáu - 17:30",
    location: "Phòng Studio 3",
    spots: "Còn 2 suất trống",
    img: classImages[1],
  },
  {
    id: "hiit",
    title: "Functional HIIT Performance",
    status: "available",
    statusLabel: "Còn chỗ",
    trainer: "HLV. Marcus Đặng",
    schedule: "Thứ Năm, Thứ Bảy - 18:30",
    location: "Khu Thể Lực Tổng Hợp",
    spots: "Còn 6 suất trống",
    img: classImages[2],
  },
  {
    id: "kickboxing",
    title: "Kickboxing Core Stress-Relief",
    status: "full",
    statusLabel: "Đã đầy",
    trainer: "HLV. Hoàng Kim",
    schedule: "Thứ Hai, Thứ Sáu - 19:30",
    location: "Khu Boxing Gym",
    spots: "Lớp học đã kín chỗ",
    img: classImages[3],
  },
  {
    id: "pilates",
    title: "Pilates Hồi Phục Cột Sống",
    status: "available",
    statusLabel: "Còn chỗ",
    trainer: "HLV. Minh Thư",
    schedule: "Thứ Ba - 10:00",
    location: "Phòng Reformer Pilates",
    spots: "Còn 4 suất trống",
    img: classImages[4],
  },
  {
    id: "bongro",
    title: "Bóng Rổ Thiếu Niên U12",
    status: "almost",
    statusLabel: "Sắp đầy",
    trainer: "HLV. Alexander Trần",
    schedule: "Chủ Nhật - 08:00",
    location: "Sân Đa Năng 2",
    spots: "Còn 1 suất trống",
    img: classImages[5],
  },
  {
    id: "swimming",
    title: "Bơi Sải Nâng Cao",
    status: "full",
    statusLabel: "Đã đầy",
    trainer: "HLV. Alexander Trần",
    schedule: "Thứ Bảy - 16:00",
    location: "Hồ Bơi Lớn A",
    spots: "Lớp học đã kín chỗ",
    img: classImages[6],
  },
  {
    id: "strength",
    title: "Strength Conditioning",
    status: "available",
    statusLabel: "Còn chỗ",
    trainer: "HLV. Marcus Đặng",
    schedule: "Thứ Tư - 19:00",
    location: "Phòng Tạ Tự Do",
    spots: "Còn 12 suất trống",
    img: classImages[7],
  },
]

const navItems = [
  { label: "Trang chủ", active: false },
  { label: "Bộ môn", active: false },
  { label: "Lớp học", active: true },
  { label: "Huấn luyện viên", active: false },
  { label: "Gói tập", active: false },
  { label: "Về chúng tôi", active: false },
  { label: "Liên hệ", active: false },
]

function StatusBadge({ status, label }: { status: ClassStatus; label: string }) {
  const styles: Record<ClassStatus, string> = {
    available: "bg-[rgba(16,185,129,0.1)] text-[#10b981]",
    full: "bg-[rgba(100,116,139,0.1)] text-[#64748b]",
    almost: "bg-[rgba(245,158,11,0.1)] text-[#f59e0b]",
  }
  return (
    <span className={`px-3 py-1 rounded-full font-['Inter:Bold'] font-bold text-[12px] ${styles[status]}`}>
      {label}
    </span>
  )
}

function ClassCard({ item }: { item: ClassItem }) {
  const isAvailable = item.status !== "full"
  return (
    <div
      className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex gap-5 items-center shadow-[0_4px_6px_rgba(0,0,0,0.02)] cursor-pointer hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-shadow"
      data-name="class-card"
      data-class-id={item.id}
    >
      <div className="shrink-0 w-[180px] h-[130px] rounded-xl overflow-hidden">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-normal truncate max-w-[280px]">
            {item.title}
          </p>
          <StatusBadge status={item.status} label={item.statusLabel} />
        </div>
        <div className="flex gap-4 items-center flex-wrap">
          <span className="flex gap-1.5 items-center shrink-0">
            <img src={imgUser} alt="" className="w-[11px] h-[11px]" />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">{item.trainer}</span>
          </span>
          <span className="flex gap-1.5 items-center shrink-0">
            <img src={imgClock} alt="" className="w-[11px] h-[11px]" />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] whitespace-nowrap">{item.schedule}</span>
          </span>
          <span className="flex gap-1.5 items-center min-w-0">
            <img src={imgMapPin} alt="" className="w-[11px] h-[11px] shrink-0" />
            <span className="font-['Inter:Regular'] font-normal text-[#64748b] text-[13px] truncate">{item.location}</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`font-['Inter:Semi_Bold'] font-semibold text-[13px] ${item.status === "full" ? "text-[#64748b]" : "text-[#059669]"}`}>
            {item.spots}
          </span>
          {isAvailable ? (
            <button
              className="bg-[#2563eb] text-white font-['Inter:Bold'] font-bold text-[13px] px-4 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors"
              data-name="btn-detail"
              data-class-id={item.id}
              type="button"
            >
              Chi tiết &amp; Đăng ký
            </button>
          ) : (
            <button
              className="bg-[#94a3b8] text-white font-['Inter:Bold'] font-bold text-[13px] px-4 py-2 rounded-lg cursor-not-allowed"
              type="button"
              disabled
            >
              Đã đầy chỗ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClassListPage() {
  const [subject, setSubject] = useState("")
  const [day, setDay] = useState("")
  const [shift, setShift] = useState("")
  const [page, setPage] = useState(1)

  const filtered = classes.filter((c) => {
    if (subject && c.title !== subject) return false
    return true
  })

  const rows: ClassItem[][] = []
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2))
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="2263:3450">
      {/* Navbar */}
      <nav
        className="bg-white border-b border-[#e2e8f0] flex h-[72px] items-center justify-between px-[80px] w-full shrink-0"
        data-node-id="2263:3451"
        data-name="navbar"
      >
        <div className="flex gap-2.5 items-center cursor-pointer" data-name="logo-group">
          <div className="bg-[#10b981] flex items-center justify-center rounded-lg size-9 shrink-0">
            <img src={imgZap} alt="" className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-none">SPORTCENTER</p>
            <p className="font-['Inter:Semi_Bold'] font-semibold text-[#059669] text-[9px] uppercase leading-none">Energy Platform</p>
          </div>
        </div>
        <div className="flex gap-2 h-full items-center" data-name="menu-items">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col h-full items-start justify-center px-4 py-6 cursor-pointer"
              data-name={`menu-item-${item.label}`}
            >
              <p className={`whitespace-nowrap text-[15px] leading-normal ${item.active ? "font-['Inter:Bold'] font-bold text-[#2563eb]" : "font-['Inter:Medium'] font-medium text-[#1e293b]"}`}>
                {item.label}
              </p>
              {item.active && <div className="bg-[#2563eb] h-0.5 rounded-sm w-6 mt-1" />}
            </div>
          ))}
        </div>
        <div className="flex gap-3 items-center" data-name="navbar-actions">
          <button className="border border-[#e2e8f0] px-[18px] py-2.5 rounded-lg" type="button" data-name="btn-login">
            <span className="font-['Inter:Semi_Bold'] font-semibold text-[#1e293b] text-[14px] whitespace-nowrap">Đăng nhập</span>
          </button>
          <button className="bg-[#10b981] px-5 py-2.5 rounded-lg" type="button" data-name="btn-register">
            <span className="font-['Inter:Bold'] font-bold text-white text-[14px] whitespace-nowrap">Đăng ký thành viên</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#0f172a] flex flex-col gap-4 px-[80px] py-16 w-full" data-node-id="2263:3481" data-name="hero-dark">
        <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[36px] leading-normal">
          Lịch lớp học hàng tuần
        </p>
        <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[16px] leading-normal">
          Tìm lớp phù hợp với thời gian và mục tiêu chuyển động của bạn. Lớp mới cập nhật liên tục mỗi tuần.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-[#e2e8f0] px-[80px] py-6 w-full" data-node-id="2263:3484" data-name="filter-container">
        <div className="flex gap-4 items-center w-full">
          <div className="flex-1 min-w-0 relative">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 appearance-none font-['Inter:Regular'] font-normal text-[#1e293b] text-[14px] cursor-pointer pr-9"
            >
              <option value="">Tất cả bộ môn</option>
              <option value="Aqua Basic Therapy">Aqua Therapy</option>
              <option value="Vinyasa Flow Yoga">Yoga</option>
              <option value="Functional HIIT Performance">HIIT Performance</option>
              <option value="Kickboxing Core Stress-Relief">Kickboxing</option>
              <option value="Pilates Hồi Phục Cột Sống">Pilates</option>
              <option value="Bóng Rổ Thiếu Niên U12">Bóng Rổ</option>
              <option value="Bơi Sải Nâng Cao">Bơi lội</option>
              <option value="Strength Conditioning">Strength</option>
            </select>
            <img src={imgChevronDown} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 appearance-none font-['Inter:Regular'] font-normal text-[#1e293b] text-[14px] cursor-pointer pr-9"
            >
              <option value="">Chọn ngày trong tuần</option>
              <option value="2">Thứ Hai</option>
              <option value="3">Thứ Ba</option>
              <option value="4">Thứ Tư</option>
              <option value="5">Thứ Năm</option>
              <option value="6">Thứ Sáu</option>
              <option value="7">Thứ Bảy</option>
              <option value="cn">Chủ Nhật</option>
            </select>
            <img src={imgChevronDown} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
          </div>
          <div className="flex-1 min-w-0 relative">
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-4 py-3 appearance-none font-['Inter:Regular'] font-normal text-[#1e293b] text-[14px] cursor-pointer pr-9"
            >
              <option value="">Khung giờ (Sáng / Chiều / Tối)</option>
              <option value="sang">Sáng (06:00 – 12:00)</option>
              <option value="chieu">Chiều (12:00 – 18:00)</option>
              <option value="toi">Tối (18:00 – 22:00)</option>
            </select>
            <img src={imgChevronDown} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" />
          </div>
          <button
            onClick={() => { setPage(1) }}
            className="bg-[#2563eb] flex gap-2.5 items-center justify-center px-6 py-3 rounded-lg w-[180px] shrink-0 hover:bg-[#1d4ed8] transition-colors"
            type="button"
          >
            <img src={imgSearch} alt="" className="w-3.5 h-3.5" />
            <span className="font-['Inter:Bold'] font-bold text-white text-[14px] whitespace-nowrap">Tìm kiếm</span>
          </button>
        </div>
      </div>

      {/* Classes grid */}
      <div className="flex flex-col gap-6 py-12 px-[80px] w-full" data-node-id="2263:3506" data-name="classes-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-6 w-full">
            {row.map((item) => (
              <div key={item.id} className="flex-1 min-w-0">
                <ClassCard item={item} />
              </div>
            ))}
            {row.length === 1 && <div className="flex-1 min-w-0" />}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#64748b] font-['Inter:Regular'] font-normal text-[15px]">
            Không tìm thấy lớp phù hợp. Vui lòng thử lại với bộ lọc khác.
          </div>
        )}

        {/* Pagination */}
        <div className="flex gap-2 items-center justify-center pt-8">
          {[
            { label: "<", val: Math.max(1, page - 1) },
            { label: "1", val: 1 },
            { label: "2", val: 2 },
            { label: "3", val: 3 },
            { label: ">", val: Math.min(3, page + 1) },
          ].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => setPage(val)}
              type="button"
              className={`flex items-center justify-center rounded-lg size-10 text-[14px] border transition-colors ${
                label === String(page)
                  ? "bg-[#2563eb] text-white border-[#2563eb] font-['Inter:Bold'] font-bold"
                  : "bg-white border-[#e2e8f0] text-[#1e293b] font-['Inter:Semi_Bold'] font-semibold hover:bg-[#f1f5f9]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#020617] flex flex-col gap-10 pb-12 pt-16 px-[80px] w-full" data-node-id="2263:3738" data-name="footer">
        <div className="flex items-start justify-between w-full gap-8 flex-wrap">
          <div className="flex flex-col gap-6 max-w-[360px]">
            <div className="flex gap-2.5 items-center cursor-pointer" data-name="logo-group-footer">
              <div className="bg-[#10b981] flex items-center justify-center rounded-lg size-10 shrink-0">
                <img src={imgZap1} alt="" className="w-[19px] h-[19px]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[20px] leading-none">SPORTCENTER</p>
                <p className="font-['Inter:Semi_Bold'] font-semibold text-[#10b981] text-[10px] uppercase leading-none">Energy Platform</p>
              </div>
            </div>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.6]">
              Hệ thống phòng tập thể thao tiêu chuẩn quốc tế mang lại nguồn năng lượng bứt phá mỗi ngày.
            </p>
            <div className="flex gap-2 items-center">
              <img src={imgPhone} alt="" className="w-[13px] h-[13px]" />
              <p className="font-['Inter:Bold'] font-bold text-white text-[16px] whitespace-nowrap">Hotline: 1900 6868</p>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-[200px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Dịch vụ nổi bật</p>
            {["Bơi lội Aqua", "Yoga trị liệu", "HIIT & Strength", "Boxing Kickfit", "Bóng rổ đội nhóm"].map((s) => (
              <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
            ))}
          </div>
          <div className="flex flex-col gap-4 w-[200px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">SportCenter</p>
            {["Hệ thống chi nhánh", "Đội ngũ chuyên gia", "Bảng giá gói tập", "Tin tức sự kiện", "Tuyển dụng"].map((s) => (
              <p key={s} className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px]">{s}</p>
            ))}
          </div>
          <div className="flex flex-col gap-4 max-w-[320px]">
            <p className="font-['Inter:Bold'] font-bold text-white text-[14px] uppercase">Địa chỉ chi nhánh chính</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[14px] leading-[1.5]">
              Tòa nhà Energy Tower, 120 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh
            </p>
            <div className="flex gap-3 pt-2">
              {[imgFacebook, imgInstagram, imgYoutube, imgLinkedin].map((icon, i) => (
                <div key={i} className="bg-[#1e293b] flex items-center justify-center rounded-lg size-9">
                  <img src={icon} alt="" className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-px bg-[#1e293b]" />
        <div className="flex items-center justify-between w-full flex-wrap gap-4" data-name="policy-links">
          <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px]">
            © 2026 SportCenter. Bảo lưu mọi quyền thương hiệu.
          </p>
          <div className="flex gap-6">
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white transition-colors">Chính sách bảo mật</p>
            <p className="font-['Inter:Regular'] font-normal text-[#94a3b8] text-[13px] cursor-pointer hover:text-white transition-colors">Điều khoản sử dụng</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
