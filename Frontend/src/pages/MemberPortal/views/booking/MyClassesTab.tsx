import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Receipt,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle,
  History,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { MemberSessionItem } from "../../types";

interface MyClassesTabProps {
  myActiveClasses?: MemberSessionItem[];
  mySessions?: MemberSessionItem[];
  getBookingStatus: (session: MemberSessionItem) => string;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
  onCancelBooking: (target: { classId: string; className: string }) => void;
}

export const MyClassesTab: React.FC<MyClassesTabProps> = ({
  myActiveClasses = [],
  mySessions = [],
  getBookingStatus,
  onStartChatWithCoach,
  onCancelBooking,
}) => {
  const [subTab, setSubTab] = useState<"upcoming" | "history">("upcoming");

  // Dùng toàn bộ danh sách lớp của hội viên (mySessions) để phân loại
  const allSessions = useMemo(() => {
    return mySessions.length > 0 ? mySessions : myActiveClasses;
  }, [mySessions, myActiveClasses]);

  const now = useMemo(() => new Date(), []);

  // Hàm tính mốc thời gian bắt đầu & kết thúc của một buổi học
  const getSessionTimes = (booking: MemberSessionItem) => {
    try {
      if ((booking as any).scheduleTime) {
        const start = new Date((booking as any).scheduleTime);
        const duration = Number((booking as any).durationMinutes || 60);
        const end = new Date(start.getTime() + duration * 60000);
        return { start, end };
      }
      let dateStr = booking.date || "";
      if (dateStr.includes("/")) {
        const [d, m, y] = dateStr.split("/");
        dateStr = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      const start = new Date(`${dateStr}T${booking.startTime || "00:00"}:00`);
      const end = booking.endTime
        ? new Date(`${dateStr}T${booking.endTime}:00`)
        : new Date(start.getTime() + 60 * 60000);
      return { start, end };
    } catch {
      return { start: new Date(0), end: new Date(0) };
    }
  };

  // Xác định lớp đã kết thúc hay chưa
  const isClassPast = (booking: MemberSessionItem) => {
    const rawStatus = String(getBookingStatus(booking) || "").toLowerCase();
    if (
      rawStatus === "completed" ||
      rawStatus === "attended" ||
      rawStatus === "no_show" ||
      rawStatus === "no-show"
    ) {
      return true;
    }
    const { end } = getSessionTimes(booking);
    return end.getTime() > 0 && end.getTime() < now.getTime();
  };

  // Xác định lớp đang trong khung giờ diễn ra
  const isClassOngoing = (booking: MemberSessionItem) => {
    const { start, end } = getSessionTimes(booking);
    return start.getTime() <= now.getTime() && now.getTime() <= end.getTime();
  };

  // 1. Danh sách lớp sắp diễn ra (chưa đến giờ kết thúc và chưa bị hủy)
  const upcomingClasses = useMemo(() => {
    return allSessions
      .filter((s) => {
        const rawStatus = String(getBookingStatus(s) || "").toLowerCase();
        const isCancelled =
          rawStatus.includes("cancel") ||
          rawStatus.includes("huy") ||
          rawStatus === "rejected";
        return !isCancelled && !isClassPast(s);
      })
      .sort((a, b) => {
        const timeA = getSessionTimes(a).start.getTime();
        const timeB = getSessionTimes(b).start.getTime();
        return timeA - timeB;
      });
  }, [allSessions, getBookingStatus, now]);

  // 2. Danh sách lịch sử tập luyện (đã kết thúc hoặc đã bị hủy)
  const historyClasses = useMemo(() => {
    return allSessions
      .filter((s) => {
        const rawStatus = String(getBookingStatus(s) || "").toLowerCase();
        const isCancelled =
          rawStatus.includes("cancel") ||
          rawStatus.includes("huy") ||
          rawStatus === "rejected";
        return isCancelled || isClassPast(s);
      })
      .sort((a, b) => {
        const timeA = getSessionTimes(a).start.getTime();
        const timeB = getSessionTimes(b).start.getTime();
        return timeB - timeA; // Mới nhất lên đầu
      });
  }, [allSessions, getBookingStatus, now]);

  const currentDisplayList = subTab === "upcoming" ? upcomingClasses : historyClasses;

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {subTab === "upcoming" ? (
              <>
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Lớp học sắp diễn ra ({upcomingClasses.length} lớp)</span>
              </>
            ) : (
              <>
                <History className="w-5 h-5 text-indigo-600" />
                <span>Lịch sử tập luyện ({historyClasses.length} buổi)</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subTab === "upcoming"
              ? "Theo dõi các buổi tập sắp tới, giờ học và kênh trao đổi trực tiếp với Huấn luyện viên."
              : "Nhật ký các buổi tập đã hoàn thành trong quá khứ, kiểm tra điểm danh và phản hồi chất lượng."}
          </p>
        </div>

        {/* BỘ LỌC SUB-TAB (PHƯƠNG ÁN A) */}
        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/60 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSubTab("upcoming")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === "upcoming"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sắp diễn ra</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                subTab === "upcoming"
                  ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {upcomingClasses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("history")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              subTab === "history"
                ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch sử tập</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                subTab === "history"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {historyClasses.length}
            </span>
          </button>
        </div>
      </div>

      {/* DANH SÁCH LỚP HỌC */}
      {currentDisplayList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          {subTab === "upcoming" ? (
            <>
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Bạn không có lớp học nào sắp diễn ra
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Hãy chuyển sang tab "Lớp nhóm" để khám phá các lớp học mới và đăng ký lịch tập phù hợp.
              </p>
            </>
          ) : (
            <>
              <History className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có lịch sử buổi tập nào
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Các buổi học sau khi kết thúc hoặc đã tham gia sẽ tự động được lưu trữ vào mục lịch sử này.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentDisplayList.map((booking) => {
            const rawStatus = String(getBookingStatus(booking) || "").toLowerCase();
            const isPending = rawStatus === "pending" || rawStatus === "pending_payment";
            const isCancelled =
              rawStatus.includes("cancel") ||
              rawStatus.includes("huy") ||
              rawStatus === "rejected";
            const ongoing = isClassOngoing(booking);
            const isPast = isClassPast(booking);

            return (
              <div
                key={booking.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isPast || isCancelled
                    ? "border-slate-200 dark:border-slate-800 opacity-90"
                    : "border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                        {booking.sport}
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1.5">
                        {booking.name}
                      </h4>
                    </div>
                    {/* BADGE TRẠNG THÁI CHUẨN XÁC THEO THỜI GIAN */}
                    {isCancelled ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400">
                        ⚪ Đã hủy lớp
                      </span>
                    ) : isPast ? (
                      booking.attendanceStatus === "có mặt" || rawStatus === "attended" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã tham gia (Có mặt)
                        </span>
                      ) : booking.attendanceStatus === "vắng" || rawStatus === "no_show" || rawStatus === "no-show" ? (
                        <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Vắng mặt (No-show)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> Đã kết thúc
                        </span>
                      )
                    ) : ongoing ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-amber-500 text-white border-amber-600 dark:bg-amber-600 animate-pulse flex items-center gap-1 shadow-sm shadow-amber-500/20">
                        <Zap className="w-3.5 h-3.5" /> Đang diễn ra
                      </span>
                    ) : isPending ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                        ⏳ Giữ chỗ · Chờ thanh toán tại quầy
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-black border shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                        🟢 Đã thanh toán & Xác nhận
                      </span>
                    )}
                  </div>

                  {/* Time and Location Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>
                        {booking.startTime} - {booking.endTime} • Ngày {booking.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{booking.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Receipt className="w-4 h-4 shrink-0" />
                      <span>
                        Thanh toán:{" "}
                        {isPending ? (
                          <strong className="text-slate-600 dark:text-slate-400">
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
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-emerald-200/80 dark:border-emerald-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Huấn luyện viên phụ trách
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-slate-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {booking.coachRating ?? "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <CoachAvatar
                        src={booking.coachAvatar}
                        name={booking.coachName}
                        className="w-12 h-12 rounded-full shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {booking.coachName}
                        </h5>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                          {booking.coachSpecialty || "Huấn luyện viên Thể hình"}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {booking.coachPhone || "0901 234 567"}
                        </p>
                      </div>
                    </div>

                    {booking.coachBio && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-2.5 pt-2 border-t border-emerald-100 dark:border-slate-700 leading-relaxed">
                        "{booking.coachBio}"
                      </p>
                    )}
                  </div>
                </div>

                {/* HÀNG NÚT HÀNH ĐỘNG */}
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
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn tin cho HLV</span>
                  </button>

                  {/* CHÍNH SÁCH HIỂN THỊ NÚT HỦY:
                      - Nếu là Lớp quá khứ / Lịch sử (isPast): TUYỆT ĐỐI KHÔNG HIỂN THỊ NÚT HỦY
                      - Nếu lớp đang diễn ra (ongoing): Khóa nút Hủy
                      - Chỉ cho phép hủy đối với lớp chưa bắt đầu */}
                  {isPast || isCancelled ? (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isCancelled ? "Đã hủy" : "Đã hoàn thành"}</span>
                    </div>
                  ) : ongoing ? (
                    <button
                      type="button"
                      disabled
                      title="Lớp học đang diễn ra, không thể hủy giữ chỗ."
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed"
                    >
                      Đang học (Khóa hủy)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onCancelBooking({
                          classId: (booking as any).classId || booking.id,
                          className: booking.name,
                        })
                      }
                      className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hủy lớp
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
