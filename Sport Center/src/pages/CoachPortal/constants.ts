import { ReactNode } from "react";
import { CoachScreen } from "./types";
import { IconGrid, IconCalendar, IconBook, IconClipboard, IconPerson, IconSparkle, IconUserCheck } from "./Icons";

export const A = "/assets";

export const navItems: { key: CoachScreen; label: string; Icon: () => ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", Icon: IconGrid },
  { key: "schedule", label: "Lịch dạy", Icon: IconCalendar },
  { key: "curriculum", label: "Giáo án", Icon: IconBook },
  { key: "assessment", label: "Đánh giá học viên", Icon: IconClipboard },
  { key: "attendance", label: "Điểm danh", Icon: IconUserCheck },
  { key: "profile", label: "Cá nhân", Icon: IconPerson },
  { key: "ai", label: "AI Gợi ý", Icon: IconSparkle },
]

export const breadcrumbs: Record<CoachScreen, string> = {
  dashboard: "HLV / Tổng quan",
  schedule: "HLV / Quản lý lịch",
  curriculum: "HLV / Giáo án",
  assessment: "HLV / Đánh giá học viên",
  attendance: "HLV / Điểm danh",
  profile: "HLV / Hồ sơ",
  ai: "HLV / AI Gợi ý bài tập",
}

export const pageTitles: Record<CoachScreen, string> = {
  dashboard: "Bảng điều khiển Huấn luyện viên",
  schedule: "Lịch dạy và làm việc tuần",
  curriculum: "Kho giáo án huấn luyện",
  assessment: "Nhật ký & Đánh giá tập luyện",
  attendance: "Điểm danh học viên",
  profile: "Thông tin huấn luyện viên cá nhân",
  ai: "AI Gợi ý bài tập thông minh",
}