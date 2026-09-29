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
