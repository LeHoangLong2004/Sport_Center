import { Clock, MapPin, Target, Users, Eye } from "lucide-react";
import type { CoachScreen } from "../../../types";
import { STATUS_BADGE, type UnifiedScheduleItem } from "../types";
import { isAttendanceLocked24h } from "../../../utils/attendanceLock";

interface ScheduleSessionCardProps {
  session: UnifiedScheduleItem;
  onSelectPtSession: (item: UnifiedScheduleItem) => void;
  onOpenRequestModal: (sessionId?: string) => void;
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string; memberId?: string }) => void;
}

export function ScheduleSessionCard({
  session: s,
  onSelectPtSession,
  onOpenRequestModal,
  navigateTo,
}: ScheduleSessionCardProps) {
  const badge = STATUS_BADGE[s.status] || {
    label: s.status,
    bg: "bg-slate-100",
    text: "text-slate-600",
  };
  const isPT = s.type === "pt";
  const isPendingApproval = !isPT && s.approvalStatus === "pending";
  const isAppointmentPending = s.appointmentStatus === "Chờ Coach xác nhận";

  return (
    <div
      className={`bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
        "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
          <span className="font-semibold text-base text-slate-900 dark:text-white">
            {s.className}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
            isPT
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300"
            }`}
          >
            {isPT ? "Kèm 1–1 (PT)" : "Lớp Nhóm"}
          </span>
          {isPendingApproval && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-slate-200 bg-slate-50 text-slate-700">
              Chờ Manager duyệt
            </span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {s.sport}
          </span>
          <span
            className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
              `${badge.bg} ${badge.text}`
            }`}
          >
            {isAppointmentPending ? "Chờ bạn xác nhận" : badge.label}
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
          {isPT ? (
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              Mục tiêu: {s.goal}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {s.registeredCount}/{s.capacity} học viên
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <>
            {isPendingApproval ? (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700">
                Đang chờ duyệt
              </span>
            ) : isPT ? (
              <button
                type="button"
                onClick={() => onSelectPtSession(s)}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                {isAppointmentPending ? "Xem & phản hồi" : "Chi tiết PT"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo("attendance", { sessionId: s.id })}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 ${
                  isAttendanceLocked24h(s.date, s.startTime)
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    : "text-white bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <span>{isAttendanceLocked24h(s.date, s.startTime) ? "Xem điểm danh" : "Điểm danh"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenRequestModal(s.id)}
              className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              Dời ca
            </button>
            {!isPT && (
              <button
                type="button"
                onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Chi tiết →
              </button>
            )}
        </>
      </div>
    </div>
  );
}
