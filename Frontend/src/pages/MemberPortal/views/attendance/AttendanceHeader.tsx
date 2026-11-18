import React from "react";
import {
  Sparkles,
  UserCheck,
  DoorOpen,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import type { ActivePackageInfo } from "./types";

interface AttendanceHeaderProps {
  sessionsCount: number;
  gateCheckInsCount: number;
  absentCount: number;
  activePackages?: ActivePackageInfo[];
  refreshing: boolean;
  onRefresh: () => void;
}

export default function AttendanceHeader({
  sessionsCount,
  gateCheckInsCount,
  absentCount,
  activePackages = [],
  refreshing,
  onRefresh,
}: AttendanceHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-900 to-slate-900 p-6 sm:p-7 text-white shadow-xl border border-emerald-500/20">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-8 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Điểm danh & Check-in
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Lịch Sử Điểm Danh
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Kiểm tra trạng thái điểm danh lớp học, lịch kèm PT và thời gian quét thẻ check-in tại sảnh Sport Center.
          </p>
          {/* Quick stats pills right inside header */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-medium flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              {sessionsCount} buổi lớp & PT
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white font-medium flex items-center gap-1.5">
              <DoorOpen className="w-3.5 h-3.5" />
              {gateCheckInsCount} lượt check-in sảnh
            </span>
            {absentCount > 0 ? (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {absentCount} buổi vắng
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đầy đủ buổi học
              </span>
            )}
            {activePackages.map((pkg) => (
              <span
                key={pkg.id}
                className="px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-md border border-emerald-300/40 text-emerald-200 font-semibold flex items-center gap-1.5"
                title={`Hạn sử dụng: ${pkg.startDate} đến ${pkg.endDate}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {pkg.packageName}
                <span className="opacity-80 text-[10px]">
                  ({pkg.daysLeft > 0 ? `còn ${pkg.daysLeft} ngày` : "hết hạn"})
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="btn-refresh-attendance"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
