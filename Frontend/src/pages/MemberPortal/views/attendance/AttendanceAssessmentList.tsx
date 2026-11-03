import React from "react";
import type { CoachAssessmentData } from "./types";
import type { MemberScreen } from "../../types";
import {
  Award,
  Calendar,
  Clock,
  Dumbbell,
  MessageSquare,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Props {
  assessments: CoachAssessmentData[];
  loading: boolean;
  onNavigate: (screen: MemberScreen) => void;
}

export default function AttendanceAssessmentList({
  assessments,
  loading,
  onNavigate,
}: Props) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-44 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 mx-auto flex items-center justify-center">
          <Award className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Chưa có đánh giá tiến độ từ Huấn luyện viên
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Sau mỗi ca tập thực tế (lớp nhóm hoặc ca kèm 1-1 PT), Huấn luyện viên sẽ đánh giá mức độ hoàn thành, các chỉ số thể lực và ghi nhận xét kèm định hướng cho bạn tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assessments.map((a) => (
        <div
          key={a.id}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:border-orange-200 dark:hover:border-orange-800/60 transition-all duration-200 space-y-4"
        >
          {/* Card Top: Class, Coach & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3.5">
              {a.coachAvatar ? (
                <img
                  src={a.coachAvatar}
                  alt={a.coachName}
                  className="w-12 h-12 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 font-bold text-white flex items-center justify-center text-sm shadow-xs">
                  {a.coachName ? a.coachName.slice(0, 2).toUpperCase() : "HL"}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {a.className || "Buổi tập cùng Huấn luyện viên"}
                  </h4>
                  {a.sportName && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300">
                      {a.sportName}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Huấn luyện viên: <strong className="text-slate-700 dark:text-slate-300">{a.coachName || "HLV Trung tâm"}</strong>
                </p>
              </div>
            </div>

            {/* Date Tag */}
            <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto font-medium">
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              <span>{formatDate(a.createdAt || a.scheduleTime)}</span>
            </div>
          </div>

          {/* Completion Progress Gauge */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/80 via-amber-50/30 to-white dark:from-orange-950/20 dark:via-slate-800/40 dark:to-slate-900 border border-orange-100 dark:border-orange-900/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Mức độ hoàn thành bài tập
              </span>
              <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400">
                {a.completion}%
              </span>
            </div>

            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.max(0, a.completion))}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Workout Metrics */}
          {Array.isArray(a.metrics) && a.metrics.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                Chỉ số tập luyện & Thể lực đạt được:
              </span>
              <div className="flex flex-wrap gap-2">
                {a.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
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
          {a.comment && (
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Nhận xét & Đánh giá của Huấn luyện viên:
              </span>
              <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed pl-5">
                &ldquo;{a.comment}&rdquo;
              </p>
            </div>
          )}

          {/* Next Steps Recommendation */}
          {a.nextStep && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs space-y-1.5">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-600" />
                Kế hoạch & Định hướng buổi tiếp theo:
              </span>
              <p className="text-amber-900 dark:text-amber-200 leading-relaxed pl-5 font-medium">
                {a.nextStep}
              </p>
            </div>
          )}

          {/* Footer Action */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Trao đổi thêm với HLV
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

