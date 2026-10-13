import React from "react";
import { Clock, MapPin, PlusCircle, MessageSquare } from "lucide-react";
import type { CoachScreen } from "../../types";
import type { MockSession } from "../../services/api";

interface DashboardSidebarProps {
  nextSession?: MockSession;
  pendingSessions: MockSession[];
  navigateTo: (s: CoachScreen, extra?: { sessionId?: string }) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  nextSession,
  pendingSessions,
  navigateTo,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Next upcoming class highlight */}
      {nextSession && (
        <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Lớp sắp bắt đầu
            </span>
            <h3 className="text-lg font-bold mt-1 text-white">{nextSession.className}</h3>
            <div className="text-xs text-slate-300 space-y-1 mt-2 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {nextSession.startTime} – {nextSession.endTime}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {nextSession.room}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {nextSession.registeredMemberIds.length} học viên
            </span>
            <button
              type="button"
              onClick={() => navigateTo("class-detail", { sessionId: nextSession.id })}
              className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Vào lớp ngay →
            </button>
          </div>
        </div>
      )}

      {/* Pending to-dos */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col gap-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
          <span>Việc cần xử lý</span>
          <span className="text-xs font-semibold text-slate-400">
            {pendingSessions.length} việc
          </span>
        </h3>

        {pendingSessions.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 text-center font-medium">
            🎉 Tuyệt vời! Không có buổi học nào bị tồn đọng điểm danh.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => navigateTo("attendance", { sessionId: s.id })}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Chưa chốt điểm danh
                  </span>
                  <span className="text-[11px] text-slate-500">{s.className} ({s.startTime})</span>
                </div>
                <span className="text-emerald-600 font-semibold text-xs">Xử lý →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Shortcuts */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex flex-col gap-2.5">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
          Truy cập nhanh
        </h3>
        <button
          type="button"
          onClick={() => navigateTo("curriculum")}
          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-slate-500" /> Soạn giáo án bài tập mới
          </span>
          <span>→</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo("reviews")}
          className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" /> Xem nhận xét & Đánh giá từ học viên
          </span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
