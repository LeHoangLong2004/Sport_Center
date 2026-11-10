import React from "react";
import { Loader2, Sparkles } from "lucide-react";

/**
 * Base Skeleton component with subtle pulse and optional shimmer effect
 */
export function Skeleton({
  className = "",
  style,
  shimmer = true,
}: {
  className?: string;
  style?: React.CSSProperties;
  shimmer?: boolean;
}) {
  return (
    <div
      style={style}
      className={`relative overflow-hidden rounded-md bg-slate-200/80 dark:bg-slate-700/60 animate-pulse ${
        shimmer ? "animate-shimmer" : ""
      } ${className}`}
    />
  );
}

/**
 * KPI Metric Cards Skeleton (thường dùng ở Admin/Coach Dashboard)
 */
export function KpiCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${count} gap-6 w-full animate-in fade-in duration-300`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-6 rounded-2xl flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-9 w-40 rounded-lg mt-1" />
          <Skeleton className="h-3.5 w-48 mt-1" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table Rows Skeleton (dùng khi load danh sách hội viên, hóa đơn, lịch tập)
 */
export function TableSkeleton({
  rows = 5,
  cols = 5,
  className = "",
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={`w-full divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800/40">
        {Array.from({ length: cols }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-4 ${idx === 0 ? "w-36" : idx === 1 ? "w-28" : "flex-1"}`}
          />
        ))}
      </div>

      {/* Table Body Rows */}
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 px-6 py-4.5">
          {/* Avatar / Col 1 */}
          <div className="flex items-center gap-3 w-36 shrink-0">
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>

          {/* Col 2 */}
          <Skeleton className="h-4 w-28 shrink-0" />

          {/* Middle Cols */}
          {Array.from({ length: Math.max(1, cols - 3) }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-4 flex-1" />
          ))}

          {/* Action / Badge Col */}
          <Skeleton className="h-7 w-20 rounded-lg shrink-0 ml-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * Pricing / Service Cards Skeleton (dùng cho bảng giá gói tập)
 */
export function PricingCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`relative rounded-3xl p-8 flex flex-col justify-between bg-white dark:bg-slate-800 border ${
            i === 1 ? "border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10" : "border-slate-200 dark:border-slate-700 shadow-sm"
          }`}
        >
          {i === 1 && (
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-44" />
            <div className="flex items-baseline gap-2 my-4">
              <Skeleton className="h-10 w-36 rounded-lg" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className={`h-3.5 ${idx % 2 === 0 ? "w-full" : "w-4/5"}`} />
                </div>
              ))}
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-xl mt-8" />
        </div>
      ))}
    </div>
  );
}

/**
 * Bar Chart Skeleton
 */
export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="w-full flex flex-col gap-4 p-6 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div
        style={{ height }}
        className="flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100 dark:border-slate-700"
      >
        {[45, 75, 30, 90, 60, 80, 50, 95, 70, 85, 40, 65].map((val, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              style={{ height: `${val}%` }}
              className="w-full max-w-[28px] rounded-t-lg bg-emerald-100 dark:bg-emerald-900/30"
            />
            <Skeleton className="h-3 w-6 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Modern Full Page / Section Loading Spinner with smooth animated brand badge
 */
export function PageLoader({
  message = "Đang tải dữ liệu...",
  subMessage = "Vui lòng đợi trong giây lát",
  className = "",
}: {
  message?: string;
  subMessage?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 min-h-[320px] w-full text-center ${className}`}>
      <div className="relative mb-5 flex items-center justify-center">
        {/* Glow ambient ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
        
        {/* Spinning border ring */}
        <div className="w-16 h-16 rounded-full border-3 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        
        {/* Inner brand emblem */}
        <div className="absolute inset-2 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
          <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 tracking-wider">
            SC
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-base">
        <span>{message}</span>
        <span className="inline-flex gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
        </span>
      </div>
      
      {subMessage && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-sm">
          {subMessage}
        </p>
      )}
    </div>
  );
}

/**
 * Top Progress Bar (Thanh load chạy ngang đầu trang như YouTube/GitHub khi reload/navigation)
 */
export function TopProgressBar({ loading }: { loading: boolean }) {
  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent overflow-hidden pointer-events-none">
      <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 animate-top-loading origin-left" />
    </div>
  );
}

