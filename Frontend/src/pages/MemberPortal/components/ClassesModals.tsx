import React from 'react';

export function CancelBookingModal({
  show,
  onHide,
  onConfirm
}: {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
}) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Hủy đặt lớp?</h3>
          <p className="text-slate-500 font-medium text-sm">
            Bạn có chắc chắn muốn hủy đặt chỗ cho lớp học này không? Hành động này không thể hoàn tác.
          </p>
          <div className="flex items-center gap-3 w-full pt-4">
            <button
              onClick={onHide}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-600/20"
            >
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationModal({
  notification,
  onHide
}: {
  notification: { show: boolean; type: 'success' | 'error'; message: string };
  onHide: () => void;
}) {
  if (!notification.show) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          {notification.type === 'success' ? (
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
          ) : (
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
          )}
          <h3 className="text-xl font-bold text-slate-800">
            {notification.type === 'success' ? 'Thành công!' : 'Đã có lỗi xảy ra!'}
          </h3>
          <p className="text-slate-500 font-medium text-sm">
            {notification.message}
          </p>
          <div className="w-full pt-4">
            <button
              onClick={onHide}
              className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-teal-600/20"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
