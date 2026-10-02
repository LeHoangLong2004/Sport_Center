import { FormEvent, useState } from "react"
import { MemberSidebar } from "./pages/MemberPortal/components/MemberSidebar"

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
      <MemberSidebar page={page as any} onNavigate={onNavigate as any} />
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
  { row: 1, column: 3, tone: "teal", title: "Yoga Flow", detail: "Mai Phương", meta: "Studio 1" },
  { row: 2, column: 6, tone: "green", title: "Tự tập tự do", detail: "Không có PT", meta: "Khu Gym" },
  { row: 3, column: 1, tone: "green", title: "Cardio tự do", detail: "Tập máy chạy" },
  { row: 3, column: 2, tone: "teal", title: "Functional HIIT", detail: "Trần Khoa" },
  { row: 3, column: 5, tone: "orange", title: "PT cá nhân", detail: "Trần Khoa" },
]

function Schedule({ onNavigate }: { onNavigate: Navigate }) {
  return (
    <Shell page="schedule" onNavigate={onNavigate}>
      <section className="p-8 bg-slate-50 min-h-[calc(100vh-78px)] flex gap-6 flex-col xl:flex-row items-start">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex-1 w-full">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tuần học hiện tại</h2>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                21 Th9 - 27 Th9, 2026
              </p>
            </div>
            <div className="flex gap-5 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200/60">
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm shadow-teal-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lớp nhóm</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-sm shadow-orange-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">HLV Cá nhân (PT)</span></div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50"></span><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tự tập luyện</span></div>
            </div>
          </div>
          
          <div className="overflow-x-auto overflow-y-hidden">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                <div className="p-4 text-center border-r border-slate-200/50"></div>
                {days.map(day => <div key={day} className="p-4 text-center border-r border-slate-200/50">{day}</div>)}
              </div>
              <div className="relative bg-white" style={{ minHeight: '500px' }}>
                {["08:00", "10:00", "17:30"].map((time, row) => (
                  <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-100 min-h-[140px]">
                    <div className="p-4 text-center text-xs font-bold text-slate-400 border-r border-slate-100 flex items-center justify-center bg-slate-50/30">{time}</div>
                    {days.map(day => <div key={day} className="border-r border-slate-100 last:border-r-0 relative hover:bg-teal-50/20 transition-colors cursor-crosshair"></div>)}
                  </div>
                ))}
                
                {/* Events - positioned absolute */}
                {calendarEvents.map((ev, i) => {
                  const bg = ev.tone === 'teal' ? 'bg-teal-50/90 border-teal-200 text-teal-700' : 
                             ev.tone === 'green' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-700' : 
                             'bg-orange-50/90 border-orange-200 text-orange-700';
                  const dot = ev.tone === 'teal' ? 'bg-teal-500 shadow-teal-500/40' : 
                              ev.tone === 'green' ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-orange-500 shadow-orange-500/40';
                  
                  // Calculate position
                  const top = ev.row === 1 ? '16px' : ev.row === 2 ? '156px' : '296px';
                  
                  return (
                    <button type="button" onClick={() => ev.title === "Functional HIIT" && onNavigate("workout")} key={i} className={`absolute text-left p-3.5 rounded-2xl border backdrop-blur-md ${bg} hover:shadow-lg transition-all cursor-pointer z-10 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${ev.tone === 'teal' ? 'focus:ring-teal-500' : ev.tone === 'green' ? 'focus:ring-emerald-500' : 'focus:ring-orange-500'}`} style={{ top, left: `calc(80px + ${((ev.column - 1) / 7) * 100}% + 8px)`, width: `calc(${100 / 7}% - 16px)`, minHeight: '108px' }}>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shadow-sm ${dot}`}></span>
                          <strong className="text-sm font-bold leading-tight">{ev.title}</strong>
                        </div>
                      </div>
                      <div className="text-xs font-medium opacity-90 mt-1 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {ev.detail}
                      </div>
                      {ev.meta && (
                        <div className="text-[11px] font-medium opacity-75 mt-1.5 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          {ev.meta}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-6">
          <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-4 rounded-2xl shadow-md shadow-teal-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm" onClick={() => onNavigate("classes")} type="button">
            + Đặt lớp mới
          </button>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Buổi tập tiếp theo</strong>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex flex-col items-center justify-center bg-white border border-slate-200 w-14 h-16 rounded-xl shadow-sm shrink-0">
                <span className="text-[10px] font-bold text-teal-600 uppercase">Thứ 4</span>
                <b className="text-xl font-black text-slate-800">23</b>
              </div>
              <div className="flex-1 min-w-0">
                <strong className="block text-base font-bold text-slate-800 truncate mb-1">Yoga Flow</strong>
                <small className="block text-xs font-medium text-slate-500 truncate flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  08:00 • Coach Mai Phương
                </small>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <strong className="block text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4">Tiến trình tháng 9</strong>
            <dl className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <dt className="text-sm font-medium text-slate-500">Số buổi tập</dt>
                <dd className="text-sm font-bold text-slate-800">12 buổi</dd>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <dt className="text-sm font-medium text-slate-500">Tiêu thụ calo</dt>
                <dd className="text-sm font-bold text-orange-600 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
                  8,400 kcal
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-slate-500">Chuỗi kỷ lục</dt>
                <dd className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  5 ngày
                </dd>
              </div>
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
      <section className="flex h-[calc(100vh-78px)] bg-slate-50 overflow-hidden">
        {/* Sidebar History */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <strong className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Lịch sử Chat</strong>
            <button aria-label="Cuộc trò chuyện mới" type="button" className="p-1.5 hover:bg-slate-100 rounded-md transition-colors text-slate-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {[
            ["Kế hoạch dinh dưỡng tuần 4", "Hôm nay"],
            ["Đau mỏi cơ sau buổi Legday", "Hôm qua"],
            ["Cách tính lượng Calories thâm hụt", "T5, 19/09"],
            ["Đề xuất lớp Yoga phù hợp gối", "T2, 16/09"],
            ["Tăng cơ giảm mỡ cho dân văn phòng", "05/09"],
          ].map(([title, date], index) => (
            <button className={`w-full text-left p-3 rounded-xl transition-all ${index === 0 ? "bg-teal-50 border border-teal-100" : "hover:bg-slate-50 border border-transparent"}`} key={title} type="button">
              <strong className={`block text-sm font-semibold truncate ${index === 0 ? "text-teal-700" : "text-slate-700"}`}>{title}</strong>
              <small className={`block text-xs mt-1 ${index === 0 ? "text-teal-500" : "text-slate-400"}`}>{date}</small>
            </button>
          ))}
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 relative">
          <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 flex items-center shrink-0 z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-md shadow-teal-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2zm0 6a2 2 0 0 1 2 2v6a2 2 0 0 1-4 0v-6a2 2 0 0 1 2-2zm0 12a2 2 0 0 1 2 2H10a2 2 0 0 1 2-2z"/></svg>
              </div>
              <div>
                <strong className="block text-sm font-bold text-slate-800">Move AI Coach</strong>
                <small className="block text-xs font-medium text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Trợ lý AI đang trực tuyến hỗ trợ bạn</small>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex justify-end">
              <p className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[80%] leading-relaxed">
                Gợi ý bài tập cho giảm mỡ bụng trong vòng 4 tuần hiệu quả nhất. Mình có thể tập 4 buổi một tuần tại nhà hoặc phòng gym đều được.
              </p>
            </div>
            
            <div className="flex justify-start items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2zm0 6a2 2 0 0 1 2 2v6a2 2 0 0 1-4 0v-6a2 2 0 0 1 2-2zm0 12a2 2 0 0 1 2 2H10a2 2 0 0 1 2-2z"/></svg>
              </div>
              <div className="bg-gradient-to-br from-teal-600 to-indigo-700 text-white shadow-xl shadow-teal-900/10 rounded-3xl rounded-tl-sm px-6 py-5 text-sm max-w-[85%] leading-relaxed">
                <p className="mb-4 text-teal-50">Chào Minh Anh! Để giảm mỡ bụng hiệu quả và an toàn, chúng ta cần kết hợp giữa bài tập đốt mỡ toàn thân (HIIT) và các bài tập tăng cường khối lượng cơ trung tâm (Core). Mình đề xuất cho bạn giáo án 4 ngày dưới đây:</p>
                
                <div className="bg-white/10 rounded-2xl overflow-hidden border border-white/20 mb-4 backdrop-blur-sm">
                  <div className="grid grid-cols-[1fr_2fr_1fr_1fr] bg-white/10 p-3 text-xs font-bold tracking-wider text-teal-100 uppercase border-b border-white/10">
                    <div>NGÀY</div><div>BÀI TẬP CHI TIẾT</div><div>THỜI LƯỢNG</div><div>CALO ƯỚC TÍNH</div>
                  </div>
                  {plan.map((row, idx) => (
                    <div key={row[0]} className={`grid grid-cols-[1fr_2fr_1fr_1fr] p-3 text-sm items-center ${idx !== plan.length - 1 ? 'border-b border-white/10' : ''} hover:bg-white/5 transition-colors`}>
                      <span className="font-semibold text-white">{row[0]}</span>
                      <span className="text-teal-50">{row[1]}</span>
                      <span className="text-teal-100">{row[2]}</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-medium text-xs w-fit">{row[3]}</span>
                    </div>
                  ))}
                </div>
                
                <p className="mb-5 text-teal-50">Dinh dưỡng cũng đóng vai trò quyết định, hãy giữ mức thâm hụt nhẹ 300 kcal/ngày nhé. Bạn có muốn mình tạo chi tiết bài tập cho từng ngày không?</p>
                
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="bg-white text-teal-700 hover:bg-teal-50 font-semibold px-4 py-2 rounded-full text-xs transition-all shadow-sm">Thêm vào lịch</button>
                  <button type="button" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium px-4 py-2 rounded-full text-xs transition-all">Điều chỉnh</button>
                  <button type="button" className="bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium px-4 py-2 rounded-full text-xs transition-all">Tạo giáo án</button>
                </div>
              </div>
            </div>

            {sent.map((text, index) => (
              <div className="flex justify-end" key={`${text}-${index}`}>
                <p className="bg-white border border-slate-200 text-slate-700 shadow-sm rounded-2xl rounded-tr-sm px-5 py-3 text-sm max-w-[80%] leading-relaxed animate-in slide-in-from-bottom-2 fade-in duration-300">
                  {text}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-white border-t border-slate-200">
            <form className="relative flex items-center shadow-sm border border-slate-200 rounded-full bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all overflow-hidden" onSubmit={submit}>
              <input value={message} onChange={(event) => setMessage(event.target.value)} className="w-full bg-transparent outline-none py-3.5 pl-6 pr-12 text-sm text-slate-700 placeholder-slate-400" placeholder="Hỏi về lịch tập, chế độ dinh dưỡng, kĩ thuật tập luyện..." />
              <button aria-label="Gửi tin nhắn" type="submit" className={`absolute right-2 p-2 rounded-full transition-all ${message.trim() ? 'bg-teal-600 text-white shadow-md hover:bg-teal-700' : 'bg-slate-200 text-slate-400'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </form>
          </div>
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
