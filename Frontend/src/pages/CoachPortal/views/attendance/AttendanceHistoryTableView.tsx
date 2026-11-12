import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Dumbbell,
  ArrowRight,
  FileText,
  Lock,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle
} from "lucide-react";
import type { MockSession } from "../../services/api";
import { isSessionPast24Hours } from "../../utils/attendanceTimeUtils";

interface Props {
  activeSessions: MockSession[];
  isLoading: boolean;
  onSelectSession: (sessionId: string) => void;
  finalizedMap: Record<string, boolean>;
}

const ITEMS_PER_PAGE = 7;

export default function AttendanceHistoryTableView({
  activeSessions,
  isLoading,
  onSelectSession,
  finalizedMap,
}: Props) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "finalized" | "draft" | "locked">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dayName}, ${dd}/${mm}/${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const sessionsWithStats = useMemo(() => {
    return activeSessions.map((session) => {
      const isFinalized = !!finalizedMap[session.id] || session.status === "hoàn thành";
      const isPast24h = isSessionPast24Hours(session.date, session.startTime);
      const localKey = `coach_attendance_${session.id}`;
      let localRecords: any[] = [];
      try {
        const item = localStorage.getItem(localKey);
        if (item) localRecords = JSON.parse(item);
      } catch {}

      const enrolled = Array.isArray(session.registeredMemberIds)
        ? session.registeredMemberIds.length
        : (session as any).registeredCount || 0;

      const attendedCount = localRecords.filter((r) => r.status === "attended").length;
      const absentCount = localRecords.filter((r) => r.status === "no_show").length;
      const totalRecorded = localRecords.length || enrolled;

      const attendanceRate = totalRecorded > 0 ? Math.round((attendedCount / totalRecorded) * 100) : 0;

      return {
        ...session,
        isFinalized,
        isPast24h,
        enrolled,
        attendedCount,
        absentCount,
        attendanceRate,
        isToday: session.date === todayIso,
      };
    });
  }, [activeSessions, finalizedMap, todayIso]);

  const filteredSessions = useMemo(() => {
    return sessionsWithStats.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.className.toLowerCase().includes(q) ||
        (s.sport && s.sport.toLowerCase().includes(q)) ||
        (s.room && s.room.toLowerCase().includes(q)) ||
        s.date.includes(q);

      if (!matchSearch) return false;
      if (filterMode === "finalized") return s.isFinalized && !s.isPast24h;
      if (filterMode === "draft") return !s.isFinalized && !s.isPast24h;
      if (filterMode === "locked") return s.isPast24h;
      return true;
    });
  }, [sessionsWithStats, search, filterMode]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterMode]);

  const totalSessions = activeSessions.length;
  const finalizedCount = sessionsWithStats.filter((s) => s.isFinalized).length;
  const lockedCount = sessionsWithStats.filter((s) => s.isPast24h).length;
  const pendingCount = sessionsWithStats.filter((s) => !s.isFinalized && !s.isPast24h).length;

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage]);

  const startRecord = filteredSessions.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, filteredSessions.length);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 3 KPI Thống Kê Tổng Quan Lịch Sử */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng ca dạy đã lên lịch</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalSessions}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Toàn bộ kỳ dạy học</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Ca đã chốt sổ điểm danh</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{finalizedCount}</p>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">Sổ điểm danh hợp lệ</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Ca đã khóa quá hạn 24h</p>
            <p className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">{lockedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Khóa vĩnh viễn không thể sửa</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Lịch Sử Điểm Danh */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        {/* Header bảng & Công cụ tìm kiếm / Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Nhật ký điểm danh ca dạy</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                {filteredSessions.length} ca
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tra cứu lại các ca dạy, tỷ lệ chuyên cần và kiểm tra sổ điểm danh theo quy định 24h
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Pill */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterMode === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Tất cả ({totalSessions})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("finalized")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterMode === "finalized"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Đã chốt ({finalizedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("locked")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterMode === "locked"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xs font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Khóa quá 24h ({lockedCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm lớp, môn, phòng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Bảng Dữ Liệu Lịch Sử */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="size-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-xs font-semibold">Đang tải lịch sử điểm danh...</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Không tìm thấy ca dạy nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Lớp học & Bộ môn</th>
                  <th className="py-3 px-4">Thời gian & Ngày</th>
                  <th className="py-3 px-4">Phòng tập</th>
                  <th className="py-3 px-4 text-center">Sĩ số ca</th>
                  <th className="py-3 px-4 text-center">Trạng thái sổ</th>
                  <th className="py-3 px-4 text-center w-[140px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Tên lớp & Bộ môn */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                          s.isPast24h
                            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                            {s.className}
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {s.sport || "Lớp nhóm"} {s.level ? `• ${s.level}` : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Thời gian & Ngày */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{s.startTime} - {s.endTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatSessionDate(s.date)}</span>
                          {s.isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold text-[9px]">
                              HÔM NAY
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phòng tập */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.room || "Gym Area"}</span>
                      </div>
                    </td>

                    {/* Sĩ số ca & Chuyên cần */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.enrolled}/{s.capacity} HV
                        </span>
                        {s.isFinalized && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Có mặt: {s.attendedCount} • Vắng: {s.absentCount}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Trạng thái sổ điểm danh */}
                    <td className="py-3.5 px-4 text-center">
                      {s.isPast24h ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          <Lock className="w-3 h-3 text-slate-500" />
                          Đã khóa (Quá 24h)
                        </span>
                      ) : s.isFinalized ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Đã chốt sổ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Chưa chốt
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectSession(s.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer ${
                          s.isPast24h
                            ? "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                            : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                        }`}
                      >
                        {s.isPast24h ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem chi tiết</span>
                          </>
                        ) : (
                          <>
                            <span>{s.isFinalized ? "Xem / Sửa" : "Điểm danh"}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* THANH PHÂN TRANG GỌN GÀNG (PAGINATION BAR) */}
        {filteredSessions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Hiển thị <span className="font-bold text-slate-900 dark:text-white">{startRecord} - {endRecord}</span> trong tổng số{" "}
              <span className="font-bold text-slate-900 dark:text-white">{filteredSessions.length}</span> ca dạy
            </div>

            <div className="flex items-center gap-1.5">
              {/* Nút Trước */}
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              {/* Danh sách trang */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-8 h-8 px-2 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Nút Sau */}
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
