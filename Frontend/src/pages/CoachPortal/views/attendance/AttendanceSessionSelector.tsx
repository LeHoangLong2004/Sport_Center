import { Filter } from "lucide-react";
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
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Buổi học được phân công
        </label>
        <div className="relative">
          <select
            value={selectedSessionId || ""}
            onChange={(e) => onSessionChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          >
            {activeSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.className} — {s.date} ({s.startTime} - {s.endTime})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 text-sm">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Thời gian & Phòng</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {session.startTime} – {session.endTime} · {session.room}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block font-medium">Sĩ số</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {enrolledCount}/{session.capacity} học viên
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block font-medium">Trạng thái</span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isFinalized
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
            }`}
          >
            {isFinalized ? "Đã chốt sổ" : "Chưa chốt"}
          </span>
        </div>
      </div>
    </div>
  );
}
