import React, { useState, useEffect } from 'react';

export function ClassDetailModal({ classId, onClose, onEdit, onApproval }: { classId: string, onClose: () => void, onEdit: (data: any) => void, onApproval?: (action: 'approve' | 'reject') => Promise<boolean> }) {
  const [classDetail, setClassDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

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
          onClose(); // Trigger refresh and close modal after showing success
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-fade-in-up">
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
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
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
              {/* Proposal Banner */}
              {isPendingProposal && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">Đề xuất lịch dạy từ HLV {classDetail.coachName || 'Coach'}</p>
                    <p className="text-amber-700 mt-0.5">Vui lòng kiểm tra kỹ thời gian và phòng tập trước khi phê duyệt.</p>
                  </div>
                </div>
              )}

              {/* Class Title Card */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
                    {classDetail.sportName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                    📍 {classDetail.facilityName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {classDetail.className}
                </h3>
              </div>

              {/* Info Grid (4 compact stat cards) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời gian</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {new Date(classDetail.scheduleTime).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(classDetail.scheduleTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({classDetail.durationMinutes}p)
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Huấn luyện viên</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={classDetail.coachName || 'Chưa phân công'}>
                    {classDetail.coachName || 'Chưa phân công'}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">HLV phụ trách</p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phòng tập</span>
                  <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={classDetail.facilityName}>
                    {classDetail.facilityName}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Địa điểm</p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sĩ số</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    <span className="text-emerald-600">{classDetail.currentEnrolled}</span> / {classDetail.capacity}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Học viên tối đa</p>
                </div>
              </div>

              {/* Members Section / Pending Note */}
              {isPendingProposal ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
                  <p className="text-xs font-semibold text-slate-700">Lớp học chưa mở đăng ký</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hội viên chỉ có thể thấy và đăng ký sau khi lớp học được Quản lý phê duyệt.
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Danh sách học viên ({classDetail.enrolledMembers?.length || 0})
                  </h4>
                  
                  {classDetail.enrolledMembers?.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-xs">
                            <th className="py-2.5 px-3.5 font-semibold text-slate-600">Họ và tên</th>
                            <th className="py-2.5 px-3.5 font-semibold text-slate-600">Số điện thoại</th>
                            <th className="py-2.5 px-3.5 font-semibold text-slate-600">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {classDetail.enrolledMembers.map((m: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-3.5 font-medium text-slate-800">{m.fullName}</td>
                              <td className="py-2.5 px-3.5 text-slate-600">{m.phoneNumber}</td>
                              <td className="py-2.5 px-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  (m.bookingStatus || m.status) === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                  (m.bookingStatus || m.status) === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                  (m.bookingStatus || m.status) === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                  (m.bookingStatus || m.status) === 'attended' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                  (m.bookingStatus || m.status) === 'no_show' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                  (m.bookingStatus || m.status) === 'cancelled' ? 'bg-gray-100 text-gray-700 border border-gray-200' : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {(m.bookingStatus || m.status) === 'confirmed' ? '🟢 Đã đăng ký' : 
                                   (m.bookingStatus || m.status) === 'pending' ? '⏳ Chờ duyệt' : 
                                   (m.bookingStatus || m.status) === 'rejected' ? '❌ Bị từ chối' : 
                                   (m.bookingStatus || m.status) === 'attended' ? '🔵 Đã tham gia' : 
                                   (m.bookingStatus || m.status) === 'no_show' ? '🟡 Vắng mặt' : 
                                   (m.bookingStatus || m.status) === 'cancelled' ? '⚪ Đã hủy' : (m.bookingStatus || m.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                      <p className="text-xs text-slate-500">Chưa có học viên nào đăng ký lớp này.</p>
                    </div>
                  )}
                </div>
              )}
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
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-xs transition hover:bg-rose-50 hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sửa thông tin
            </button>
            <button 
              onClick={() => classDetail.status === false ? setShowConfirmRestore(true) : setShowConfirmCancel(true)}
              disabled={isCancelling || isRestoring}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 ${classDetail.status === false ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400' : 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'}`}
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
              <p className="text-gray-600">
                {notification.message}
              </p>
              {notification.type === 'error' && (
                <button 
                  onClick={() => setNotification(null)}
                  className="mt-4 px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors w-full"
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
                  onClick={() => setShowConfirmCancel(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Không, quay lại
                </button>
                <button 
                  onClick={handleCancelClass}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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
                  onClick={() => setShowConfirmRestore(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Không, quay lại
                </button>
                <button
                  onClick={handleRestoreClass}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Có, khôi phục lớp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
