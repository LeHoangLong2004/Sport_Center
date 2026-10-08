import type { ReactNode } from "react";
import type { CoachScreen } from "./types";
import {
  IconGrid, IconCalendar, IconBook, IconClipboard,
  IconPerson, IconSparkle, IconUserCheck, IconUsers, IconBell,
} from "./Icons";

export const A = "/assets";

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