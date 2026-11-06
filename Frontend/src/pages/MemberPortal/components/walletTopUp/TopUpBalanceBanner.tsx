import React from "react";
import { Wallet, Sparkles } from "lucide-react";

interface Props {
  currentBalance: number;
  userName: string;
}

export const TopUpBalanceBanner: React.FC<Props> = ({ currentBalance, userName }) => {
  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md flex items-center justify-between border border-slate-700/50">
      <div>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Wallet className="w-3 h-3 text-emerald-400" /> Số dư khả dụng
        </span>
        <div className="text-xl font-black text-white mt-0.5">
          {currentBalance.toLocaleString("vi-VN")}{" "}
          <span className="text-xs font-semibold text-emerald-400">đ</span>
        </div>
      </div>
      <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> <span>{userName}</span>
      </div>
    </div>
  );
};
