import React from 'react';
import { assetRoots, iconNames, classItems, memberSections, MemberPage, visualPage, asset } from '../shared';
import { useUserProfile } from '../../../hooks/useUserProfile';

export function MemberTopbar({
  page,
  onNavigate,
}: {
  page: MemberPage
  onNavigate: (page: MemberPage) => void
}) {
  const { profile } = useUserProfile();
  const userName = profile?.fullName ? profile.fullName.split(' ').pop() : 'Hội viên';

  const currentVisualPage = visualPage(page)
  const icons = iconNames[currentVisualPage]
  const pageCopy: Partial<Record<MemberPage, [string, string]>> = {
    overview: ["Member Portal / Tổng quan", `Xin chào, ${userName}`],
    classes: ["Member Portal / Lớp & Lịch / Đặt lớp", "Đặt lớp tập"],
    confirm: [
      "Member Portal / Lớp & Lịch / Xác nhận đặt chỗ",
      "Xác nhận đăng ký lớp",
    ],
    payment: ["Member Portal / Thanh toán", "Gói tập & thanh toán"],
    reports: ["Member Portal / Báo cáo", "Báo cáo luyện tập"],
    profile: ["Member Portal / Hồ sơ thành viên", "Hồ sơ của tôi"],
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
          aria-label="Hồ sơ thành viên"
          type="button"
          onClick={() => onNavigate("profile")}
        >
          <img src={asset(currentVisualPage, icons.account)} alt="" />
        </button>
      </div>
    </header>
  )
}
