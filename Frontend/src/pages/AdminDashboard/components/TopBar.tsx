import React, { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { avatarTopbar, iSearch, iBell } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';
import { notificationApi, type ManagerNotification } from '../../../hooks/notificationApi';
import { ThemeToggle } from '../../../components/ThemeToggle';

export function TopBar({ breadcrumb, title, onProfileClick, onNotificationClick }: { breadcrumb: string; title: string; onProfileClick?: () => void; onNotificationClick?: (notification: ManagerNotification) => void }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ManagerNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  useEffect(() => {
    let cancelled = false;
    setIsNotificationsLoading(true);
    setNotificationsError(false);

    notificationApi.list()
      .then(data => {
        if (!cancelled) setNotifications(data);
      })
      .catch(() => {
        if (!cancelled) setNotificationsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsNotificationsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isNotificationsOpen]);

  const markAsRead = async (notification: ManagerNotification) => {
    if (notification.isRead || notification.id.startsWith('derived-')) return;

    try {
      await notificationApi.markRead(notification.id);
      setNotifications(current => current.map(item =>
        item.id === notification.id ? { ...item, isRead: true } : item
      ));
    } catch {
      // Giữ thông báo chưa đọc nếu API đánh dấu thất bại.
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(current => current.map(item => ({ ...item, isRead: true })));
    } catch {
      // Không làm gián đoạn thao tác của Manager nếu cập nhật trạng thái thất bại.
    }
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const userStr = localStorage.getItem("user");
  let userName = "Admin";
  let avatarUrl = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userName = user.fullName || user.name || user.email?.split('@')[0] || "Admin";
      avatarUrl = user.avatarUrl;
    } catch(e) {}
  }

  return (
    <header className="manager-topbar flex justify-between items-center px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">{breadcrumb}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
      </div>
      <div className="flex gap-3 items-center">
        <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 items-center gap-2 px-3 py-2.5 rounded-xl w-[260px] border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <img src={iSearch} alt="" className="size-4 shrink-0 opacity-50" />
          <input 
            type="text" 
            placeholder="Tìm hội viên, lớp..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 w-full"
          />
        </div>
        <ThemeToggle className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/90 hover:bg-indigo-50 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/80 hover:border-indigo-200 dark:border-slate-700/80 text-slate-600 hover:text-indigo-600 dark:text-amber-400 dark:hover:text-amber-300 transition-all shadow-2xs cursor-pointer group" />
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            aria-label="Thông báo"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all shadow-2xs relative cursor-pointer group ${
              isNotificationsOpen
                ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100/90 hover:bg-emerald-50/80 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border-slate-200/80 hover:border-emerald-200 dark:border-slate-700/80 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
            }`}
          >
            <Bell className="w-[17px] h-[17px] group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="font-bold text-slate-800 dark:text-white">Thông báo</p>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  Đánh dấu đã đọc
                </button>
              </div>
              {isNotificationsLoading ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">Đang tải thông báo...</div>
              ) : notificationsError ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm font-medium text-rose-500">Không thể tải thông báo.</p>
                  <p className="mt-1 text-xs text-slate-400">Vui lòng thử lại sau.</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <img src={iBell} alt="" className="mx-auto mb-3 size-8 opacity-30" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có thông báo mới</p>
                  <p className="mt-1 text-xs text-slate-400">Các cập nhật quan trọng sẽ hiển thị tại đây.</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notification => (
                    <button
                      type="button"
                      key={notification.id}
                      onClick={() => {
                        void markAsRead(notification);
                        setIsNotificationsOpen(false);
                        onNotificationClick?.(notification);
                      }}
                      className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${notification.isRead ? '' : 'bg-emerald-50/60 dark:bg-emerald-950/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-emerald-500'}`} />
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
        </div>
        <UserAvatar 
          src={avatarUrl} 
          name={userName}
          className="rounded-full size-11 object-cover cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors shadow-sm" 
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}
