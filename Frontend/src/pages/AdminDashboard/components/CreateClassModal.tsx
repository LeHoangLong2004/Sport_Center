import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCreateClassForm } from './createClass/useCreateClassForm';
import { CreateClassFormFields } from './createClass/CreateClassFormFields';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
  mode?: "manager" | "coach";
}

/**
 * Modal Tạo & Đề xuất lớp học mới (hoặc Cập nhật lớp học hiện có).
 * Được sử dụng chung bởi cả Manager (tạo lớp trực tiếp) và Coach (đề xuất mở lớp).
 */
export function CreateClassModal({ onClose, onSuccess, editData, mode = "manager" }: CreateClassModalProps) {
  const modalRootRef = useRef<HTMLDivElement>(null);

  const {
    isCoachMode,
    formData,
    setFormData,
    handleChange,
    sports,
    facilities,
    coaches,
    currentCoachName,
    loadingData,
    loading,
    error,
    success,
    leadTimeValidation,
    handleSubmit,
  } = useCreateClassForm({ editData, mode, onSuccess, onClose });

  // Khóa cuộn trang nền khi mở modal và khôi phục khi đóng
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const modalEl = modalRootRef.current;
    const scrollContainers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.manager-page-content, .portal-page-enter, [class*="overflow-y-auto"]'
      )
    ).filter((el) => !modalEl || !modalEl.contains(el));

    const originalContainerStyles = scrollContainers.map((el) => ({
      el,
      overflow: el.style.overflow,
    }));

    scrollContainers.forEach((el) => {
      el.style.overflow = 'hidden';
    });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      originalContainerStyles.forEach(({ el, overflow }) => {
        el.style.overflow = overflow;
      });
    };
  }, []);

  const modalContent = (
    <div
      ref={modalRootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overscroll-contain backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {isCoachMode ? "Đề xuất lớp học mới" : editData ? "Cập nhật thông tin lớp học" : "Tạo lớp học mới"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer">
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">{success}</div>}

            {isCoachMode && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-900 flex items-start gap-2.5">
                <span className="text-base leading-none shrink-0 mt-0.5">⏱️</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">Quy định thời gian đề xuất lớp</p>
                  <p className="text-slate-800 leading-relaxed">
                    Lớp học đề xuất phải bắt đầu sau thời điểm hiện tại <strong>tối thiểu 24 giờ</strong> để Ban quản lý kịp phê duyệt và mở cho Hội viên đăng ký.
                  </p>
                </div>
              </div>
            )}

            <CreateClassFormFields
              formData={formData}
              setFormData={setFormData}
              handleChange={handleChange}
              sports={sports}
              facilities={facilities}
              coaches={coaches}
              currentCoachName={currentCoachName}
              loadingData={loadingData}
              isCoachMode={isCoachMode}
              leadTimeValidation={leadTimeValidation}
            />

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || (leadTimeValidation !== null && !leadTimeValidation.valid)}
                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              >
                {loading ? 'Đang xử lý...' : (isCoachMode ? 'Gửi đề xuất mở lớp' : editData ? 'Lưu thay đổi' : 'Xác nhận tạo lớp')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
