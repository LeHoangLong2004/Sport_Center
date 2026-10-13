import React from "react";
import { CheckCircle2, Activity, Clock, TrendingUp } from "lucide-react";

export const MemberStatsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Chuyên cần */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>ĐỘ CHUYÊN CẦN</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">92%</span>
          <span className="text-xs text-emerald-600 font-medium">11/12 buổi</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }}></div>
        </div>
      </div>

      {/* Cân nặng & BMI */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>CHỈ SỐ THỂ CHẤT</span>
          <Activity className="w-4 h-4 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            64.5 <span className="text-sm font-normal text-slate-500">kg</span>
          </span>
          <span className="text-xs text-blue-600 font-medium">BMI 21.8</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Cao: 172cm · Mỡ: 16.2%</p>
      </div>

      {/* Buổi tập gần nhất */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>BUỔI GẦN NHẤT</span>
          <Clock className="w-4 h-4 text-purple-500" />
        </div>
        <div className="mt-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">Gym BodyCombat</span>
          <span className="text-xs text-emerald-600 font-medium">Có mặt (11/10/2026)</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Hoàn thành 100% giáo án</p>
      </div>

      {/* Tiến độ mục tiêu */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>TIẾN ĐỘ MỤC TIÊU</span>
          <TrendingUp className="w-4 h-4 text-orange-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">78%</span>
          <span className="text-xs text-orange-600 font-medium">Giai đoạn 1</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Sức bền & cơ bắp săn chắc</p>
      </div>
    </div>
  );
};
