import { CoachScreen } from "../types";
import { IconCalendar } from "../Icons";

export default function CoachDashboard({ onNavigate }: { onNavigate: (s: CoachScreen) => void }) {
  const stats = [
    {
      icon: "📅",
      label: "Lớp dạy hôm nay",
      value: "4 lớp",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-100 dark:border-orange-500/20",
    },
    {
      icon: "👥",
      label: "Tổng số học viên",
      value: "28 học viên",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-500/20",
    },
    {
      icon: "🏃",
      label: "Lịch PT cá nhân",
      value: "3 buổi hôm nay",
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-500/10",
      border: "border-purple-100 dark:border-purple-500/20",
    },
    {
      icon: "💰",
      label: "Thu nhập tạm tính",
      value: "18.5tr đ",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-500/10",
      border: "border-orange-100 dark:border-orange-500/20",
      highlight: true,
    },
  ]

  const schedule = [
    { time: "07:00 - 08:00", name: "Yoga Gây & Dây Cơ Bản", location: "Studio 2", type: "Lớp Nhóm", typeColor: "text-orange-600 dark:text-orange-400", typeBg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-500" },
    { time: "09:00 - 10:30", name: "Gym Group BodyCombat", location: "Khu Fitness A", type: "Lớp Nhóm", typeColor: "text-orange-600 dark:text-orange-400", typeBg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-500" },
    { time: "14:00 - 15:00", name: "PT Huấn Luyện: Nguyễn Lan Anh", location: "Khu PT VIP", type: "PT 1-1", typeColor: "text-orange-600 dark:text-orange-400", typeBg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-500" },
    { time: "17:00 - 18:30", name: "CrossFit Thể Lực Cao Độ", location: "Studio Ngoài Trời", type: "Lớp Nhóm Đặc biệt", typeColor: "text-emerald-600 dark:text-emerald-400", typeBg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-500" },
  ]

  const notifications = [
    {
      tag: "YÊU CẦU PT",
      tagColor: "text-emerald-600 dark:text-emerald-400",
      tagBg: "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20",
      time: "10 phút trước",
      content: "Hội viên Trần Minh Khoa yêu cầu đặt lịch PT 1-1 cho ngày mai lúc 15:00.",
      actions: ["Chấp nhận", "Từ chối"],
    },
    {
      tag: "YÊU CẦU MỚI",
      tagColor: "text-orange-600 dark:text-orange-400",
      tagBg: "bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20",
      time: "1 giờ trước",
      content: "Đăng ký mới từ hội viên VIP: Vũ Thu Trang muốn chọn bạn làm HLV cá nhân 24 buổi.",
      actions: [],
    },
    {
      tag: "LỊCH THAY ĐỔI",
      tagColor: "text-slate-600 dark:text-slate-400",
      tagBg: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
      time: "Hôm qua",
      content: (
        <>Lớp Gym Group BodyCombat ngày 28/10 chuyển từ Studio 1 sang <strong>Khu Fitness A</strong>.</>
      ),
      actions: [],
    },
  ]

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div className={`p-5 rounded-2xl bg-white dark:bg-slate-800/50 border ${s.highlight ? 'border-orange-200 dark:border-orange-500/30 shadow-lg shadow-orange-500/5' : 'border-slate-200 dark:border-slate-700/50'} flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-xl`} key={s.label}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${s.bg} border ${s.border}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-black ${s.highlight ? "text-orange-600 dark:text-orange-400" : "text-slate-900 dark:text-white"} tracking-tight`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Lịch dạy hôm nay */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lịch dạy hôm nay</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
              <IconCalendar />
              Thứ Năm, 26/10/2026
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            {schedule.map((s) => (
              <div
                key={s.name}
                className={`p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 border-l-4 ${s.border} hover:shadow-md transition-shadow cursor-pointer group`}
                onClick={() => onNavigate("schedule")}
              >
                <div className="w-32 shrink-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{s.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">{s.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {s.location}
                  </div>
                </div>
                <div className="shrink-0 mt-2 sm:mt-0">
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${s.typeColor} ${s.typeBg}`}>
                    {s.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thông báo & Yêu cầu */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông báo & Yêu cầu mới</h2>
          <div className="flex flex-col gap-4">
            {notifications.map((n, i) => (
              <div className="p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-shadow" key={i}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md ${n.tagColor} ${n.tagBg}`}>
                    {n.tag}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{n.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4">
                  {n.content}
                </p>
                {n.actions.length > 0 && (
                  <div className="flex items-center gap-2">
                    {n.actions.map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={a === "Chấp nhận" 
                          ? "px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-500/20" 
                          : "px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors"}
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
