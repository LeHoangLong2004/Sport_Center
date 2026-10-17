import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { MemberScreen } from "../types";
import { UserAvatar } from "../../../components/UserAvatar";
import { useUserProfile } from "../../../hooks/useUserProfile";
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CreditCard,
  Receipt,
  Dumbbell,
  Star,
  MessageSquare,
  Bot,
  User,
  Sun,
  Moon,
  Bell,
  QrCode,
  Ticket,
  Activity,
  Lock,
  Globe,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Shield,
  X,
  Sparkles,
  Crown,
  KeyRound,
  FileText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";
import WalletTopUpModal from "./WalletTopUpModal";
import { notificationApi, type ManagerNotification } from "../../../hooks/notificationApi";

interface Props {
  currentScreen: MemberScreen;
  onNavigate: (screen: MemberScreen) => void;
  children: React.ReactNode;
}

export default function MemberShellModern({ currentScreen, onNavigate, children }: Props) {
  const [isDark, setIsDark] = useState(() => {
    return (
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark"
    );
  });

  const [notifications, setNotifications] = useState<ManagerNotification[]>([]);
  const [notificationsError, setNotificationsError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [currentLang, setCurrentLang] = useState<"vi" | "en">("vi");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return WalletService.getLocalWallet().balance;
  });
  const [showWalletModal, setShowWalletModal] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const notificationCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const data = await notificationApi.list();
        if (!cancelled) {
          setNotifications(data);
          setNotificationsError(false);
        }
      } catch {
        if (!cancelled) setNotificationsError(true);
      }
    };

    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const markNotificationAsRead = async (notification: ManagerNotification) => {
    if (notification.isRead || notification.id.startsWith("derived-")) return;
    try {
      await notificationApi.markRead(notification.id);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      ));
    } catch {
      // Keep the notification unread when the server update fails.
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {
      // Keep the current unread state when the server update fails.
    }
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Handle click outside for User Menu & Notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOpenCheckin = () => setShowCheckInModal(true);
    const handleOpenWallet = () => setShowWalletModal(true);
    const handleWalletUpdate = (e: any) => {
      if (e?.detail?.balance !== undefined) {
        setWalletBalance(e.detail.balance);
      } else {
        setWalletBalance(WalletService.getLocalWallet().balance);
      }
    };

    window.addEventListener("open-checkin-modal", handleOpenCheckin);
    window.addEventListener("open-wallet-modal", handleOpenWallet);
    window.addEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdate);

    return () => {
      window.removeEventListener("open-checkin-modal", handleOpenCheckin);
      window.removeEventListener("open-wallet-modal", handleOpenWallet);
      window.removeEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdate);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    WalletService.getWallet().then((w) => {
      if (!cancelled && typeof w.balance === "number") {
        setWalletBalance(w.balance);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load reactive profile
  const { profile } = useUserProfile("member");
  const userStr = localStorage.getItem("user");
  let userName = profile?.fullName;
  let userEmail = profile?.email;
  let avatarUrl = profile?.avatarUrl;
  let memberCode = profile?.id ? profile.id.substring(0, 8).toUpperCase() : "";
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role?.toLowerCase() !== "coach") {
        if (!userName) userName = u.fullName || u.name;
        userEmail = userEmail || u.email;
        avatarUrl = avatarUrl || u.avatarUrl;
      }
      if (!memberCode && u.id) {
        memberCode = String(u.id).substring(0, 8).toUpperCase();
      }
    } catch (e) {}
  }
  userName = userName || "Hội viên";
  userEmail = userEmail || "";
  const userTier = profile?.memberTier || "Thành viên mới";
  memberCode = memberCode ? `MEM-${memberCode}` : "MEM-OFFICIAL";

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    window.location.hash = "login";
    window.location.reload();
  };

  const handleSwitchToInvoices = () => {
    setShowUserMenu(false);
    onNavigate("profile");
    // Dispatch custom event to switch profile tab to payments
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("switch-profile-tab", { detail: "payments" }));
    }, 50);
  };

  const handleSwitchToSecurity = () => {
    setShowUserMenu(false);
    onNavigate("profile");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("switch-profile-tab", { detail: "security" }));
    }, 50);
  };

  // Core menu items on the sidebar (Thanh toán & Hóa đơn đã được đưa vào Profile)
  const menuItems: { id: MemberScreen; label: string; icon: any }[] = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "booking", label: "Khám phá & Đặt lịch", icon: Compass },
    { id: "schedule", label: "Lịch của tôi", icon: CalendarCheck },
    { id: "packages", label: "Gói tập của tôi", icon: CreditCard },
    { id: "shop", label: "Cửa hàng", icon: ShoppingBag },
    { id: "workouts", label: "Giáo án & Bài tập", icon: Dumbbell },
    { id: "reviews", label: "Đánh giá HLV", icon: Star },
    { id: "chat", label: "Tin nhắn", icon: MessageSquare },
    { id: "support", label: "Trợ lý AI & Hỗ trợ", icon: Bot },
    { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  ];

  const breadcrumbs: Record<MemberScreen, string> = {
    dashboard: "HỘI VIÊN / TỔNG QUAN",
    booking: "HỘI VIÊN / KHÁM PHÁ & ĐẶT LỊCH",
    schedule: "HỘI VIÊN / LỊCH CỦA TÔI",
    packages: "HỘI VIÊN / GÓI TẬP & DỊCH VỤ",
    payments: "HỘI VIÊN / HỒ SƠ & HÓA ĐƠN",
    workouts: "HỘI VIÊN / GIÁO ÁN & BÀI TẬP",
    reviews: "HỘI VIÊN / ĐÁNH GIÁ HLV",
    chat: "HỘI VIÊN / TIN NHẮN TRAO ĐỔI",
    support: "HỘI VIÊN / TRỢ LÝ AI & HỖ TRỢ",
    shop: "HỘI VIÊN / CỬA HÀNG SẢN PHẨM",
    profile: "HỘI VIÊN / HỒ SƠ CÁ NHÂN",
  };

  const pageTitles: Record<MemberScreen, string> = {
    dashboard: "Tổng quan hôm nay",
    booking: "Khám phá & Đặt lịch tập",
    schedule: "Lịch tập của tôi",
    packages: "Gói tập & Dịch vụ",
    payments: "Hồ sơ & Lịch sử giao dịch",
    workouts: "Giáo án & Bài tập",
    reviews: "Đánh giá Huấn luyện viên",
    chat: "Tin nhắn & Trao đổi",
    support: "Trợ lý AI & Hỗ trợ",
    shop: "Cửa hàng sản phẩm & Đồ tập",
    profile: "Hồ sơ cá nhân",
  };

  return (
    <div className="flex w-full min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-emerald-500 selection:text-white">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 dark:text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[250px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar z-30 select-none">
        {/* Brand */}
        <div
          className="flex gap-[12px] items-center shrink-0 w-full cursor-pointer"
          onClick={() => onNavigate("dashboard")}
        >
          <div className="bg-[#10b981] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-emerald-500/20">
            <span className="font-bold text-white text-[18px]">SC</span>
          </div>
          <div className="flex flex-col gap-[2px] items-start shrink-0">
            <span className="font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide">
              SPORTCENTER
            </span>
            <span className="font-bold text-[#10b981] text-[10px] whitespace-nowrap uppercase tracking-widest">
              MEMBER PORTAL
            </span>
          </div>
        </div>

        {/* Navigation Items (9 items) */}
        <div className="flex flex-col gap-[4px] items-start shrink-0 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#10b981] text-white shadow-md shadow-emerald-500/25 font-bold"
                    : "bg-transparent text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <div className="shrink-0 size-5 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span className="flex-1 text-[13px] leading-normal tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto"></div>

        {/* User profile widget at bottom of sidebar */}
        <div className="pt-2 w-full border-t border-[#1e293b]">
          <div
            className="cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden"
            onClick={() => onNavigate("profile")}
          >
            <UserAvatar
              src={avatarUrl || undefined}
              name={userName}
              className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#10b981] transition-colors"
            />
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <strong className="font-bold text-white text-[13px] truncate">{userName}</strong>
              <small className="text-[#94a3b8] text-[11px] truncate">{userTier}</small>
            </div>
            <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-[#0f172a]/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.hash = "home";
                }}
                className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors"
                title="Trang chủ"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="flex justify-between items-center px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-30">
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">
              {breadcrumbs[currentScreen]}
            </p>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {pageTitles[currentScreen]}
            </h1>
          </div>

          <div className="relative flex items-center gap-3">
            {/* Quick Check-in Button on Topbar */}
            <button
              id="btn-quick-checkin"
              type="button"
              onClick={() => setShowCheckInModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20 transition-all shadow-xs cursor-pointer"
              title="Mở mã QR cá nhân để quét vào cổng"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Mã Check-in</span>
            </button>

            {/* Wallet Balance Pill */}
            <button
              id="btn-member-wallet"
              type="button"
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-500/30 transition-all shadow-xs cursor-pointer group"
              title="Xem số dư tài khoản & Nạp tiền vào ví"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Ví: {walletBalance.toLocaleString("vi-VN")} đ</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black group-hover:bg-emerald-500 transition-colors">
                + Nạp
              </span>
            </button>

            {/* Membership Tier Pill */}
            <div
              onClick={() => onNavigate("packages")}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-200/60 dark:border-amber-500/20 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{userTier}</span>
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

            {/* Notifications Toggle */}
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
              {false && showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Thông báo mới ({notificationCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => void markAllNotificationsAsRead()}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Đã đọc hết
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Nhắc lịch tập: Yoga Cân Bằng
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Ngày mai lúc 07:00 tại Studio Yoga với HLV Minh Tuấn
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        Ưu đãi gia hạn Hạng Premium VIP
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        Bạn nhận được voucher giảm thêm 10% khi gia hạn kỳ hạn 3 tháng
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showNotifications && (
              <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-white">Thông báo</span>
                  <button
                    type="button"
                    onClick={() => void markAllNotificationsAsRead()}
                    disabled={notificationCount === 0}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
                {notificationsError ? (
                  <div className="px-4 py-8 text-center text-sm text-rose-500">Không thể tải thông báo.</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">Chưa có thông báo mới.</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => {
                          void markNotificationAsRead(notification);
                          if (notification.targetType === "class" || notification.targetType === "booking" || notification.type === "booking_event") {
                            setShowNotifications(false);
                            onNavigate("schedule");
                          }
                        }}
                        className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${notification.isRead ? "" : "bg-emerald-50/60 dark:bg-emerald-950/20"}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300" : "bg-emerald-500"}`} />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-slate-800 dark:text-white">{notification.title}</span>
                            {notification.message && <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{notification.message}</span>}
                            <span className="mt-1 block text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</span>
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* USER AVATAR BUTTON WITH POPUP DROPDOWN (LIKE YOUTUBE) */}
            <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer focus:outline-none"
                title="Tài khoản cá nhân"
              >
                <UserAvatar
                  src={avatarUrl || undefined}
                  name={userName}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
              </button>

              {/* YOUTUBE-STYLE RICH DROPDOWN MENU */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50 text-slate-800 dark:text-slate-200 animate-scaleUp divide-y divide-slate-100 dark:divide-slate-800">
                  {/* HEADER: USER IDENTITY */}
                  <div className="p-3 pb-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        src={avatarUrl || undefined}
                        name={userName}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {userName}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                          <Crown className="w-3 h-3 text-amber-500" />
                          {userTier}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("profile");
                      }}
                      className="mt-3 w-full py-1.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      Xem & chỉnh sửa hồ sơ cá nhân →
                    </button>
                  </div>

                  {/* GROUP 1: TÀI CHÍNH & GÓI TẬP */}
                  <div className="py-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("packages");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span className="flex-1">Gói dịch vụ & Nâng cấp hạng</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchToInvoices}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-4 h-4 text-blue-500" />
                      <span className="flex-1">Lịch sử giao dịch & Hóa đơn</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-md">
                        Mới
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("packages");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-purple-500" />
                      <span className="flex-1">Ví đặc quyền (2 vé mời bạn)</span>
                    </button>
                  </div>

                  {/* GROUP 2: TẬP LUYỆN & CHECK-IN */}
                  <div className="py-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("workouts");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-orange-500" />
                      <span className="flex-1">Giáo án & Bài tập HLV giao</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("profile");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Activity className="w-4 h-4 text-pink-500" />
                      <span className="flex-1">Chỉ số cơ thể & InBody</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowCheckInModal(true);
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-teal-500" />
                      <span className="flex-1">Mã QR cá nhân Check-in</span>
                    </button>
                  </div>

                  {/* GROUP 3: CÀI ĐẶT & TIỆN ÍCH */}
                  <div className="py-1.5 space-y-0.5">
                    {/* Theme switcher */}
                    <button
                      type="button"
                      onClick={() => setIsDark(!isDark)}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {isDark ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Giao diện: {isDark ? "Tối (Dark)" : "Sáng (Light)"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Đổi
                      </span>
                    </button>

                    {/* Language switcher */}
                    <button
                      type="button"
                      onClick={() => {
                        const next = currentLang === "vi" ? "en" : "vi";
                        setCurrentLang(next);
                        showToast(
                          next === "vi"
                            ? "Đã chuyển sang Tiếng Việt 🇻🇳"
                            : "Switched to English 🇬🇧 (Phiên bản đầy đủ đang cập nhật)"
                        );
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>Ngôn ngữ:</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        {currentLang === "vi" ? "Tiếng Việt 🇻🇳" : "English 🇬🇧"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchToSecurity}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span className="flex-1">Đổi mật khẩu & Bảo mật</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate("support");
                      }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-indigo-500" />
                      <span className="flex-1">Trợ lý AI & Hỗ trợ kỹ thuật</span>
                    </button>
                  </div>

                  {/* GROUP 4: ĐĂNG XUẤT */}
                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* QUICK CHECK-IN QR PASS MODAL (PORTAL) */}
      {showCheckInModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-scaleUp">
              <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  SPORTCENTER PASS
                </span>
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Container */}
              <div className="my-6 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/40 flex flex-col items-center shadow-inner relative">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  {/* Clean SVG QR mockup */}
                  <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    {/* Top-left corner box */}
                    <rect x="10" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                    <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
                    <rect x="18" y="18" width="8" height="8" rx="1" fill="#10b981" />
                    {/* Top-right corner box */}
                    <rect x="66" y="10" width="24" height="24" rx="4" fill="#0f172a" />
                    <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
                    <rect x="74" y="18" width="8" height="8" rx="1" fill="#10b981" />
                    {/* Bottom-left corner box */}
                    <rect x="10" y="66" width="24" height="24" rx="4" fill="#0f172a" />
                    <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
                    <rect x="18" y="74" width="8" height="8" rx="1" fill="#10b981" />
                    {/* Data dots */}
                    <rect x="40" y="12" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="50" y="18" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="42" y="26" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="52" y="32" width="6" height="6" rx="1" fill="#10b981" />
                    <rect x="20" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="30" y="48" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="68" y="42" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="78" y="50" width="6" height="6" rx="1" fill="#10b981" />
                    <rect x="40" y="66" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="50" y="72" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="42" y="80" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="68" y="70" width="6" height="6" rx="1" fill="#0f172a" />
                    <rect x="76" y="82" width="6" height="6" rx="1" fill="#0f172a" />
                  </svg>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Sẵn sàng quét vào cổng</span>
                </div>
              </div>

              <h4 className="text-base font-black text-slate-900 dark:text-white">{userName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Mã số: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{memberCode}</span>
              </p>
              <div className="mt-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>{userTier}</span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                Đưa mã này vào máy quét tại cửa vào hoặc xuất trình cho Lễ tân để check-in ca tập.
              </p>

              <button
                type="button"
                onClick={() => setShowCheckInModal(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs transition-colors"
              >
                Đóng thẻ
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Wallet TopUp & Balance Modal */}
      <WalletTopUpModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBalance={walletBalance}
        userName={userName}
        phone={profile?.phone}
        onSuccess={(newBal) => {
          setWalletBalance(newBal);
        }}
      />
    </div>
  );
}
