import React from "react";
import { Bot, Sparkles, RefreshCw } from "lucide-react";

interface CoachAiLoadingStateProps {
  elapsedSeconds?: number;
  onCancel?: () => void;
}

export const CoachAiLoadingState: React.FC<CoachAiLoadingStateProps> = ({
  elapsedSeconds = 0,
  onCancel,
}) => {
  // Step message based on elapsed time
  const getStepMessage = () => {
    if (elapsedSeconds < 4) {
      return "1/3 Đang phân tích hồ sơ thể trạng và mục tiêu bài tập...";
    }
    if (elapsedSeconds < 8) {
      return "2/3 Google Gemini 1.5 Flash đang biên soạn bài tập chuẩn form...";
    }
    return "3/3 Đang định lượng số hiệp, reps và thời gian nghỉ tối ưu...";
  };

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-8 shadow-sm flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 animate-pulse">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Bot className="w-10 h-10 text-orange-400 animate-bounce" />
          </div>
        </div>
        <div className="absolute -inset-3 bg-orange-500/20 rounded-3xl blur-xl animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-xs font-semibold text-orange-700 dark:text-orange-300 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-spin" />
        <span>Gemini AI đang sinh giáo án ({elapsedSeconds}s)</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-2">
        {getStepMessage()}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        Quá trình mất khoảng 4 - 8 giây để Gemini tính toán khối lượng bài tập theo chuẩn an toàn.
      </p>

      <div className="w-full max-w-sm space-y-2">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(95, 20 + elapsedSeconds * 12)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>Xử lý Structured JSON</span>
          <span>Gemini 1.5 Flash</span>
        </div>
      </div>

      {elapsedSeconds > 12 && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-6 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Hủy và thử lại</span>
        </button>
      )}
    </div>
  );
};
