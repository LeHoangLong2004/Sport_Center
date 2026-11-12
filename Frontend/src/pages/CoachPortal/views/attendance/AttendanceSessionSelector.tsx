import { Calendar, Clock, MapPin, Users, Award, ShieldCheck, ChevronDown, Dumbbell, Lock } from "lucide-react";
import { Calendar, Clock, MapPin, Users, ShieldCheck, ChevronDown, Dumbbell, Award, CheckCircle2, RotateCcw } from "lucide-react";
import type { MockSession } from "../../services/api";
import type { AttendanceDeadlineInfo } from "../../utils/attendanceLock";

interface Props {
  selectedSessionId: string;
  onSessionChange: (id: string) => void;
  activeSessions: MockSession[];
  session: MockSession;
  isFinalized: boolean;
  isDraft?: boolean;
  isExpired24h?: boolean;
  deadlineInfo?: AttendanceDeadlineInfo;
  enrolledCount: number;
  stats: {
    total: number;
    attended: number;
    absent: number;
    late: number;
    pending: number;
    attendanceRate: number;
  };
}

export default function AttendanceSessionSelector({
  selectedSessionId,
  onSessionChange,
  activeSessions,
  session,
  isFinalized,
  isDraft,
  isExpired24h,
  deadlineInfo,
  enrolledCount,
  stats,
}: Props) {
  // Format Vietnamese date
  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dayName}, ${dd}/${mm}/${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Row: Class Info & Dropdown Switcher */}
      <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-50 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-b border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              <Dumbbell className="w-3.5 h-3.5" />
              {session.sport || "Lớp nhóm"}
            </span>
            {session.level && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {session.level}
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isFinalized
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                  : isDraft
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isFinalized ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Đã chốt sổ điểm danh
                </>
              ) : isDraft ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Đang điểm danh (Bản nháp)
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Chưa điểm danh
                </>
              )}
              {isExpired24h ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Đã đóng (Quá 24 giờ)
                </span>
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isFinalized
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : isDraft
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {isFinalized ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Đã chốt sổ điểm danh
                    </>
                  ) : isDraft ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Bản nháp (Đang lưu nháp)
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Chưa điểm danh
                    </>
                  )}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {session.className}
            </h2>
            {deadlineInfo && deadlineInfo.formattedDeadline && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Thời hạn điểm danh: {isExpired24h ? "Đã hết hạn lúc " : "Hết hạn lúc "}
                  <strong>{deadlineInfo.formattedDeadline}</strong> (
                  {isExpired24h ? "Không thể sửa điểm vì đã quá 24 giờ" : deadlineInfo.remainingText})
                </span>
              </p>
            )}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {session.className}
          </h2>
        </div>

        {/* Dropdown Ca dạy */}
        <div className="w-full md:w-80">
          <div className="relative">
            <select
              value={selectedSessionId || ""}
              onChange={(e) => onSessionChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-9 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
            >
              {activeSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.className} — {s.date} ({s.startTime} - {s.endTime})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2: 5 KPI / Metadata ngang gọn gàng 1 hàng */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800 text-xs">
        {/* Khung giờ */}
        <div className="p-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Khung giờ</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {session.startTime} – {session.endTime}
            </span>
          </div>
        </div>

        {/* Ngày diễn ra */}
        <div className="p-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Ngày diễn ra</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {formatSessionDate(session.date)}
            </span>
          </div>
        </div>

        {/* Phòng / Khu vực */}
        <div className="p-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Phòng / Khu vực</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {session.room || "Chưa xếp phòng"}
            </span>
          </div>
        </div>

        {/* Sĩ số & Có mặt */}
        <div className="p-3.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Đã có mặt / Sĩ số</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
              {stats.attended}/{stats.total} <span className="text-[11px] font-normal text-slate-500">({stats.attendanceRate}%)</span>
            </span>
          </div>
        </div>

        {/* Vắng & Trễ */}
        <div className="p-3.5 flex items-center gap-2.5 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-slate-400 text-[11px] block">Vắng / Đi trễ</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 truncate block">
              {stats.absent} vắng <span className="text-slate-400 font-normal">|</span> <span className="text-amber-600 font-bold">{stats.late} trễ</span>
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar chuyên cần mỏng (6px) nằm gọn dưới đáy */}
      {stats.total > 0 && (
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${(stats.attended / stats.total) * 100}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`Có mặt: ${stats.attended}`}
          />
          <div
            style={{ width: `${(stats.late / stats.total) * 100}%` }}
            className="bg-amber-400 transition-all duration-300"
            title={`Đi trễ: ${stats.late}`}
          />
          <div
            style={{ width: `${(stats.absent / stats.total) * 100}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`Vắng: ${stats.absent}`}
          />
          <div
            style={{ width: `${(stats.pending / stats.total) * 100}%` }}
            className="bg-slate-200 dark:bg-slate-700 transition-all duration-300"
            title={`Chưa điểm danh: ${stats.pending}`}
          />
        </div>
      )}
    </div>
  );
}
