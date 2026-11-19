import React from "react";
import { UserX, Phone, Loader2, Users } from "lucide-react";

interface EnrolledMember {
  memberId: string;
  fullName: string;
  phoneNumber: string;
  bookingStatus: string;
}

interface Props {
  enrolledMembers: EnrolledMember[];
  loading: boolean;
  cancellingMemberId: string | null;
  onCancelMember: (member: EnrolledMember) => void;
}

export function BookClassAttendeesList({
  enrolledMembers,
  loading,
  cancellingMemberId,
  onCancelMember,
}: Props) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
        <Loader2 className="size-6 animate-spin text-emerald-600" />
        <span className="text-xs font-medium">Đang tải danh sách học viên...</span>
      </div>
    );
  }

  if (enrolledMembers.length === 0) {
    return (
      <div className="py-10 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <Users className="size-8 mx-auto text-slate-300 mb-2" />
        <h5 className="text-xs font-bold text-slate-600">Chưa có học viên đăng ký</h5>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Chưa có ai đặt chỗ trong lớp học này. Bạn có thể sang tab "Đặt lớp hộ" để đăng ký cho học viên.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
      {enrolledMembers.map((m) => {
        const isCancelling = cancellingMemberId === m.memberId;
        const initials = (m.fullName || "TV")
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div
            key={m.memberId}
            className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 shadow-2xs transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-9 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-bold text-slate-800 truncate">
                    {m.fullName || "Học viên"}
                  </h5>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      m.bookingStatus === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {m.bookingStatus === "pending" ? "Chờ thu tiền" : "Đã xác nhận"}
                  </span>
                </div>
                {m.phoneNumber && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="size-2.5" />
                    <span>{m.phoneNumber}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onCancelMember(m)}
              className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Hủy lịch hộ cho học viên này"
            >
              {isCancelling ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <UserX className="size-3" />
              )}
              <span>Hủy lịch</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

