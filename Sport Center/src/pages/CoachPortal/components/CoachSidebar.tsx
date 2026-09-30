import { CoachScreen } from "../types";
import { navItems, A } from "../constants";

export default function CoachSidebar({
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

      <div className="cp-coach-foot cursor-pointer hover:bg-white/5 p-3 -m-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => onNavigate("profile")}>
        <img src={`${A}/f6154.png`} alt="HLV Minh Tuấn" className="cp-coach-avatar w-10 h-10 rounded-full shrink-0" />
        <div className="cp-coach-info flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 flex flex-col justify-center">
          <strong className="block truncate text-sm text-white">HLV Minh Tuấn</strong>
          <small className="block truncate text-xs text-white/50">Master Trainer</small>
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
  )
}