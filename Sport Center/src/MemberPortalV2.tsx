import { FormEvent, useState } from "react"

export type NewMemberPage = "schedule" | "success" | "workout" | "ai"

type Navigate = (
  page:
    | NewMemberPage
    | "classes"
    | "overview"
    | "users"
    | "payment"
    | "reports",
) => void

const roots: Record<NewMemberPage, string> = {
  schedule: "/assets/member-schedule",
  success: "/assets/member-success",
  workout: "/assets/member-workout",
  ai: "/assets/member-ai",
}

const pageAssets = {
  schedule: {
    avatar: "33848.png",
    account: "2a759.png",
    nav: ["a6906.svg", "c502a.svg", "c502a.svg", "2e78e.svg", "2b3e0.svg", "01d29.svg", "f1047.svg"],
    search: "ce4a8.svg",
    bell: "a9acc.svg",
  },
  success: {
    avatar: "0507f.png",
    account: "6fd1f.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "c37d3.svg", "3ecbb.svg", "4b8d6.svg", "e7464.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
  workout: {
    avatar: "13619.png",
    account: "0733d.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "c37d3.svg", "3ecbb.svg", "4b8d6.svg", "e7464.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
  ai: {
    avatar: "29d1d.png",
    account: "fdb14.png",
    nav: ["198ea.svg", "a6ac8.svg", "a6ac8.svg", "b486a.svg", "3ecbb.svg", "4b8d6.svg", "987d8.svg"],
    search: "c7e83.svg",
    bell: "a3af3.svg",
  },
}

function src(page: NewMemberPage, file: string) {
  return `${roots[page]}/${file}`
}

function Shell({
  page,
  onNavigate,
  children,
}: {
  page: NewMemberPage
  onNavigate: Navigate
  children: React.ReactNode
}) {
  const assets = pageAssets[page]
  const active = page === "ai" ? 6 : page === "workout" ? 5 : 3
  const nav = ["Tổng quan", "Hồ sơ cá nhân", "Người dùng", "Lớp & lịch", "Thanh toán", "Báo cáo", "AI & đào tạo"]
  const titles = {
    schedule: ["Member Portal / Lớp & Lịch", "Lịch cá nhân của Member"],
    success: ["Member Portal / Lớp & Lịch / Đăng ký", "Đặt chỗ lớp học"],
    workout: ["Member Portal / Lịch sử / Chi tiết", "Chi tiết buổi tập & Kết quả"],
    ai: ["Member Portal / Trợ lý AI", "Move AI - Trợ lý thông minh"],
  }

  return (
    <main className={`m2-shell m2-${page}`}>
      <aside className="m2-sidebar">
        <div className="m2-brand">
          <span>SC</span>
          <div>
            <strong>SPORTCENTER</strong>
            <small>{page === "schedule" ? "MEMBER" : "MEMBER PORTAL"}</small>
          </div>
        </div>
        <nav className="m2-nav" aria-label="Điều hướng hội viên">
          {nav.map((label, index) => (
            <button
              className={active === index ? "active" : ""}
              key={label}
              onClick={() => {
                const destinations = [
                  "overview",
                  "profile",
                  "users",
                  "schedule",
                  "payment",
                  "reports",
                  "ai",
                ] as const
                onNavigate(destinations[index] as any)
              }}
              type="button"
            >
              <img src={src(page, assets.nav[index])} alt="" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="m2-support">
          <strong>Cần hỗ trợ?</strong>
          <span>
            {page === "schedule"
              ? "Trung tâm vận hành 06:00–22:00 hằng ngày"
              : "Tổng đài hỗ trợ hội viên hoạt động từ 06:00 – 22:00 hằng ngày. Hotline: 1900 6868"}
          </span>
        </div>
        <div className="m2-sidebar-spacer" />
        <div className="m2-account cursor-pointer hover:bg-white/5 p-3 -m-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => onNavigate("profile" as any)}>
          <img src={src(page, assets.avatar)} alt="" className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 flex flex-col justify-center">
            <strong className="block truncate text-sm text-white">Minh Anh</strong>
            <small className="block truncate text-xs text-white/50">Hội viên Premium</small>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-slate-800/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; }}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Trang chủ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </button>
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; window.location.reload(); }}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>
      <div className="m2-workspace">
        <header className="m2-topbar">
          <div>
            <span>{titles[page][0]}</span>
            <strong>{titles[page][1]}</strong>
          </div>
          <div className="m2-tools">
            <label>
              <img src={src(page, assets.search)} alt="" />
              <input
                aria-label="Tìm kiếm"
                placeholder={page === "schedule" ? "Tìm nhanh..." : "Tìm kiếm bài tập, lịch..."}
              />
            </label>
            <button aria-label="Thông báo" type="button">
              <img src={src(page, assets.bell)} alt="" />
            </button>
            <button aria-label="Tài khoản" type="button">
              <img src={src(page, assets.account)} alt="" />
            </button>
          </div>
        </header>
        {children}
      </div>
    </main>
  )
}

const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]
const calendarEvents = [
  { row: 1, column: 3, tone: "blue", title: "Yoga Flow", detail: "Mai Phương", meta: "Studio 1" },
  { row: 2, column: 6, tone: "green", title: "Tự tập tự do", detail: "Không có PT", meta: "Khu Gym" },
  { row: 3, column: 1, tone: "green", title: "Cardio tự do", detail: "Tập máy chạy" },
  { row: 3, column: 2, tone: "blue", title: "Functional HIIT", detail: "Trần Khoa" },
  { row: 3, column: 5, tone: "orange", title: "PT cá nhân", detail: "Trần Khoa" },
]

function Schedule({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Shell page="schedule" onNavigate={onNavigate}>
      <section className="m2-schedule-content">
        <div className="m2-calendar-card">
          <div className="m2-calendar-title">
            <div><strong>Tuần học hiện tại</strong><span>21 Th9 - 27 Th9, 2026</span></div>
            <div className="m2-legend">
              <span><i className="blue" />Lớp nhóm</span>
              <span><i className="orange" />HLV Cá nhân (PT)</span>
              <span><i className="green" />Tự tập luyện</span>
            </div>
          </div>
          <div className="m2-calendar">
            <div className="m2-calendar-days"><span />{days.map((day) => <strong key={day}>{day}</strong>)}</div>
            {["08:00", "10:00", "17:30"].map((time, row) => (
              <div className="m2-calendar-row" key={time}>
                <span>{time}</span>
                {days.map((day) => <div key={day} />)}
                {calendarEvents.filter((event) => event.row === row + 1).map((event) => (
                  <button
                    className={`m2-calendar-event ${event.tone} column-${event.column}`}
                    key={event.title}
                    onClick={() => event.title === "Functional HIIT" && onNavigate("workout")}
                    type="button"
                  >
                    <strong>{event.title}</strong><span>{event.detail}</span>{event.meta && <small>{event.meta}</small>}
                  </button>
                ))}
              </div>
            ))}
            <div className="m2-calendar-blank" />
          </div>
        </div>
        <aside className="m2-schedule-aside">
          <button className="m2-book-button" onClick={() => onNavigate("classes")} type="button">+ Đặt lớp mới</button>
          <div className="m2-side-card">
            <strong>BUỔI TẬP TIẾP THEO</strong>
            <div className="m2-next-class">
              <span><small>THỨ 4</small><b>23</b></span>
              <div><strong>Yoga Flow</strong><small>08:00 • Coach Mai Phương</small></div>
            </div>
          </div>
          <div className="m2-side-card">
            <strong>TIẾN TRÌNH THÁNG 9</strong>
            <dl>
              <div><dt>Số buổi tập</dt><dd>12 buổi</dd></div>
              <div><dt>Tiêu thụ calo</dt><dd className="orange">8,400 kcal</dd></div>
              <div><dt>Chuỗi kỷ lục</dt><dd className="green">🔥 5 ngày</dd></div>
            </dl>
          </div>
        </aside>
      </section>
    </Shell>
  )
}

function Success({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Shell page="success" onNavigate={onNavigate}>
      <section className="m2-success-content">
        <div className="m2-success-box">
          <span className="m2-success-icon"><img src={src("success", "3cd18.svg")} alt="" /></span>
          <div className="m2-success-copy">
            <strong>Đặt chỗ thành công!</strong>
            <span>Mã số đặt chỗ của bạn đã được ghi nhận trên hệ thống SportCenter.</span>
          </div>
          <div className="m2-ticket">
            <div className="m2-ticket-head"><span>Functional HIIT</span><strong>Mã: BK-20241</strong></div>
            <img className="m2-ticket-line" src={src("success", "88b99.svg")} alt="" />
            <div className="m2-ticket-grid">
              <div><small>HUẤN LUYỆN VIÊN</small><strong>Coach Trần Khoa</strong></div>
              <div><small>KHU VỰC</small><strong>Arena 2 (Khu A)</strong></div>
              <div><small>THỜI GIAN</small><strong>Thứ Ba, 24/09/2024</strong></div>
              <div><small>KHUNG GIỜ</small><strong>18:30 - 19:30</strong></div>
            </div>
            <img className="m2-ticket-line" src={src("success", "88b99.svg")} alt="" />
            <div className="m2-ticket-note">
              <img src={src("success", "e7a6b.svg")} alt="" />
              <span>Lưu ý: Quý khách có thể <strong>Hủy miễn phí trước 16:30</strong> cùng ngày.</span>
            </div>
          </div>
          <div className="m2-success-actions">
            <button onClick={() => onNavigate("schedule")} type="button">Xem lịch tập</button>
            <button onClick={() => onNavigate("classes")} type="button">Đặt thêm lớp</button>
            <button onClick={() => onNavigate("overview")} type="button">Về trang chủ</button>
          </div>
        </div>
      </section>
    </Shell>
  )
}

const exercises = [
  ["1. Burpees", "Cardio / Sức mạnh", "3 hiệp x 12 lần"],
  ["2. Box Jumps", "Phát lực chân", "3 hiệp x 10 lần"],
  ["3. Kettlebell Swings", "Chuỗi liên kết sau", "4 hiệp x 15 lần (16kg)"],
  ["4. Medicine Ball Slams", "Phát lực toàn thân", "3 hiệp x 15 lần (8kg)"],
  ["5. Push Ups to Jack", "Ngực & Lõi", "3 hiệp x 12 lần"],
  ["6. Dumbbell Thrusters", "Phát lực hỗn hợp", "4 hiệp x 10 lần (10kg/bên)"],
  ["7. Plank Shoulder Taps", "Ổn định lõi", "3 hiệp x 45 giây"],
  ["8. Assault Bike Sprint", "Yếm khí hoàn toàn", "4 hiệp x 30 giây tối đa"],
]

function HeartChart() {
  const lineAssets = ["12db3.svg", "ef6f5.svg", "b6f50.svg", "1ea4e.svg", "978ed.svg", "a459e.svg", "591bd.svg", "ae3ba.svg", "0339e.svg"]
  return (
    <div className="m2-chart">
      <div className="m2-chart-scale"><span>180</span><span>140</span><span>100</span></div>
      <div className="m2-chart-plot">
        <div className="m2-chart-gridline top" /><div className="m2-chart-gridline middle" /><div className="m2-chart-gridline bottom" />
        <div className="m2-chart-line">
          {lineAssets.map((file) => <img key={file} src={src("workout", file)} alt="" />)}
        </div>
      </div>
      <div className="m2-chart-zones"><span>Vùng kịch trần</span><span>HIIT đốt mỡ</span><span>Khởi động nhẹ</span></div>
    </div>
  )
}

function Workout({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Shell page="workout" onNavigate={onNavigate}>
      <section className="m2-workout-content">
        <div className="m2-workout-hero">
          <div><span>Đã hoàn thành • Hôm nay</span><strong>Functional HIIT - Đốt mỡ tối đa</strong><small>Thời gian thực hiện: 18:30 - 19:25 | Huấn luyện viên: Coach Trần Khoa</small></div>
          <button type="button">Chia sẻ kết quả</button>
        </div>
        <div className="m2-workout-grid">
          <div className="m2-workout-left">
            <div className="m2-metrics">
              <div><span>Năng lượng tiêu hao</span><strong>450 kcal</strong><small>Mục tiêu: 400 kcal</small></div>
              <div><span>Thời lượng thực tế</span><strong>55 phút</strong><small>Khởi động & giãn cơ: 10'</small></div>
              <div><span>Nhịp tim trung bình</span><strong>142 bpm</strong><small>Cao nhất: 172 bpm</small></div>
              <div><span>Cường độ nỗ lực</span><strong>8.5 / 10</strong><small>Thang đo RPE tự đánh giá</small></div>
            </div>
            <div className="m2-chart-card">
              <div><strong>Biểu đồ nhịp tim liên tục (bpm)</strong><span>Vùng HIIT tối ưu (85% HR max)</span></div>
              <HeartChart />
            </div>
            <div className="m2-coach-review">
              <div><img src={src("workout", "d88df.png")} alt="" /><span><strong>Đánh giá từ Coach Trần Khoa</strong><small>PT riêng • Huấn luyện viên trưởng</small></span></div>
              <p>"Hôm nay Minh Anh tập trung rất tốt, hoàn thành đầy đủ các chuỗi HIIT cường độ cao. <strong>Lưu ý cải thiện form Squat ở hiệp cuối</strong> để bảo vệ khớp gối tốt hơn nhé. Hãy tập trung đẩy mông ra sau nhiều hơn."</p>
            </div>
          </div>
          <aside className="m2-exercises">
            <strong>Giáo án bài tập đã thực hiện</strong>
            <div>
              {exercises.map(([title, note, result]) => (
                <article key={title}><span><strong>{title}</strong><small>{note}</small></span><b>{result}</b></article>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </Shell>
  )
}

const plan = [
  ["Thứ Hai (Day 1)", "HIIT Đốt Mỡ + Circuit Training", "45 phút", "400-450 kcal"],
  ["Thứ Tư (Day 2)", "Core Stabilization (Cơ bụng & lõi)", "30 phút", "250 kcal"],
  ["Thứ Sáu (Day 3)", "Tabata Abs & Cardio liên tục", "40 phút", "350 kcal"],
  ["Chủ Nhật (Day 4)", "Pilates Recovery & giãn cơ", "50 phút", "200 kcal"],
]

function AiAssistant({ onNavigate }: { onNavigate: Navigate }) {
  const [message, setMessage] = useState("")
  const [sent, setSent] = useState<string[]>([])
  function submit(event: FormEvent) {
    event.preventDefault()
    const next = message.trim()
    if (!next) return
    setSent((current) => [...current, next])
    setMessage("")
  }
  return (
    <Shell page="ai" onNavigate={onNavigate}>
      <section className="m2-ai-layout">
        <aside className="m2-chat-history">
          <div><strong>LỊCH SỬ CHAT</strong><button aria-label="Cuộc trò chuyện mới" type="button"><img src={src("ai", "8c7b7.svg")} alt="" /></button></div>
          {[
            ["Kế hoạch dinh dưỡng tuần 4", "Hôm nay"],
            ["Đau mỏi cơ sau buổi Legday", "Hôm qua"],
            ["Cách tính lượng Calories thâm hụt", "T5, 19/09"],
            ["Đề xuất lớp Yoga phù hợp gối", "T2, 16/09"],
            ["Tăng cơ giảm mỡ cho dân văn phòng", "05/09"],
          ].map(([title, date], index) => <button className={index === 0 ? "active" : ""} key={title} type="button"><strong>{title}</strong><small>{date}</small></button>)}
        </aside>
        <div className="m2-chat">
          <div className="m2-chat-head"><span><img src={src("ai", "7005e.svg")} alt="" /></span><div><strong>Move AI Coach</strong><small>● Trợ lý AI đang trực tuyến hỗ trợ bạn</small></div></div>
          <div className="m2-chat-stream">
            <p className="m2-chat-user">Gợi ý bài tập cho giảm mỡ bụng trong vòng 4 tuần hiệu quả nhất. Mình có thể tập 4 buổi một tuần tại nhà hoặc phòng gym đều được.</p>
            <div className="m2-chat-ai">
              <p>Chào Minh Anh! Để giảm mỡ bụng hiệu quả và an toàn, chúng ta cần kết hợp giữa bài tập đốt mỡ toàn thân (HIIT) và các bài tập tăng cường khối lượng cơ trung tâm (Core). Mình đề xuất cho bạn giáo án 4 ngày dưới đây:</p>
              <div className="m2-plan-table">
                <div><strong>NGÀY</strong><strong>BÀI TẬP CHI TIẾT</strong><strong>THỜI LƯỢNG</strong><strong>CALO ƯỚC TÍNH</strong></div>
                {plan.map((row) => <div key={row[0]}>{row.map((cell, index) => <span className={index === 0 ? "day" : index === 3 ? "calo" : ""} key={cell}>{cell}</span>)}</div>)}
              </div>
              <p>Dinh dưỡng cũng đóng vai trò quyết định, hãy giữ mức thâm hụt nhẹ 300 kcal/ngày nhé. Bạn có muốn mình tạo chi tiết bài tập cho từng ngày không?</p>
              <div className="m2-quick-actions"><button type="button">Thêm vào lịch</button><button type="button">Điều chỉnh</button><button type="button">Tạo giáo án</button></div>
            </div>
            {sent.map((text, index) => <p className="m2-chat-user" key={`${text}-${index}`}>{text}</p>)}
          </div>
          <form className="m2-chat-input" onSubmit={submit}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hỏi về lịch tập, chế độ dinh dưỡng, kĩ thuật tập luyện..." /><button aria-label="Gửi tin nhắn" type="submit"><img src={src("ai", "34eb1.svg")} alt="" /></button></form>
        </div>
      </section>
    </Shell>
  )
}

export default function MemberPortalV2({ page, onNavigate }: { page: NewMemberPage; onNavigate: Navigate }) {
  if (page === "schedule") return <Schedule onNavigate={onNavigate} />
  if (page === "success") return <Success onNavigate={onNavigate} />
  if (page === "workout") return <Workout onNavigate={onNavigate} />
  return <AiAssistant onNavigate={onNavigate} />
}
