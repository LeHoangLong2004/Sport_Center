import React from "react";
import { Sparkles, History, Bot, ShieldCheck } from "lucide-react";

interface CoachAiHeaderProps {
  onOpenHistory: () => void;
  historyCount: number;
}

export const CoachAiHeader: React.FC<CoachAiHeaderProps> = ({
  onOpenHistory,
  historyCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-orange-500/30 p-6 shadow-xl text-white">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/25 shrink-0">
            <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-orange-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300">
                Flow 5 · AI Workout Recommendation
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Gemini Connected
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Coach-in-the-Loop
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-amber-200">
              Gợi ý bài tập thông minh với AI
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Trợ lý AI phân tích mục tiêu, trình độ và thể trạng của học viên để gợi ý danh sách bài tập tối ưu. 
              HLV xem xét, tinh chỉnh liều lượng và duyệt trước khi giao.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-orange-400/50 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <History className="w-4 h-4 text-orange-400" />
            <span>Lịch sử gợi ý bài tập AI</span>
            {historyCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/30 text-orange-200 font-bold border border-orange-400/30">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
