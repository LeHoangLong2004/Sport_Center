import React from "react";
import type { MemberScreen } from "../../types";
import { Sparkles, Wallet, Compass, Bot } from "lucide-react";

interface DashboardWelcomeBannerProps {
  userName: string;
  balance: number;
  upcomingSessionsCount: number;
  hasActivePackages: boolean;
  onNavigate: (screen: MemberScreen) => void;
}

export const DashboardWelcomeBanner: React.FC<DashboardWelcomeBannerProps> = ({
  userName,
  balance,
  upcomingSessionsCount,
  hasActivePackages,
  onNavigate,
}) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-slate-700/50">
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{hasActivePackages ? "Hội viên Thể thao SportCenter" : "Thành viên Mới SportCenter"}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Xin chào, {userName} 👋</h1>
        <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
          {upcomingSessionsCount > 0
            ? `Chào mừng bạn trở lại! Bạn có ${upcomingSessionsCount} buổi tập được xếp lịch trong tuần này. Hãy duy trì năng lượng và tập luyện đều đặn nhé!`
            : "Chào mừng bạn đến với SportCenter! Hãy bắt đầu hành trình nâng cao sức khỏe bằng việc khám phá các gói tập và lớp học nhé!"}
        </p>
        <div className="pt-2 flex items-center gap-3">
          <div className="inline-flex items-center gap-3 p-2 px-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-slate-300 font-medium">Số dư ví:</span>
              <strong className="text-sm font-extrabold text-white tracking-tight">
                {balance.toLocaleString("vi-VN")} đ
              </strong>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-wallet-modal"))}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer shadow-xs"
            >
              + Nạp ví
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          onClick={() => onNavigate("booking")}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Khám phá & Đặt lịch</span>
        </button>
        <button
          onClick={() => onNavigate("support")}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/10"
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Hỏi AI Trợ lý</span>
        </button>
      </div>
    </div>
  </div>
);
