import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Dumbbell,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import type { MockSession } from "../../services/api";

interface Props {
  activeSessions: MockSession[];
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
  finalizedMap: Record<string, boolean>;
}

type DateTab = "all" | "today" | "tomorrow" | "this_week";
type StatusFilter = "all" | "pending" | "finalized";

export default function AttendanceClassSessionsList({
  activeSessions,
  isLoading,
  onSelectSession,
  finalizedMap,
}: Props) {
  const [dateTab, setDateTab] = useState<DateTab>(() => {
    const today = new Date().toISOString().split("T")[0];
    return activeSessions.some((s) => s.date === today) ? "today" : "all";
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const tomorrowIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  }, []);

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

  const getSessionAttendanceState = (session: MockSession) => {
    if (finalizedMap[session.id]) {
      return "finalized";
    }
    const localKey = `coach_attendance_${session.id}`;
    try {
      const saved = localStorage.getItem(localKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((r: any) => r.status && r.status !== "chưa điểm danh")) {
          return "draft";
        }
      }
    } catch {}
    return "unmarked";
  };

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return activeSessions.filter((s) => {
      // 1. Date filter
      if (dateTab === "today" && s.date !== todayIso) return false;
      if (dateTab === "tomorrow" && s.date !== tomorrowIso) return false;
      if (dateTab === "this_week") {
        if (!s.date || s.date < weekRange.start || s.date > weekRange.end) return false;
      }

      // 2. Status filter
      const state = getSessionAttendanceState(s);
      if (statusFilter === "finalized" && state !== "finalized") return false;
      if (statusFilter === "pending" && state === "finalized") return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = s.className?.toLowerCase().includes(q);
        const sportMatch = s.sport?.toLowerCase().includes(q);
        const roomMatch = s.room?.toLowerCase().includes(q);
        if (!nameMatch && !sportMatch && !roomMatch) return false;
      }

      return true;
    });
  }, [activeSessions, dateTab, statusFilter, search, todayIso, tomorrowIso, weekRange, finalizedMap]);

  // Statistics
  const todaySessionsCount = useMemo(
    () => activeSessions.filter((s) => s.date === todayIso).length,
    [activeSessions, todayIso]
  );

  const pendingAttendanceCount = useMemo(
    () => activeSessions.filter((s) => !finalizedMap[s.id]).length,
    [activeSessions, finalizedMap]
  );

  const finalizedCount = useMemo(
    () => activeSessions.filter((s) => !!finalizedMap[s.id]).length,
    [activeSessions, finalizedMap]
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Điểm danh ca dạy</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Danh sách ca dạy & Điểm danh
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Chọn ca dạy bên dưới để mở sổ điểm danh chi tiết, xác nhận học viên có mặt và cập nhật chuyên cần.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs backdrop-blur-sm border border-white/10">
              Hôm nay có <strong className="text-emerald-400 font-bold">{todaySessionsCount}</strong> ca dạy
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng ca dạy</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activeSessions.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">đã xếp lịch</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ca dạy hôm nay</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{todaySessionsCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">cần phụ trách</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Chưa chốt điểm danh</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingAttendanceCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">cần hoàn tất</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã chốt sổ</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{finalizedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">hoàn thành</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: "today", label: `Hôm nay (${todaySessionsCount})` },
            { key: "tomorrow", label: "Ngày mai" },
            { key: "this_week", label: "Tuần này" },
            { key: "all", label: `Tất cả (${activeSessions.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDateTab(tab.key as DateTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                dateTab === tab.key
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Pills & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Mọi trạng thái điểm danh</option>
            <option value="pending">Chưa chốt điểm danh</option>
            <option value="finalized">Đã chốt sổ điểm danh</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm lớp, môn, phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Class Sessions Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <div className="size-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold">Đang tải danh sách ca dạy...</span>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy ca dạy nào phù hợp
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {dateTab === "today"
              ? "Hôm nay bạn không có ca dạy nào hoặc các ca đã được lọc ẩn."
              : "Thử thay đổi bộ lọc ngày hoặc từ khóa tìm kiếm."}
          </p>
          {dateTab !== "all" && (
            <button
              type="button"
              onClick={() => {
                setDateTab("all");
                setStatusFilter("all");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Xem tất cả ca dạy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => {
            const state = getSessionAttendanceState(session);
            const isFinalized = state === "finalized";
            const isDraft = state === "draft";
            const enrolled = Array.isArray(session.registeredMemberIds)
              ? session.registeredMemberIds.length
              : (session as any).registeredCount || 0;
            const occupancy = session.capacity > 0 ? Math.round((enrolled / session.capacity) * 100) : 0;
            const isToday = session.date === todayIso;

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isToday
                    ? "border-emerald-300 dark:border-emerald-800/80 ring-2 ring-emerald-500/10"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                {/* Accent top stripe */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isFinalized
                      ? "bg-slate-400 dark:bg-slate-600"
                      : isDraft
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />

                <div className="space-y-3.5 pt-1">
                  {/* Tags & Status */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <Dumbbell className="w-3 h-3" />
                        {session.sport || "Lớp nhóm"}
                      </span>
                      {session.level && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {session.level}
                        </span>
                      )}
                    </div>

                    {/* Attendance State Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isFinalized
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : isDraft
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {isFinalized ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-slate-500" />
                          Đã chốt sổ
                        </>
                      ) : isDraft ? (
                        <>
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Đang lưu nháp
                        </>
                      ) : (
                        <>
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Chưa điểm danh
                        </>
                      )}
                    </span>
                  </div>

                  {/* Class Title */}
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {session.className}
                    </h3>
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {session.startTime} – {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatSessionDate(session.date)}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-extrabold text-[10px]">
                          HÔM NAY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{session.room || "Studio trung tâm"}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {enrolled}/{session.capacity} HV
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {occupancy}% lấp đầy
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSession(session.id);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isFinalized
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 group-hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 group-hover:scale-[1.02]"
                    }`}
                  >
                    <span>{isFinalized ? "Xem sổ điểm danh / Điều chỉnh" : "Điểm danh ngay"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
