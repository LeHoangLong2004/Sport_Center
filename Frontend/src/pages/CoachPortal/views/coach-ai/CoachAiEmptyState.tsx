import React from "react";
import { Sparkles } from "lucide-react";

interface CoachAiEmptyStateProps {
  onQuickDemo?: () => void;
}

export const CoachAiEmptyState: React.FC<CoachAiEmptyStateProps> = ({ onQuickDemo }) => {
  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center text-center min-h-[500px]">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center mb-5 text-orange-500 dark:text-orange-400 shadow-inner">
        <Sparkles className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
        Không gian duyệt giáo án AI (Flow 5)
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        Chọn đối tượng và mục tiêu bên trái, sau đó nhấn <strong>"Sinh giáo án với Gemini AI"</strong> để tạo bản nháp. Giáo án sẽ xuất hiện tại đây để bạn kiểm duyệt và chỉnh sửa.
      </p>

      {/* 4 Steps Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-8 text-left">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900 text-center leading-4 text-[10px]">1</span>
            <span>Cá nhân hóa ngữ cảnh</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Dựa trên BMI, lịch sử tập và thiết bị sẵn có.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900 text-center leading-4 text-[10px]">2</span>
            <span>Gemini 1.5 Flash</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sinh bài tập nhanh, chuẩn JSON có số hiệp, reps & rest.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900 text-center leading-4 text-[10px]">3</span>
            <span>Coach kiểm duyệt</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            HLV tự do chỉnh sửa hiệp, lần tập hoặc thêm bớt bài.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900 text-center leading-4 text-[10px]">4</span>
            <span>Duyệt & Giao 1 chạm</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Chỉ giáo án đã được duyệt mới được giao cho học viên.
          </p>
        </div>
      </div>

      {onQuickDemo && (
        <button
          type="button"
          onClick={onQuickDemo}
          className="text-xs font-semibold px-4 py-2 rounded-xl text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-colors cursor-pointer"
        >
          ⚡ Thử nhanh với dữ liệu mẫu Flow 5
        </button>
      )}
    </div>
  );
};
