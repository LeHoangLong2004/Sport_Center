import React from 'react';

interface EnrolledMember {
  fullName: string;
  phoneNumber?: string;
  bookingStatus?: string;
  status?: string;
}

interface ClassEnrolledMembersTableProps {
  enrolledMembers?: EnrolledMember[];
  isPendingProposal: boolean;
}

function getBookingStatusBadge(status?: string) {
  switch (status) {
    case 'confirmed':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 border border-green-200">🟢 Đã đăng ký</span>;
    case 'pending':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">⏳ Chờ duyệt</span>;
    case 'rejected':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">❌ Bị từ chối</span>;
    case 'attended':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">🔵 Đã tham gia</span>;
    case 'no_show':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">🟡 Vắng mặt</span>;
    case 'cancelled':
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">⚪ Đã hủy</span>;
    default:
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">{status || 'Chưa xác định'}</span>;
  }
}

export function ClassEnrolledMembersTable({
  enrolledMembers = [],
  isPendingProposal,
}: ClassEnrolledMembersTableProps) {
  if (isPendingProposal) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
        <p className="text-xs font-semibold text-slate-700">Lớp học chưa mở đăng ký</p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Hội viên chỉ có thể thấy và đăng ký sau khi lớp học được Quản lý phê duyệt.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        Danh sách học viên ({enrolledMembers.length})
      </h4>

      {enrolledMembers.length > 0 ? (
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
              {enrolledMembers.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3.5 font-medium text-slate-800">{m.fullName}</td>
                  <td className="py-2.5 px-3.5 text-slate-600">{m.phoneNumber || 'N/A'}</td>
                  <td className="py-2.5 px-3.5">
                    {getBookingStatusBadge(m.bookingStatus || m.status)}
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
  );
}
