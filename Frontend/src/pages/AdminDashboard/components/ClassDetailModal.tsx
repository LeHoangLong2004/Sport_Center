import React, { useState, useEffect } from 'react';

export function ClassDetailModal({ classId, onClose, onEdit }: { classId: string, onClose: () => void, onEdit: (data: any) => void }) {
  const [classDetail, setClassDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

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
    if (!confirm('Bạn có chắc chắn muốn hủy lớp học này không? Mọi lượt đăng ký của học viên cũng sẽ bị hủy bỏ.')) return;
    
    setIsCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/classes/${classId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã hủy lớp học thành công!');
        onClose(); // This will trigger fetchClasses in SchedulePage if we modify it
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.message || 'Không thể hủy lớp học lúc này.');
      }
    } catch (err) {
      alert('Lỗi kết nối khi hủy lớp học.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Chi Tiết Lớp Học</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">{error}</div>
          ) : classDetail ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-6 bg-blue-50/30 p-5 rounded-xl border border-blue-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Tên Lớp</p>
                  <p className="font-bold text-gray-900 text-lg">{classDetail.className}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Môn Học</p>
                  <p className="font-semibold text-gray-800">{classDetail.sportName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Thời Gian</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(classDetail.scheduleTime).toLocaleString('vi-VN')} ({classDetail.durationMinutes} phút)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Phòng Tập</p>
                  <p className="font-semibold text-gray-800">{classDetail.facilityName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Huấn Luyện Viên</p>
                  <p className="font-semibold text-gray-800">{classDetail.coachName || 'Chưa phân công'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Sĩ Số</p>
                  <p className="font-semibold text-gray-800">
                    <span className="text-blue-600">{classDetail.currentEnrolled}</span> / {classDetail.capacity}
                  </p>
                </div>
              </div>

              {/* Enrolled Members */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Danh sách học viên ({classDetail.enrolledMembers?.length || 0})
                </h3>
                
                {classDetail.enrolledMembers?.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                          <th className="py-3 px-4 font-semibold text-gray-600">Họ và tên</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Số điện thoại</th>
                          <th className="py-3 px-4 font-semibold text-gray-600">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {classDetail.enrolledMembers.map((m: any, i: number) => (
                          <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-800">{m.fullName}</td>
                            <td className="py-3 px-4 text-gray-600">{m.phoneNumber}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                (m.bookingStatus || m.status) === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                (m.bookingStatus || m.status) === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {(m.bookingStatus || m.status) === 'confirmed' ? 'Đã đăng ký' : (m.bookingStatus || m.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                    <p className="text-gray-500">Chưa có học viên nào đăng ký lớp này.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        {classDetail && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
            <button 
              onClick={() => onEdit(classDetail)} 
              className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sửa thông tin
            </button>
            <button 
              onClick={handleCancelClass}
              disabled={isCancelling}
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors flex items-center gap-2"
            >
              {isCancelling && (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isCancelling ? 'Đang xử lý...' : 'Hủy lớp học'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
