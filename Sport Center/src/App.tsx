import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import SiteApp from "./SiteApp"
import MemberPortal, { MemberPage } from "./MemberPortal"
import CoachPortal from "./CoachPortal"
import AdminDashboard from "./AdminDashboard"
import PaymentFlow from "./PaymentFlow"
import ReceptionistPortal from "./ReceptionistPortal"

const assets = "/assets"

const icons = {
  search: `${assets}/6eb8a.svg`,
  bell: `${assets}/06b01.svg`,
  download: `${assets}/10f65.svg`,
  chevron: `${assets}/45d62.svg`,
  sliders: `${assets}/cdfe4.svg`,
  eye: `${assets}/08ba8.svg`,
  edit: `${assets}/acfee.svg`,
  more: `${assets}/5e479.svg`,
}

type Member = {
  name: string
  id: string
  avatar: string
  packageName: string
  phone: string
  email: string
  status: "Đang hoạt động" | "Sắp hết hạn" | "Tạm khóa"
  expiry: string
  vip?: boolean
}

const initialMembers: Member[] = [
  {
    name: "Nguyễn Lan Anh",
    id: "MB-2048",
    avatar: `${assets}/50eeb.png`,
    packageName: "Premium 12 tháng",
    phone: "0903 456 789",
    email: "lananh@email.com",
    status: "Đang hoạt động",
    expiry: "18/12/2026",
    vip: true,
  },
  {
    name: "Trần Minh Khoa",
    id: "MB-2017",
    avatar: `${assets}/c814c.png`,
    packageName: "Fitness 6 tháng",
    phone: "0918 224 560",
    email: "khoa.tran@email.com",
    status: "Đang hoạt động",
    expiry: "02/10/2026",
  },
  {
    name: "Lê Gia Hân",
    id: "MB-1984",
    avatar: `${assets}/c880b.png`,
    packageName: "Swim 3 tháng",
    phone: "0987 322 104",
    email: "giahan.le@email.com",
    status: "Sắp hết hạn",
    expiry: "25/09/2026",
  },
  {
    name: "Phạm Đức Long",
    id: "MB-1902",
    avatar: `${assets}/98afc.png`,
    packageName: "Premium 12 tháng",
    phone: "0908 914 777",
    email: "long.pham@email.com",
    status: "Tạm khóa",
    expiry: "08/05/2027",
  },
  {
    name: "Vũ Thu Trang",
    id: "MB-1870",
    avatar: `${assets}/88820.png`,
    packageName: "Yoga 6 tháng",
    phone: "0932 662 198",
    email: "thutrang.vu@email.com",
    status: "Đang hoạt động",
    expiry: "14/01/2027",
  },
]

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">SC</span>
      <span className="brand-name">SPORTCENTER OS</span>
    </div>
  )
}

function AuthVisual({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <section className="login-visual">
      <img className="login-photo" src={`${assets}/33567.png`} alt="" />
      <div className="login-overlay" />
      <Brand />
      <div className="login-message">
        <span className="eyebrow-orange">VẬN HÀNH ĐA BỘ MÔN</span>
        <p className={emphasized ? "login-slogan emphasized" : "login-slogan"}>
          Năng lượng cho mọi chuyển động.
        </p>
        <p className="login-description">
          Một hệ thống thống nhất cho thành viên, lớp học, thanh toán và huấn
          luyện thông minh.
        </p>
      </div>
      <p className="copyright">
        © 2026 Sports Center • Bảo mật dữ liệu vận hành
      </p>
    </section>
  )
}

function Registration({
  onRegistered,
  onLogin,
  onHome,
}: {
  onRegistered: () => void
  onLogin: () => void
  onHome?: () => void
}) {
  function submit(event: FormEvent) {
    event.preventDefault()
    onRegistered()
  }

  return (
    <main className="login-page">
      <AuthVisual emphasized />

      <section className="register-panel">
        <form className="register-form" onSubmit={submit}>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="back-home-btn"
            >
              ← Quay về trang chủ
            </button>
          )}
          <div className="register-heading">
            <span className="eyebrow-blue">TẠO TÀI KHOẢN MỚI</span>
            <p className="register-title">Đăng ký tài khoản</p>
            <p className="register-copy">
              Điền thông tin để tạo tài khoản SportCenter của bạn
            </p>
          </div>

          <div className="register-fields">
            <label className="field register-field">
              <span>Họ và tên</span>
              <input
                autoComplete="name"
                name="name"
                placeholder="Nguyễn Văn A"
                required
              />
            </label>
            <label className="field register-field">
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                placeholder="nguyenvana@sportscenter.vn"
                required
                type="email"
              />
            </label>
            <label className="field register-field">
              <span>Số điện thoại</span>
              <input
                autoComplete="tel"
                inputMode="tel"
                name="phone"
                placeholder="0901 234 567"
                required
                type="tel"
              />
            </label>
            <label className="field register-field">
              <span>Mật khẩu</span>
              <input
                autoComplete="new-password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
              />
            </label>
            <label className="field register-field">
              <span>Xác nhận mật khẩu</span>
              <input
                autoComplete="new-password"
                name="passwordConfirmation"
                placeholder="••••••••"
                required
                type="password"
              />
            </label>
          </div>

          <div className="register-actions">
            <button className="primary-button login-button" type="submit">
              Đăng ký tài khoản →
            </button>
            <div className="login-switch">
              <span>Đã có tài khoản?</span>
              <button type="button" onClick={onLogin}>
                Đăng nhập
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

type DemoRole = "admin" | "member" | "coach" | "receptionist"

const demoAccounts: {
  email: string
  password: string
  role: DemoRole
  label: string
  name: string
}[] = [
  {
    email: "manager@sportscenter.vn",
    password: "sportscenter",
    role: "admin",
    label: "Quản trị viên",
    name: "Trần Minh Quân",
  },
  {
    email: "lananh@email.com",
    password: "member123",
    role: "member",
    label: "Hội viên",
    name: "Nguyễn Lan Anh",
  },
  {
    email: "coach@sportscenter.vn",
    password: "coach123",
    role: "coach",
    label: "Huấn luyện viên",
    name: "Lê Văn Hùng",
  },
  {
    email: "letan@sportscenter.vn",
    password: "letan123",
    role: "receptionist",
    label: "Lễ tân",
    name: "Ngọc Mai",
  },
]

function Login({
  onLogin,
  onLoginAs,
  onRegister,
  onForgotPassword,
  onHome,
}: {
  onLogin: () => void
  onLoginAs?: (role: DemoRole) => void
  onRegister: () => void
  onForgotPassword: () => void
  onHome?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("manager@sportscenter.vn")
  const [password, setPassword] = useState("sportscenter")
  const [error, setError] = useState("")

  function fillDemo(account: (typeof demoAccounts)[0]) {
    setEmail(account.email)
    setPassword(account.password)
    setError("")
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const matched = demoAccounts.find(
      (a) => a.email === email.trim() && a.password === password,
    )
    if (!matched) {
      setError("Email hoặc mật khẩu không đúng. Hãy dùng tài khoản demo bên dưới.")
      return
    }
    setLoading(true)
    window.setTimeout(() => {
      if (onLoginAs) onLoginAs(matched.role)
      else onLogin()
    }, 450)
  }

  return (
    <main className="login-page">
      <AuthVisual />

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="back-home-btn"
            >
              ← Quay về trang chủ
            </button>
          )}
          <div className="login-heading">
            <span className="eyebrow-blue">CHÀO MỪNG TRỞ LẠI</span>
            <p className="login-title">Đăng nhập hệ thống</p>
            <p className="login-copy">
              Nhập thông tin tài khoản để truy cập hệ thống.
            </p>
          </div>

          <div className="demo-accounts">
            <p className="demo-accounts-label">Tài khoản demo</p>
            <div className="demo-accounts-list">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  className="demo-account-chip"
                  onClick={() => fillDemo(account)}
                >
                  <span className="demo-chip-role">{account.label}</span>
                  <span className="demo-chip-name">{account.name}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Email hoặc mã nhân viên</span>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError("") }}
              type="text"
              required
            />
          </label>
          <label className="field">
            <span>Mật khẩu</span>
            <input
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError("") }}
              type="password"
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <div className="forgot-password-row">
            <button type="button" onClick={onForgotPassword}>
              Quên mật khẩu?
            </button>
          </div>
          <button
            className="primary-button login-button"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập an toàn →"}
          </button>
          <div className="login-switch">
            <span>Chưa có tài khoản?</span>
            <button type="button" onClick={onRegister}>
              Đăng ký ngay
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

function ForgotPassword({
  onSubmit,
  onLogin,
}: {
  onSubmit: () => void
  onLogin: () => void
}) {
  const [loading, setLoading] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(onSubmit, 450)
  }

  return (
    <main className="login-page">
      <AuthVisual emphasized />

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <button
            type="button"
            onClick={onLogin}
            className="back-home-btn"
          >
            ← Quay lại đăng nhập
          </button>
          <div className="login-heading">
            <span className="eyebrow-blue">KHÔI PHỤC MẬT KHẨU</span>
            <p className="login-title">Quên mật khẩu?</p>
            <p className="login-copy">
              Nhập email đã đăng ký. Chúng tôi sẽ gửi mã xác minh để đặt lại mật khẩu.
            </p>
          </div>
          <label className="field">
            <span>Địa chỉ email</span>
            <input
              placeholder="email@sportscenter.vn"
              type="email"
              required
              autoComplete="email"
            />
          </label>
          <button
            className="primary-button login-button"
            disabled={loading}
            type="submit"
          >
            {loading ? "Đang gửi mã..." : "Gửi mã xác minh →"}
          </button>
          <div className="login-switch">
            <span>Đã nhớ mật khẩu?</span>
            <button type="button" onClick={onLogin}>
              Đăng nhập
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

function Verification({ onVerified }: { onVerified: () => void }) {
  const [digits, setDigits] = useState(["4", "8", "2", "", "", ""])
  const [seconds, setSeconds] = useState(299)
  const [error, setError] = useState("")
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const timer = window.setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    inputs.current[3]?.focus()
  }, [])

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigits((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? digit : item)),
    )
    setError("")
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function verify(event: FormEvent) {
    event.preventDefault()
    if (digits.some((digit) => !digit)) {
      setError("Vui lòng nhập đủ 6 chữ số.")
      return
    }
    onVerified()
  }

  function resend() {
    setDigits(["", "", "", "", "", ""])
    setSeconds(299)
    setError("")
    inputs.current[0]?.focus()
  }

  const countdown = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <main className="login-page">
      <AuthVisual emphasized />
      <section className="verify-panel">
        <form className="verify-content" onSubmit={verify}>
          <div className="verify-heading">
            <span className="eyebrow-blue">XÁC MINH TÀI KHOẢN</span>
            <p className="verify-title">Xác minh qua Email</p>
            <p className="verify-copy">
              Chúng tôi đã gửi mã xác minh gồm 6 chữ số đến email của bạn. Vui
              lòng nhập mã bên dưới để kích hoạt tài khoản.
            </p>
          </div>

          <div className="email-display">
            <img src={`${assets}/cacaa.svg`} alt="" />
            <span>nguyenvana@sportscenter.vn</span>
            <small>ĐÃ GỬI</small>
          </div>

          <div className="otp-block">
            <div className="otp-inputs">
              {digits.map((digit, index) => (
                <input
                  aria-label={`Chữ số xác minh ${index + 1}`}
                  className={
                    digit || index === 3 ? "otp-input active" : "otp-input"
                  }
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKey(index, event)}
                  placeholder="-"
                  ref={(element) => {
                    inputs.current[index] = element
                  }}
                  value={digit}
                />
              ))}
            </div>
            <div className="countdown">
              <img src={`${assets}/40e6a.svg`} alt="" />
              <span>
                Mã xác minh có hiệu lực trong <strong>{countdown}</strong>
              </span>
            </div>
            {error && <p className="otp-error">{error}</p>}
          </div>

          <div className="verify-actions">
            <button className="primary-button login-button" type="submit">
              Xác minh tài khoản →
            </button>
            <div className="resend-copy">
              <span>Không nhận được mã?</span>
              <button type="button" onClick={resend}>
                Gửi lại mã
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

function IconButton({
  icon,
  label,
  className = "",
}: {
  icon: string
  label: string
  className?: string
}) {
  return (
    <button
      className={`icon-button ${className}`}
      aria-label={label}
      type="button"
    >
      <img src={icon} alt="" />
    </button>
  )
}

function Status({ value }: { value: Member["status"] }) {
  return (
    <span
      className={`status status-${value.replaceAll(" ", "-").toLowerCase()}`}
    >
      {value}
    </span>
  )
}

function AddMemberModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Thêm hội viên mới"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="modal-title">Thêm hội viên mới</p>
            <p className="modal-copy">Tạo hồ sơ hội viên trong hệ thống.</p>
          </div>
          <button
            className="close-button"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
          >
            ×
          </button>
        </div>
        <div className="modal-grid">
          <label className="field">
            <span>Họ và tên</span>
            <input placeholder="Nhập họ tên hội viên" />
          </label>
          <label className="field">
            <span>Số điện thoại</span>
            <input placeholder="Nhập số điện thoại" />
          </label>
          <label className="field modal-wide">
            <span>Email</span>
            <input placeholder="email@example.com" type="email" />
          </label>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="primary-button" type="button" onClick={onClose}>
            Thêm hội viên
          </button>
        </div>
      </section>
    </div>
  )
}

function AdminProfile({ onBack }: { onBack: () => void }) {
  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="breadcrumb">Quản lý / Hồ sơ cá nhân</p>
          <p className="topbar-title">Hồ sơ quản trị viên</p>
        </div>
        <div className="top-actions">
          <label className="global-search">
            <img src={icons.search} alt="" />
            <input placeholder="Tìm nhanh hội viên, lớp..." />
          </label>
          <IconButton icon={icons.bell} label="Thông báo" />
          <button
            className="avatar-button"
            type="button"
            onClick={onBack}
            title="Quay lại"
          >
            <img src={`${assets}/f6154.png`} alt="Tài khoản quản lý" />
          </button>
        </div>
      </header>

      <section className="content">
        <div className="admin-profile-page">
          <div className="admin-profile-hero">
            <div className="admin-profile-avatar-wrap">
              <img
                src={`${assets}/f6154.png`}
                alt="Ảnh đại diện"
                className="admin-profile-avatar"
              />
              <button className="admin-profile-avatar-edit" type="button" aria-label="Đổi ảnh">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L4.933 13.733l-3.6.8.8-3.6L11.333 2Z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="admin-profile-hero-info">
              <h2 className="admin-profile-name">Trần Minh Quân</h2>
              <span className="admin-profile-badge">Quản trị viên</span>
              <p className="admin-profile-id">ID: ADM-2023-00001</p>
            </div>
          </div>

          <div className="admin-profile-sections">
            <div className="admin-profile-card">
              <div className="admin-profile-card-header">
                <h3>Thông tin cá nhân</h3>
                <button type="button" className="admin-profile-edit-btn">Chỉnh sửa</button>
              </div>
              <div className="admin-profile-fields">
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Họ và tên</span>
                  <span className="admin-profile-value">Trần Minh Quân</span>
                </div>
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Email</span>
                  <span className="admin-profile-value">minhquan@sportscenter.vn</span>
                </div>
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Số điện thoại</span>
                  <span className="admin-profile-value">0901 234 567</span>
                </div>
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Mã nhân viên</span>
                  <span className="admin-profile-value">EMP-00001</span>
                </div>
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Vai trò</span>
                  <span className="admin-profile-value">Quản trị viên hệ thống</span>
                </div>
                <div className="admin-profile-field">
                  <span className="admin-profile-label">Ngày vào làm</span>
                  <span className="admin-profile-value">01/01/2023</span>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-profile-actions">
            <button type="button" className="admin-profile-action-btn admin-profile-action-primary">
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="admin-profile-action-btn admin-profile-action-secondary"
              onClick={onBack}
            >
              Quay lại dashboard
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("Thành viên")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("Tất cả")
  const [selected, setSelected] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  if (showProfile) {
    return <AdminProfile onBack={() => setShowProfile(false)} />
  }

  const members = useMemo(
    () =>
      initialMembers.filter((member) => {
        const matchesQuery = `${member.name} ${member.id} ${member.phone}`
          .toLowerCase()
          .includes(query.toLowerCase())
        const matchesStatus = status === "Tất cả" || member.status === status
        return matchesQuery && matchesStatus
      }),
    [query, status],
  )

  function toggleMember(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="breadcrumb">Quản lý / Người dùng / Hội viên</p>
          <p className="topbar-title">Quản lý người dùng</p>
        </div>
        <div className="top-actions">
          <label className="global-search">
            <img src={icons.search} alt="" />
            <input placeholder="Tìm nhanh hội viên, lớp..." />
          </label>
          <IconButton icon={icons.bell} label="Thông báo" />
          <button
            className="avatar-button"
            type="button"
            onClick={() => setShowProfile(true)}
            title="Hồ sơ cá nhân"
          >
            <img src={`${assets}/f6154.png`} alt="Tài khoản quản lý" />
          </button>
        </div>
      </header>

      <section className="content">
        <div className="content-header">
          <div>
            <p className="page-title">Quản lý người dùng</p>
            <p className="page-subtitle">
              2.486 hồ sơ đang được quản lý tập trung trên toàn hệ thống.
            </p>
          </div>
          <div className="header-actions">
            <button className="secondary-button" type="button">
              <img src={icons.download} alt="" />
              Xuất dữ liệu Excel
            </button>
            <button
              className="primary-button"
              type="button"
              onClick={() => setShowModal(true)}
            >
              + Thêm hội viên mới
            </button>
          </div>
        </div>

        <nav className="tabs" aria-label="Nhóm người dùng">
          {[
            ["Thành viên", "2.214"],
            ["Huấn luyện viên", "48"],
            ["Nhân viên", "224"],
          ].map(([tab, count]) => (
            <button
              className={activeTab === tab ? "tab active" : "tab"}
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab} ({count})
            </button>
          ))}
        </nav>

        <div className="filters">
          <label className="filter-search">
            <img src={icons.search} alt="" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên, mã hội viên, số điện thoại..."
            />
          </label>
          <label className="select-control">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Tất cả">Trạng thái: Tất cả</option>
              <option value="Đang hoạt động">Đang hoạt động</option>
              <option value="Sắp hết hạn">Sắp hết hạn</option>
              <option value="Tạm khóa">Tạm khóa</option>
            </select>
            <img src={icons.chevron} alt="" />
          </label>
          <label className="select-control">
            <select defaultValue="all">
              <option value="all">Gói tập: Tất cả</option>
              <option>Premium 12 tháng</option>
              <option>Fitness 6 tháng</option>
              <option>Swim 3 tháng</option>
            </select>
            <img src={icons.chevron} alt="" />
          </label>
          <IconButton
            icon={icons.sliders}
            label="Bộ lọc nâng cao"
            className="filter-button"
          />
          <span className="selected-count">Đã chọn {selected.length} mục</span>
        </div>

        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input type="checkbox" aria-label="Chọn tất cả" />
                  </th>
                  <th>HỘI VIÊN</th>
                  <th>GÓI HIỆN TẠI</th>
                  <th>LIÊN HỆ</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY HẾT HẠN</th>
                  <th className="actions-cell">THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selected.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        aria-label={`Chọn ${member.name}`}
                      />
                    </td>
                    <td>
                      <div className="member-cell">
                        <img src={member.avatar} alt="" />
                        <div>
                          <strong>{member.name}</strong>
                          <span>{member.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="package-cell">
                        <span>{member.packageName}</span>
                        {member.vip && <small>VIP</small>}
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span>{member.phone}</span>
                        <small>{member.email}</small>
                      </div>
                    </td>
                    <td>
                      <Status value={member.status} />
                    </td>
                    <td>{member.expiry}</td>
                    <td>
                      <div className="row-actions">
                        {member.status === "Sắp hết hạn" ? (
                          <button className="renew-button" type="button">
                            Gia hạn
                          </button>
                        ) : (
                          <>
                            <IconButton icon={icons.eye} label="Xem chi tiết" />
                            <IconButton icon={icons.edit} label="Chỉnh sửa" />
                          </>
                        )}
                        <IconButton icon={icons.more} label="Thêm tùy chọn" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && (
              <p className="empty-state">Không tìm thấy hội viên phù hợp.</p>
            )}
          </div>
          <div className="table-footer">
            <span>
              Hiển thị 1-{members.length} trong tổng số 2.214 hội viên
            </span>
            <div className="pagination">
              <button type="button">10 dòng/trang⌄</button>
              <button type="button">‹ Trước</button>
              <button className="current-page" type="button">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">222</button>
              <button type="button">Sau ›</button>
            </div>
          </div>
        </div>
      </section>
      {showModal && <AddMemberModal onClose={() => setShowModal(false)} />}
    </main>
  )
}

function AdminPortal({
  onExit,
  initialStep = "register",
  initialMemberPage = "overview",
}: {
  onExit: () => void
  initialStep?: "register" | "login" | "verify" | "member"
  initialMemberPage?: MemberPage
}) {
  const [step, setStep] = useState<
    "register" | "login" | "verify" | "forgotPassword" | "member" | "dashboard"
  >(initialStep)
  const [verifyTarget, setVerifyTarget] = useState<"member" | "login">("member")

  if (step === "member") {
    return <MemberPortal initialPage={initialMemberPage} />
  }

  if (step === "dashboard") {
    return <AdminDashboard onLogout={onExit} />
  }

  if (step === "register") {
    return (
      <Registration
        onLogin={() => setStep("login")}
        onRegistered={() => {
          setVerifyTarget("member")
          setStep("verify")
        }}
        onHome={onExit}
      />
    )
  }

  if (step === "forgotPassword") {
    return (
      <ForgotPassword
        onLogin={() => setStep("login")}
        onSubmit={() => {
          setVerifyTarget("login")
          setStep("verify")
        }}
      />
    )
  }

  if (step === "verify") {
    return (
      <Verification onVerified={() => setStep(verifyTarget)} />
    )
  }

  return (
    <Login
      onLogin={() => setStep("member")}
      onLoginAs={(role) => {
        if (role === "admin") setStep("dashboard")
        else if (role === "coach") {
          window.location.hash = "coach"
        } else if (role === "receptionist") {
          window.location.hash = "receptionist"
        } else setStep("member")
      }}
      onRegister={() => setStep("register")}
      onForgotPassword={() => setStep("forgotPassword")}
      onHome={onExit}
    />
  )
}

const coachHashes = new Set([
  "#coach",
  "#coach-schedule",
  "#coach-curriculum",
  "#coach-assessment",
  "#coach-profile",
  "#coach-ai",
])

const adminHashes = new Set([
  "#admin",
  "#register",
  "#member",
  "#classes",
  "#booking-confirm",
  "#schedule",
  "#booking-success",
  "#workout-detail",
  "#move-ai",
])

const paymentHashes = new Set(["#payment"])
const receptionistHashes = new Set(["#receptionist"])

function isAdminHash(hash: string) {
  return adminHashes.has(hash)
}

function isCoachHash(hash: string) {
  return coachHashes.has(hash)
}

export default function App() {
  const [adminOpen, setAdminOpen] = useState(
    () => isAdminHash(window.location.hash),
  )
  const [coachOpen, setCoachOpen] = useState(
    () => isCoachHash(window.location.hash),
  )
  const [paymentOpen, setPaymentOpen] = useState(
    () => paymentHashes.has(window.location.hash),
  )
  const [receptionistOpen, setReceptionistOpen] = useState(
    () => receptionistHashes.has(window.location.hash),
  )

  useEffect(() => {
    const sync = () => {
      setAdminOpen(isAdminHash(window.location.hash))
      setCoachOpen(isCoachHash(window.location.hash))
      setPaymentOpen(paymentHashes.has(window.location.hash))
      setReceptionistOpen(receptionistHashes.has(window.location.hash))
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  if (receptionistOpen) {
    return (
      <ReceptionistPortal
        onExit={() => {
          window.location.hash = "home"
          setReceptionistOpen(false)
        }}
      />
    )
  }

  if (paymentOpen) {
    return (
      <PaymentFlow
        onExit={() => {
          window.location.hash = "home"
          setPaymentOpen(false)
        }}
      />
    )
  }

  if (coachOpen) {
    return <CoachPortal />
  }

  if (adminOpen) {
    return (
      <AdminPortal
        initialStep={
          window.location.hash === "#admin"
            ? "login"
            : [
                  "#member",
                  "#classes",
                  "#booking-confirm",
                  "#schedule",
                  "#booking-success",
                  "#workout-detail",
                  "#move-ai",
                ].includes(
                  window.location.hash,
                )
              ? "member"
              : "register"
        }
        initialMemberPage={
          window.location.hash === "#classes"
            ? "classes"
            : window.location.hash === "#booking-confirm"
              ? "confirm"
              : window.location.hash === "#schedule"
                ? "schedule"
                : window.location.hash === "#booking-success"
                  ? "success"
                  : window.location.hash === "#workout-detail"
                    ? "workout"
                    : window.location.hash === "#move-ai"
                      ? "ai"
              : "overview"
        }
        onExit={() => {
          window.location.hash = "home"
          setAdminOpen(false)
        }}
      />
    )
  }

  return (
    <SiteApp
      onOpenAdmin={() => {
        window.location.hash = "admin"
        setAdminOpen(true)
      }}
      onOpenRegister={() => {
        window.location.hash = "register"
        setAdminOpen(true)
      }}
      onOpenPayment={() => {
        window.location.hash = "payment"
        setPaymentOpen(true)
      }}
    />
  )
}
