import React from "react";
import {
  Clock,
  MapPin,
  Users,
  ArrowRight,
  AlertCircle,
  CalendarCheck,
  User,
  Phone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MockSession, AttendanceRecord } from "../../services/api";
import { type Appointment, parseAppointmentCustomer } from "../../../../services/appointmentService";

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  "sắp diễn ra": { label: "Sắp diễn ra", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
  "đang diễn ra": { label: "Đang diễn ra", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-400" },
  "hoàn thành": { label: "Hoàn thành", bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", text: "text-slate-600 dark:text-slate-400" },
  "đã hủy": { label: "Đã hủy", bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-400" },
};

interface TodaySessionsListProps {
  loading: boolean;
  todaySessions: MockSession[];
  attendances: Record<string, AttendanceRecord[]>;
  appointments?: Appointment[];
  onUpdateAppointmentStatus?: (id: string, newStatus: string) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

export const TodaySessionsList: React.FC<TodaySessionsListProps> = ({
  loading,
  todaySessions,
  attendances,
  appointments = [],
  onUpdateAppointmentStatus,
  navigateTo,
}) => {
  return (
    <div className="xl:col-span-2 flex flex-col gap-5">
      {/* 1. LỊCH HẸN KHÁCH TỪ LỄ TÂN (Nổi bật dành cho HLV) */}
      {appointments.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 dark:border-amber-900/60 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/20 p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Lịch hẹn tiếp đón từ Lễ tân</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    {appointments.length} lịch hẹn
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Lễ tân xếp lịch cho bạn tiếp đón khách đo InBody, tư vấn hoặc tập thử PT 1-1
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              Hôm nay
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {appointments.map((appt) => {
              const { name: custName, phone: custPhone } = parseAppointmentCustomer(appt.customerName);
              const isCompleted = appt.status === "Đã hoàn tất";
              const isCancelled = appt.status === "Đã hủy";
              const isWaiting = !isCompleted && !isCancelled;

              return (
                <div
                  key={appt.id}
                  className={`p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-amber-300 dark:hover:border-amber-700/80 transition-all ${
                    isCancelled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800/60 text-center shrink-0 min-w-[72px]">
                      <span className="block text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {appt.time}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {(() => {
                          const todayStr = new Date().toISOString().split("T")[0];
                          if (!appt.date || appt.date === todayStr) return "Hôm nay";
                          const tom = new Date();
                          tom.setDate(tom.getDate() + 1);
                          const tomStr = tom.toISOString().split("T")[0];
                          if (appt.date === tomStr) return "Ngày mai";
                          const parts = appt.date.split("-");
                          return parts.length === 3 ? `${parts[2]}/${parts[1]}` : appt.date;
                        })()}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                          Lễ tân xếp
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {appt.title}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : isCancelled
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400"
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {custName || appt.customerName}
                        </span>
                        {custPhone && (
                          <a
                            href={`tel:${custPhone}`}
                            className="flex items-center gap-1 text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 font-medium"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            {custPhone}
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          Khu PT 1-1 / Sảnh đón
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isWaiting && onUpdateAppointmentStatus && (
                      <button
                        type="button"
                        onClick={() => onUpdateAppointmentStatus(appt.id, "Đã hoàn tất")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Xác nhận tiếp đón</span>
                      </button>
                    )}
                    {isCompleted && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã tiếp đón
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LỊCH DẠY LỚP HỌC HÔM NAY */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Lịch dạy lớp nhóm hôm nay
          </h2>
          <button
            type="button"
            onClick={() => navigateTo("schedule")}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            Đang tải lịch hôm nay...
          </div>
        ) : todaySessions.length === 0 ? (
          <div className="p-10 text-center text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl text-xs">
            {appointments.length > 0
              ? "Bạn không có ca dạy lớp nhóm nào hôm nay, chỉ có lịch hẹn tiếp đón khách ở phía trên."
              : "Hôm nay bạn không có ca dạy nào. Hãy tận hưởng thời gian nghỉ hoặc soạn giáo án mới!"}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {todaySessions.map((s) => {
              const badge = STATUS_BADGE[s.status] || {
                label: s.status,
                bg: "bg-slate-100",
                text: "text-slate-600",
              };
              const recs = attendances[s.id] || [];
              const pending = recs.filter((r) => r.status === "chưa điểm danh").length;
              const isCancelled = s.status === "đã hủy";

              return (
                <div
                  key={s.id}
                  className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-sm ${
                    isCancelled ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                      <span className="font-semibold text-base text-slate-900 dark:text-white">
                        {s.className}
                      </span>
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.bg} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {s.sport}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {s.startTime} – {s.endTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {s.room}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {s.registeredMemberIds.length}/{s.capacity} học viên
                      </span>
                    </div>

                    {pending > 0 && !isCancelled && (
                      <div className="mt-2 text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Còn {pending} học viên chưa được điểm danh
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => navigateTo("attendance", { sessionId: s.id })}
                        className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                      >
                        Điểm danh
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                      className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
