import { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  ArrowRight,
  Sparkles,
  Award,
  Lock,
} from "lucide-react";
import type { MockSession, AssessmentRecord } from "../../services/api";
import { isAttendanceLocked24h } from "../../utils/attendanceLock";

interface Props {
  sessions: MockSession[];
  assessments: AssessmentRecord[];
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
}

type StatusFilter = "all" | "pending" | "in_progress" | "completed" | "locked";

export default function AssessmentClassSessionsList({
  sessions,
  assessments,
  isLoading,
  onSelectSession,
}: Props) {
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const courseOptions = useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; sessions: MockSession[] }>();

    sessions.forEach((session) => {
      const id = String(session.courseId || session.classId || session.id);
      const name = session.courseName || session.className.replace(/\s*\(Buổi\s+\d+\)\s*$/i, "");
      const group = grouped.get(id) ?? { id, name, sessions: [] };
      group.sessions.push(session);
      grouped.set(id, group);
    });

    return Array.from(grouped.values())
      .map((course) => ({
        ...course,
        sessions: [...course.sessions].sort((a, b) => {
          if (a.sessionNumber != null && b.sessionNumber != null && a.sessionNumber !== b.sessionNumber) {
            return a.sessionNumber - b.sessionNumber;
          }
          return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
        }),
      }))
      .sort((a, b) => `${a.sessions[0]?.date ?? ""} ${a.sessions[0]?.startTime ?? ""}`
        .localeCompare(`${b.sessions[0]?.date ?? ""} ${b.sessions[0]?.startTime ?? ""}`));
  }, [sessions]);

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

  // Helper to get evaluation metrics for a session
  const getSessionEvalState = useMemo(() => {
    const map: Record<
      string,
      { totalMembers: number; evaluatedCount: number; state: "pending" | "in_progress" | "completed" }
    > = {};

    sessions.forEach((s) => {
      const memberIds = Array.isArray(s.registeredMemberIds) ? s.registeredMemberIds : [];
      const totalMembers = memberIds.length || s.capacity || 0;

      // Unique members evaluated for this session
      const evaluatedMembers = new Set(
        assessments
          .filter((a) => String(a.sessionId) === String(s.id) && Boolean(a.memberId))
          .map((a) => String(a.memberId))
      );
      const evaluatedCount = evaluatedMembers.size;

      let state: "pending" | "in_progress" | "completed" = "pending";
      if (evaluatedCount > 0 && totalMembers > 0 && evaluatedCount >= totalMembers) {
        state = "completed";
      } else if (evaluatedCount > 0) {
        state = "in_progress";
      } else {
        state = "pending";
      }

      map[s.id] = { totalMembers, evaluatedCount, state };
    });

    return map;
  }, [sessions, assessments]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (!selectedCourseId) return [];

    return sessions.filter((s) => {
      const courseId = String(s.courseId || s.classId || s.id);
      if (courseId !== selectedCourseId) return false;

      // 2. Status filter
      const evalInfo = getSessionEvalState[s.id] || { state: "pending" };
      const isLocked24h = isAttendanceLocked24h(s.date, s.startTime);
      if (statusFilter === "locked" && !isLocked24h) return false;
      if (statusFilter !== "all" && statusFilter !== "locked" && evalInfo.state !== statusFilter) return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch = s.className?.toLowerCase().includes(q);
        const sportMatch = s.sport?.toLowerCase().includes(q);
        const roomMatch = s.room?.toLowerCase().includes(q);
        if (!nameMatch && !sportMatch && !roomMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (a.sessionNumber != null && b.sessionNumber != null && a.sessionNumber !== b.sessionNumber) {
        return a.sessionNumber - b.sessionNumber;
      }
      return `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`);
    });
  }, [sessions, selectedCourseId, statusFilter, search, getSessionEvalState]);

  // Statistics
  const todaySessionsCount = useMemo(
    () => sessions.filter((s) => s.date === todayIso).length,
    [sessions, todayIso]
  );

  const pendingCount = useMemo(
    () => sessions.filter((s) => (getSessionEvalState[s.id]?.state ?? "pending") === "pending").length,
    [sessions, getSessionEvalState]
  );

  const inProgressCount = useMemo(
    () => sessions.filter((s) => getSessionEvalState[s.id]?.state === "in_progress").length,
    [sessions, getSessionEvalState]
  );

  const completedCount = useMemo(
    () => sessions.filter((s) => getSessionEvalState[s.id]?.state === "completed").length,
    [sessions, getSessionEvalState]
  );

  const lockedCount = useMemo(
    () => sessions.filter((s) => isAttendanceLocked24h(s.date, s.startTime)).length,
    [sessions]
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Đánh giá học viên</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Danh sách ca dạy & Đánh giá
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Chọn ca dạy bên dưới để mở phiếu đánh giá chi tiết, ghi nhận kết quả và chỉ số luyện tập cho từng học viên.
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
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{sessions.length}</p>
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
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Chưa đánh giá</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">cần thực hiện</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Đã đánh giá</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{completedCount + inProgressCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{completedCount} ca hoàn tất</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <label htmlFor="assessment-course-filter" className="shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">Lớp học</label>
          <select
            id="assessment-course-filter"
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setStatusFilter("all");
              setSearch("");
            }}
            className="min-w-0 max-w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 md:max-w-xl"
          >
            <option value="">Chọn lớp học để xem các buổi</option>
            {courseOptions.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.sessions.length} buổi)
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">Mọi trạng thái đánh giá</option>
            <option value="pending">Chưa đánh giá ({pendingCount})</option>
            <option value="in_progress">Đang đánh giá ({inProgressCount})</option>
            <option value="completed">Đã hoàn tất ({completedCount})</option>
            <option value="locked">Đã đóng (Quá 24 giờ) ({lockedCount})</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm buổi, môn, phòng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* 4. Class sessions list */}
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
            {selectedCourseId ? "Không tìm thấy buổi học nào phù hợp" : "Chọn lớp học để xem danh sách buổi"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {selectedCourseId
              ? "Thử đổi trạng thái đánh giá hoặc từ khóa tìm kiếm."
              : "Chọn một lớp trong danh sách để xem các buổi từ đầu đến cuối khóa."}
          </p>
          {selectedCourseId && (statusFilter !== "all" || search) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
            >
              Xem tất cả buổi của lớp
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSessions.map((session) => {
            const evalInfo = getSessionEvalState[session.id] || {
              totalMembers: 0,
              evaluatedCount: 0,
              state: "pending",
            };
            const isToday = session.date === todayIso;
            const isLocked24h = isAttendanceLocked24h(session.date, session.startTime);
            const isCompleted = evalInfo.state === "completed";
            const isInProgress = evalInfo.state === "in_progress";

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:px-5 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                  isToday
                    ? "border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-500/10"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                {/* Status accent */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isLocked24h
                      ? "bg-slate-400 dark:bg-slate-700"
                      : isCompleted
                      ? "bg-emerald-500"
                      : isInProgress
                      ? "bg-amber-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                />

                <div className="pl-1 sm:pl-2 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-start gap-1.5 flex-wrap mb-1.5">
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

                    {isLocked24h ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Lock className="w-3 h-3 text-slate-500" />
                        Đã đóng (Quá 24 giờ)
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : isInProgress
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã đánh giá ({evalInfo.evaluatedCount}/{evalInfo.totalMembers})
                          </>
                        ) : isInProgress ? (
                          <>
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            Đang đánh giá ({evalInfo.evaluatedCount}/{evalInfo.totalMembers})
                          </>
                        ) : (
                          <>
                            <span className="size-1.5 rounded-full bg-slate-400" />
                            Chưa đánh giá
                          </>
                        )}
                      </span>
                    )}
                  </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {session.className}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {session.startTime} – {session.endTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatSessionDate(session.date)}</span>
                      {isToday && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-extrabold text-[10px]">
                          HÔM NAY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{session.room || "Studio trung tâm"}</span>
                    </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-center gap-3 lg:min-w-52 lg:px-5 lg:border-x border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          {evalInfo.totalMembers} học viên
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {evalInfo.evaluatedCount}/{evalInfo.totalMembers} đã đánh giá
                      </span>
                  </div>

                  <div className="lg:min-w-48 lg:pl-1">
                  {isLocked24h ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(session.id);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Xem đánh giá (Đã đóng)</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSession(session.id);
                      }}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isCompleted
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 group-hover:bg-slate-200"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Xem / Sửa đánh giá</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </>
                      ) : (
                        <>
                          <span>Đánh giá ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

