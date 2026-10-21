import React from "react";
import type { AttendanceSession } from "./types";
import type { MemberScreen } from "../../types";
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ArrowRight,
  RefreshCw,
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
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: AttendanceSession["status"]) => {
    switch (status) {
      case "có mặt":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Có mặt
          </span>
        );
      case "vắng":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Vắng mặt
          </span>
        );
      case "đi muộn":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Đi muộn
          </span>
        );
      case "chưa diễn ra":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Calendar className="w-3.5 h-3.5" />
            Sắp diễn ra
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" />
            Chưa điểm danh
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm lớp, huấn luyện viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Status */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="có mặt">Có mặt</option>
            <option value="vắng">Vắng mặt</option>
            <option value="đi muộn">Đi muộn</option>
            <option value="chưa điểm danh">Chưa điểm danh</option>
            <option value="chưa diễn ra">Sắp diễn ra</option>
          </select>

          {/* Filter by Type */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="all">Mọi hình thức</option>
            <option value="group">Lớp nhóm</option>
            <option value="pt">Kèm 1-1 PT</option>
          </select>
        </div>
      </div>

      {/* Main List Body */}
      {loading ? (
        <div className="p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-teal-500 mb-4" />
          <p className="text-slate-500 text-sm font-medium">Đang tải lịch sử điểm danh...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
            Không tìm thấy dữ liệu điểm danh
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            {sessions.length === 0
              ? "Bạn chưa có buổi tập hoặc lớp học nào đã được điểm danh. Hãy đặt lịch buổi tập mới ngay!"
              : "Không có buổi học nào phù hợp với bộ lọc hiện tại."}
          </p>
          {sessions.length === 0 && (
            <button
              onClick={() => onNavigate("booking")}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              Khám phá & Đặt lịch ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session)}
              className="group relative flex flex-col justify-between p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 cursor-pointer"
            >
              <div className="space-y-4">
                {/* Header Row: Date & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                    <span>{formatDateDisplay(session.date)}</span>
                    <span>•</span>
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  {getStatusBadge(session.status)}
                </div>

                {/* Class Title & Sport Tag */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {session.sport}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                      {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                    {session.className}
                  </h3>
                </div>

                {/* Coach & Room Info */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold flex items-center justify-center overflow-hidden border border-teal-500/20 text-xs">
                      {session.coachAvatar ? (
                        <img src={session.coachAvatar} alt={session.coachName} className="w-full h-full object-cover" />
                      ) : (
                        session.coachName.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {session.coachName}
                      </p>
                      <p className="text-[11px] text-slate-400">Huấn luyện viên phụ trách</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {session.room}
                    </p>
                    <p className="text-[10px] text-slate-400">Phòng tập</p>
                  </div>
                </div>

                {/* Coach's feedback note if present */}
                {session.coachNote && (
                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-xs">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Nhận xét từ HLV:
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{session.coachNote}"
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Detail Link */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                <span>Xem chi tiết buổi học</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
