import React, { useState, useEffect } from "react";
import type { MemberScreen } from "../types";
import { UserAvatar } from "../../../components/UserAvatar";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CreditCard,
  Receipt,
  Dumbbell,
  Activity,
  Star,
  Bot,
  User,
  LogOut,
  Sun,
  Moon,
  Bell,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Props {
  currentScreen: MemberScreen;
  onNavigate: (screen: MemberScreen) => void;
  children: React.ReactNode;
}

export default function MemberShellModern({ currentScreen, onNavigate, children }: Props) {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
  });

  const [notificationCount, setNotificationCount] = useState(2);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Load user from localStorage
  const userStr = localStorage.getItem("user");
  let userName = "Nguyễn Lan Anh";
  let userEmail = "lananh@email.com";
  let avatarUrl: string | null = null;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      userName = u.fullName || u.name || "Nguyễn Lan Anh";
      userEmail = u.email || "lananh@email.com";
      avatarUrl = u.avatarUrl || null;
    } catch (e) {}
  }

  const menuItems: { id: MemberScreen; label: string; icon: any; badge?: string }[] = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "booking", label: "Khám phá & Đặt lịch", icon: Compass, badge: "Hot" },
    { id: "schedule", label: "Lịch của tôi", icon: CalendarCheck },
    { id: "packages", label: "Gói tập của tôi", icon: CreditCard },
    { id: "payments", label: "Thanh toán & Hóa đơn", icon: Receipt },
    { id: "workouts", label: "Giáo án & Bài tập", icon: Dumbbell },
    { id: "progress", label: "Chỉ số & Tiến độ", icon: Activity },
    { id: "reviews", label: "Đánh giá HLV", icon: Star },
    { id: "support", label: "Trợ lý AI & Hỗ trợ", icon: Bot, badge: "AI" },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  ];

  const screenTitles: Record<MemberScreen, { title: string; subtitle: string }> = {
    dashboard: { title: "Tổng quan", subtitle: "Theo dõi lịch tập, gói dịch vụ và tiến độ luyện tập cá nhân" },
    booking: { title: "Khám phá & Đặt lịch", subtitle: "Đăng ký lớp nhóm các bộ môn hoặc đặt lịch tập kèm 1-1 với HLV" },
    schedule: { title: "Lịch của tôi", subtitle: "Danh sách buổi tập sắp tới, lịch sử tham gia và ca đã hủy" },
    packages: { title: "Gói tập & Dịch vụ", subtitle: "Chi tiết các gói tập đang sở hữu và đăng ký / gia hạn gói mới" },
    payments: { title: "Thanh toán & Hóa đơn", subtitle: "Theo dõi các hóa đơn thanh toán và xác nhận giao dịch" },
    workouts: { title: "Giáo án & Bài tập", subtitle: "Nội dung luyện tập do HLV chỉ định và bài tập tự rèn luyện" },
    progress: { title: "Chỉ số thể hình & Tiến độ", subtitle: "Theo dõi cân nặng, chỉ số cơ thể và kết quả đánh giá thể lực" },
    reviews: { title: "Đánh giá Huấn luyện viên", subtitle: "Phản hồi chất lượng giảng dạy và đóng góp ý kiến sau buổi tập" },
    support: { title: "Trợ lý AI & Hỗ trợ", subtitle: "Tra cứu thông tin thông minh 24/7 và gửi yêu cầu đến trung tâm" },
    profile: { title: "Hồ sơ cá nhân", subtitle: "Quản lý thông tin hội viên, mục tiêu thể thao và đổi mật khẩu" },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-200 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0B132B] dark:bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen z-30 select-none">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20 tracking-wider">
            SC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white text-[15px] tracking-wide leading-tight">SPORTCENTER</span>
            <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">MEMBER PORTAL</span>
          </div>
        </div>

        {/* Member Quick Badge */}
        <div className="px-4 py-3 mx-3 my-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="relative">
            <UserAvatar src={avatarUrl} name={userName} className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/50" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-medium">Hội viên Thể thao</p>
          </div>
        </div>

        {/* Nav Items */}
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Không gian hội viên</div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto hidden-scrollbar py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  active
                    ? "bg-emerald-500/15 text-emerald-400 font-semibold shadow-sm border border-emerald-500/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      item.badge === "Hot"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto"></span>}
              </button>
            );
          })}
        </nav>

        {/* Support Center Widget */}
        <div className="p-3 m-3 rounded-xl bg-slate-800/50 border border-slate-700/40 text-slate-300 text-xs">
          <div className="flex items-center gap-2 mb-1 text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Giờ hoạt động</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">06:00 – 22:00 tất cả các ngày trong tuần. Hotline: 1900 6868</p>
        </div>

        {/* Footer profile actions */}
        <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate("profile")}
            className="flex items-center gap-2 text-xs text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="Xem hồ sơ"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-[11px] font-medium">Hồ sơ cá nhân</span>
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.hash = "home";
              window.location.reload();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>SportCenter</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{screenTitles[currentScreen].title}</span>
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {screenTitles[currentScreen].title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher Demo */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium">Vai trò:</span>
              <select
                aria-label="Chuyển vai trò demo"
                value="member"
                onChange={(e) => {
                  const role = e.target.value;
                  if (role === "coach") window.location.hash = "coach-portal";
                  else if (role === "admin") window.location.hash = "dashboard";
                  else if (role === "receptionist") window.location.hash = "receptionist";
                  else window.location.hash = "member";
                }}
                className="bg-transparent border-none text-xs font-semibold text-emerald-600 dark:text-emerald-400 outline-none cursor-pointer"
              >
                <option value="member" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                  Hội viên (Member)
                </option>
                <option value="coach" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                  HLV (Coach)
                </option>
                <option value="receptionist" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                  Lễ tân (Receptionist)
                </option>
                <option value="admin" className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                  Quản lý (Manager)
                </option>
              </select>
            </div>

            {/* Dark/Light mode toggle */}
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                title="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Thông báo mới ({notificationCount})</span>
                    <button
                      type="button"
                      onClick={() => setNotificationCount(0)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      Đã đọc hết
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Nhắc lịch tập: Yoga Cân Bằng</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Ngày mai lúc 07:00 tại Studio 2 với HLV Minh Tuấn</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">Bài tập mới từ HLV Enam</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">HLV đã giao nhiệm vụ chạy bộ phục hồi 20 phút</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Mini */}
            <div
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer"
            >
              <UserAvatar src={avatarUrl} name={userName} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700" />
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
