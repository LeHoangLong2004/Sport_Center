import React from "react";
import type { ManagerNotification } from "../../../../hooks/notificationApi";

interface Props {
  notifications: ManagerNotification[];
  notificationsError: boolean;
  notificationCount: number;
  onMarkRead: (notification: ManagerNotification) => void;
  onMarkAllRead: () => void;
  onSelectSchedule: () => void;
}

export default function MemberNotificationDropdown({
  notifications,
  notificationsError,
  notificationCount,
  onMarkRead,
  onMarkAllRead,
  onSelectSchedule,
}: Props) {
  const formatNotificationTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <span className="font-bold text-slate-800 dark:text-white">Thông báo</span>
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={notificationCount === 0}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400 cursor-pointer"
        >
          Đánh dấu đã đọc
        </button>
      </div>

      {notificationsError ? (
        <div className="px-4 py-8 text-center text-sm text-rose-500">
          Không thể tải thông báo.
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400">
          Chưa có thông báo mới.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() => {
                onMarkRead(notification);
                if (
                  notification.targetType === "class" ||
                  notification.targetType === "booking" ||
                  notification.type === "booking_event"
                ) {
                  onSelectSchedule();
                }
              }}
              className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-emerald-50/50 dark:border-slate-800 dark:hover:bg-slate-800/70 cursor-pointer ${
                notification.isRead ? "" : "bg-emerald-50/60 dark:bg-emerald-950/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${
                    notification.isRead ? "bg-slate-300" : "bg-emerald-500"
                  }`}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-white">
                    {notification.title}
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
  );
}
