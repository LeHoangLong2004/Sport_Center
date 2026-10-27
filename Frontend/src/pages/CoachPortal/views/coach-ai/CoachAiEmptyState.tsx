import React from "react";
import { Sparkles, Zap, Dumbbell, HeartPulse, ShieldCheck, ArrowRight, Bot } from "lucide-react";
import { ROUTINE_PRESETS, type RoutinePreset } from "./types";

interface CoachAiEmptyStateProps {
  onQuickDemo?: () => void;
  onApplyPreset?: (preset: RoutinePreset) => void;
}

export const CoachAiEmptyState: React.FC<CoachAiEmptyStateProps> = ({ onQuickDemo, onApplyPreset }) => {
  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[560px]">
      {/* Top AI Badge */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 p-0.5 shadow-lg shadow-orange-500/20">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-orange-500 dark:text-orange-400">
            <Bot className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">
        Trợ lý AI Gợi Ý Bài Tập Huấn Luyện Viên
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed mb-6">
        Hệ thống tích hợp <strong>Google Gemini AI</strong> phân tích thể trạng, chỉ số BMI và tiền sử chấn thương để đề xuất bài tập an toàn. HLV toàn quyền tinh chỉnh trước khi giao cho học viên.
      </p>

      {/* Interactive Quick Presets Section */}
      <div className="w-full max-w-xl mb-6 text-left">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>Khám phá các mẫu giáo án được đề xuất:</span>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 normal-case font-semibold">
            Bấm để nạp thông số ngay
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ROUTINE_PRESETS.slice(0, 3).map((preset) => (
            <div
              key={preset.id}
              onClick={() => onApplyPreset?.(preset)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-orange-50/80 dark:hover:bg-orange-950/40 hover:border-orange-300 dark:hover:border-orange-700/60 transition-all cursor-pointer group flex flex-col justify-between gap-2 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{preset.durationMinutes}p</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                  {preset.title}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                  {preset.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-orange-600 dark:text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Chọn mẫu này</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Steps Showcase */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl mb-6 text-left">
        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900 text-center leading-4 text-[10px]">1</span>
            <span>Thể trạng & Bệnh lý</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Chiều cao, cân nặng, tiền sử chấn thương khớp.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 text-center leading-4 text-[10px]">2</span>
            <span>Lọc an toàn AI</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Gemini tự động loại bỏ bài tập gây áp lực chấn thương.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900 text-center leading-4 text-[10px]">3</span>
            <span>HLV kiểm duyệt</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Coach-in-the-Loop: sửa sets, reps, đổi bài linh hoạt.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-center leading-4 text-[10px]">4</span>
            <span>Giao học viên</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Lưu Thư viện hoặc giao trực tiếp học viên tập luyện.
          </p>
        </div>
      </div>

      {onQuickDemo && (
        <button
          type="button"
          onClick={onQuickDemo}
          className="text-xs font-semibold px-4 py-2.5 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>⚡ Nạp nhanh dữ liệu mẫu & Tạo bài tập ngay</span>
        </button>
      )}
    </div>
  );
};
