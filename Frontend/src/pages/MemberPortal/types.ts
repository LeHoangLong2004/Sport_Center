export type MemberScreen =
  | "dashboard"   // 1. Tổng quan
  | "booking"     // 2. Khám phá & Đặt lịch (Lớp nhóm + PT 1-1)
  | "schedule"    // 3. Lịch của tôi (Sắp tới, Lịch sử, Đã hủy)
  | "packages"    // 4. Gói tập & Mua gói
  | "payments"    // 5. Thanh toán & Hóa đơn
  | "workouts"    // 6. Giáo án & Bài tập
  | "attendance"  // 7. Điểm danh & Lịch sử chuyên cần
  | "reviews"     // 8. Đánh giá HLV
  | "chat"        // 9. Tin nhắn trao đổi với HLV
  | "support"     // 10. Trợ lý AI & Hỗ trợ
  | "shop"        // 11. Cửa hàng sản phẩm
  | "profile";    // 12. Hồ sơ cá nhân & Đổi mật khẩu

export interface MemberSessionItem {
  id: string;
  name: string;
  sport: string;
  level: string;
  type: "group" | "pt";
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  coachSpecialty?: string;
  coachPhone?: string;
  coachBio?: string;
  coachRating?: number;
  coachExperienceYears?: number;
  price?: number;
  paymentStatus?: string;
  capacity: number;
  registeredCount: number;
  status: "sắp diễn ra" | "đang diễn ra" | "hoàn thành" | "đã hủy";
  attendanceStatus?: "có mặt" | "đi muộn" | "vắng" | "chưa điểm danh";
  cancelReason?: string;
  coachNote?: string;
  goal?: string;
}

export interface MemberPackageItem {
  id: string;
  packageId: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  price: number;
  status: "active" | "expired" | "pending";
  totalSessions?: number;
  usedSessions?: number;
}

export interface MemberPaymentItem {
  id: string;
  subscriptionId?: string;
  packageName: string;
  amount: number;
  date: string;
  method: "Tiền mặt tại quầy" | "Chuyển khoản" | "VNPay" | "MoMo";
  status: "paid" | "pending" | "refunded";
  referenceCode?: string;
  invoiceUrl?: string;
}

export interface MemberTaskItem {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedDate: string;
  dueDate?: string;
  completed: boolean;
  category: "workout" | "diet" | "recovery";
}


export interface MemberCoachReviewItem {
  id: string;
  sessionId: string;
  sessionName: string;
  coachId: string;
  coachName: string;
  date: string;
  rating: number; // 1-5
  tags: string[];
  comment: string;
}

export interface MemberSupportTicketItem {
  id: string;
  category: "Tư vấn dịch vụ" | "Đổi lịch" | "Hoàn tiền" | "Cơ sở vật chất" | "Khác";
  subject: string;
  content: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}
