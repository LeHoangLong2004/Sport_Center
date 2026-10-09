import { useState } from "react"

export const A = "/assets"

export type Page = "checkin" | "register" | "classes" | "schedule" | "pos" | "lookup" | "detail" | "profile"

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const navItems: { id: Page; label: string; icon: string }[] = [
  { id: "checkin", label: "Check-in / Check-out", icon: `${A}/38b67.svg` },
  { id: "register", label: "Đăng ký mới", icon: `${A}/7e980.svg` },
  { id: "classes", label: "Lớp học (Đặt hộ)", icon: `${A}/d225c.svg` },
  { id: "schedule", label: "Lịch hẹn PT", icon: `${A}/d225c.svg` },
  { id: "pos", label: "Bán hàng", icon: `${A}/d1f41.svg` },
  { id: "lookup", label: "Tra cứu thông tin", icon: `${A}/5031c.svg` },
]

export const avatarByPage: Record<Page, string> = {
  checkin: `${A}/ce215.png`,
  register: `${A}/90dad.png`,
  classes: `${A}/d749b.png`,
  schedule: `${A}/d749b.png`,
  pos: `${A}/7d869.png`,
  lookup: `${A}/8a918.png`,
  detail: `${A}/8a918.png`,
  profile: `${A}/8a918.png`,
}

// ─── Main ReceptionistPortal ──────────────────────────────────────────────────

export const breadcrumbs: Record<Page, { bc: string; title: string; shift?: string }> = {
  checkin: { bc: "Lễ tân / Quét thẻ & Điểm danh", title: "Check-in / Check-out hội viên" },
  register: { bc: "Lễ tân / Thêm hồ sơ & Mua gói", title: "Đăng ký hội viên mới" },
  classes: { bc: "Lễ tân / Lịch Lớp học", title: "Quản lý Lớp học & Đặt hộ" },
  schedule: { bc: "Lễ tân / Lịch Coach & Tư vấn", title: "Quản lý lịch hẹn của khách" },
  pos: { bc: "Lễ tân / Nghiệp vụ POS", title: "Bán hàng tại quầy", shift: "Ca làm việc" },
  lookup: { bc: "Lễ tân / Danh sách hệ thống", title: "Tra cứu thông tin hội viên", shift: "Ca làm việc" },
  detail: { bc: "Lễ tân / Tra cứu hội viên / Chi tiết", title: "Chi tiết hội viên", shift: "Ca làm việc" },
  profile: { bc: "Lễ tân / Hồ sơ cá nhân", title: "Hồ sơ Lễ tân", shift: "Ca làm việc" },
}
