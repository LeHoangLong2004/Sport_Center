import { useState, type ReactNode } from "react"

export type CoachScreen =
  | "dashboard"
  | "schedule"
  | "curriculum"
  | "assessment"
  | "profile"
  | "ai"

const A = "/assets"

// ── Inline SVG icons ─────────────────────────────────────────────
function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="3" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 7h15M6 1.5v3M12 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 2.5h9a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2ZM14 5h1.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H14" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 6.5h5M5.5 9.5h5M5.5 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconClipboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 3.5h12a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 3.5V3a3 3 0 0 1 6 0v.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.5 9.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconPerson() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5 10.5 7h5.5l-4.5 3.5 1.5 5.5L9 13l-4 3 1.5-5.5L2 7h5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 0 1 6 6v3l1.5 2H2.5L4 11V8a6 6 0 0 1 6-6Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 16a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 7a5.5 5.5 0 1 0 1-3.2L1 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Shared Shell ─────────────────────────────────────────────────
const navItems: { key: CoachScreen; label: string; Icon: () => ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", Icon: IconGrid },
  { key: "schedule", label: "Lịch dạy", Icon: IconCalendar },
  { key: "curriculum", label: "Giáo án", Icon: IconBook },
  { key: "assessment", label: "Đánh giá học viên", Icon: IconClipboard },
  { key: "profile", label: "Cá nhân", Icon: IconPerson },
  { key: "ai", label: "AI Gợi ý", Icon: IconSparkle },
]

const breadcrumbs: Record<CoachScreen, string> = {
  dashboard: "HLV / Tổng quan",
  schedule: "HLV / Quản lý lịch",
  curriculum: "HLV / Giáo án",
  assessment: "HLV / Đánh giá học viên",
  profile: "HLV / Hồ sơ",
  ai: "HLV / AI Gợi ý bài tập",
}

const pageTitles: Record<CoachScreen, string> = {
  dashboard: "Bảng điều khiển Huấn luyện viên",
  schedule: "Lịch dạy và làm việc tuần",
  curriculum: "Kho giáo án huấn luyện",
  assessment: "Nhật ký & Đánh giá tập luyện",
  profile: "Thông tin huấn luyện viên cá nhân",
  ai: "AI Gợi ý bài tập thông minh",
}

function CoachSidebar({
  screen,
  onNavigate,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
}) {
  return (
    <aside className="cp-sidebar">
      <div className="cp-brand">
        <div className="cp-brand-mark">SC</div>
        <div className="cp-brand-text">
          <strong>SPORTCENTER</strong>
          <small>COACH PORTAL</small>
        </div>
      </div>

      <nav className="cp-nav" aria-label="Coach navigation">
        {navItems.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`cp-nav-item ${screen === key ? "active" : ""}`}
            onClick={() => onNavigate(key)}
            type="button"
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="cp-kênh-box">
        <p className="cp-kênh-title">Kênh Huấn Luyện</p>
        <p className="cp-kênh-desc">
          Xem và cập nhật nhanh các chỉ số tập luyện và giáo án HLV lúc thi.
        </p>
      </div>

      <div className="cp-coach-foot">
        <img src={`${A}/f6154.png`} alt="HLV Minh Tuấn" className="cp-coach-avatar" />
        <div className="cp-coach-info">
          <strong>HLV Minh Tuấn</strong>
          <small>Master Trainer</small>
        </div>
      </div>
    </aside>
  )
}

function CoachTopbar({ screen }: { screen: CoachScreen }) {
  return (
    <header className="cp-topbar">
      <div>
        <p className="cp-breadcrumb">{breadcrumbs[screen]}</p>
        <h1 className="cp-topbar-title">{pageTitles[screen]}</h1>
      </div>
      <div className="cp-topbar-right">
        <div className="cp-status-badge">
          <span className="cp-status-dot" />
          Đang trực tuyến • Ca chiều
        </div>
        <button className="cp-icon-btn" aria-label="Thông báo" type="button">
          <IconBell />
        </button>
      </div>
    </header>
  )
}

function CoachShell({
  screen,
  onNavigate,
  children,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
  children: React.ReactNode
}) {
  return (
    <div className="cp-shell">
      <CoachSidebar screen={screen} onNavigate={onNavigate} />
      <div className="cp-main">
        <CoachTopbar screen={screen} />
        <div className="cp-content">{children}</div>
      </div>
    </div>
  )
}

// ── Screen 1: Dashboard ──────────────────────────────────────────
function CoachDashboard({ onNavigate }: { onNavigate: (s: CoachScreen) => void }) {
  const stats = [
    {
      icon: "📅",
      label: "Lớp dạy hôm nay",
      value: "4 lớp",
      color: "#3B82F6",
      bg: "#EEF5FF",
    },
    {
      icon: "👥",
      label: "Tổng số học viên",
      value: "28 học viên",
      color: "#10B981",
      bg: "#D1FAE5",
    },
    {
      icon: "🏃",
      label: "Lịch PT cá nhân",
      value: "3 buổi hôm nay",
      color: "#8B5CF6",
      bg: "#EDE9FE",
    },
    {
      icon: "💰",
      label: "Thu nhập tạm tính(Tháng này)",
      value: "18.5tr đ",
      color: "#F97316",
      bg: "#FFF1E8",
      highlight: true,
    },
  ]

  const schedule = [
    { time: "07:00 - 08:00", name: "Yoga Gây & Dây Cơ Bản", location: "Studio 2", type: "Lớp Nhóm", typeColor: "#3B82F6", border: "#3B82F6" },
    { time: "09:00 - 10:30", name: "Gym Group BodyCombat", location: "Khu Fitness A", type: "Lớp Nhóm", typeColor: "#3B82F6", border: "#3B82F6" },
    { time: "14:00 - 15:00", name: "PT Huấn Luyện: Nguyễn Lan Anh", location: "Khu PT VIP", type: "PT 1-1", typeColor: "#F97316", border: "#F97316" },
    { time: "17:00 - 18:30", name: "CrossFit Thể Lực Cao Độ", location: "Studio Ngoài Trời", type: "Lớp Nhóm Đặc biệt", typeColor: "#0D9488", border: "#0D9488" },
  ]

  const notifications = [
    {
      tag: "YÊU CẦU PT",
      tagColor: "#10B981",
      tagBg: "#D1FAE5",
      time: "10 phút trước",
      content: "Hội viên Trần Minh Khoa yêu cầu đặt lịch PT 1-1 cho ngày mai lúc 15:00.",
      actions: ["Chấp nhận", "Từ chối"],
    },
    {
      tag: "YÊU CẦU MỚI",
      tagColor: "#3B82F6",
      tagBg: "#EEF5FF",
      time: "1 giờ trước",
      content: "Đăng ký mới từ hội viên VIP: Vũ Thu Trang muốn chọn bạn làm HLV cá nhân 24 buổi.",
      actions: [],
    },
    {
      tag: "LỊCH THAY ĐỔI",
      tagColor: "#64748B",
      tagBg: "#F1F5F9",
      time: "Hôm qua",
      content: (
        <>Lớp Gym Group BodyCombat ngày 28/10 chuyển từ Studio 1 sang <strong>Khu Fitness A</strong>.</>
      ),
      actions: [],
    },
  ]

  return (
    <div className="cp-dashboard">
      <div className="cp-stat-grid">
        {stats.map((s) => (
          <div className="cp-stat-card" key={s.label}>
            <div className="cp-stat-icon" style={{ background: s.bg, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="cp-stat-label">{s.label}</p>
              <p
                className="cp-stat-value"
                style={s.highlight ? { color: "#F97316" } : undefined}
              >
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="cp-dashboard-body">
        <div className="cp-schedule-panel">
          <div className="cp-panel-head">
            <h2 className="cp-panel-title">Lịch dạy hôm nay</h2>
            <span className="cp-date-badge">
              <IconCalendar />
              Thứ Năm, 26/10/2026
            </span>
          </div>
          <div className="cp-schedule-list">
            {schedule.map((s) => (
              <div
                key={s.name}
                className="cp-schedule-item"
                style={{ borderLeftColor: s.border }}
                onClick={() => onNavigate("schedule")}
              >
                <span className="cp-schedule-time">{s.time}</span>
                <div className="cp-schedule-info">
                  <span className="cp-schedule-name">{s.name}</span>
                  <span className="cp-schedule-loc">{s.location}</span>
                </div>
                <span
                  className="cp-type-badge"
                  style={{ color: s.typeColor, background: s.typeColor + "18" }}
                >
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="cp-notif-panel">
          <h2 className="cp-panel-title">Thông báo & Yêu cầu mới</h2>
          <div className="cp-notif-list">
            {notifications.map((n, i) => (
              <div className="cp-notif-card" key={i}>
                <div className="cp-notif-head">
                  <span
                    className="cp-notif-tag"
                    style={{ color: n.tagColor, background: n.tagBg }}
                  >
                    {n.tag}
                  </span>
                  <span className="cp-notif-time">{n.time}</span>
                </div>
                <p className="cp-notif-content">{n.content}</p>
                {n.actions.length > 0 && (
                  <div className="cp-notif-actions">
                    {n.actions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={a === "Chấp nhận" ? "cp-btn-primary-sm" : "cp-btn-ghost-sm"}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Screen 2: Lịch dạy (Weekly Schedule) ────────────────────────
const DAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"]
const HOURS = [6, 9, 14, 17, 20]

type ClassBlock = {
  day: number
  hour: number
  type: "GROUP" | "PT" | "SPECIAL"
  name: string
}

const weekClasses: ClassBlock[] = [
  { day: 0, hour: 9, type: "GROUP", name: "CrossFit A" },
  { day: 0, hour: 17, type: "GROUP", name: "CrossFit A" },
  { day: 1, hour: 6, type: "GROUP", name: "Yoga Sáng" },
  { day: 1, hour: 9, type: "PT", name: "PT: Minh Khoa" },
  { day: 1, hour: 20, type: "GROUP", name: "Yoga Đêm" },
  { day: 2, hour: 9, type: "GROUP", name: "Gym Group B" },
  { day: 2, hour: 14, type: "PT", name: "PT: Lan Anh" },
  { day: 3, hour: 9, type: "GROUP", name: "Gym Combat" },
  { day: 3, hour: 17, type: "GROUP", name: "CrossFit A" },
  { day: 4, hour: 6, type: "GROUP", name: "Yoga Sáng" },
  { day: 4, hour: 14, type: "PT", name: "PT: Lan Anh" },
  { day: 4, hour: 20, type: "GROUP", name: "Yoga Đêm" },
  { day: 5, hour: 17, type: "PT", name: "PT: Thu Trang" },
  { day: 6, hour: 14, type: "SPECIAL", name: "Sự kiện SC" },
]

const typeStyles = {
  GROUP: { color: "#3B82F6", bg: "#EEF5FF", label: "GROUP" },
  PT: { color: "#F97316", bg: "#FFF1E8", label: "PT" },
  SPECIAL: { color: "#8B5CF6", bg: "#EDE9FE", label: "SPECIAL" },
}

function CoachSchedule() {
  const [filter, setFilter] = useState<"all" | "GROUP" | "PT" | "SPECIAL">("all")

  const visible = filter === "all" ? weekClasses : weekClasses.filter((c) => c.type === filter)

  return (
    <div className="cp-schedule-screen">
      <div className="cp-schedule-toolbar">
        <div className="cp-week-picker">
          <span>Tuần này: 23/10 - 29/10</span>
          <IconChevronDown />
        </div>
        <div className="cp-filter-tabs">
          {(["all", "GROUP", "PT", "SPECIAL"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`cp-filter-tab ${filter === f ? "active" : ""}`}
              style={
                filter === f && f !== "all"
                  ? { background: typeStyles[f].bg, color: typeStyles[f].color, borderColor: typeStyles[f].color }
                  : undefined
              }
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tất cả" : f === "GROUP" ? `Lớp nhóm (${weekClasses.filter(c=>c.type==="GROUP").length})` : f === "PT" ? `PT cá nhân (${weekClasses.filter(c=>c.type==="PT").length})` : `Đặc biệt (${weekClasses.filter(c=>c.type==="SPECIAL").length})`}
            </button>
          ))}
        </div>
        <div className="cp-week-total">Tổng dạy: 18 buổi/tuần</div>
        <button className="cp-btn-primary" type="button">
          <IconPlus /> + Thêm lịch mới
        </button>
      </div>

      <div className="cp-week-grid-wrap">
        <div className="cp-week-grid">
          <div className="cp-week-header">
            <div className="cp-week-corner" />
            {DAYS.map((d) => (
              <div key={d} className="cp-week-day-head">{d}</div>
            ))}
          </div>
          {HOURS.map((hour) => (
            <div key={hour} className="cp-week-row">
              <div className="cp-week-time">{String(hour).padStart(2, "0")}:00</div>
              {DAYS.map((_, di) => {
                const cls = visible.find((c) => c.day === di && c.hour === hour)
                return (
                  <div key={di} className="cp-week-cell">
                    {cls && (
                      <div
                        className="cp-week-block"
                        style={{
                          color: typeStyles[cls.type].color,
                          background: typeStyles[cls.type].bg,
                          borderLeftColor: typeStyles[cls.type].color,
                        }}
                      >
                        <span className="cp-week-block-type">{typeStyles[cls.type].label}</span>
                        <span className="cp-week-block-name">{cls.name}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Screen 3: Kho Giáo Án ────────────────────────────────────────
const curricula = [
  { name: "Yoga Gây & Dây Cơ Bản", category: "Yoga", level: "Beginner", duration: 60, uses: 42 },
  { name: "HIIT Đốt Mỡ Thể Lực Cao", category: "Cardio", level: "Advanced", duration: 45, uses: 56 },
  { name: "Tăng Cơ Ngực & Vai VIP PT", category: "Personal PT", level: "Intermediate", duration: 60, uses: 124 },
  { name: "Giáo Án CrossFit Cho Team", category: "Thể lực", level: "Advanced", duration: 90, uses: 18 },
  { name: "Yoga Trị Liệu Cột Sống", category: "Yoga", level: "Beginner", duration: 75, uses: 35 },
  { name: "Gym Nhẹ Nhàng Phục Hồi", category: "Fitness", level: "Beginner", duration: 50, uses: 29 },
  { name: "Giảm Cân Bền Vững PT 1-1", category: "Personal PT", level: "Intermediate", duration: 60, uses: 88 },
  { name: "Core & Abs Bụng Săn Chắc", category: "Cardio", level: "Intermediate", duration: 30, uses: 64 },
]

const levelColors: Record<string, { color: string; bg: string }> = {
  Beginner: { color: "#10B981", bg: "#D1FAE5" },
  Intermediate: { color: "#F97316", bg: "#FFF1E8" },
  Advanced: { color: "#EF4444", bg: "#FEE2E2" },
}

function CoachCurriculum() {
  const [selected, setSelected] = useState(0)
  const curr = curricula[selected]

  return (
    <div className="cp-curriculum-screen">
      <div className="cp-curriculum-left">
        <div className="cp-curriculum-toolbar">
          <h2 className="cp-panel-title">Danh sách giáo án hoạt động</h2>
          <button className="cp-btn-primary" type="button">
            <IconPlus /> + Tạo giáo án mới
          </button>
        </div>
        <div className="cp-curriculum-table-wrap">
          <table className="cp-curriculum-table">
            <thead>
              <tr>
                <th>TÊN GIÁO ÁN</th>
                <th>PHÂN LOẠI</th>
                <th>CẤP ĐỘ</th>
                <th>THỜI LƯỢNG</th>
                <th>ĐÃ SỬ DỤNG</th>
              </tr>
            </thead>
            <tbody>
              {curricula.map((c, i) => (
                <tr
                  key={c.name}
                  className={selected === i ? "selected" : ""}
                  onClick={() => setSelected(i)}
                >
                  <td>{c.name}</td>
                  <td className="cp-curriculum-cat">{c.category}</td>
                  <td>
                    <span
                      className="cp-level-badge"
                      style={{
                        color: levelColors[c.level].color,
                        background: levelColors[c.level].bg,
                      }}
                    >
                      {c.level}
                    </span>
                  </td>
                  <td>{c.duration} phút</td>
                  <td>{c.uses} lần</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cp-curriculum-right">
        <p className="cp-detail-eyebrow">CHI TIẾT GIÁO ÁN ĐANG CHỌN</p>
        <h2 className="cp-detail-title">{curr.name}</h2>
        <p className="cp-detail-meta">
          Thời lượng: {curr.duration} phút • Cấp độ: {curr.level}
        </p>
        <div className="cp-detail-phases">
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#F97316" }}>PHẦN 1: KHỞI ĐỘNG (15 PHÚT)</p>
            <p className="cp-phase-body">
              • 5 phút thở bụng ổn định tâm trí. • 10 phút khởi động xoay các
              khớp cổ, vai, hông kết hợp gây gỗ nhẹ để mở rộng biên độ chuyển
              động.
            </p>
          </div>
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#10B981" }}>PHẦN 2: THỰC HÀNH CHÍNH (35 PHÚT)</p>
            <p className="cp-phase-body">
              • Chuỗi chiến binh kết hợp gây để cân chỉnh trục cột sống. •
              Sử dụng dây khang lực treo tường bổ trợ kéo giãn khớp vai và
              lồng ngực. • Thực hành các tư thế thăng bằng chân cơ gây định
              tâm thế đứng.
            </p>
          </div>
          <div className="cp-phase">
            <p className="cp-phase-head" style={{ color: "#8B5CF6" }}>PHẦN 3: THƯ GIÃN & PHỤC HỒI (10 PHÚT)</p>
            <p className="cp-phase-body">
              • Tư thế em bé giãn thắt lưng kết hợp dây. • Thư giãn sâu
              Savasana trong nhạc thiền Tây Tạng tình tâm tuyệt đối.
            </p>
          </div>
        </div>
        <button className="cp-btn-primary cp-btn-full" type="button">
          ÁP DỤNG CHO LỚP HỌC
        </button>
      </div>
    </div>
  )
}

// ── Screen 4: Đánh giá học viên ──────────────────────────────────
const students = [
  {
    name: "Nguyễn Lan Anh",
    type: "PT 1-1",
    avatar: `${A}/50eeb.png`,
    progress: "Tiến triển tốt",
    progressColor: "#10B981",
    progressBg: "#D1FAE5",
    weight: "54kg",
    goal: "Giảm 3kg mỡ mông đùi",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 14:00",
  },
  {
    name: "Lê Minh Triết",
    type: "Fitness Member",
    avatar: `${A}/c814c.png`,
    progress: "Ổn định",
    progressColor: "#3B82F6",
    progressBg: "#EEF5FF",
    weight: "78kg",
    goal: "Tăng 2kg cơ bắp tay",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 08:15",
  },
  {
    name: "Vũ Thu Trang",
    type: "Yoga VIP 1-1",
    avatar: `${A}/88820.png`,
    progress: "Khá chậm",
    progressColor: "#F97316",
    progressBg: "#FFF1E8",
    weight: "49kg",
    goal: "Phục hồi khớp vai thẳng trục",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Hôm nay, 08:02",
  },
  {
    name: "Trần Minh Khoa",
    type: "CrossFit Team",
    avatar: `${A}/98afc.png`,
    progress: "Tiến triển xuất sắc",
    progressColor: "#0D9488",
    progressBg: "#CCFBF1",
    weight: "82kg",
    goal: "Cải thiện VO2 Max & Thể lực",
    note: '"Hoàn thành tốt chuỗi ta Squat 15 reps x 3 sets. Khớp hông linh hoạt hơn, tuy nhiên cần chú ý hit thở sâu, không nín thở khi gồng bụng."',
    noteTime: "Thứ 3, 17:00",
  },
]

function CoachAssessment() {
  const [query, setQuery] = useState("")
  const visible = students.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="cp-assessment-screen">
      <div className="cp-assessment-toolbar">
        <h2 className="cp-panel-title">Theo dõi tiến trình & Ghi chú HLV</h2>
        <label className="cp-search-box">
          <IconSearch />
          <input
            placeholder="Tìm tên học viên..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="cp-student-grid">
        {visible.map((s) => (
          <div className="cp-student-card" key={s.name}>
            <div className="cp-student-head">
              <div className="cp-student-id">
                <img src={s.avatar} alt={s.name} className="cp-student-avatar" />
                <div>
                  <strong className="cp-student-name">{s.name}</strong>
                  <span className="cp-student-type">{s.type}</span>
                </div>
              </div>
              <span
                className="cp-progress-badge"
                style={{ color: s.progressColor, background: s.progressBg }}
              >
                {s.progress}
              </span>
            </div>
            <div className="cp-student-stats">
              <div>
                <p className="cp-student-stat-label">CÂN NẶNG HIỆN TẠI</p>
                <p className="cp-student-stat-val">{s.weight}</p>
              </div>
              <div>
                <p className="cp-student-stat-label">MỤC TIÊU HUẤN LUYỆN</p>
                <p className="cp-student-stat-val">{s.goal}</p>
              </div>
            </div>
            <div className="cp-student-note-wrap">
              <p className="cp-student-note-label">
                GHI CHÚ HLV BUỔI GẦN NHẤT ({s.noteTime})
              </p>
              <p className="cp-student-note">{s.note}</p>
            </div>
            <div className="cp-student-actions">
              <button className="cp-btn-primary cp-btn-sm" type="button">
                Viết ghi chú buổi mới
              </button>
              <button className="cp-btn-outline cp-btn-sm" type="button">
                Lịch sử Body Fat
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Screen 5: Hồ sơ cá nhân ─────────────────────────────────────
function CoachProfile() {
  const certs = [
    "Chứng chỉ Master Yoga Alliance 200H Mỹ.",
    "Chứng nhận Huấn luyện viên thể lực CrossFit Level 2 quốc tế.",
    "Chứng chỉ PT chuyên nghiệp liên đoàn tại Việt Nam.",
    "Chuyên gia tư vấn dinh dưỡng nâng cao (Nutritional Specialist).",
  ]

  return (
    <div className="cp-profile-screen">
      <div className="cp-profile-hero-card">
        <img src={`${A}/f6154.png`} alt="HLV Nguyễn Minh Tuấn" className="cp-profile-photo" />
        <div className="cp-profile-hero-info">
          <div className="cp-profile-name-row">
            <h2 className="cp-profile-name">HLV Nguyễn Minh Tuấn</h2>
            <span className="cp-master-badge">MASTER COACH</span>
          </div>
          <p className="cp-profile-sub">
            Mã HLV: HLV-4019 • Bộ môn phụ trách chính: Gym, Yoga & CrossFit
          </p>
          <div className="cp-profile-fields">
            <div>
              <p className="cp-profile-field-label">ĐIỆN THOẠI</p>
              <p className="cp-profile-field-val">098 765 4321</p>
            </div>
            <div>
              <p className="cp-profile-field-label">EMAIL LIÊN HỆ</p>
              <p className="cp-profile-field-val">tuan.nm@sportcenter.com</p>
            </div>
            <div>
              <p className="cp-profile-field-label">BẰNG CẤP & CHỨNG CHỈ</p>
              <p className="cp-profile-field-val">
                Bằng cử nhân Y sinh học TDTT • NASM CPT
              </p>
            </div>
            <div>
              <p className="cp-profile-field-label">KINH NGHIỆM</p>
              <p className="cp-profile-field-val">8 năm huấn luyện chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cp-profile-sections">
        <div className="cp-profile-card">
          <h3 className="cp-profile-card-title">Chứng chỉ & Chuyên môn đạt được</h3>
          <ul className="cp-cert-list">
            {certs.map((c) => (
              <li key={c} className="cp-cert-item">
                <span className="cp-cert-check">
                  <IconCheck />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="cp-profile-card">
          <h3 className="cp-profile-card-title">Đánh giá & Doanh số cá nhân</h3>
          <div className="cp-kpi-list">
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">Điểm hài lòng học viên (CSAT):</span>
              <span className="cp-kpi-val" style={{ color: "#10B981" }}>4.9 / 5.0 (★)</span>
            </div>
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">Tỷ lệ gia hạn gói tập PT:</span>
              <span className="cp-kpi-val" style={{ color: "#3B82F6" }}>88.5%</span>
            </div>
            <div className="cp-kpi-row">
              <span className="cp-kpi-label">KPI đạt được tháng này:</span>
              <span className="cp-kpi-val" style={{ color: "#F97316" }}>115% mục tiêu</span>
            </div>
          </div>
          <button className="cp-btn-outline cp-btn-full" style={{ marginTop: 20 }} type="button">
            Yêu cầu chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Screen 6: AI Gợi ý ──────────────────────────────────────────
const AI_EXERCISES = [
  { icon: "🔥", name: "HIIT Tabata 20/10 Core Burn", duration: "45 phút", target: "Đốt mỡ bụng", level: "Cao" },
  { icon: "🥊", name: "Shadow Boxing & Footwork Drills", duration: "30 phút", target: "Tăng sức bền", level: "Trung bình" },
  { icon: "🏋️", name: "Kettlebell Swings & Thrusters", duration: "25 phút", target: "Sức mạnh cơ trung tâm", level: "Cao" },
  { icon: "💜", name: "Cool-down & Stretch giãn cơ sâu", duration: "15 phút", target: "Phục hồi cơ bắp", level: "Thấp" },
]

const groupClasses = [
  { name: "Yoga Gây & Dây Cơ Bản", subject: "Yoga", members: 12, next: "Thứ Sáu - 07:00" },
  { name: "Gym Group BodyCombat", subject: "Cardio", members: 20, next: "Thứ Bảy - 09:00" },
  { name: "CrossFit Thể Lực Cao Độ", subject: "Thể lực", members: 8, next: "Chủ nhật - 17:00" },
]

const levelColorAI: Record<string, string> = {
  Cao: "#EF4444",
  "Trung bình": "#F97316",
  Thấp: "#10B981",
}

function CoachAI() {
  const [studentOpen, setStudentOpen] = useState(true)

  return (
    <div className="cp-ai-screen">
      <div className="cp-ai-selector">
        <label className="cp-student-select" onClick={() => setStudentOpen(!studentOpen)}>
          <IconSearch />
          <span>Chọn học viên để gợi ý bài tập...</span>
          <IconChevronDown />
        </label>
        <span className="cp-selected-badge">Đã chọn 1 học viên</span>
      </div>

      <div className="cp-ai-student-card">
        <img src={`${A}/c814c.png`} alt="Nguyễn Minh Khoa" className="cp-ai-student-avatar" />
        <div className="cp-ai-student-info">
          <strong>Nguyễn Minh Khoa</strong>
          <span className="cp-ai-student-tag">HIIT & Boxing</span>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">TRÌNH ĐỘ</p>
          <p className="cp-ai-stat-val">Trung bình</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">MỤC TIÊU HUẤN LUYỆN</p>
          <p className="cp-ai-stat-val">Giảm mỡ & Tăng sức bền</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">ĐÃ LUYỆN TẬP</p>
          <p className="cp-ai-stat-val">24 buổi</p>
        </div>
        <div className="cp-ai-student-stat">
          <p className="cp-ai-stat-label">BUỔI GẦN NHẤT</p>
          <p className="cp-ai-stat-val">25/10/2026</p>
        </div>
      </div>

      <div className="cp-ai-body">
        <div className="cp-ai-suggestions">
          <div className="cp-ai-sug-head">
            <div>
              <h2 className="cp-panel-title">Bài tập được AI đề xuất</h2>
              <p className="cp-ai-sug-sub">Dựa trên thể lực, lịch sử tập luyện và mục tiêu đốt mỡ</p>
            </div>
            <span className="cp-ai-badge">✦ Được tạo bởi AI</span>
          </div>

          <div className="cp-ai-plan-card">
            <p className="cp-ai-plan-title">Kế hoạch tập luyện tuần tới (Tuần 5)</p>
            <p className="cp-ai-plan-desc">
              Tập trung cải thiện chỉ số Sức bền tim mạch thông qua chuỗi bài HIIT cường độ
              cao ngắt quãng kết hợp Power Boxing.
            </p>
            <div className="cp-ai-exercise-list">
              {AI_EXERCISES.map((ex) => (
                <div className="cp-ai-exercise-item" key={ex.name}>
                  <span className="cp-ai-ex-icon">{ex.icon}</span>
                  <div className="cp-ai-ex-info">
                    <strong>{ex.name}</strong>
                    <span className="cp-ai-ex-sub">{ex.duration} • {ex.target}</span>
                  </div>
                  <span
                    className="cp-ai-ex-level"
                    style={{ color: levelColorAI[ex.level] }}
                  >
                    {ex.level}
                  </span>
                </div>
              ))}
            </div>
            <div className="cp-ai-plan-actions">
              <button className="cp-btn-primary cp-btn-full" type="button">
                Áp dụng kế hoạch này
              </button>
              <button className="cp-btn-outline" type="button">
                <IconRefresh /> Tạo gợi ý mới
              </button>
            </div>
          </div>
        </div>

        <div className="cp-ai-analysis">
          <div className="cp-ai-analysis-card">
            <h3 className="cp-profile-card-title">Phân tích thể lực AI</h3>
            {[
              { label: "Sức bền (Cardio)", pct: 72, color: "#3B82F6" },
              { label: "Sức mạnh (Power)", pct: 58, color: "#8B5CF6" },
              { label: "Dẻo dai (Flexibility)", pct: 45, color: "#F97316" },
            ].map((bar) => (
              <div key={bar.label} className="cp-bar-row">
                <div className="cp-bar-head">
                  <span>{bar.label}</span>
                  <span style={{ color: bar.color, fontFamily: "var(--font-bold)" }}>{bar.pct}%</span>
                </div>
                <div className="cp-bar-track">
                  <div
                    className="cp-bar-fill"
                    style={{ width: `${bar.pct}%`, background: bar.color }}
                  />
                </div>
              </div>
            ))}
            <div className="cp-ai-kcal">
              <span>⚡</span>
              <div>
                <p className="cp-ai-kcal-label">TIÊU THỤ NĂNG LƯỢNG TRUNG BÌNH</p>
                <p className="cp-ai-kcal-val">520 kcal / buổi tập</p>
              </div>
            </div>
          </div>

          <div className="cp-ai-analysis-card">
            <div className="cp-bar-head">
              <h3 className="cp-profile-card-title" style={{ margin: 0 }}>Lịch sử tiến bộ</h3>
              <span className="cp-ai-trend">Xu hướng 4 tuần</span>
            </div>
            <svg width="100%" height="80" viewBox="0 0 220 80" preserveAspectRatio="none">
              <polyline
                points="10,60 70,45 130,30 190,10"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {[10, 70, 130, 190].map((x, i) => (
                <circle key={i} cx={x} cy={[60, 45, 30, 10][i]} r="4" fill="#3B82F6" />
              ))}
            </svg>
            <div className="cp-chart-labels">
              {["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4 (Hiện tại)"].map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cp-ai-group">
        <h2 className="cp-panel-title">Gợi ý bài tập cho lớp nhóm</h2>
        <table className="cp-curriculum-table">
          <thead>
            <tr>
              <th>TÊN LỚP HỌC</th>
              <th>BỘ MÔN</th>
              <th>SỐ HỘI VIÊN</th>
              <th>GIỜ HỌC TIẾP THEO</th>
              <th>HÀNH ĐỘNG AI</th>
            </tr>
          </thead>
          <tbody>
            {groupClasses.map((g) => (
              <tr key={g.name}>
                <td>{g.name}</td>
                <td>{g.subject}</td>
                <td>{g.members} học viên</td>
                <td>{g.next}</td>
                <td>
                  <button className="cp-ai-action-btn" type="button">
                    ✦ Tạo giáo án AI cho lớp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main Export ──────────────────────────────────────────────────
export default function CoachPortal() {
  const [screen, setScreen] = useState<CoachScreen>("dashboard")

  const screens: Record<CoachScreen, ReactNode> = {
    dashboard: <CoachDashboard onNavigate={setScreen} />,
    schedule: <CoachSchedule />,
    curriculum: <CoachCurriculum />,
    assessment: <CoachAssessment />,
    profile: <CoachProfile />,
    ai: <CoachAI />,
  }

  return (
    <CoachShell screen={screen} onNavigate={setScreen}>
      {screens[screen]}
    </CoachShell>
  )
}
