import { useMemo, useState } from "react";
import type { AttendanceSession } from "./types";
import type { MemberScreen } from "../../types";
import { groupAttendanceSessions } from "./groupSessions";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  LayoutGrid,
  LayoutList,
  MapPin,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";

interface AttendanceClassListProps {
  sessions: AttendanceSession[];
  filteredSessions: AttendanceSession[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onSelectSession: (session: AttendanceSession) => void;
  onNavigate: (screen: MemberScreen) => void;
}

const statusStyles: Record<AttendanceSession["status"], string> = {
  "có mặt": "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  "vắng": "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  "đi muộn": "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  "chưa diễn ra": "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
  "chưa điểm danh": "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00`);
  return Number.isNaN(value.getTime())
    ? date
    : value.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

function SessionStatus({ status }: { status: AttendanceSession["status"] }) {
  const Icon = status === "có mặt" ? CheckCircle2 : status === "vắng" ? XCircle : Clock;
  const label = status === "chưa diễn ra" ? "Sắp diễn ra" : status === "chưa điểm danh" ? "Chưa điểm danh" : status === "vắng" ? "Vắng mặt" : status === "đi muộn" ? "Đi muộn" : "Có mặt";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusStyles[status]}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </span>
  );
}

export default function AttendanceClassList({
  sessions,
  filteredSessions,
  loading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onSelectSession,
  onNavigate,
}: AttendanceClassListProps) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCourseKey, setSelectedCourseKey] = useState<string | null>(null);

  const allGroups = useMemo(() => groupAttendanceSessions(sessions), [sessions]);
  const filteredIds = useMemo(() => new Set(filteredSessions.map((session) => session.id)), [filteredSessions]);
  const visibleGroups = useMemo(
    () => allGroups.filter((group) => group.sessions.some((session) => filteredIds.has(session.id))),
    [allGroups, filteredIds],
  );
  const selectedGroup = selectedCourseKey
    ? allGroups.find((group) => group.key === selectedCourseKey) ?? null
    : null;

  const renderCourseCard = (group: (typeof allGroups)[number]) => {
    const nextSession = group.sessions.find((session) => session.status === "chưa diễn ra") ?? group.sessions[0];
    const attended = group.sessions.filter((session) => session.status === "có mặt").length;
    const absent = group.sessions.filter((session) => session.status === "vắng").length;
    const evaluated = group.sessions.filter((session) => ["có mặt", "vắng", "đi muộn"].includes(session.status)).length;

    return (
      <button
        type="button"
        key={group.key}
        onClick={() => setSelectedCourseKey(group.key)}
        className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Calendar className="h-4 w-4" />
              <span className="mt-0.5 text-[9px] font-extrabold">{group.totalSessions} BUỔI</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">{nextSession.sport}</span>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{nextSession.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}</span>
              </div>
              <h3 className="truncate text-base font-extrabold text-slate-900 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300 sm:text-lg">{group.name}</h3>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{nextSession.startTime}–{nextSession.endTime}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{nextSession.room}</span>
                <span className="inline-flex items-center gap-1.5"><User className="h-3.5 w-3.5" />HLV {nextSession.coachName}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                {evaluated > 0 ? `Đã điểm danh ${evaluated}/${group.totalSessions} buổi · Có mặt ${attended}${absent ? ` · Vắng ${absent}` : ""}` : `${group.sessions.length} buổi đang hiển thị trong lịch của bạn`}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
            <SessionStatus status={nextSession.status} />
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Chi tiết <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3.5 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 md:flex-row md:items-center md:justify-between sm:p-4">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Tìm theo tên lớp, huấn luyện viên..." value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-800 transition focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 sm:text-sm" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 sm:text-sm">
            <option value="all">Tất cả trạng thái</option><option value="có mặt">Có mặt</option><option value="vắng">Vắng mặt</option><option value="đi muộn">Đi muộn</option><option value="chưa điểm danh">Chưa điểm danh</option><option value="chưa diễn ra">Sắp diễn ra</option>
          </select>
          <select value={typeFilter} onChange={(event) => onTypeFilterChange(event.target.value)} className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 sm:text-sm">
            <option value="all">Mọi hình thức</option><option value="group">Lớp nhóm</option><option value="pt">Kèm 1-1 PT</option>
          </select>
          {!selectedGroup && <div className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button type="button" onClick={() => setViewMode("list")} title="Xem dạng danh sách" className={`rounded-lg p-1.5 ${viewMode === "list" ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400" : "text-slate-400"}`}><LayoutList className="h-4 w-4" /></button>
            <button type="button" onClick={() => setViewMode("grid")} title="Xem dạng lưới" className={`rounded-lg p-1.5 ${viewMode === "grid" ? "bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400" : "text-slate-400"}`}><LayoutGrid className="h-4 w-4" /></button>
          </div>}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white/50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50"><RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-500" /><p className="text-sm font-semibold text-slate-500">Đang đồng bộ dữ liệu điểm danh...</p></div>
      ) : selectedGroup ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/25 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button type="button" onClick={() => setSelectedCourseKey(null)} className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"><ArrowLeft className="h-3.5 w-3.5" /> Danh sách lớp đã đăng ký</button>
              <h2 className="truncate text-lg font-extrabold text-slate-900 dark:text-white">{selectedGroup.name}</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selectedGroup.sessions[0]?.sport} · {selectedGroup.sessions.length} buổi trong lịch · HLV {selectedGroup.sessions[0]?.coachName}</p>
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="rounded-lg bg-white px-3 py-2 text-emerald-700 dark:bg-slate-900 dark:text-emerald-300">{selectedGroup.sessions.filter((session) => ["có mặt", "vắng", "đi muộn"].includes(session.status)).length} đã điểm danh</span>
              <span className="rounded-lg bg-white px-3 py-2 text-sky-700 dark:bg-slate-900 dark:text-sky-300">{selectedGroup.sessions.filter((session) => session.status === "chưa diễn ra").length} sắp tới</span>
            </div>
          </div>

          <div className="space-y-3">
            {selectedGroup.sessions.map((session, index) => (
              <button type="button" key={session.id} onClick={() => onSelectSession(session)} className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">BUỔI {session.sessionNumber ?? index + 1}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(session.date)}</span>
                    </div>
                    <h3 className="truncate text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{session.className}</h3>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{session.startTime}–{session.endTime}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{session.room}</span>
                      <span>HLV {session.coachName}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:justify-end sm:border-0 sm:pt-0">
                    <SessionStatus status={session.status} />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">Chi tiết <ChevronRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : visibleGroups.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <Calendar className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <h3 className="mb-1 text-base font-bold text-slate-700 dark:text-slate-300">Không tìm thấy lớp đã đăng ký</h3>
          <p className="mx-auto mb-5 max-w-md text-sm text-slate-500 dark:text-slate-400">{sessions.length === 0 ? "Bạn chưa có lớp học hoặc buổi tập nào. Hãy khám phá lớp phù hợp để bắt đầu." : "Không có lớp nào phù hợp với bộ lọc hiện tại."}</p>
          {sessions.length === 0 && <button type="button" onClick={() => onNavigate("booking")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-emerald-500">Khám phá & Đặt lịch ngay <ArrowRight className="h-4 w-4" /></button>}
        </div>
      ) : (
        <div className={viewMode === "list" ? "space-y-3" : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
          {visibleGroups.map(renderCourseCard)}
        </div>
      )}
    </div>
  );
}
