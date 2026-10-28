import React from "react";
import { Calendar, Plus, RefreshCw } from "lucide-react";

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
}

export const ScheduleHeader: React.FC<Props> = ({
  refreshing,
  onRefresh,
  onOpenCreateModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Lịch Hẹn Coach & Tiếp Đón
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              ({new Date().toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Theo dõi và điều phối buổi tập thử 1:1, đo InBody, nhắc hẹn trước 30 phút
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
          <span>Làm mới</span>
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Tạo lịch hẹn</span>
        </button>
      </div>
    </div>
  );
};
