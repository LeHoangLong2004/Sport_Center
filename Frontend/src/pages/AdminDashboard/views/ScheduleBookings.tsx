import React, { useState, useEffect } from "react";
import { BookingRow } from "../components/BookingRow";

interface ScheduleBookingsProps {
  bookings: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ScheduleBookings({
  bookings,
  onApprove,
  onReject,
}: ScheduleBookingsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [bookings.length]);

  const totalPages = Math.ceil(bookings.length / rowsPerPage) || 1;
  const paginatedBookings = bookings.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full flex-1 min-h-0 shadow-xs">
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="min-w-[880px] w-full">
            <div className="bg-[#f8fafc] flex font-extrabold items-center px-[24px] py-[14px] text-[#64748b] text-[13px] w-full border-b border-[#e2e8f0] shrink-0 whitespace-nowrap select-none">
              <span className="flex-1 min-w-0">HỘI VIÊN</span>
              <span className="w-[180px] shrink-0">LỚP HỌC</span>
              <span className="w-[160px] shrink-0">THỜI GIAN</span>
              <span className="w-[160px] shrink-0">ĐẶT LÚC</span>
              <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
              <span className="w-[80px] shrink-0 text-right">THAO TÁC</span>
            </div>
            <div className="flex flex-col w-full">
              {paginatedBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  handleApprove={onApprove}
                  handleReject={onReject}
                />
              ))}
              {bookings.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-sm">
                  Chưa có dữ liệu đặt chỗ
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="flex h-14 items-center justify-between px-6 border-t border-[#e2e8f0] w-full shrink-0 bg-white">
          <span className="text-[#64748b] text-sm">
            Hiển thị {bookings.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, bookings.length)} trong tổng số {bookings.length} lượt đặt chỗ
          </span>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === 1 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
            >
              ‹ Trước
            </button>
            {getPageNumbers().map((p, i) => (
              <button 
                key={i} 
                type="button"
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                disabled={p === '...'}
                className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${p === currentPage ? "bg-emerald-600 font-semibold text-white shadow-xs shadow-emerald-600/20" : p === '...' ? "bg-transparent text-slate-400 cursor-default" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 cursor-pointer"}`}
              >
                {p}
              </button>
            ))}
            <button 
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${currentPage === totalPages ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50 transition-colors cursor-pointer"}`}
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
