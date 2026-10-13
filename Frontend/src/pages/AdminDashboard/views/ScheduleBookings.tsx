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
  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col items-start overflow-hidden rounded-[12px] shrink-0 w-full flex-1 min-h-0">
      <div className="flex flex-col w-full h-full overflow-hidden">
        <div className="bg-[#f1f5f9] flex font-['Manrope:ExtraBold'] font-extrabold items-center px-[24px] py-[14px] text-[#64748b] text-[13px] w-full border-b border-[#e2e8f0] shrink-0">
          <span className="flex-1 min-w-0">HỘI VIÊN</span>
          <span className="w-[180px] shrink-0">LỚP HỌC</span>
          <span className="w-[160px] shrink-0">THỜI GIAN</span>
          <span className="w-[160px] shrink-0">ĐẶT LÚC</span>
          <span className="w-[120px] shrink-0">TRẠNG THÁI</span>
          <span className="w-[80px] shrink-0 text-right">THAO TÁC</span>
        </div>
        <div className="flex flex-col flex-1 w-full overflow-y-auto">
          {bookings.map((booking) => (
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
  );
}
