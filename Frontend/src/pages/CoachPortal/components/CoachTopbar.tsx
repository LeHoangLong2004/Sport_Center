import { useState, useEffect, useRef } from "react";
import { CoachScreen } from "../types";
import { breadcrumbs, pageTitles } from "../constants";
import { IconBell } from "../Icons";
import { notificationApi, type ManagerNotification } from "../../../hooks/notificationApi";

function getShiftName() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Ca sáng";
  if (hour >= 12 && hour < 18) return "Ca chiều";
  if (hour >= 18 && hour < 22) return "Ca tối";
  return "Ca đêm";
}

export default function CoachTopbar({ screen }: { screen: CoachScreen }) {
  const [shift, setShift] = useState(getShiftName());
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ManagerNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const loadNotifications = async () => {
    setIsNotificationsLoading(true);
    setNotificationsError(false);
    try {
      setNotifications(await notificationApi.list());
    } catch {
      setNotificationsError(true);
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setShift(getShiftName()), 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => void loadNotifications(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const markAsRead = async (notification: ManagerNotification) => {
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

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch {
      // Keep the current unread state when the server update fails.
    }
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
  };

  return (
    <header className="flex justify-between items-center px-6 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{breadcrumbs[screen]}</p>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{pageTitles[screen]}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs rounded-full border border-orange-200/50 dark:border-orange-500/20">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          Đang trực tuyến • {shift}
        </div>
        <div ref={notificationsRef} className="relative">
          <button
            className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Thông báo"
            aria-expanded={isNotificationsOpen}
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold border-2 border-white dark:border-slate-900 rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-white">Thông báo</p>
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  disabled={unreadCount === 0}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 disabled:cursor-default disabled:text-slate-400"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              {isNotificationsLoading ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Đang tải thông báo...</div>
              ) : notificationsError ? (
                <div className="px-4 py-8 text-center text-sm text-rose-500">Không thể tải thông báo.</div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Chưa có thông báo mới.</div>
              ) : (
                <div className="max-h-[min(420px,calc(100vh-8rem))] overflow-y-auto">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => {
                        void markAsRead(notification);
                        setIsNotificationsOpen(false);
                        if (notification.targetType === "class") {
                          window.dispatchEvent(new Event("coach-schedule-updated"));
                          window.location.hash = "#coach-schedule";
                        } else if (notification.type !== "payment") {
                          window.location.hash = "#coach-notifications";
                        }
                      }}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-orange-50/60 dark:border-slate-800 dark:hover:bg-slate-800/70 ${notification.isRead ? "" : "bg-orange-50/60 dark:bg-orange-950/20"}`}
                    >
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300" : "bg-orange-500"}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-slate-800 dark:text-white">{notification.title}</span>
                        {notification.message && <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{notification.message}</span>}
                        <span className="mt-1 block text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
