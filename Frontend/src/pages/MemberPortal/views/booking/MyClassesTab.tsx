import React, { useMemo } from "react";
import { Calendar, Clock, MapPin, ShieldCheck, Star, Phone, MessageCircle, CheckCircle2 } from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import type { MemberSessionItem } from "../../types";
import { type CancelBookingTarget } from "./bookingTypes";

interface MyClassesTabProps {
  myActiveClasses?: MemberSessionItem[];
  mySessions?: MemberSessionItem[];
  getBookingStatus: (session: MemberSessionItem) => string;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
  onCancelBooking: (target: CancelBookingTarget) => void;
  membership?: any | null;
}

interface CourseEnrollment {
  booking: MemberSessionItem;
  sessionCount: number;
  courseName: string;
}

export const MyClassesTab: React.FC<MyClassesTabProps> = ({
  myActiveClasses = [],
  mySessions = [],
  getBookingStatus,
  onStartChatWithCoach,
  onCancelBooking,
}) => {
  const allSessions = useMemo(() => mySessions.length > 0 ? mySessions : myActiveClasses, [mySessions, myActiveClasses]);
  const now = Date.now();

  const getSessionTimes = (session: MemberSessionItem) => {
    if ((session as any).scheduleTime) {
      const start = new Date((session as any).scheduleTime);
      const end = new Date(start.getTime() + Number((session as any).durationMinutes || 60) * 60000);
      return { start, end };
    }

    const dateText = session.date || "";
    const normalizedDate = dateText.includes("/")
      ? dateText.split("/").reverse().join("-")
      : dateText;
    const start = new Date(`${normalizedDate}T${session.startTime || "00:00"}:00`);
    const end = session.endTime
      ? new Date(`${normalizedDate}T${session.endTime}:00`)
      : new Date(start.getTime() + 60 * 60000);
    return { start, end };
  };

  const courses = useMemo<CourseEnrollment[]>(() => {
    const grouped = new Map<string, MemberSessionItem[]>();

    allSessions.forEach((session) => {
      if (session.type !== "group") return;
      const status = String(getBookingStatus(session) || "").trim().toLowerCase();
      // A payment hold is not a completed registration. Pending review is shown as a registration request.
      if (["pending_payment", "cancelled", "canceled", "đã hủy", "rejected", "class_cancelled", "attended", "no_show", "no-show"].includes(status)) return;

      const courseId = String((session as any).parentId || (session as any).classId || session.id);
      const sessions = grouped.get(courseId) || [];
      sessions.push(session);
      grouped.set(courseId, sessions);
    });

    return Array.from(grouped.values()).flatMap((sessions) => {
      const nextSession = sessions
        .filter((session) => getSessionTimes(session).end.getTime() >= now)
        .sort((a, b) => getSessionTimes(a).start.getTime() - getSessionTimes(b).start.getTime())[0];
      if (!nextSession) return [];

      const totalSessions = Math.max(
        sessions.length,
        ...sessions.map((session) => Number((session as any).totalSessions || 1)),
      );
      const courseName = (nextSession.name || "Khóa học")
        .replace(/\s*\(Buổi\s*\d+\)\s*$/i, "")
        .replace(/\s*[-–—]?\s*Buổi\s*\d+\s*$/i, "")
        .trim();

      return [{ booking: nextSession, sessionCount: totalSessions, courseName }];
    }).sort((a, b) => getSessionTimes(a.booking).start.getTime() - getSessionTimes(b.booking).start.getTime());
  }, [allSessions, getBookingStatus, now]);

  const dateLabel = (date: string) => {
    if (!date) return "Chưa có lịch";
    const parsed = date.includes("/") ? date : date.split("-").reverse().join("/");
    return parsed;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800/60">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          <span>Khóa học đã đăng ký ({courses.length})</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Mỗi khóa học hiển thị một lần cùng buổi học tiếp theo.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Bạn chưa đăng ký khóa học nào</h4>
          <p className="text-xs text-slate-500 mt-1">Các khóa học bạn đã đăng ký sẽ xuất hiện tại đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map(({ booking, sessionCount, courseName }) => {
            const rawStatus = String(getBookingStatus(booking) || "").toLowerCase();
            const isPending = rawStatus === "pending";
            const { start, end } = getSessionTimes(booking);
            const isOngoing = start.getTime() <= now && now <= end.getTime();
            const formattedDate = dateLabel(booking.date);

            return (
              <article
                key={String((booking as any).parentId || (booking as any).classId || booking.id)}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                        {booking.sport || "Lớp nhóm"} · Khóa học
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">{courseName}</h4>
                      <p className="text-xs text-slate-500 mt-1">{sessionCount} buổi trong khóa</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${isPending
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"}`}>
                      {isPending ? "Chờ duyệt" : isOngoing ? "Đang học" : "Đã đăng ký"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Buổi tiếp theo: {booking.startTime}–{booking.endTime} · {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{booking.room || "Chưa cập nhật địa điểm"}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/40 dark:from-slate-800 dark:to-slate-850 border border-emerald-200/80 dark:border-emerald-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Huấn luyện viên phụ trách
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-slate-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {booking.coachRating ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <CoachAvatar src={booking.coachAvatar} name={booking.coachName} className="w-12 h-12 rounded-full shadow-sm shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{booking.coachName}</h5>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{booking.coachSpecialty || "Huấn luyện viên Thể hình"}</p>
                        {booking.coachPhone && <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 text-slate-400" /> {booking.coachPhone}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onStartChatWithCoach(booking.coachName, booking.coachId, booking.coachAvatar)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" /> Nhắn tin cho HLV
                  </button>
                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => onCancelBooking({
                        classId: String((booking as any).classId || booking.id),
                        className: courseName,
                        scheduleTime: (booking as any).scheduleTime,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        dateStr: booking.date,
                        price: booking.price,
                        type: "class",
                        sport: booking.sport,
                        room: booking.room,
                      })}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Hủy khóa học
                    </button>
                  )}
                  {isPending && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><CheckCircle2 className="w-4 h-4" />Đang chờ duyệt</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
