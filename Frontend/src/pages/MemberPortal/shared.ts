import { FormEvent, useMemo, useState } from "react"
import MemberPortalV2, { NewMemberPage } from "../../MemberPortalV2"

export type MemberPage =
  | "overview"
  | "users"
  | "classes"
  | "confirm"
  | "payment"
  | "reports"
  | "profile"
  | NewMemberPage

export const assetRoots = {
  overview: "/assets/member-dashboard",
  classes: "/assets/member-booking",
  confirm: "/assets/member-confirm",
}

export const iconNames = {
  overview: {
    dashboard: "f100e.svg",
    users: "9ddf7.svg",
    calendar: "21064.svg",
    payment: "91b5c.svg",
    reports: "77921.svg",
    ai: "b44db.svg",
    search: "b08f9.svg",
    bell: "e12e7.svg",
    avatar: "af3ea.svg",
    account: "92db2.svg",
  },
  classes: {
    dashboard: "a6906.svg",
    users: "c502a.svg",
    calendar: "2e78e.svg",
    payment: "2b3e0.svg",
    reports: "01d29.svg",
    ai: "f1047.svg",
    search: "ce4a8.svg",
    bell: "a9acc.svg",
    avatar: "98e10.png",
    account: "6b7a8.png",
  },
  confirm: {
    dashboard: "a6906.svg",
    users: "c502a.svg",
    calendar: "2e78e.svg",
    payment: "2b3e0.svg",
    reports: "01d29.svg",
    ai: "f1047.svg",
    search: "ce4a8.svg",
    bell: "a9acc.svg",
    avatar: "86f81.png",
    account: "a091d.png",
  },
}

export const classItems = [
  {
    title: "Yoga Flow",
    coach: "Mai Phương",
    schedule: "Thứ Tư, 23/09 • 08:00 (60 phút)",
    room: "Phòng: Studio 1 (Tầng 2)",
    spaces: "Còn 8 chỗ",
    image: "60eeb.png",
  },
  {
    title: "Functional HIIT",
    coach: "Trần Khoa",
    schedule: "Thứ Ba, 22/09 • 18:30 (45 phút)",
    room: "Phòng: Arena 2 (Tầng 1)",
    spaces: "Còn 5 chỗ",
    image: "340d3.png",
  },
  {
    title: "Zumba Dance",
    coach: "Hoàng Anh",
    schedule: "Thứ Năm, 24/09 • 19:30 (60 phút)",
    room: "Phòng: Studio 3 (Tầng 3)",
    spaces: "Còn 12 chỗ",
    image: "b0a09.png",
  },
  {
    title: "Kickboxing Basic",
    coach: "Nguyễn Hùng",
    schedule: "Thứ Sáu, 25/09 • 06:30 (60 phút)",
    room: "Phòng: Combat Zone",
    spaces: "Còn 4 chỗ",
    image: "25c0c.png",
  },
  {
    title: "Pilates Core",
    coach: "Minh Thư",
    schedule: "Thứ Bảy, 26/09 • 09:00 (60 phút)",
    room: "Phòng: Studio 2 (Tầng 2)",
    spaces: "Còn 2 chỗ",
    image: "5709f.png",
  },
  {
    title: "Swimming Adv",
    coach: "Quốc Bảo",
    schedule: "Chủ Nhật, 27/09 • 17:00 (90 phút)",
    room: "Phòng: Pool Area (Tầng hầm)",
    spaces: "Còn 10 chỗ",
    image: "8b5dc.png",
  },
]

export type ClassItem = (typeof classItems)[number] & { id?: string; sportName?: string; }

type PortalVisualPage = keyof typeof assetRoots

export function visualPage(page: MemberPage): PortalVisualPage {
  return page === "classes" || page === "confirm" ? page : "overview"
}

export function asset(page: PortalVisualPage, filename: string) {
  return `${assetRoots[page]}/${filename}`
}

export const memberSections = {
  users: {
    kicker: "THÔNG TIN TÀI KHOẢN",
    title: "Hồ sơ hội viên",
    description: "Quản lý thông tin cá nhân và trạng thái hội viên của bạn.",
    stats: [
      ["Hạng hội viên", "Premium", "Hoạt động"],
      ["Mã hội viên", "MB-2048", "Tham gia từ 2024"],
      ["Chi nhánh", "Quận 1", "SportCenter Central"],
    ],
    rows: [
      ["Họ và tên", "Nguyễn Lan Anh", "Thông tin định danh"],
      ["Số điện thoại", "0903 456 789", "Số liên hệ chính"],
      ["Email", "lananh@email.com", "Nhận thông báo hệ thống"],
    ],
  },
  payment: {
    kicker: "GÓI TẬP & HÓA ĐƠN",
    title: "Thanh toán",
    description: "Theo dõi gói tập hiện tại và các giao dịch gần đây.",
    stats: [
      ["Gói hiện tại", "Premium", "12 tháng"],
      ["Ngày hết hạn", "18/12/2026", "Còn 88 ngày"],
      ["Trạng thái", "Đã thanh toán", "Không có dư nợ"],
    ],
    rows: [
      ["HD-092026", "Premium 12 tháng", "12.000.000 đ"],
      ["HD-032026", "Gia hạn tủ đồ", "600.000 đ"],
      ["HD-122025", "PT cá nhân • 10 buổi", "4.500.000 đ"],
    ],
  },
  reports: {
    kicker: "TIẾN ĐỘ LUYỆN TẬP",
    title: "Báo cáo",
    description: "Tổng hợp hoạt động và kết quả luyện tập của bạn.",
    stats: [
      ["Buổi tập tháng này", "12 buổi", "Tăng 3 buổi"],
      ["Năng lượng tiêu hao", "8.400 kcal", "Đạt 84% mục tiêu"],
      ["Chuỗi tập hiện tại", "5 ngày", "Kỷ lục 18 ngày"],
    ],
    rows: [
      ["Functional HIIT", "22/09/2026", "450 kcal"],
      ["Yoga Flow", "20/09/2026", "210 kcal"],
      ["Cardio tự do", "18/09/2026", "380 kcal"],
    ],
  },
} as const
