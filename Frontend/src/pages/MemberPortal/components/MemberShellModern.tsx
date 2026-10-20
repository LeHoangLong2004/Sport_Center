import React, { useState, useEffect } from "react";
import type { MemberScreen } from "../types";
import { useUserProfile } from "../../../hooks/useUserProfile";
import { Sparkles } from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";
import WalletTopUpModal from "./WalletTopUpModal";
import { notificationApi, type ManagerNotification } from "../../../hooks/notificationApi";
import MemberSidebar from "./shell/MemberSidebar";
import MemberCheckInModal from "./shell/MemberCheckInModal";
import { MemberTopBar } from "./shell/MemberTopBar";

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
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return WalletService.getLocalWallet().balance;
  });
  const [showWalletModal, setShowWalletModal] = useState(false);

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
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, isRead: true } : item
        )
      );
    } catch {
      // Keep state on failure
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {
      // Keep state on failure
    }
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
      <MemberSidebar
        currentScreen={currentScreen}
        userName={userName}
        userTier={userTier}
        avatarUrl={avatarUrl}
        onNavigate={onNavigate}
        onLogout={handleLogout}
      />

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0">
        <MemberTopBar
          currentScreen={currentScreen}
          userName={userName}
          userEmail={userEmail}
          userTier={userTier}
          avatarUrl={avatarUrl}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
          notifications={notifications}
          notificationsError={notificationsError}
          notificationCount={notificationCount}
          onMarkNotificationRead={markNotificationAsRead}
          onMarkAllNotificationsRead={markAllNotificationsAsRead}
          walletBalance={walletBalance}
          onOpenWalletModal={() => setShowWalletModal(true)}
          onOpenCheckInModal={() => setShowCheckInModal(true)}
          onNavigate={onNavigate}
          onLogout={handleLogout}
          showToast={showToast}
        />

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* QUICK CHECK-IN QR PASS MODAL */}
      <MemberCheckInModal
        isOpen={showCheckInModal}
        userName={userName}
        memberCode={memberCode}
        userTier={userTier}
        onClose={() => setShowCheckInModal(false)}
      />

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

