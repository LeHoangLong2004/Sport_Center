import type { ReactNode } from "react";
import type { CoachScreen } from "./types";
import {
  IconGrid, IconCalendar, IconBook, IconClipboard,
  IconPerson, IconSparkle, IconUserCheck, IconUsers, IconBell, IconStar, IconMessage,
} from "./Icons";

export const A = "/assets";

export const navItems: { key: CoachScreen; label: string; Icon: () => ReactNode }[] = [
  { key: "dashboard",     label: "Tổng quan",              Icon: IconGrid },
  { key: "schedule",      label: "Lịch dạy",               Icon: IconCalendar },
  { key: "attendance",    label: "Điểm danh lớp",          Icon: IconUserCheck },
  { key: "members",       label: "Học viên phụ trách",     Icon: IconUsers },
  { key: "assessment",    label: "Đánh giá học viên",      Icon: IconClipboard },
  { key: "curriculum",    label: "Giáo án & AI",           Icon: IconBook },
  { key: "chat",          label: "Tin nhắn",               Icon: IconMessage },
  { key: "reviews",       label: "Phản hồi học viên",      Icon: IconStar },
  { key: "profile",       label: "Hồ sơ cá nhân",          Icon: IconPerson },
];

export const breadcrumbs: Partial<Record<CoachScreen, string>> = {
  dashboard:        "Tổng quan",
  schedule:         "Lịch dạy & Ca làm việc",
  "class-detail":   "Chi tiết buổi học",
  attendance:       "Điểm danh lớp học",
  members:          "Học viên phụ trách",
  "member-profile": "Hồ sơ học viên",
  assessment:       "Đánh giá học viên",
  curriculum:       "Giáo án & AI",
  ai:               "Gợi ý bài tập AI",
  chat:             "Tin nhắn trao đổi",
  reviews:          "Phản hồi học viên",
  profile:          "Hồ sơ cá nhân",
  settings:         "Cài đặt",
};

export const pageTitles: Partial<Record<CoachScreen, string>> = {
  dashboard:        "Tổng quan",
  schedule:         "Lịch dạy & Ca làm việc",
  "class-detail":   "Chi tiết buổi học",
  attendance:       "Điểm danh lớp học",
  members:          "Học viên phụ trách",
  "member-profile": "Hồ sơ học viên",
  assessment:       "Đánh giá học viên",
  curriculum:       "Giáo án & Trợ lý AI",
  ai:               "Gợi ý bài tập thông minh với AI",
  chat:             "Tin nhắn trao đổi",
  reviews:          "Phản hồi học viên",
  profile:          "Hồ sơ Huấn luyện viên",
  settings:         "Cài đặt",
};