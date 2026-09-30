import React from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';

export function MemberSidebar({
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
    ["profile", "Hồ sơ cá nhân", icons.users],
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
              onClick={() => onNavigate(destination as MemberPage)}
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

      <div className="mp-account cursor-pointer hover:bg-white/5 p-3 -m-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => onNavigate("profile")}>
        <img src={asset(currentVisualPage, icons.avatar)} alt="" className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 flex flex-col justify-center">
          <strong className="block truncate text-sm text-white">Minh Anh</strong>
          <small className="block truncate text-xs text-white/50">
            {page === "overview"
              ? "Ca sáng • Đang hoạt động"
              : "Hội viên Premium"}
          </small>
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
