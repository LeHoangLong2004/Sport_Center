import React from "react";
import { Bot, Sparkles, RefreshCw, ShieldCheck, HeartPulse, Cpu, CheckCircle2 } from "lucide-react";

interface CoachAiLoadingStateProps {
  elapsedSeconds?: number;
  onCancel?: () => void;
  targetName?: string;
  sportName?: string;
  goal?: string;
  durationMinutes?: number;
}

export const CoachAiLoadingState: React.FC<CoachAiLoadingStateProps> = ({
  elapsedSeconds = 0,
  onCancel,
  targetName,
  sportName,
  goal,
  durationMinutes,
}) => {
  // Step progression based on elapsed seconds
  const stepIndex = elapsedSeconds < 3 ? 1 : elapsedSeconds < 6 ? 2 : elapsedSeconds < 9 ? 3 : 4;

  const steps = [
    {
      title: "1. Nạp hồ sơ thể trạng & Phân tích chỉ số BMI",
      desc: "Trích xuất chiều cao, cân nặng và tiền sử chấn thương của học viên",
      active: stepIndex === 1,
      done: stepIndex > 1,
    },
    {
      title: "2. Kích hoạt bộ lọc an toàn Gemini AI Safety Filter",
      desc: "Tự động loại bỏ các bài tập gây xung lực tiêu cực lên vùng chấn thương",
      active: stepIndex === 2,
      done: stepIndex > 2,
    },
    {
      title: "3. Google Gemini 1.5 Flash sinh bài tập chuyên sâu",
      desc: "Lựa chọn các bài tập phù hợp mục tiêu, trình độ & lịch sử tập luyện",
      active: stepIndex === 3,
      done: stepIndex > 3,
    },
    {
      title: "4. Định lượng số hiệp (Sets), số lần (Reps) & thời gian nghỉ",
      desc: "Hoàn tất bản nháp để Huấn luyện viên kiểm duyệt (Coach-in-the-Loop)",
      active: stepIndex === 4,
      done: stepIndex > 4,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto w-full my-4 text-center animate-in fade-in duration-300">
      {/* Central Glowing AI Hologram */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 p-1 shadow-xl shadow-orange-500/25">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Bot className="w-12 h-12 text-orange-400 animate-pulse" />
          </div>
        </div>
        <div className="absolute -inset-4 bg-orange-500/15 rounded-full blur-2xl animate-pulse pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-slate-800">
          <Sparkles className="w-4 h-4 animate-spin" />
        </div>
      </div>

      {/* Target Info Pill */}
      {(targetName || sportName) && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-xs font-semibold text-orange-800 dark:text-orange-200 mb-3 shadow-xs">
          <Cpu className="w-3.5 h-3.5 text-orange-500" />
          <span>
            Đang tạo bài tập cho: <strong>{targetName || "Học viên"}</strong> {sportName ? `· ${sportName}` : ""} {durationMinutes ? `· ${durationMinutes}p` : ""}
          </span>
        </div>
      )}

      <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1.5">
        Gemini AI đang sinh giáo án cá nhân hóa...
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        {goal ? `Mục tiêu: "${goal}". ` : ""}Hệ thống đang xử lý và phản hồi dưới dạng Structured JSON chuẩn an toàn thể thao.
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2 mb-8">
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 transition-all duration-500 rounded-full shadow-sm"
            style={{ width: `${Math.min(95, 25 + elapsedSeconds * 12)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
          <span>Thời gian: {elapsedSeconds}s</span>
          <span>Mô hình: Gemini 1.5 Flash</span>
        </div>
      </div>

      {/* Step by Step AI Generation Pipeline */}
      <div className="w-full max-w-md flex flex-col gap-2.5 text-left mb-6">
        {steps.map((s, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
              s.done
                ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100"
                : s.active
                ? "bg-orange-50/80 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700/80 text-orange-900 dark:text-orange-100 ring-1 ring-orange-500/20"
                : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-60"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {s.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : s.active ? (
                <div className="w-4 h-4 border-2 border-orange-500/40 border-t-orange-600 rounded-full animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">{s.title}</div>
              <div className="text-[11px] opacity-80 mt-0.5 leading-snug">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {elapsedSeconds > 10 && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Hủy và quay lại</span>
        </button>
      )}
    </div>
  );
};
