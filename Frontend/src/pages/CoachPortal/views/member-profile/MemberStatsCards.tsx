import React from "react";
import { CheckCircle2, Activity, Clock, TrendingUp } from "lucide-react";
import type { MemberProfileData } from "./types";

interface Props {
  stats: MemberProfileData["stats"];
}

export const MemberStatsCards: React.FC<Props> = ({ stats }) => {
  const attendanceRate = stats.attendanceRate;
  const latest = stats.latestSession;
  const formatNumber = (value?: number | null, suffix = "") => value == null ? "Chưa cập nhật" : `${value}${suffix}`;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Chuyên cần */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>ĐỘ CHUYÊN CẦN</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(attendanceRate, "%")}</span>
          <span className="text-xs text-emerald-600 font-medium">{stats.attendedSessions}/{stats.totalSessions} buổi</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${attendanceRate ?? 0}%` }}></div>
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
            {formatNumber(stats.weight)}{stats.weight != null && <span className="text-sm font-normal text-slate-500"> kg</span>}
          </span>
          <span className="text-xs text-blue-600 font-medium">BMI {formatNumber(stats.bmi)}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Cao: {formatNumber(stats.height, "cm")} · Mỡ: {formatNumber(stats.bodyFat, "%")}</p>
      </div>

      {/* Buổi tập gần nhất */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>BUỔI GẦN NHẤT</span>
          <Clock className="w-4 h-4 text-purple-500" />
        </div>
        <div className="mt-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">{latest?.className || "Chưa có dữ liệu"}</span>
          <span className="text-xs text-emerald-600 font-medium">{latest ? `${latest.status} (${latest.date})` : "Chưa có dữ liệu"}</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">{latest?.completion != null ? `Hoàn thành ${latest.completion}% giáo án` : "Chưa có đánh giá"}</p>
      </div>

      {/* Tiến độ mục tiêu */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>TIẾN ĐỘ MỤC TIÊU</span>
          <TrendingUp className="w-4 h-4 text-orange-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(stats.goalProgress, "%")}</span>
          <span className="text-xs text-orange-600 font-medium">Theo giáo án đã giao</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Tiến độ trung bình từ dữ liệu bài tập</p>
      </div>
    </div>
  );
};
