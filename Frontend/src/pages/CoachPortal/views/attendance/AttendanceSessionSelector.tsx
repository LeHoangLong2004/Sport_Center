import { Calendar, Clock, MapPin, Users, Award, ShieldCheck, ChevronDown, Dumbbell } from "lucide-react";
import type { MockSession } from "../../services/api";

interface Props {
  selectedSessionId: string;
  onSessionChange: (id: string) => void;
  activeSessions: MockSession[];
  session: MockSession;
  isFinalized: boolean;
  enrolledCount: number;
}

export default function AttendanceSessionSelector({
  selectedSessionId,
  onSessionChange,
  activeSessions,
  session,
  isFinalized,
  enrolledCount,
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

  const occupancyRate = session.capacity > 0 ? Math.round((enrolledCount / session.capacity) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top Banner / Selector Bar */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
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
                    : "bg-slate-100 text-slate-800 dark:bg-slate-950/50 dark:text-slate-400"
                }`}
              >
                {isFinalized ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã chốt sổ điểm danh
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                    Chưa chốt sổ
                  </>
                )}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {session.className}
            </h2>
          </div>

          {/* Session Switcher Dropdown */}
          <div className="w-full lg:w-96">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Chọn ca dạy cần điểm danh
            </label>
            <div className="relative">
              <select
                value={selectedSessionId || ""}
                onChange={(e) => onSessionChange(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
              >
                {activeSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.className} — {s.date} ({s.startTime} - {s.endTime})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Session Metadata Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
        {/* Time */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Khung giờ</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {session.startTime} – {session.endTime}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Ngày diễn ra</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatSessionDate(session.date)}
            </span>
          </div>
        </div>

        {/* Location / Room */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Phòng / Khu vực</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block max-w-[140px]">
              {session.room || "Chưa xếp phòng"}
            </span>
          </div>
        </div>

        {/* Capacity */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 text-[11px] block font-medium">Sĩ số lớp</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {enrolledCount}/{session.capacity} HV ({occupancyRate}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
