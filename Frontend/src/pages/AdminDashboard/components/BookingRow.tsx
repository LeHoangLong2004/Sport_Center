import React, { useState } from 'react';
import { X } from 'lucide-react';

export function BookingRow({ 
  booking: b, 
  handleApprove, 
  handleReject 
}: { 
  booking: any; 
  handleApprove: (id: string) => void; 
  handleReject: (id: string) => void; 
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  let statusColor = "bg-gray-100 text-gray-700";
  if (b.status === "Confirmed") statusColor = "bg-green-100 text-green-700";
  if (b.status === "Pending") statusColor = "bg-yellow-100 text-yellow-700";
  if (b.status === "Rejected") statusColor = "bg-red-100 text-red-700 border border-red-200";
  if (b.status === "Cancelled") statusColor = "bg-gray-200 text-gray-600";

  return (
    <>
      <div className="border-[#e2e8f0] border-b border-solid flex items-center px-[24px] py-[12px] shrink-0 w-full hover:bg-slate-50 transition-colors">
      <div className="flex flex-1 gap-[10px] items-center min-w-0">
        <img src={b.memberAvatar} alt="" className="shrink-0 size-[32px] rounded-full object-cover" />
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-[#0f172a] text-[13px] truncate">{b.memberName}</span>
          <span className="font-medium text-[#64748b] text-[11px]">{b.memberPhone} • {b.memberCode}</span>
        </div>
      </div>
      <div className="flex flex-col w-[180px] shrink-0">
        <span className="font-bold text-[#0f172a] text-[13px] truncate">{b.className}</span>
        <span className="font-medium text-[#64748b] text-[11px] truncate">HLV: {b.coachName}</span>
      </div>
      <div className="flex flex-col w-[160px] shrink-0">
        <span className="font-medium text-[#0f172a] text-[13px] truncate">{new Date(b.startTime).toLocaleDateString('vi-VN')}</span>
        <span className="font-medium text-[#64748b] text-[11px]">{new Date(b.startTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div className="flex flex-col w-[160px] shrink-0">
        <span className="font-medium text-[#0f172a] text-[13px] truncate">{new Date(b.bookedAt).toLocaleDateString('vi-VN')}</span>
        <span className="font-medium text-[#64748b] text-[11px]">{new Date(b.bookedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
      </div>
      <div className="flex items-start w-[120px] shrink-0">
        <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${statusColor}`}>
          {b.status}
        </span>
      </div>
      <div className="flex items-center justify-end w-[80px] shrink-0 gap-2">
        {b.status === "Pending" ? (
          <>
            <button onClick={() => handleApprove(b.id)} className="text-green-600 hover:text-green-800 p-1 font-bold text-xs bg-green-50 rounded" title="Duyệt">✓</button>
            <button onClick={() => handleReject(b.id)} className="text-red-600 hover:text-red-800 p-1 font-bold text-xs bg-red-50 rounded" title="Từ chối">✗</button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
            title="Xem chi tiết đặt chỗ"
            aria-label={`Xem chi tiết đặt chỗ của ${b.memberName}`}
          >
            ...
          </button>
        )}
      </div>
    </div>

      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Chi tiết đặt chỗ</h2>
            <button
              type="button"
              onClick={() => setIsDetailsOpen(false)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Đóng chi tiết đặt chỗ"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <Detail label="Hội viên" value={b.memberName} />
            <Detail label="Mã hội viên" value={b.memberCode} />
            <Detail label="Lớp học" value={b.className} />
            <Detail label="Huấn luyện viên" value={b.coachName} />
            <Detail label="Trạng thái" value={b.status} />
            <Detail label="Thời gian học" value={formatDateTime(b.startTime)} />
            <Detail label="Đặt lúc" value={formatDateTime(b.bookedAt)} />
          </div>
          <button
            type="button"
            onClick={() => setIsDetailsOpen(false)}
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
        </div>
      )}
    </>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có dữ liệu";
  return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value || "Chưa có dữ liệu"}</span>
    </div>
  );
}
