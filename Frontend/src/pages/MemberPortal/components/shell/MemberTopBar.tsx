import { useState, useRef, useEffect } from "react";
import type { MemberScreen } from "../../types";
import { UserAvatar } from "../../../../components/UserAvatar";
import {
  Sun,
  Moon,
  Bell,
  QrCode,
  Crown,
  Wallet,
  Home,
} from "lucide-react";
import type { ManagerNotification } from "../../../../hooks/notificationApi";
import MemberNotificationDropdown from "./MemberNotificationDropdown";
import MemberUserDropdown from "./MemberUserDropdown";
import { BREADCRUMBS, PAGE_TITLES } from "./shellConstants";

interface MemberTopBarProps {
  currentScreen: MemberScreen;
  userName: string;
  userEmail: string;
  userTier: string;
  avatarUrl?: string;
  isDark: boolean;
  onToggleTheme: () => void;
  notifications: ManagerNotification[];
  notificationsError: boolean;
  notificationCount: number;
  onMarkNotificationRead: (n: ManagerNotification) => void;
  onMarkAllNotificationsRead: () => void;
  walletBalance: number;
  onOpenWalletModal: () => void;
  onOpenCheckInModal: () => void;
  onNavigate: (s: MemberScreen) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
}

export function MemberTopBar({
  currentScreen,
  userName,
  userEmail,
  userTier,
  avatarUrl,
  isDark,
  onToggleTheme,
  notifications,
  notificationsError,
  notificationCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  walletBalance,
  onOpenWalletModal,
  onOpenCheckInModal,
  onNavigate,
  onLogout,
  showToast,
}: MemberTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState<"vi" | "en">("vi");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchToInvoices = () => {
    setShowUserMenu(false);
    onNavigate("payments");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchToSecurity = () => {
    setShowUserMenu(false);
    onNavigate("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("switch-profile-tab", { detail: "security" }));
    }, 50);
  };

  return (
    <header className="flex justify-between items-center px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "home";
              window.dispatchEvent(new HashChangeEvent("hashchange"));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-none flex items-center gap-1"
            title="Quay lại Trang chủ SportCenter"
          >
            <Home className="w-3 h-3 text-emerald-500" />
            <span>TRANG CHỦ</span>
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => {
              onNavigate("dashboard");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="hover:text-emerald-500 transition-colors cursor-pointer focus:outline-none"
            title="Quay lại Tổng quan (Overview)"
          >
            HỘI VIÊN
          </button>
          <span>/</span>
          <span>{BREADCRUMBS[currentScreen]?.replace(/^HỘI VIÊN\s*\/\s*/, "") || "TỔNG QUAN"}</span>
        </p>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {PAGE_TITLES[currentScreen]}
        </h1>
      </div>

      <div className="relative flex items-center gap-3">
        {/* Return to Home Website Button */}
        <button
          id="btn-return-home"
          type="button"
          onClick={() => {
            window.location.hash = "home";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all shadow-xs cursor-pointer"
          title="Quay lại Trang chủ website"
        >
          <Home className="w-3.5 h-3.5 text-emerald-500" />
          <span>Trang chủ</span>
        </button>
        {/* Quick Check-in Button */}
        <button
          id="btn-quick-checkin"
          type="button"
          onClick={onOpenCheckInModal}
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
          onClick={onOpenWalletModal}
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
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <MemberNotificationDropdown
              notifications={notifications}
              notificationsError={notificationsError}
              notificationCount={notificationCount}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onMarkAllNotificationsRead}
              onSelectSchedule={() => {
                setShowNotifications(false);
                onNavigate("schedule");
              }}
            />
          )}
        </div>

        {/* USER AVATAR BUTTON WITH POPUP DROPDOWN */}
        <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition-all cursor-pointer focus:outline-none"
            title="Tài khoản cá nhân"
          >
            <UserAvatar
              src={avatarUrl}
              name={userName}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
          </button>

          {showUserMenu && (
            <MemberUserDropdown
              userName={userName}
              userEmail={userEmail}
              userTier={userTier}
              avatarUrl={avatarUrl}
              isDark={isDark}
              currentLang={currentLang}
              onNavigate={onNavigate}
              onClose={() => setShowUserMenu(false)}
              onToggleTheme={onToggleTheme}
              onToggleLang={() => {
                const next = currentLang === "vi" ? "en" : "vi";
                setCurrentLang(next);
                showToast(
                  next === "vi"
                    ? "Đã chuyển sang Tiếng Việt 🇻🇳"
                    : "Switched to English 🇬🇧 (Phiên bản đầy đủ đang cập nhật)"
                );
              }}
              onOpenCheckIn={onOpenCheckInModal}
              onOpenWallet={onOpenWalletModal}
              onSwitchToInvoices={handleSwitchToInvoices}
              onSwitchToSecurity={handleSwitchToSecurity}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </header>
  );
}
