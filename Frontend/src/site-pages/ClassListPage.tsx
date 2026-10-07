import { useState, useEffect } from "react"
import { FadeUp, FadeIn } from "../components/Motion"

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

const formatSchedule = (isoString: string) => {
  try {
    const d = new Date(isoString);
    const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const day = dayNames[d.getDay()];
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} - ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}

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
    <FadeUp
      className="bg-white border border-[#e2e8f0] rounded-2xl p-5 flex gap-5 items-center shadow-[0_4px_6px_rgba(0,0,0,0.02)] cursor-pointer hover:-translate-y-1 hover:border-[#10b981] hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] transition-all duration-300 group"
      data-name="class-card"
      data-class-id={item.id}
    >
      <div className="shrink-0 w-[180px] h-[130px] rounded-xl overflow-hidden relative">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-['Inter:Extra_Bold'] font-extrabold text-[#1e293b] text-[18px] leading-normal truncate max-w-[280px] group-hover:text-[#10b981] transition-colors">
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
    </FadeUp>
  )
}

export default function ClassListPage() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState("")
  const [day, setDay] = useState("")
  const [shift, setShift] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes/available");
        if (!res.ok) throw new Error("Failed to fetch classes");
        const data = await res.json();
        
        const mapped: ClassItem[] = data.map((d: any, index: number) => {
          const avail = d.maxCapacity - d.currentBookings;
          let status: ClassStatus = "available";
          let statusLabel = "Còn chỗ";
          let spots = `Còn ${avail} suất trống`;
          
          if (avail <= 0) {
            status = "full";
            statusLabel = "Đã đầy";
            spots = "Lớp học đã kín chỗ";
          } else if (avail <= 3) {
            status = "almost";
            statusLabel = "Sắp đầy";
          }
          
          return {
            id: d.id,
            title: d.name,
            status,
            statusLabel,
            trainer: d.coachName || "N/A",
            schedule: formatSchedule(d.startTime),
            location: d.roomName || "N/A",
            spots,
            img: classImages[index % classImages.length],
          };
        });
        setClasses(mapped);
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const filtered = classes.filter((c) => {
    if (subject && !c.title.toLowerCase().includes(subject.toLowerCase())) return false
    return true
  })

  const rows: ClassItem[][] = []
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2))
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen" data-node-id="2263:3450">
      

      {/* Hero */}
      <section className="relative flex flex-col gap-[32px] items-center text-center px-[80px] py-[100px] w-full shrink-0 overflow-hidden min-h-[320px] justify-center">
        <FadeIn className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute inset-0 w-full h-full object-cover max-w-none" src="/assets/images/hero_bg.jpg" />
          <div className="absolute inset-0 bg-slate-900/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        </FadeIn>
        <div className="relative z-10 flex flex-col gap-4 items-center w-full">
          <FadeUp>
            <p className="font-['Inter:Extra_Bold'] font-extrabold text-white text-[48px] leading-normal">
              Lịch lớp học hàng tuần
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="font-['Inter:Regular'] font-normal text-[#cbd5e1] text-[18px] leading-normal max-w-2xl mx-auto">
              Tìm lớp phù hợp với thời gian và mục tiêu chuyển động của bạn. Lớp mới cập nhật liên tục mỗi tuần.
            </p>
          </FadeUp>
        </div>
      </section>

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
      <section className="flex flex-col gap-6 py-12 px-[80px] w-full" data-node-id="2263:3506" data-name="classes-grid">
        {rows.map((row, ri) => (
          <FadeUp delay={ri * 0.1} key={ri} className="flex gap-6 w-full">
            {row.map((item) => (
              <div key={item.id} className="flex-1 min-w-0">
                <ClassCard item={item} />
              </div>
            ))}
            {row.length === 1 && <div className="flex-1 min-w-0" />}
          </FadeUp>
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
      </section>

      
    </div>
  )
}
