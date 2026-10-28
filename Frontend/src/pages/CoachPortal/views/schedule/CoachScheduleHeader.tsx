import React from "react";
import { CalendarPlus, Send } from "lucide-react";
import type { MainTab } from "./types";

interface Props {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  pendingInvitationsCount: number;
  requestsCount: number;
  onOpenClassProposal: () => void;
  onOpenSlotModal: () => void;
  onOpenRequestModal: () => void;
}

export function CoachScheduleHeader({
  activeTab,
  setActiveTab,
  pendingInvitationsCount,
  requestsCount,
  onOpenClassProposal,
  onOpenSlotModal,
  onOpenRequestModal,
}: Props) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1">HLV / LỊCH DẠY</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Lịch dạy & Ca làm việc
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenClassProposal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            Đề xuất lớp học
          </button>

          <button
            type="button"
            onClick={onOpenSlotModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4" />
            Đăng lịch trống 1–1
          </button>

          <button
            type="button"
            onClick={onOpenRequestModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            Yêu cầu ca dạy / Dạy thay
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "schedule"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Lịch dạy & PT 1–1
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "availability"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          Khung giờ rảnh
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === "requests"
              ? "border-orange-500 text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <span>Yêu cầu & Lời mời</span>
          {pendingInvitationsCount > 0 ? (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
              {pendingInvitationsCount}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">({requestsCount})</span>
          )}
        </button>
      </div>
    </>
  );
}
