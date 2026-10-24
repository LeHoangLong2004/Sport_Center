// Coach Portal — Screen types (mã CO từ spec)
export type CoachScreen =
  | "dashboard"      // CO-01
  | "schedule"       // CO-02
  | "class-detail"   // CO-03
  | "attendance"     // CO-04
  | "members"        // CO-05
  | "member-profile" // CO-05 detail
  | "curriculum"     // CO-06
  | "chat"           // Tin nhắn trao đổi
  | "reviews"        // CO-07 Đánh giá từ học viên
  | "assessment"     // CO-07 Đánh giá tiến độ & kết quả học viên
  | "notifications"  // CO-08
  | "ai"             // CO-09
  | "profile"        // CO-10
  | "settings";