import React, { useState } from "react";
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
  LayoutList,
  LayoutGrid,
  MapPin,
  User,
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const parseDateParts = (dateStr: string) => {
    if (!dateStr) return { weekday: "", day: "--", month: "", full: "N/A" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { weekday: "", day: "--", month: "", full: dateStr };
      const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
      const day = d.getDate().toString().padStart(2, "0");
      const month = `Thg ${d.getMonth() + 1}`;
      const full = d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return { weekday, day, month, full };
    } catch {
      return { weekday: "", day: "--", month: "", full: dateStr };
    }
  };

  const isFutureSession = (dateStr: string, startTimeStr: string) => {
    if (!dateStr || !startTimeStr) return false;
    try {
      const sessionDateTime = new Date(`${dateStr}T${startTimeStr}:00`);
      return !isNaN(sessionDateTime.getTime()) && sessionDateTime.getTime() > Date.now();
    } catch {
      return false;
    }
  };

  const getStatusConfig = (status: AttendanceSession["status"]) => {
    switch (status) {
      case "có mặt":
        return {
          label: "Có mặt",
          icon: CheckCircle2,
          badgeCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
          borderCls: "border-l-emerald-500",
          dateBoxCls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50",
        };
      case "vắng":
        return {
          label: "Vắng mặt",
          icon: XCircle,
          badgeCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
          borderCls: "border-l-rose-500",
          dateBoxCls: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50",
        };
      case "đi muộn":
        return {
          label: "Đi muộn",
          icon: AlertCircle,
          badgeCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          borderCls: "border-l-amber-500",
          dateBoxCls: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50",
        };
      case "chưa diễn ra":
        return {
          label: "Sắp diễn ra",
          icon: Clock,
          badgeCls: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
          borderCls: "border-l-sky-500",
          dateBoxCls: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-800/50",
        };
      default:
        return {
          label: "Chưa điểm danh",
          icon: Clock,
          badgeCls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25",
          borderCls: "border-l-slate-400",
          dateBoxCls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter & View Mode Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên lớp, huấn luyện viên..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="có mặt">Có mặt</option>
            <option value="vắng">Vắng mặt</option>
            <option value="đi muộn">Đi muộn</option>
            <option value="chưa điểm danh">Chưa điểm danh</option>
            <option value="chưa diễn ra">Sắp diễn ra</option>
          </select>

          {/* Type Select */}
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold cursor-pointer"
          >
            <option value="all">Mọi hình thức</option>
            <option value="group">Lớp nhóm</option>
            <option value="pt">Kèm 1-1 PT</option>
          </select>

          {/* View Mode Toggle (List / Grid) */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Xem dạng danh sách dòng thời gian"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              }`}
              title="Xem dạng thẻ lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      {loading ? (
        <div className="p-16 text-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-500" />
          <p className="text-slate-500 text-sm font-semibold">Đang đồng bộ dữ liệu điểm danh...</p>
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              Khám phá & Đặt lịch ngay
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* ================= 1. DẠNG DANH SÁCH DÒNG THỜI GIAN (LIST VIEW) ================= */
        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const isFuture = isFutureSession(session.date, session.startTime);
            const effectiveStatus = isFuture ? "chưa diễn ra" : session.status;
            const statusCfg = getStatusConfig(effectiveStatus);
            const StatusIcon = statusCfg.icon;
            const dateParts = parseDateParts(session.date);

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`group relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-500/50 transition-all duration-200 cursor-pointer border-l-4 ${statusCfg.borderCls} flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                {/* Left: Date Box & Main Details */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  {/* Date Badge Box */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-2xs ${statusCfg.dateBoxCls}`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 leading-none">
                      {dateParts.weekday}
                    </span>
                    <span className="text-lg sm:text-xl font-black leading-tight my-0.5">
                      {dateParts.day}
                    </span>
                    <span className="text-[9px] font-bold opacity-75 leading-none">
                      {dateParts.month}
                    </span>
                  </div>

                  {/* Class Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Tags row: Sport, Type, Time, Room */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {session.sport}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {session.startTime} - {session.endTime}
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
                        •
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {session.room}
                      </span>
                    </div>

                    {/* Class Name */}
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {session.className}
                    </h3>

                    {/* Coach & Notice / Feedback Preview */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0">
                          {session.coachAvatar ? (
                            <img src={session.coachAvatar} alt={session.coachName} className="w-full h-full object-cover" />
                          ) : (
                            session.coachName.charAt(0)
                          )}
                        </div>
                        <span>HLV {session.coachName}</span>
                      </div>

                      {isFuture ? (
                        <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                          • Sắp diễn ra, HLV sẽ điểm danh sau buổi học
                        </span>
                      ) : session.coachNote ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 italic line-clamp-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          "{session.coachNote}"
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Status Badge & Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-2xs ${statusCfg.badgeCls}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusCfg.label}</span>
                  </span>

                  <button
                    type="button"
                    className="p-2 rounded-xl text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <span className="hidden lg:inline">Chi tiết</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= 2. DẠNG THẺ LƯỚI NÂNG CẤP (GRID VIEW) ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSessions.map((session) => {
            const isFuture = isFutureSession(session.date, session.startTime);
            const effectiveStatus = isFuture ? "chưa diễn ra" : session.status;
            const statusCfg = getStatusConfig(effectiveStatus);
            const StatusIcon = statusCfg.icon;
            const dateParts = parseDateParts(session.date);

            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all duration-200 cursor-pointer border-t-4 ${statusCfg.borderCls}`}
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Date string & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateParts.full}</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusCfg.badgeCls}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Tags & Class Title */}
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {session.sport}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.startTime} - {session.endTime}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {session.className}
                    </h3>
                  </div>

                  {/* Coach & Room Box */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold flex items-center justify-center overflow-hidden shrink-0 text-xs text-slate-700 dark:text-slate-200">
                        {session.coachAvatar ? (
                          <img src={session.coachAvatar} alt={session.coachName} className="w-full h-full object-cover" />
                        ) : (
                          session.coachName.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{session.coachName}</p>
                        <p className="text-[10px] text-slate-400">HLV phụ trách</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{session.room}</p>
                      <p className="text-[10px] text-slate-400">Phòng tập</p>
                    </div>
                  </div>

                  {/* Message Note */}
                  {isFuture ? (
                    <div className="p-2.5 rounded-xl bg-sky-50/80 dark:bg-sky-950/30 text-[11px] text-sky-700 dark:text-sky-300 font-medium flex items-center gap-1.5 border border-sky-100 dark:border-sky-900/50">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Sắp diễn ra, HLV sẽ điểm danh sau buổi học.</span>
                    </div>
                  ) : session.coachNote ? (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                      <p className="italic line-clamp-1">"{session.coachNote}"</p>
                    </div>
                  ) : null}
                </div>

                {/* Footer Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Xem chi tiết buổi học</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
