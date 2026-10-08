/**
 * CO-02 — Lịch dạy
 * Chế độ danh sách (ưu tiên mobile) + tuần view desktop.
 * Coach không kéo thả, không tạo lịch (spec §CO-02).
 * Trạng thái buổi không suy ra từ điểm danh.
 */
import { useState, useMemo } from "react";
import type { CoachScreen } from "../types";
import { MOCK_SESSIONS, type SessionStatus } from "../services/mockData";

type ViewMode = "list" | "week";
type SportFilter = "all" | string;
type StatusFilter = "all" | SessionStatus;

interface Props {
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

const SPORT_OPTIONS = ["all", ...Array.from(new Set(MOCK_SESSIONS.map((s) => s.sport)))];
const STATUS_OPTIONS: (StatusFilter)[] = ["all", "sắp diễn ra", "đang diễn ra", "hoàn thành", "đã hủy"];

const STATUS_STYLE: Record<string, string> = {
  "sắp diễn ra":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "đang diễn ra": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "hoàn thành":   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  "đã hủy":       "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function CoachSchedule({ navigateTo }: Props) {
  const [view, setView] = useState<ViewMode>("list");
  const [sportFilter, setSportFilter] = useState<SportFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = tuần hiện tại

  const filtered = useMemo(
    () =>
      MOCK_SESSIONS.filter((s) => {
        if (sportFilter !== "all" && s.sport !== sportFilter) return false;
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        return true;
      }).sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
    [sportFilter, statusFilter]
  );

  // Group by date for list view
  const byDate = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lịch dạy</h1>
        {/* View toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
          {(["list", "week"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setView(m)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === m
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {m === "list" ? "Danh sách" : "Tuần"}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Môn:</span>
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            {SPORT_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === "all" ? "Tất cả" : o}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o === "all" ? "Tất cả" : o}</option>
            ))}
          </select>
        </div>
        {view === "week" && (
          <div className="flex items-center gap-2 ml-auto">
            <button type="button" onClick={() => setWeekOffset((v) => v - 1)}
              className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              ← Tuần trước
            </button>
            <button type="button" onClick={() => setWeekOffset(0)}
              className="px-2 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Hôm nay
            </button>
            <button type="button" onClick={() => setWeekOffset((v) => v + 1)}
              className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
              Tuần sau →
            </button>
          </div>
        )}
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="flex flex-col gap-4">
          {byDate.length === 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center text-slate-400">
              Không có buổi học nào phù hợp bộ lọc.
            </div>
          )}
          {byDate.map(([date, sessions]) => {
            const d = new Date(date);
            const label = d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });
            const isToday = date === today;
            return (
              <div key={date}>
                <div className={`text-sm font-semibold mb-2 px-1 ${isToday ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-slate-400"}`}>
                  {label.charAt(0).toUpperCase() + label.slice(1)} {isToday && "(Hôm nay)"}
                </div>
                <div className="flex flex-col gap-2">
                  {sessions.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      onClick={() => navigateTo("class-detail", { sessionId: s.id })}
                      onAttendance={() => navigateTo("attendance", { sessionId: s.id })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW (desktop only) */}
      {view === "week" && (
        <div className="overflow-x-auto">
          <div className="min-w-[640px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
              <div className="p-3 text-xs text-slate-400 font-medium">Giờ</div>
              {DAYS.map((d) => (
                <div key={d} className="p-3 text-xs text-center text-slate-600 dark:text-slate-300 font-semibold">
                  {d}
                </div>
              ))}
            </div>
            {/* Note: Week view shows session names only; click → detail */}
            {["06:00", "07:00", "09:00", "14:00", "17:00", "19:00"].map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-700/50 min-h-[60px]">
                <div className="p-3 text-xs text-slate-400 font-mono">{hour}</div>
                {DAYS.map((_, di) => {
                  const daySession = filtered.find((s) => {
                    const dayOfWeek = (new Date(s.date).getDay() + 6) % 7; // Mon=0
                    return dayOfWeek === di && s.startTime === hour;
                  });
                  return (
                    <div key={di} className="p-1 border-l border-slate-100 dark:border-slate-700/50">
                      {daySession && (
                        <button
                          type="button"
                          onClick={() => navigateTo("class-detail", { sessionId: daySession.id })}
                          className="w-full text-left p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                        >
                          <div className="font-semibold truncate">{daySession.sport}</div>
                          <div className="truncate opacity-75">{daySession.className}</div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionRow({
  session, onClick, onAttendance,
}: {
  session: ReturnType<typeof MOCK_SESSIONS[0]["valueOf"]>;
  onClick: () => void;
  onAttendance: () => void;
}) {
  const statusStyle = STATUS_STYLE[session.status] || "bg-gray-100 text-gray-500";
  const isCancelled = session.status === "đã hủy";

  return (
    <div
      className={`bg-white dark:bg-slate-800 border ${isCancelled ? "border-red-200 dark:border-red-800/50 opacity-70" : "border-slate-200 dark:border-slate-700"} rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {session.className}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>
            {session.status}
          </span>
          {session.sport && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {session.sport}
            </span>
          )}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {session.startTime}–{session.endTime} · {session.room} · {session.registeredMemberIds.length}/{session.capacity} người
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {!isCancelled && (
          <button
            type="button"
            className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); onAttendance(); }}
          >
            Điểm danh
          </button>
        )}
      </div>
    </div>
  );
}