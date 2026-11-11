import { FormEvent, useMemo, useState } from "react";

export type MemberPage =
  | "overview"
  | "users"
  | "classes"
  | "confirm"
  | "payment"
  | "shop"
  | "reports"
  | "profile"
  | "schedule"
  | "workout"
  | "ai"
  | "success";

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

export type ClassItem = {
  title: string;
  coach: string;
  schedule: string;
  room: string;
  spaces: string;
  image: string;
  id?: string;
  sportName?: string;
};

export const classItems: ClassItem[] = [];

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
      ["Hạng hội viên", "Hội viên SportCenter", "Hoạt động"],
      ["Mã hội viên", "MB-MEMBER", "Tài khoản chính thức"],
      ["Chi nhánh", "SportCenter Complex", "Toàn hệ thống"],
    ],
    rows: [
      ["Họ và tên", "Hội viên", "Thông tin định danh"],
      ["Số điện thoại", "Chưa cập nhật", "Số liên hệ chính"],
      ["Email", "Chưa cập nhật", "Nhận thông báo hệ thống"],
    ],
  },
  payment: {
    kicker: "GÓI TẬP & HÓA ĐƠN",
    title: "Thanh toán",
    description: "Theo dõi gói tập hiện tại và các giao dịch gần đây.",
    stats: [
      ["Gói hiện tại", "Chưa đăng ký", "0 tháng"],
      ["Ngày hết hạn", "--/--/----", "Chưa kích hoạt"],
      ["Trạng thái", "Chưa kích hoạt", "Không có dư nợ"],
    ],
    rows: [],
  },
  reports: {
    kicker: "TIẾN ĐỘ LUYỆN TẬP",
    title: "Báo cáo",
    description: "Tổng hợp hoạt động và kết quả luyện tập của bạn.",
    stats: [
      ["Buổi tập tháng này", "0 buổi", "Khởi đầu mới"],
      ["Năng lượng tiêu hao", "0 kcal", "Chưa có dữ liệu"],
      ["Chuỗi tập hiện tại", "0 ngày", "Bắt đầu hôm nay"],
    ],
    rows: [],
  },
} as const
