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
  { key: "assessment",    label: "Đánh giá tiến độ",       Icon: IconClipboard },
  { key: "curriculum",    label: "Giáo án & Bài tập",      Icon: IconBook },
  { key: "ai",            label: "Trợ lý Coach AI",        Icon: IconSparkle },
  { key: "chat",          label: "Tin nhắn (Chat)",        Icon: IconMessage },
  { key: "reviews",       label: "Đánh giá từ học viên",  Icon: IconStar },
  { key: "profile",       label: "Hồ sơ cá nhân",          Icon: IconPerson },
];

export const breadcrumbs: Partial<Record<CoachScreen, string>> = {
  dashboard:        "HLV / Tổng quan",
  schedule:         "HLV / Lịch dạy",
  "class-detail":   "HLV / Lịch dạy / Chi tiết buổi",
  attendance:       "HLV / Điểm danh lớp",
  members:          "HLV / Học viên phụ trách",
  "member-profile": "HLV / Học viên / Hồ sơ",
  assessment:       "HLV / Đánh giá tiến độ",
  curriculum:       "HLV / Giáo án & Bài tập",
  ai:               "HLV / Trợ lý Coach AI",
  chat:             "HLV / Tin nhắn trao đổi",
  reviews:          "HLV / Đánh giá từ học viên",
  profile:          "HLV / Hồ sơ cá nhân",
  settings:         "HLV / Cài đặt",
};

export const pageTitles: Partial<Record<CoachScreen, string>> = {
  dashboard:        "Tổng quan hôm nay",
  schedule:         "Lịch dạy & Ca làm việc",
  "class-detail":   "Chi tiết buổi học",
  attendance:       "Điểm danh lớp học",
  members:          "Học viên phụ trách",
  "member-profile": "Hồ sơ học viên",
  assessment:       "Đánh giá tiến độ & Kết quả học viên",
  curriculum:       "Giáo án & Bài tập",
  ai:               "Trợ lý AI tạo giáo án & bài tập",
  chat:             "Tin nhắn trao đổi với học viên",
  reviews:          "Đánh giá & Nhận xét từ học viên",
  profile:          "Hồ sơ Huấn luyện viên",
  settings:         "Cài đặt",
};