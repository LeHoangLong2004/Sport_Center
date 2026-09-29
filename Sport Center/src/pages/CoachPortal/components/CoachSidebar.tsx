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