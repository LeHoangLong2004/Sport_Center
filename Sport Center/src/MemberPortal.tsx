import { FormEvent, useMemo, useState } from "react"
import MemberPortalV2, { NewMemberPage } from "./MemberPortalV2"

export type MemberPage =
  | "overview"
  | "users"
  | "classes"
  | "confirm"
  | "payment"
  | "reports"
  | "profile"
  | NewMemberPage

const assetRoots = {
  overview: "/assets/member-dashboard",
  classes: "/assets/member-booking",
  confirm: "/assets/member-confirm",
}

const iconNames = {
  overview: {
    dashboard: "f100e.svg",
    users: "9ddf7.svg",
    calendar: "21064.svg",
    payment: "91b5c.svg",
    reports: "77921.svg",
    ai: "b44db.svg",
    search: "b08f9.svg",
    bell: "e12e7.svg",
    avatar: "af3ea.svg",
    account: "92db2.svg",
  },
  classes: {
    dashboard: "a6906.svg",
    users: "c502a.svg",
    calendar: "2e78e.svg",
    payment: "2b3e0.svg",
    reports: "01d29.svg",
    ai: "f1047.svg",
    search: "ce4a8.svg",
    bell: "a9acc.svg",
    avatar: "98e10.png",
    account: "6b7a8.png",
  },
  confirm: {
    dashboard: "a6906.svg",
    users: "c502a.svg",
    calendar: "2e78e.svg",
    payment: "2b3e0.svg",
    reports: "01d29.svg",
    ai: "f1047.svg",
    search: "ce4a8.svg",
    bell: "a9acc.svg",
    avatar: "86f81.png",
    account: "a091d.png",
  },
}

const classItems = [
  {
    title: "Yoga Flow",
    coach: "Mai Phương",
    schedule: "Thứ Tư, 23/09 • 08:00 (60 phút)",
    room: "Phòng: Studio 1 (Tầng 2)",
    spaces: "Còn 8 chỗ",
    image: "60eeb.png",
  },
  {
    title: "Functional HIIT",
    coach: "Trần Khoa",
    schedule: "Thứ Ba, 22/09 • 18:30 (45 phút)",
    room: "Phòng: Arena 2 (Tầng 1)",
    spaces: "Còn 5 chỗ",
    image: "340d3.png",
  },
  {
    title: "Zumba Dance",
    coach: "Hoàng Anh",
    schedule: "Thứ Năm, 24/09 • 19:30 (60 phút)",
    room: "Phòng: Studio 3 (Tầng 3)",
    spaces: "Còn 12 chỗ",
    image: "b0a09.png",
  },
  {
    title: "Kickboxing Basic",
    coach: "Nguyễn Hùng",
    schedule: "Thứ Sáu, 25/09 • 06:30 (60 phút)",
    room: "Phòng: Combat Zone",
    spaces: "Còn 4 chỗ",
    image: "25c0c.png",
  },
  {
    title: "Pilates Core",
    coach: "Minh Thư",
    schedule: "Thứ Bảy, 26/09 • 09:00 (60 phút)",
    room: "Phòng: Studio 2 (Tầng 2)",
    spaces: "Còn 2 chỗ",
    image: "5709f.png",
  },
  {
    title: "Swimming Adv",
    coach: "Quốc Bảo",
    schedule: "Chủ Nhật, 27/09 • 17:00 (90 phút)",
    room: "Phòng: Pool Area (Tầng hầm)",
    spaces: "Còn 10 chỗ",
    image: "8b5dc.png",
  },
]

type ClassItem = (typeof classItems)[number]

type PortalVisualPage = keyof typeof assetRoots

function visualPage(page: MemberPage): PortalVisualPage {
  return page === "classes" || page === "confirm" ? page : "overview"
}

function asset(page: PortalVisualPage, filename: string) {
  return `${assetRoots[page]}/${filename}`
}

function MemberSidebar({
  page,
  onNavigate,
}: {
  page: MemberPage
  onNavigate: (page: MemberPage) => void
}) {
  const currentVisualPage = visualPage(page)
  const icons = iconNames[currentVisualPage]
  const navigation = [
    ["overview", "Tổng quan", icons.dashboard],
    ["users", "Người dùng", icons.users],
    ["schedule", "Lớp & lịch", icons.calendar],
    ["payment", "Thanh toán", icons.payment],
    ["reports", "Báo cáo", icons.reports],
    ["ai", "AI & đào tạo", icons.ai],
  ] as const

  return (
    <aside className="mp-sidebar">
      <div className="mp-brand">
        <span className="mp-brand-mark">SC</span>
        <span className="mp-brand-copy">
          <strong>SPORTCENTER</strong>
          <small>MEMBER</small>
        </span>
      </div>

      <nav className="mp-navigation" aria-label="Điều hướng hội viên">
        {navigation.map(([destination, label, icon]) => {
          const active =
            destination === "overview"
              ? page === "overview"
              : destination === "schedule"
                ? ["classes", "confirm", "schedule", "success"].includes(page)
                : destination === "reports"
                  ? page === "reports" || page === "workout"
                  : page === destination
          return (
            <button
              className={active ? "mp-nav-item active" : "mp-nav-item"}
              key={destination}
              onClick={() => onNavigate(destination)}
              type="button"
            >
              <span className="mp-icon-box">
                <img src={asset(currentVisualPage, icon)} alt="" />
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mp-support">
        <strong>Cần hỗ trợ?</strong>
        <span>Trung tâm vận hành 06:00–22:00 hằng ngày</span>
      </div>

      <div className="mp-sidebar-spacer" />

      <div className="mp-account">
        <img src={asset(currentVisualPage, icons.avatar)} alt="" />
        <span>
          <strong>Minh Anh</strong>
          <small>
            {page === "overview"
              ? "Ca sáng • Đang hoạt động"
              : "Hội viên Premium"}
          </small>
        </span>
      </div>
    </aside>
  )
}

function MemberTopbar({
  page,
  onNavigate,
}: {
  page: MemberPage
  onNavigate: (page: MemberPage) => void
}) {
  const currentVisualPage = visualPage(page)
  const icons = iconNames[currentVisualPage]
  const pageCopy: Partial<Record<MemberPage, [string, string]>> = {
    overview: ["Member Portal / Tổng quan", "Xin chào, Lan Anh"],
    users: ["Member Portal / Người dùng", "Hồ sơ hội viên"],
    classes: ["Member Portal / Lớp & Lịch / Đặt lớp", "Đặt lớp tập"],
    confirm: [
      "Member Portal / Lớp & Lịch / Xác nhận đặt chỗ",
      "Xác nhận đăng ký lớp",
    ],
    payment: ["Member Portal / Thanh toán", "Gói tập & thanh toán"],
    reports: ["Member Portal / Báo cáo", "Báo cáo luyện tập"],
    profile: ["Member Portal / Hồ sơ cá nhân", "Hồ sơ của tôi"],
  }
  const [breadcrumb, title] = pageCopy[page] ?? pageCopy.overview!

  return (
    <header className="mp-topbar">
      <div className="mp-topbar-title">
        <span>{breadcrumb}</span>
        <strong>{title}</strong>
      </div>
      <div className="mp-tools">
        <label className="mp-search">
          <span className="mp-icon-box">
            <img src={asset(currentVisualPage, icons.search)} alt="" />
          </span>
          <input aria-label="Tìm nhanh" placeholder="Tìm nhanh..." />
        </label>
        <button className="mp-tool-button" aria-label="Thông báo" type="button">
          <img src={asset(currentVisualPage, icons.bell)} alt="" />
        </button>
        <button
          className="mp-account-button"
          aria-label="Hồ sơ cá nhân"
          type="button"
          onClick={() => onNavigate("profile")}
        >
          <img src={asset(currentVisualPage, icons.account)} alt="" />
        </button>
      </div>
    </header>
  )
}

function MemberShell({
  page,
  onNavigate,
  children,
}: {
  page: MemberPage
  onNavigate: (page: MemberPage) => void
  children: React.ReactNode
}) {
  return (
    <main className="mp-shell">
      <MemberSidebar page={page} onNavigate={onNavigate} />
      <div className="mp-workspace">
        <MemberTopbar page={page} onNavigate={onNavigate} />
        {children}
      </div>
    </main>
  )
}

function MemberProfile({ onNavigate }: { onNavigate: (page: MemberPage) => void }) {
  return (
    <MemberShell page="profile" onNavigate={onNavigate}>
      <div className="mp-profile-page">
        <div className="mp-profile-hero">
          <div className="mp-profile-avatar-wrap">
            <img
              src="/assets/member-dashboard/af3ea.svg"
              alt="Ảnh đại diện"
              className="mp-profile-avatar"
            />
            <button className="mp-profile-avatar-edit" type="button" aria-label="Đổi ảnh">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.933 13.733l-3.6.8.8-3.6L11.333 2Z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="mp-profile-hero-info">
            <h2 className="mp-profile-name">Nguyễn Lan Anh</h2>
            <span className="mp-profile-badge">Hội viên Premium</span>
            <p className="mp-profile-id">ID: MEM-2024-00142</p>
          </div>
        </div>

        <div className="mp-profile-sections">
          <div className="mp-profile-card">
            <div className="mp-profile-card-header">
              <h3>Thông tin cá nhân</h3>
              <button type="button" className="mp-profile-edit-btn">Chỉnh sửa</button>
            </div>
            <div className="mp-profile-fields">
              <div className="mp-profile-field">
                <span className="mp-profile-label">Họ và tên</span>
                <span className="mp-profile-value">Nguyễn Lan Anh</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Email</span>
                <span className="mp-profile-value">lananh@sportscenter.vn</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Số điện thoại</span>
                <span className="mp-profile-value">0912 345 678</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày sinh</span>
                <span className="mp-profile-value">15/03/1995</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Giới tính</span>
                <span className="mp-profile-value">Nữ</span>
              </div>
            </div>
          </div>

          <div className="mp-profile-card">
            <div className="mp-profile-card-header">
              <h3>Thông tin gói tập</h3>
            </div>
            <div className="mp-profile-fields">
              <div className="mp-profile-field">
                <span className="mp-profile-label">Gói hiện tại</span>
                <span className="mp-profile-value mp-profile-premium">Premium 12 tháng</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày tham gia</span>
                <span className="mp-profile-value">01/10/2024</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Ngày hết hạn</span>
                <span className="mp-profile-value">30/09/2025</span>
              </div>
              <div className="mp-profile-field">
                <span className="mp-profile-label">Trạng thái</span>
                <span className="mp-profile-value mp-profile-status-active">Đang hoạt động</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mp-profile-actions">
          <button type="button" className="mp-profile-action-btn mp-profile-action-primary">
            Đổi mật khẩu
          </button>
          <button type="button" className="mp-profile-action-btn mp-profile-action-secondary" onClick={() => onNavigate("overview")}>
            Quay lại tổng quan
          </button>
        </div>
      </div>
    </MemberShell>
  )
}

function Overview({
  onNavigate,
}: {
  onNavigate: (page: MemberPage) => void
}) {
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState<string[]>([])

  function sendMessage(event: FormEvent) {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setConversation((current) => [...current, cleanMessage])
    setMessage("")
  }

  return (
    <MemberShell page="overview" onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">FLOW 6 • AI ASSISTANT</span>
            <p>Xin chào, Lan Anh 👋</p>
            <small>Lịch tập, tiến độ và hỗ trợ cá nhân trong một nơi.</small>
          </div>
          <button
            className="mp-primary-action"
            onClick={() => onNavigate("classes")}
            type="button"
          >
            Đặt lớp
          </button>
        </div>

        <div className="mp-portal-grid">
          <div className="mp-dashboard-column">
            <div className="mp-stat-grid">
              <div className="mp-stat-card blue">
                <span>Gói hiện tại</span>
                <strong>Premium</strong>
                <small>Còn 88 ngày</small>
              </div>
              <div className="mp-stat-card green">
                <span>Chuỗi tập</span>
                <strong>12 ngày</strong>
                <small>Kỷ lục 18 ngày</small>
              </div>
              <div className="mp-stat-card">
                <span>Tiến độ mục tiêu</span>
                <strong>45%</strong>
                <small>−1,8 / −4 kg</small>
              </div>
            </div>

            <div className="mp-card">
              <strong className="mp-card-label">Lịch sắp tới</strong>
              <div className="mp-schedule-table">
                <div className="mp-schedule-head">
                  <span>THỜI GIAN</span>
                  <span>LỚP</span>
                  <span>COACH</span>
                </div>
                {[
                  ["Hôm nay • 18:30", "Functional HIIT", "Trần Khoa"],
                  ["T4 • 08:00", "Yoga Flow", "Mai Phương"],
                  ["T6 • 17:30", "PT cá nhân", "Trần Khoa"],
                ].map((row) => (
                  <div className="mp-schedule-row" key={row[0]}>
                    <strong>{row[0]}</strong>
                    <span>{row[1]}</span>
                    <span>{row[2]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mp-card mp-notice-card">
              <strong className="mp-card-label">Thông báo</strong>
              <span>
                Coach đã cập nhật kế hoạch tuần 5 • Gói Premium sẽ gia hạn sau
                88 ngày
              </span>
              <small>1 cập nhật mới</small>
            </div>
          </div>

          <aside className="mp-ai-panel">
            <div className="mp-ai-heading">
              <span>
                <img
                  src={asset("overview", "ece3e.svg")}
                  alt=""
                />
              </span>
              <div>
                <strong>Move AI</strong>
                <small>● Đang trực tuyến</small>
              </div>
            </div>
            <p className="mp-ai-message">
              Chào Lan Anh! Hôm nay bạn có lớp HIIT lúc 18:30. Mình đề xuất
              khởi động gối 8 phút trước buổi tập.
            </p>
            <p className="mp-user-message">
              Tôi có thể đổi sang lớp nhẹ hơn không?
            </p>
            <p className="mp-ai-message">
              Có. Yoga Recovery lúc 19:00 còn 6 chỗ và phù hợp với tình trạng
              đầu gối hôm nay. Bạn muốn mình giữ chỗ?
            </p>
            {conversation.map((item, index) => (
              <p className="mp-user-message" key={`${item}-${index}`}>
                {item}
              </p>
            ))}
            <strong className="mp-suggestion-title">GỢI Ý CÂU HỎI</strong>
            {[
              "Lịch tập tuần này",
              "Bài tập phục hồi gối",
              "Quyền lợi gói Premium",
            ].map((suggestion) => (
              <button
                className="mp-suggestion"
                key={suggestion}
                onClick={() => setMessage(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
            <form className="mp-message-input" onSubmit={sendMessage}>
              <input
                aria-label="Tin nhắn cho Move AI"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Hỏi về lịch, bài tập, dịch vụ..."
                value={message}
              />
              <button aria-label="Gửi tin nhắn" type="submit">
                <img src={asset("overview", "c2444.svg")} alt="" />
              </button>
            </form>
          </aside>
        </div>
      </section>
    </MemberShell>
  )
}

const memberSections = {
  users: {
    kicker: "THÔNG TIN TÀI KHOẢN",
    title: "Hồ sơ hội viên",
    description: "Quản lý thông tin cá nhân và trạng thái hội viên của bạn.",
    stats: [
      ["Hạng hội viên", "Premium", "Hoạt động"],
      ["Mã hội viên", "MB-2048", "Tham gia từ 2024"],
      ["Chi nhánh", "Quận 1", "SportCenter Central"],
    ],
    rows: [
      ["Họ và tên", "Nguyễn Lan Anh", "Thông tin định danh"],
      ["Số điện thoại", "0903 456 789", "Số liên hệ chính"],
      ["Email", "lananh@email.com", "Nhận thông báo hệ thống"],
    ],
  },
  payment: {
    kicker: "GÓI TẬP & HÓA ĐƠN",
    title: "Thanh toán",
    description: "Theo dõi gói tập hiện tại và các giao dịch gần đây.",
    stats: [
      ["Gói hiện tại", "Premium", "12 tháng"],
      ["Ngày hết hạn", "18/12/2026", "Còn 88 ngày"],
      ["Trạng thái", "Đã thanh toán", "Không có dư nợ"],
    ],
    rows: [
      ["HD-092026", "Premium 12 tháng", "12.000.000 đ"],
      ["HD-032026", "Gia hạn tủ đồ", "600.000 đ"],
      ["HD-122025", "PT cá nhân • 10 buổi", "4.500.000 đ"],
    ],
  },
  reports: {
    kicker: "TIẾN ĐỘ LUYỆN TẬP",
    title: "Báo cáo",
    description: "Tổng hợp hoạt động và kết quả luyện tập của bạn.",
    stats: [
      ["Buổi tập tháng này", "12 buổi", "Tăng 3 buổi"],
      ["Năng lượng tiêu hao", "8.400 kcal", "Đạt 84% mục tiêu"],
      ["Chuỗi tập hiện tại", "5 ngày", "Kỷ lục 18 ngày"],
    ],
    rows: [
      ["Functional HIIT", "22/09/2026", "450 kcal"],
      ["Yoga Flow", "20/09/2026", "210 kcal"],
      ["Cardio tự do", "18/09/2026", "380 kcal"],
    ],
  },
} as const

function MemberSection({
  page,
  onNavigate,
}: {
  page: keyof typeof memberSections
  onNavigate: (page: MemberPage) => void
}) {
  const content = memberSections[page]

  return (
    <MemberShell page={page} onNavigate={onNavigate}>
      <section className="mp-overview-content">
        <div className="mp-page-heading">
          <div>
            <span className="mp-kicker">{content.kicker}</span>
            <p>{content.title}</p>
            <small>{content.description}</small>
          </div>
        </div>

        <div className="mp-dashboard-column">
          <div className="mp-stat-grid">
            {content.stats.map(([label, value, detail], index) => (
              <div
                className={`mp-stat-card ${index === 0 ? "blue" : index === 1 ? "green" : ""}`}
                key={label}
              >
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>

          <div className="mp-card">
            <strong className="mp-card-label">
              {page === "users" ? "THÔNG TIN CHI TIẾT" : "HOẠT ĐỘNG GẦN ĐÂY"}
            </strong>
            <div className="mp-schedule-table">
              {content.rows.map(([primary, secondary, meta]) => (
                <div className="mp-schedule-row" key={primary}>
                  <strong>{primary}</strong>
                  <span>{secondary}</span>
                  <span>{meta}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MemberShell>
  )
}

function Progress({ step }: { step: 1 | 2 }) {
  const lineAssets =
    step === 1
      ? [
          asset("classes", "e889f.svg"),
          asset("classes", "e889f.svg"),
        ]
      : [
          asset("confirm", "3c7d4.svg"),
          asset("confirm", "7156f.svg"),
        ]

  return (
    <div className={step === 1 ? "mp-progress step-one" : "mp-progress"}>
      <span className={step === 1 ? "active" : ""}>1. Chọn lịch</span>
      <i>
        <img src={lineAssets[0]} alt="" />
      </i>
      <span className={step === 2 ? "active" : ""}>
        {step === 2 ? "2. Xác nhận đặt lớp" : "2. Xác nhận"}
      </span>
      <i>
        <img src={lineAssets[1]} alt="" />
      </i>
      <span>3. Hoàn tất</span>
    </div>
  )
}

function Classes({
  onNavigate,
  onSelect,
}: {
  onNavigate: (page: MemberPage) => void
  onSelect: (item: ClassItem) => void
}) {
  const [category, setCategory] = useState("Yoga")
  const [selectedDay, setSelectedDay] = useState(23)
  const [shift, setShift] = useState("Sáng (06:00 - 12:00)")
  const [coachQuery, setCoachQuery] = useState("")
  const visibleClasses = useMemo(
    () =>
      classItems.filter((item) =>
        item.coach.toLowerCase().includes(coachQuery.toLowerCase()),
      ),
    [coachQuery],
  )

  return (
    <MemberShell page="classes" onNavigate={onNavigate}>
      <section className="mp-classes-content">
        <div className="mp-classes-heading">
          <div>
            <p>Chọn lịch lớp học phù hợp</p>
            <span>
              Lựa chọn từ các lớp nhóm hoặc đặt chỗ huấn luyện viên chuyên
              nghiệp cho mục tiêu của bạn.
            </span>
          </div>
          <Progress step={1} />
        </div>

        <div className="mp-filters">
          <div className="mp-category-row">
            <div className="mp-tabs">
              {["Tất cả lớp", "Yoga", "HIIT", "Swimming", "CrossFit"].map(
                (item) => (
                  <button
                    className={category === item ? "active" : ""}
                    key={item}
                    onClick={() => setCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <input
              aria-label="Lọc theo huấn luyện viên"
              onChange={(event) => setCoachQuery(event.target.value)}
              placeholder="Lọc theo HLV..."
              value={coachQuery}
            />
          </div>

          <div className="mp-week">
            <strong>LỊCH TRONG TUẦN (THÁNG 09/2026)</strong>
            <div>
              {[
                ["Thứ 2", 21],
                ["Thứ 3", 22],
                ["Thứ 4", 23],
                ["Thứ 5", 24],
                ["Thứ 6", 25],
                ["Thứ 7", 26],
                ["Chủ nhật", 27],
              ].map(([day, date]) => (
                <button
                  className={selectedDay === date ? "active" : ""}
                  key={date}
                  onClick={() => setSelectedDay(Number(date))}
                  type="button"
                >
                  <span>{day}</span>
                  <strong>{date}</strong>
                </button>
              ))}
            </div>
          </div>

          <div className="mp-shifts">
            <strong>KHUNG GIỜ:</strong>
            <div>
              {[
                "Sáng (06:00 - 12:00)",
                "Chiều (12:00 - 17:00)",
                "Tối (17:00 - 21:00)",
              ].map((item) => (
                <button
                  className={shift === item ? "active" : ""}
                  key={item}
                  onClick={() => setShift(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mp-class-grid">
          {visibleClasses.map((item) => (
            <article
              className="mp-class-card"
              key={item.title}
              onClick={() => onSelect(item)}
            >
              <img
                className="mp-class-photo"
                src={asset("classes", item.image)}
                alt=""
              />
              <div className="mp-class-body">
                <div>
                  <strong>{item.title}</strong>
                  <span>HLV: {item.coach}</span>
                </div>
                <div>
                  <p>{item.schedule}</p>
                  <small>{item.room}</small>
                </div>
                <footer>
                  <span>{item.spaces}</span>
                  <button onClick={() => onSelect(item)} type="button">
                    Đặt chỗ
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </section>
    </MemberShell>
  )
}

function Confirm({
  selectedClass,
  onNavigate,
}: {
  selectedClass: ClassItem
  onNavigate: (page: MemberPage) => void
}) {
  return (
    <MemberShell page="confirm" onNavigate={onNavigate}>
      <section className="mp-confirm-content">
        <Progress step={2} />
        <div className="mp-confirm-card">
          <div className="mp-confirm-heading">
            <p>Thông tin xác nhận đăng ký lớp</p>
            <span>
              Vui lòng kiểm tra kỹ lịch học và các điều khoản đặt lớp trước khi
              xác nhận.
            </span>
          </div>

          <div className="mp-selected-class">
            <img src={asset("confirm", "fb4de.png")} alt="" />
            <div>
              <small>LỚP NHÓM • HIIT</small>
              <strong>{selectedClass.title}</strong>
              <span>Coach: {selectedClass.coach}</span>
              <b>
                {selectedClass.title === "Functional HIIT"
                  ? "18:30 Thứ Ba, Ngày 24/09 (Arena 2)"
                  : selectedClass.schedule}
              </b>
            </div>
          </div>

          <div className="mp-member-context">
            <strong>HỘI VIÊN ĐĂNG KÝ</strong>
            <div>
              <span>Họ và tên</span>
              <b>Nguyễn Lan Anh</b>
            </div>
            <div>
              <span>Gói hội viên</span>
              <small>Premium</small>
            </div>
            <div>
              <span>Mã thành viên</span>
              <b>MB-2048</b>
            </div>
          </div>

          <div className="mp-policy">
            <span className="mp-policy-icon">
              <img src={asset("confirm", "a030e.svg")} alt="" />
            </span>
            <div>
              <strong>Lưu ý quy định đặt lớp</strong>
              <span>
                Hủy đăng ký trước giờ bắt đầu ít nhất 2 giờ miễn phí. Đi tập
                trước giờ khởi động 10 phút để nhận thiết bị đo nhịp tim tại
                quầy.
              </span>
            </div>
          </div>

          <div className="mp-confirm-actions">
            <button onClick={() => onNavigate("classes")} type="button">
              Quay lại
            </button>
            <button
              className="confirm"
              onClick={() => onNavigate("success")}
              type="button"
            >
              Xác nhận đặt chỗ
            </button>
          </div>
        </div>
      </section>
    </MemberShell>
  )
}

export default function MemberPortal({
  initialPage = "overview",
}: {
  initialPage?: MemberPage
}) {
  const [page, setPage] = useState<MemberPage>(initialPage)
  const [selectedClass, setSelectedClass] = useState<ClassItem>(classItems[1])

  if (page === "profile") {
    return <MemberProfile onNavigate={setPage} />
  }

  if (["schedule", "success", "workout", "ai"].includes(page)) {
    return (
      <MemberPortalV2
        page={page as NewMemberPage}
        onNavigate={(nextPage) => setPage(nextPage)}
      />
    )
  }

  if (page === "classes") {
    return (
      <Classes
        onNavigate={setPage}
        onSelect={(item) => {
          setSelectedClass(item)
          setPage("confirm")
        }}
      />
    )
  }

  if (page === "confirm") {
    return <Confirm selectedClass={selectedClass} onNavigate={setPage} />
  }

  if (page === "users" || page === "payment" || page === "reports") {
    return <MemberSection page={page} onNavigate={setPage} />
  }

  return <Overview onNavigate={setPage} />
}
