import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Info,
  Activity,
  FileText,
  ArrowLeft,
} from "lucide-react";
import type { Flow5WorkoutPlan } from "../../../services/api";

interface Props {
  plan: Flow5WorkoutPlan;
  setPlan: React.Dispatch<React.SetStateAction<Flow5WorkoutPlan | null>>;
  onBackToSetup?: () => void;
  onReset: () => void;
  onAiRefine?: (action: "lighter" | "heavier" | "shorten" | "bodyweight") => void;
}

export function CoachAiPlanHeader({
  plan,
  setPlan,
  onBackToSetup,
  onReset,
  onAiRefine,
}: Props) {
  const [showAiDetails, setShowAiDetails] = useState(false);

  const isDraft = plan.status === "draft";
  const isApproved = plan.status === "approved";
  const isAssigned = plan.status === "assigned";
  const isArchived = plan.status === "archived";

  return (
    <>
      {/* Top Navigation & Status Bar */}
      {onBackToSetup && (
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-orange-500" />
            <span>← Quay lại thiết lập tiêu chí / Tạo giáo án mới</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Trạng thái:
            </span>
            {isDraft && (
              <span className="font-bold text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-400/30">
                🟡 HLV đang kiểm duyệt bài tập
              </span>
            )}
            {isApproved && (
              <span className="font-bold text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
                ✓ Đã lưu vào Thư viện giáo án
              </span>
            )}
            {isAssigned && (
              <span className="font-bold text-orange-700 dark:text-orange-300 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-400/30">
                🚀 Đã giao cho học viên
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Banner & Metadata */}
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isDraft && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300">
                🟡 Bản nháp gợi ý (Draft)
              </span>
            )}
            {isApproved && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu Thư viện bài tập (Approved)
              </span>
            )}
            {isAssigned && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/15 border border-orange-400/40 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <Send className="w-3.5 h-3.5" />
                Đã giao cho học viên (Assigned)
              </span>
            )}
            {isArchived && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 border border-slate-400/40 text-slate-700 dark:text-slate-300">
                📦 Đã lưu trữ (Archived)
              </span>
            )}

            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              Phiên bản v{plan.version}
            </span>

            {plan.source === "ai_recommendation" && (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                AI Generated
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAiDetails(!showAiDetails)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showAiDetails ? "Ẩn thông số AI" : "Chi tiết AI"}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* AI Metadata Inspector */}
        {showAiDetails && plan.aiMetadata && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs text-slate-700 dark:text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">AI Provider</span>
              <span className="font-bold">{plan.aiMetadata.provider || "Gemini"}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Mô hình</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {plan.aiMetadata.model || "gemini-1.5-flash"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Token</span>
              <span className="font-bold">
                {plan.aiMetadata.inputTokens || 0} in / {plan.aiMetadata.outputTokens || 0} out
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Thời gian sinh</span>
              <span className="font-bold">
                {plan.aiMetadata.generatedAt
                  ? new Date(plan.aiMetadata.generatedAt).toLocaleTimeString("vi-VN")
                  : "Mới đây"}
              </span>
            </div>
          </div>
        )}

        {/* Plan Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tên giáo án
          </label>
          <input
            type="text"
            value={plan.planName}
            disabled={!isDraft}
            onChange={(e) => setPlan({ ...plan, planName: e.target.value })}
            className={`w-full text-base sm:text-lg font-bold px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none ${
              !isDraft ? "opacity-90 bg-slate-50 dark:bg-slate-900 cursor-not-allowed" : "border-slate-200 dark:border-slate-700"
            }`}
          />
        </div>

        {/* Plan Meta Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            Thời lượng: <strong>{plan.durationMinutes || 60} phút</strong>
          </span>
          {plan.level && (
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              Trình độ: <strong>{plan.level}</strong>
            </span>
          )}
          {plan.goal && (
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-500" />
              Mục tiêu: <strong>{plan.goal}</strong>
            </span>
          )}
        </div>

        {/* AI Copilot Quick Actions */}
        {isDraft && onAiRefine && (
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Trợ lý AI Copilot - Lệnh tinh chỉnh nhanh:</span>
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bấm để AI tự động tối ưu</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onAiRefine("lighter")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Giảm số hiệp, giảm reps, tăng thời gian nghỉ ngơi"
              >
                <span>🔄 AI đổi bài nhẹ hơn</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("heavier")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Tăng hiệp, rút ngắn thời gian nghỉ để đốt mỡ tối đa"
              >
                <span>🔥 Tăng cường độ HIIT</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("shorten")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Rút ngắn thời lượng còn 30 phút, tập trung compound cốt lõi"
              >
                <span>⏱️ Rút ngắn còn 30p</span>
              </button>
              <button
                type="button"
                onClick={() => onAiRefine("bodyweight")}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 dark:hover:border-orange-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                title="Chuyển toàn bộ sang bài tập tay không Bodyweight"
              >
                <span>🤸 Đổi sang Bodyweight (Không tạ)</span>
              </button>
            </div>
          </div>
        )}

        {/* Description & Safety Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Mô tả / Lưu ý an toàn & Kỹ thuật
          </label>
          <textarea
            rows={2}
            value={plan.description || ""}
            disabled={!isDraft}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
            placeholder="Ghi chú về khởi động, phòng tránh chấn thương hoặc dặn dò đặc biệt..."
            className={`w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none ${
              !isDraft ? "opacity-90 bg-slate-50 dark:bg-slate-900 cursor-not-allowed" : "border-slate-200 dark:border-slate-700"
            }`}
          />
        </div>
      </div>
    </>
  );
}
