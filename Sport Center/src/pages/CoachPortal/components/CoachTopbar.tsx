import { CoachScreen } from "../types";
import { breadcrumbs, pageTitles } from "../constants";
import { IconBell } from "../Icons";

export default function CoachTopbar({ screen }: { screen: CoachScreen }) {
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