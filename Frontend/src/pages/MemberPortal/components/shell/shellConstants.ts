import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CreditCard,
  Receipt,
  ShoppingBag,
  Dumbbell,
  ClipboardCheck,
  Star,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";
import type { MemberScreen } from "../../types";

export const MENU_ITEMS: { id: MemberScreen; label: string; icon: any }[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "booking", label: "Khám phá & Đặt lịch", icon: Compass },
  { id: "schedule", label: "Lịch của tôi", icon: CalendarCheck },
  { id: "attendance", label: "Điểm danh", icon: ClipboardCheck },
  { id: "packages", label: "Gói tập của tôi", icon: CreditCard },
  { id: "payments", label: "Lịch sử thanh toán", icon: Receipt },
  { id: "shop", label: "Cửa hàng", icon: ShoppingBag },
  { id: "workouts", label: "Giáo án & Bài tập", icon: Dumbbell },
  { id: "reviews", label: "Đánh giá HLV", icon: Star },
  { id: "chat", label: "Tin nhắn", icon: MessageSquare },
  { id: "support", label: "Trợ lý AI & Hỗ trợ", icon: Bot },
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
];

export const BREADCRUMBS: Record<MemberScreen, string> = {
  dashboard: "HỘI VIÊN / TỔNG QUAN",
  booking: "HỘI VIÊN / KHÁM PHÁ & ĐẶT LỊCH",
  schedule: "HỘI VIÊN / LỊCH CỦA TÔI",
  attendance: "HỘI VIÊN / ĐIỂM DANH & CHUYÊN CẦN",
  packages: "HỘI VIÊN / GÓI TẬP & DỊCH VỤ",
  payments: "HỘI VIÊN / LỊCH SỬ THANH TOÁN & HÓA ĐƠN",
  workouts: "HỘI VIÊN / GIÁO ÁN & BÀI TẬP",
  reviews: "HỘI VIÊN / ĐÁNH GIÁ HLV",
  chat: "HỘI VIÊN / TIN NHẮN TRAO ĐỔI",
  support: "HỘI VIÊN / TRỢ LÝ AI & HỖ TRỢ",
  shop: "HỘI VIÊN / CỬA HÀNG SẢN PHẨM",
  profile: "HỘI VIÊN / HỒ SƠ CÁ NHÂN",
};

export const PAGE_TITLES: Record<MemberScreen, string> = {
  dashboard: "Tổng quan hôm nay",
  booking: "Khám phá & Đặt lịch tập",
  schedule: "Lịch tập của tôi",
  attendance: "Lịch sử điểm danh & Chuyên cần",
  packages: "Gói tập & Dịch vụ",
  payments: "Lịch sử thanh toán & Hóa đơn",
  workouts: "Giáo án & Bài tập",
  reviews: "Đánh giá Huấn luyện viên",
  chat: "Tin nhắn & Trao đổi",
  support: "Trợ lý AI & Hỗ trợ",
  shop: "Cửa hàng sản phẩm & Đồ tập",
  profile: "Hồ sơ cá nhân",
};
