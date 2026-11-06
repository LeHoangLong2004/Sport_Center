import React from 'react';

export interface ClassNotification {
  type: 'success' | 'error';
  message: string;
}

interface ClassActionModalsProps {
  notification: ClassNotification | null;
  showConfirmCancel: boolean;
  showConfirmRestore: boolean;
  onCloseNotification: () => void;
  onCloseConfirmCancel: () => void;
  onConfirmCancel: () => void;
  onCloseConfirmRestore: () => void;
  onConfirmRestore: () => void;
}

export function ClassActionModals({
  notification,
  showConfirmCancel,
  showConfirmRestore,
  onCloseNotification,
  onCloseConfirmCancel,
  onConfirmCancel,
  onCloseConfirmRestore,
  onConfirmRestore,
}: ClassActionModalsProps) {
  return (
    <>
      {/* Notification Overlay */}
      {notification && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            {notification.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <h3 className={`text-xl font-bold ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {notification.type === 'success' ? 'Thành công!' : 'Thất bại!'}
            </h3>
            <p className="text-gray-600 text-sm">
              {notification.message}
            </p>
            {notification.type === 'error' && (
              <button 
                onClick={onCloseNotification}
                className="mt-4 px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors w-full cursor-pointer"
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-red-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy lớp học</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Bạn có chắc chắn muốn hủy lớp học này không? Lớp học có thể được khôi phục sau đó nếu vẫn còn thời gian phù hợp.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={onCloseConfirmCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Không, quay lại
              </button>
              <button 
                onClick={onConfirmCancel}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Có, hủy lớp học
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmRestore && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M5.2 9A7 7 0 0117.9 6.1L20 9M18.8 15A7 7 0 016.1 17.9L4 15" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận khôi phục lớp học</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Lớp học sẽ hoạt động trở lại. Các lượt đăng ký trước đó sẽ được chuyển về trạng thái chờ duyệt lại.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onCloseConfirmRestore}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Không, quay lại
              </button>
              <button
                onClick={onConfirmRestore}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Có, khôi phục lớp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
