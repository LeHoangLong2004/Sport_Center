import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Receipt,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { MemberSessionItem } from "../../types";

interface MyClassesTabProps {
  myActiveClasses: MemberSessionItem[];
  getBookingStatus: (session: MemberSessionItem) => string;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
  onCancelBooking: (target: { classId: string; className: string }) => void;
}

export const MyClassesTab: React.FC<MyClassesTabProps> = ({
  myActiveClasses,
  getBookingStatus,
  onStartChatWithCoach,
  onCancelBooking
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-5 rounded-3xl border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Danh sách lớp học đã đăng ký thành công ({myActiveClasses.length} lớp)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Xem chi tiết lịch học, thông tin Huấn luyện viên phụ trách và kênh nhắn tin trao đổi trực tiếp với HLV.
          </p>
        </div>
      </div>

      {myActiveClasses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Bạn chưa đăng ký lớp học nào
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Hãy chuyển sang tab "Lớp nhóm" để khám phá các lớp học phù hợp và đăng ký tham gia ngay.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myActiveClasses.map((booking) => {
            const rawStatus = getBookingStatus(booking);
            const isPending = rawStatus === "pending" || rawStatus === "pending_payment";

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800">
                        {booking.sport}
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        {booking.name}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border shrink-0 flex items-center gap-1.5 ${
                        isPending
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      {isPending ? "⏳ Giữ chỗ · Chờ thanh toán tại quầy" : "🟢 Đã thanh toán & Xác nhận"}
                    </span>
                  </div>

                  {/* Time and Location Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        {booking.startTime} - {booking.endTime} • Ngày {booking.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{booking.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Receipt className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        Thanh toán:{" "}
                        {isPending ? (
                          <strong className="text-amber-600 dark:text-amber-400">
                            150.000 đ (Chưa thanh toán - Thu tại quầy lễ tân)
                          </strong>
                        ) : (
                          <strong className="text-slate-800 dark:text-slate-200">
                            Giá gốc (150.000 đ)
                          </strong>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* FULL COACH PROFILE CARD BOX */}
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-teal-200/80 dark:border-teal-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Huấn luyện viên phụ trách
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-teal-100 dark:border-slate-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {booking.coachRating ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <CoachAvatar
                        src={booking.coachAvatar}
                        name={booking.coachName}
                        className="w-12 h-12 rounded-full border-2 border-teal-500 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {booking.coachName}
                        </h5>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 truncate">
                          {booking.coachSpecialty || "Huấn luyện viên Thể hình"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {booking.coachPhone || "0901 234 567"}
                        </p>
                      </div>
                    </div>

                    {booking.coachBio && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-2.5 pt-2 border-t border-teal-100 dark:border-slate-700 leading-relaxed">
                        "{booking.coachBio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Booking Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      onStartChatWithCoach(
                        booking.coachName,
                        booking.coachId,
                        booking.coachAvatar
                      )
                    }
                    className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-teal-600/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn tin cho HLV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onCancelBooking({
                        classId: (booking as any).classId || booking.id,
                        className: booking.name,
                      })
                    }
                    className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors"
                  >
                    Hủy lớp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
