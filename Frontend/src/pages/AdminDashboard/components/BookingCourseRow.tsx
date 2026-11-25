import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { UserAvatar } from "../../../components/UserAvatar";
import { formatCenterDate, formatCenterTime, formatCenterDateTime } from "../../../utils/scheduleTimeHelper";

interface Props {
  bookings: any[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
}

const cleanCourseName = (name: string) => name.replace(/\s*\(Buổi\s+\d+\)\s*$/i, "").trim();

export function BookingCourseRow({ bookings, handleApprove, handleReject }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [bookings],
  );
  const first = sortedBookings[0];
  const earliestBooking = [...bookings].sort((a, b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime())[0];
  const statuses = [...new Set(sortedBookings.map((booking) => booking.status))];
  const status = statuses.length === 1 ? statuses[0] : `${statuses.length} trạng thái`;
  const statusColor = status === "Confirmed"
    ? "bg-green-100 text-green-700"
    : status === "Pending"
      ? "bg-slate-100 text-slate-700"
      : status === "Rejected"
        ? "bg-red-100 text-red-700 border border-red-200"
        : status === "Cancelled"
          ? "bg-gray-200 text-gray-600"
          : "bg-amber-100 text-amber-800";
  const pendingCount = sortedBookings.filter((booking) => booking.status === "Pending").length;
  const courseName = cleanCourseName(first.className || "Lớp học");

  return (
    <>
      <div className="border-[#e2e8f0] border-b flex items-center px-6 py-3 w-full hover:bg-slate-50 transition-colors">
        <div className="flex flex-1 gap-2.5 items-center min-w-0">
          <UserAvatar src={first.memberAvatar} name={first.memberName || "Hội viên"} className="shrink-0 size-8 rounded-full object-cover" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[#0f172a] text-[13px] truncate">{first.memberName}</span>
            <span className="font-medium text-[#64748b] text-[11px]">{first.memberPhone} • {first.memberCode}</span>
          </div>
        </div>
        <div className="flex flex-col w-[180px] shrink-0 min-w-0">
          <span className="font-bold text-[#0f172a] text-[13px] truncate" title={courseName}>{courseName}</span>
          <span className="font-medium text-[#64748b] text-[11px] truncate">HLV: {first.coachName}</span>
          <span className="text-emerald-700 text-[11px] font-semibold">{sortedBookings.length} buổi trong khóa</span>
        </div>
        <div className="flex flex-col w-[160px] shrink-0">
          <span className="font-medium text-[#0f172a] text-[13px]">{formatCenterDate(first.startTime)}{sortedBookings.length > 1 ? ` – ${formatCenterDate(sortedBookings[sortedBookings.length - 1].startTime)}` : ` · ${formatCenterTime(first.startTime)}`}</span>
          <span className="font-medium text-[#64748b] text-[11px]">{sortedBookings.length > 1 ? "Lịch theo từng buổi" : ""}</span>
        </div>
        <div className="flex flex-col w-[160px] shrink-0">
          <span className="font-medium text-[#0f172a] text-[13px]">{formatCenterDate(earliestBooking.bookedAt)}</span>
          <span className="font-medium text-[#64748b] text-[11px]">{formatCenterTime(earliestBooking.bookedAt)}</span>
        </div>
        <div className="flex items-start w-[120px] shrink-0">
          <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${statusColor}`}>{status}</span>
        </div>
        <div className="flex items-center justify-end w-[80px] shrink-0">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            Buổi
          </button>
        </div>
      </div>
      {expanded && (
        <div className="bg-slate-50/80 border-b border-[#e2e8f0] px-6 py-3">
          <div className="ml-[180px] mr-[80px] space-y-2">
            {sortedBookings.map((booking, index) => (
              <div key={booking.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-700">Buổi {booking.sessionNumber || index + 1}</span>
                  <span className="ml-2 text-slate-600">{formatCenterDate(booking.startTime)} · {formatCenterTime(booking.startTime)}</span>
                  <span className={`ml-3 inline-block rounded px-2 py-0.5 font-bold ${booking.status === "Confirmed" ? "bg-green-100 text-green-700" : booking.status === "Pending" ? "bg-slate-100 text-slate-700" : booking.status === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{booking.status}</span>
                </div>
                {booking.status === "Pending" && (
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => handleApprove(booking.id)} className="rounded bg-green-50 px-2 py-1 font-bold text-green-700 hover:bg-green-100">Duyệt</button>
                    <button type="button" onClick={() => handleReject(booking.id)} className="rounded bg-red-50 px-2 py-1 font-bold text-red-700 hover:bg-red-100">Từ chối</button>
                  </div>
                )}
              </div>
            ))}
            {pendingCount > 0 && <p className="text-right text-[11px] text-slate-500">Có {pendingCount} buổi đang chờ duyệt.</p>}
          </div>
        </div>
      )}
    </>
  );
}
