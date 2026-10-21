import React from "react";
import type { AttendanceSession } from "./types";
import type { MemberScreen } from "../../types";
import {
  Calendar,
  Clock,
  Building,
  UserCheck,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface AttendanceDetailModalProps {
  session: AttendanceSession | null;
  onClose: () => void;
  onNavigate: (screen: MemberScreen) => void;
}

export default function AttendanceDetailModal({
  session,
  onClose,
  onNavigate,
}: AttendanceDetailModalProps) {
  if (!session) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              {session.sport} • {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              {session.className}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Attendance Status Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Trạng thái điểm danh:
          </span>
          {getStatusBadge(session.status)}
        </div>

        {/* Schedule Details */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              Ngày học
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(session.date)}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              Thời gian
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {session.startTime} - {session.endTime}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-teal-500" />
              Phòng tập
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {session.room}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-1 flex items-center gap-1.5 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-teal-500" />
              Huấn luyện viên
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {session.coachName}
            </p>
          </div>
        </div>

        {/* Coach Feedback Note */}
        {session.coachNote ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 space-y-1">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Ghi chú từ Huấn luyện viên
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "{session.coachNote}"
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 text-center">
            Chưa có nhận xét riêng từ Huấn luyện viên cho buổi học này.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onNavigate("chat");
            }}
            className="flex-1 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Nhắn tin với HLV
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
