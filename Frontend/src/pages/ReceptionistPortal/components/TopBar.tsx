import React, { useEffect, useRef, useState } from 'react';
import { breadcrumbs, A, Page } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';
import { notificationApi, type ManagerNotification } from '../../../hooks/notificationApi';
import { RoleSwitcher } from '../../../components/RoleSwitcher';

const DERIVED_READ_KEY = 'receptionist_read_derived_notifications';

function getReadDerivedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DERIVED_READ_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveReadDerivedId(id: string) {
  try {
    const list = getReadDerivedIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(DERIVED_READ_KEY, JSON.stringify(list));
    }
  } catch {}
}

function getRealtimeShift(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return "Ca sáng • Trực tuyến";
  } else if (hour >= 12 && hour < 18) {
    return "Ca chiều • Trực tuyến";
  } else if (hour >= 18 && hour < 22) {
    return "Ca tối • Trực tuyến";
  } else {
    return "Ca đêm • Trực tuyến";
  }
}

interface TopBarProps {
  breadcrumb: string;
  title: string;
  shiftLabel?: string;
  onProfileClick?: () => void;
  onNavigate?: (page: Page) => void;
}

export function TopBar({ breadcrumb, title, shiftLabel, onProfileClick, onNavigate }: TopBarProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ManagerNotification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(false);
  const [currentShift, setCurrentShift] = useState(getRealtimeShift());
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Cập nhật ca làm việc thời gian thực mỗi phút
  useEffect(() => {
    setCurrentShift(getRealtimeShift());
    const interval = setInterval(() => {
      setCurrentShift(getRealtimeShift());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  useEffect(() => {
    let cancelled = false;
    setIsNotificationsLoading(true);
    setNotificationsError(false);

    notificationApi.list()
      .then(data => {
        if (!cancelled) {
          const readDerived = getReadDerivedIds();
          const mapped = data.map(item => ({
            ...item,
            isRead: item.isRead || (item.id.startsWith('derived-') && readDerived.includes(item.id))
          }));
          setNotifications(mapped);
        }
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

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNotificationClick = async (notification: ManagerNotification) => {
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      if (notification.id.startsWith('derived-')) {
        saveReadDerivedId(notification.id);
        setNotifications(current => current.map(item =>
          item.id === notification.id ? { ...item, isRead: true } : item
        ));
      } else {
        try {
          await notificationApi.markRead(notification.id);
          setNotifications(current => current.map(item =>
            item.id === notification.id ? { ...item, isRead: true } : item
          ));
        } catch {
          // Giữ trạng thái chưa đọc nếu thất bại
        }
      }
    }

    // Đóng dropdown
    setIsNotificationsOpen(false);

    // Điều hướng đến đúng nghiệp vụ
    const lowerTitle = notification.title.toLowerCase();
    const lowerMsg = (notification.message || '').toLowerCase();
    if (
      notification.type === 'payment' ||
      notification.id === 'derived-pending-invoices' ||
      lowerTitle.includes('giao dịch') ||
      lowerTitle.includes('hóa đơn') ||
      lowerMsg.includes('hóa đơn') ||
      lowerMsg.includes('thanh toán')
    ) {
      onNavigate?.('counter-payments');
    } else if (notification.type === 'class' || notification.type === 'booking') {
      onNavigate?.('classes');
    } else if (notification.type === 'member') {
      onNavigate?.('lookup');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
    } catch {
      // Không làm gián đoạn
    }
    // Ghi nhận tất cả derived notifications là đã đọc
    notifications.forEach(n => {
      if (n.id.startsWith('derived-')) {
        saveReadDerivedId(n.id);
      }
    });
    setNotifications(current => current.map(item => ({ ...item, isRead: true })));
  };

  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  const userStr = localStorage.getItem("user");
  let userName = "Lễ tân";
  let avatarUrl = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userName = user.fullName || user.name || user.email?.split('@')[0] || "Lễ tân";
      avatarUrl = user.avatarUrl;
    } catch(e) {}
  }

  return (
    <header className="flex justify-between items-center px-6 lg:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-xl sticky top-0 z-30">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">{breadcrumb}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</p>
      </div>
      <div className="flex items-center gap-4">
        <RoleSwitcher currentRole="receptionist" />
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-200/50 dark:border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {currentShift}
        </div>
        <div ref={notificationsRef} className="relative">
        <button
          type="button"
          aria-label="Thông báo"
          aria-expanded={isNotificationsOpen}
          onClick={() => setIsNotificationsOpen(current => !current)}
          className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors"
        >
          <img src={`${A}/06b01.svg`} alt="" className="size-5 brightness-50 dark:brightness-150" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-purple-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        {isNotificationsOpen && (
          <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="font-bold text-slate-800 dark:text-white">Thông báo</p>
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline transition-colors disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
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
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map(notification => (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => void handleNotificationClick(notification)}
                    className={`block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70 group ${notification.isRead ? '' : 'bg-purple-50/60 dark:bg-purple-950/20'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/40'}`} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`text-sm font-semibold ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white font-bold'}`}>
                            {notification.title}
                          </span>
                          <span className="text-[11px] text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Xem ngay &rarr;
                          </span>
                        </span>
                        {notification.message && (
                          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {notification.message}
                          </span>
                        )}
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
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
          className="rounded-full size-11 object-cover cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors shadow-sm" 
          onClick={onProfileClick}
        />
      </div>
    </header>
  )
}
