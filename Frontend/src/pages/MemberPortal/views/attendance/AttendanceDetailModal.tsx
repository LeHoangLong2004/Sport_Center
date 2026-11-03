import React, { useEffect } from "react";
import { createPortal } from "react-dom";
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
  Award,
  Target,
  Dumbbell,
  ArrowRight,
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
  useEffect(() => {
    if (!session) return;
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [session, onClose]);

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

  const isFutureSession = (dateStr: string, startTimeStr: string): boolean => {
    try {
      if (!dateStr) return false;
      const [year, month, day] = dateStr.split("-").map(Number);
      let hour = 0;
      let minute = 0;
      if (startTimeStr && startTimeStr.includes(":")) {
        const parts = startTimeStr.split(":").map(Number);
        hour = parts[0] || 0;
        minute = parts[1] || 0;
      }
      const sessionDate = new Date(year, month - 1, day, hour, minute);
      return sessionDate.getTime() > Date.now();
    } catch {
      return false;
    }
  };

  const isFuture = isFutureSession(session.date, session.startTime);
  const effectiveStatus = isFuture ? "chưa diễn ra" : session.status;
  const assessment = session.assessment;

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

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                {session.sport} • {session.type === "pt" ? "Kèm 1-1" : "Lớp nhóm"}
              </span>
              {session.packageName && (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Gói: {session.packageName}
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {session.className}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Attendance Status Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Trạng thái điểm danh:
          </span>
          {getStatusBadge(effectiveStatus)}
        </div>

        {/* Schedule & Coach Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-0.5 flex items-center gap-1.5 font-medium text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              Ngày học
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {formatDateDisplay(session.date)}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-0.5 flex items-center gap-1.5 font-medium text-[11px]">
              <Clock className="w-3.5 h-3.5 text-teal-500" />
              Thời gian
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {session.startTime} - {session.endTime}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-0.5 flex items-center gap-1.5 font-medium text-[11px]">
              <Building className="w-3.5 h-3.5 text-teal-500" />
              Phòng tập
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {session.room}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <p className="text-slate-400 mb-0.5 flex items-center gap-1.5 font-medium text-[11px]">
              <UserCheck className="w-3.5 h-3.5 text-teal-500" />
              Huấn luyện viên
            </p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {session.coachName}
            </p>
          </div>
        </div>

        {/* Coach Assessment & Progress Card (If available) */}
        {assessment && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white dark:from-orange-950/20 dark:via-slate-800/50 dark:to-slate-900 border border-orange-200/80 dark:border-orange-800/40 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                <Award className="w-4 h-4 text-orange-500" />
                Đánh giá kết quả từ HLV {session.coachName}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300">
                Hoàn thành: {assessment.completion}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, assessment.completion))}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Fitness & Workout Metrics */}
            {Array.isArray(assessment.metrics) && assessment.metrics.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Chỉ số tập luyện đạt được:
                </span>
                <div className="flex flex-wrap gap-2">
                  {assessment.metrics.map((m, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                    >
                      <Dumbbell className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-slate-500 dark:text-slate-400">{m.name}:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {m.value} {m.unit || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coach Comments */}
            {assessment.comment && (
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  Nhận xét của Huấn luyện viên:
                </span>
                <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed pl-5">
                  &ldquo;{assessment.comment}&rdquo;
                </p>
              </div>
            )}

            {/* Next Steps Direction */}
            {assessment.nextStep && (
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-xs space-y-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-600" />
                  Kế hoạch & Định hướng buổi tiếp theo:
                </span>
                <p className="text-amber-900 dark:text-amber-200 leading-relaxed pl-5 font-medium">
                  {assessment.nextStep}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Coach Attendance Short Note (if no assessment yet or supplementary) */}
        {!assessment && (
          isFuture ? (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30 text-xs space-y-1">
              <p className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Buổi học sắp diễn ra
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Buổi học chưa đến giờ ({session.startTime} - {session.endTime}). Huấn luyện viên sẽ điểm danh và ghi nhận xét sau giờ học.
              </p>
            </div>
          ) : session.coachNote ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 space-y-1">
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                Ghi chú từ Huấn luyện viên
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{session.coachNote}&rdquo;
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 text-center">
              Chưa có nhận xét hoặc đánh giá riêng từ Huấn luyện viên cho buổi học này.
            </div>
          )
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              onClose();
              onNavigate("chat");
            }}
            className="flex-1 py-3 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Nhắn tin với HLV
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
