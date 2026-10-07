import type { ReactNode } from "react";
import type { CoachScreen } from "./types";
import {
  IconGrid, IconCalendar, IconBook, IconClipboard,
  IconPerson, IconSparkle, IconUserCheck,
} from "./Icons";

export const A = "/assets";

// Icon cho menu Học viên và Thông báo (dùng SVG inline để không thêm lib)
function IconUsers(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconBell(): ReactNode {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

export const navItems: { key: CoachScreen; label: string; Icon: () => ReactNode }[] = [
  { key: "dashboard",     label: "Tổng quan",          Icon: IconGrid },
  { key: "schedule",      label: "Lịch dạy",           Icon: IconCalendar },
  { key: "members",       label: "Học viên",           Icon: IconUsers },
  { key: "curriculum",    label: "Giáo án",            Icon: IconBook },
  { key: "attendance",    label: "Điểm danh",          Icon: IconUserCheck },
  { key: "assessment",    label: "Tiến độ & đánh giá", Icon: IconClipboard },
  { key: "notifications", label: "Thông báo",          Icon: IconBell },
  { key: "ai",            label: "AI gợi ý",           Icon: IconSparkle },
  { key: "profile",       label: "Hồ sơ cá nhân",     Icon: IconPerson },
];

export const breadcrumbs: Partial<Record<CoachScreen, string>> = {
  dashboard:        "HLV / Tổng quan",
  schedule:         "HLV / Lịch dạy",
  "class-detail":   "HLV / Lịch dạy / Chi tiết buổi",
  attendance:       "HLV / Điểm danh",
  members:          "HLV / Học viên",
  "member-profile": "HLV / Học viên / Hồ sơ",
  curriculum:       "HLV / Giáo án",
  assessment:       "HLV / Tiến độ & đánh giá",
  notifications:    "HLV / Thông báo",
  ai:               "HLV / AI gợi ý",
  profile:          "HLV / Hồ sơ cá nhân",
  settings:         "HLV / Cài đặt",
};

export const pageTitles: Partial<Record<CoachScreen, string>> = {
  dashboard:        "Tổng quan hôm nay",
  schedule:         "Lịch dạy",
  "class-detail":   "Chi tiết buổi học",
  attendance:       "Điểm danh",
  members:          "Học viên",
  "member-profile": "Hồ sơ học viên",
  curriculum:       "Giáo án",
  assessment:       "Tiến độ & Đánh giá",
  notifications:    "Thông báo",
  ai:               "AI gợi ý bài tập",
  profile:          "Hồ sơ Coach",
  settings:         "Cài đặt",
};