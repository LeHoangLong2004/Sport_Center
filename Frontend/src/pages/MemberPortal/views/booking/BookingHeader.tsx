import React from "react";
import { Sparkles, Users, Dumbbell, Receipt, Award } from "lucide-react";
import { CoachAvatar, getRealCoachAvatar } from "../../utils/coachAvatar";

interface BookingHeaderProps {
  activeTab: "group" | "pt" | "my_classes";
  setActiveTab: (tab: "group" | "pt" | "my_classes") => void;
  groupClassesCount: number;
  ptSlotsCount: number;
  myActiveClassesCount: number;
  coaches: any[];
  selectedCoachId: string;
  setSelectedCoachId: (id: string) => void;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  activeTab,
  setActiveTab,
  groupClassesCount,
  ptSlotsCount,
  myActiveClassesCount,
  coaches,
  selectedCoachId,
  setSelectedCoachId,
}) => {
  return (
    <>
      {/* Top Banner and Tabs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
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
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "group"
                ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Lớp nhóm ({groupClassesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pt")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pt"
                ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Kèm riêng 1–1 ({ptSlotsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my_classes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "my_classes"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Lớp đã đăng ký</span>
            {myActiveClassesCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {myActiveClassesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* QUICK COACH CAROUSEL (Khám phá All Coach) */}
      {activeTab === "group" && coaches.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Đội ngũ Huấn luyện viên ({coaches.length} HLV)
              </h3>
            </div>
            {selectedCoachId !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCoachId("all")}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline"
              >
                Xem tất cả HLV
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCoachId("all")}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                selectedCoachId === "all"
                  ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-black">
                ALL
              </div>
              <span>Tất cả Huấn luyện viên</span>
            </button>

            {coaches.map((c) => {
              const isSelected = selectedCoachId === c.id;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCoachId(isSelected ? "all" : c.id)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all border ${
                    isSelected
                      ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500"
                  }`}
                >
                  <CoachAvatar
                    src={c.avatarUrl}
                    name={c.fullName}
                    className="w-7 h-7 rounded-full shrink-0"
                  />
                  <div className="text-left">
                    <p className="font-bold text-xs leading-tight">{c.fullName}</p>
                    <p
                      className={`text-[10px] leading-tight ${
                        isSelected ? "text-teal-100" : "text-slate-400"
                      }`}
                    >
                      {c.specialty || "Huấn luyện viên"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
