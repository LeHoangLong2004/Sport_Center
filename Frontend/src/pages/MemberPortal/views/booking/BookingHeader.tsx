import React from "react";
import { Sparkles, Users, Dumbbell, Receipt } from "lucide-react";

interface BookingHeaderProps {
  activeTab: "group" | "pt" | "my_classes";
  setActiveTab: (tab: "group" | "pt" | "my_classes") => void;
  groupClassesCount: number;
  ptSlotsCount: number;
  myRegisteredClassesCount: number;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  activeTab,
  setActiveTab,
  groupClassesCount,
  ptSlotsCount,
  myRegisteredClassesCount,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span className="text-xs font-bold text-slate-500">Mọi hạng thành viên đều được đặt lịch</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Khám phá & Đặt lịch lớp học
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
          Khám phá trọn vẹn danh sách lớp học của tất cả Huấn luyện viên. Hội viên cơ bản (Basic) thanh toán với giá gốc niêm yết mà không bị giới hạn.
        </p>
      </div>

      {/* 3 TABS */}
      <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 self-start lg:self-center border border-slate-200/80 dark:border-slate-700 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("group")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "group"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Lớp nhóm ({groupClassesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("pt")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pt"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Kèm riêng 1–1 ({ptSlotsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my_classes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "my_classes"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Lớp đã đăng ký</span>
          {myRegisteredClassesCount > 0 && (
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
              {myRegisteredClassesCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
