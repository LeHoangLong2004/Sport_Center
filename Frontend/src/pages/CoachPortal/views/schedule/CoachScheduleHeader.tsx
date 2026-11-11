import React from "react";
import { Calendar, Clock, Bell } from "lucide-react";
import type { MainTab } from "./types";

interface Props {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  pendingInvitationsCount: number;
  requestsCount: number;
  onOpenClassProposal?: () => void;
  onOpenSlotModal?: () => void;
  onOpenRequestModal?: () => void;
}

export function CoachScheduleHeader({
  activeTab,
  setActiveTab,
  pendingInvitationsCount,
  requestsCount,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Lịch dạy & Ca làm việc
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Theo dõi ca dạy lớp nhóm, lịch kèm PT 1–1 và quản lý điều chỉnh ca làm việc.
        </p>
      </div>

      {/* Segmented Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-0.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "schedule"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Lịch dạy & PT 1–1</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "availability"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Khung giờ rảnh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "requests"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Yêu cầu & Lời mời</span>
          {pendingInvitationsCount > 0 ? (
            <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
              {pendingInvitationsCount}
            </span>
          ) : requestsCount > 0 ? (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "requests"
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }`}
            >
              {requestsCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
