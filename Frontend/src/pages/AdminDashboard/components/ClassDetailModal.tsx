import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ClassDetailInfo } from './classDetail/ClassDetailInfo';
import { ClassEnrolledMembersTable } from './classDetail/ClassEnrolledMembersTable';
import { ClassActionModals, type ClassNotification } from './classDetail/ClassActionModals';

interface ClassDetailModalProps {
  classId: string;
  onClose: () => void;
  onEdit: (data: any) => void;
  onApproval?: (action: 'approve' | 'reject') => Promise<boolean>;
}

export function ClassDetailModal({ classId, onClose, onEdit, onApproval }: ClassDetailModalProps) {
  const modalRootRef = useRef<HTMLDivElement>(null);
  const [classDetail, setClassDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [notification, setNotification] = useState<ClassNotification | null>(null);

  // Lock background UI scrolling while modal is open, and restore when closed
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

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!onApproval) return;
    setIsApproving(true);
    const success = await onApproval(action);
    setIsApproving(false);
    if (success) onClose();
  };

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}`);
        if (res.ok) {
          const data = await res.json();
          setClassDetail(data);
        } else {
          setError('Không thể tải thông tin chi tiết lớp học.');
        }
      } catch (err) {
        setError('Lỗi kết nối khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetail();
  }, [classId]);

  const handleCancelClass = async () => {
    setShowConfirmCancel(false);
    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/classes/${classId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Đã hủy lớp học thành công!' });
        setTimeout(() => {
          setNotification(null);
          onClose();
        }, 2000);
      } else {
        const data = await res.json().catch(() => null);
        setNotification({ type: 'error', message: data?.message || 'Không thể hủy lớp học lúc này.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Lỗi kết nối khi hủy lớp học.' });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRestoreClass = async () => {
    setShowConfirmRestore(false);
    setIsRestoring(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/classes/${classId}/restore`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotification({ type: 'success', message: 'Đã khôi phục lớp học thành công!' });
        setTimeout(() => {
          setNotification(null);
          onClose();
        }, 2000);
      } else {
        const data = await res.json().catch(() => null);
        setNotification({ type: 'error', message: data?.message || 'Không thể khôi phục lớp học lúc này.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Lỗi kết nối khi khôi phục lớp học.' });
    } finally {
      setIsRestoring(false);
    }
  };

  const isPendingProposal = Boolean(
    classDetail && (
      classDetail.approvalStatus?.toLowerCase() === 'pending' ||
      classDetail.approval_status?.toLowerCase() === 'pending'
    )
  );

  const modalContent = (
    <div
      ref={modalRootRef}
      className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-xs overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">Chi tiết lớp học</h2>
            {isPendingProposal ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Chờ duyệt
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Đã duyệt
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center text-sm">{error}</div>
          ) : classDetail ? (
            <>
              <ClassDetailInfo
                classDetail={classDetail}
                isPendingProposal={isPendingProposal}
              />
              <ClassEnrolledMembersTable
                enrolledMembers={classDetail.enrolledMembers}
                isPendingProposal={isPendingProposal}
              />
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        {classDetail && isPendingProposal && onApproval ? (
          <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
            <button
              type="button"
              onClick={() => void handleApproval('reject')}
              disabled={isApproving}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-xs transition hover:bg-rose-50 hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Từ chối</span>
            </button>
            <button
              type="button"
              onClick={() => void handleApproval('approve')}
              disabled={isApproving}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isApproving ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Phê duyệt</span>
                </>
              )}
            </button>
          </div>
        ) : classDetail && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button 
              onClick={() => onEdit(classDetail)} 
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Sửa thông tin
            </button>
            <button 
              onClick={() => classDetail.status === false ? setShowConfirmRestore(true) : setShowConfirmCancel(true)}
              disabled={isCancelling || isRestoring}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${classDetail.status === false ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'}`}
            >
              {(isCancelling || isRestoring) && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {classDetail.status === false
                ? (isRestoring ? 'Đang xử lý...' : 'Khôi phục lớp học')
                : (isCancelling ? 'Đang xử lý...' : 'Hủy lớp học')}
            </button>
          </div>
        )}

        {/* Notification & Confirm Dialogs */}
        <ClassActionModals
          notification={notification}
          showConfirmCancel={showConfirmCancel}
          showConfirmRestore={showConfirmRestore}
          onCloseNotification={() => setNotification(null)}
          onCloseConfirmCancel={() => setShowConfirmCancel(false)}
          onConfirmCancel={handleCancelClass}
          onCloseConfirmRestore={() => setShowConfirmRestore(false)}
          onConfirmRestore={handleRestoreClass}
        />
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

export default ClassDetailModal;
