import React, { useEffect, useRef, useState } from 'react';
import { avatarTopbar, iSearch, iBell } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';
import { notificationApi, type ManagerNotification } from '../../../hooks/notificationApi';

export function TopBar({ breadcrumb, title, onProfileClick }: { breadcrumb: string; title: string; onProfileClick?: () => void }) {
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
    <header className="flex justify-between items-center px-6 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{breadcrumb}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
      </div>
      <div className="flex gap-4 items-center">
        <div className="hidden md:flex bg-slate-100 dark:bg-slate-800/80 items-center gap-2 px-4 py-2.5 rounded-xl w-[260px] border border-transparent focus-within:border-rose-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <img src={iSearch} alt="" className="size-4 shrink-0 opacity-50" />
          <input 
            type="text" 
            placeholder="Tìm hội viên, lớp..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 w-full"
          />
        </div>
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            aria-label="Thông báo"
            aria-expanded={isNotificationsOpen}
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <img src={iBell} alt="" className="size-5 brightness-50 dark:brightness-150" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
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
                  className="text-xs font-semibold text-rose-500 transition-colors hover:text-rose-600 disabled:cursor-not-allowed disabled:text-slate-400"
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
                      onClick={() => void markAsRead(notification)}
                      className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70 ${notification.isRead ? '' : 'bg-rose-50/60 dark:bg-rose-950/20'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300' : 'bg-rose-500'}`} />
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
          className="rounded-full size-11 object-cover cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 transition-colors shadow-sm" 
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}
