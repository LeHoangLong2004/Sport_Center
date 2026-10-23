import React, { useState } from "react";
import { X, Sparkles, Clock, Calendar, CheckCircle2, Send, ChevronRight, Dumbbell } from "lucide-react";
import type { MockCurriculum } from "../../services/api";

interface CoachAiHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plans: MockCurriculum[];
  onSelectPlan: (planId: string) => void;
}

export const CoachAiHistoryDrawer: React.FC<CoachAiHistoryDrawerProps> = ({
  isOpen,
  onClose,
  plans,
  onSelectPlan,
}) => {
  const [filter, setFilter] = useState<string>("all");

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = plans.filter((p) => {
    if (filter === "draft") return p.status === "Nháp";
    if (filter === "assigned") return p.status === "Đã giao";
    if (filter === "archived") return p.status === "Lưu trữ";
    return true;
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end cursor-pointer"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-700 animate-in slide-in-from-right duration-250 cursor-default">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Lịch sử giáo án AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Các bản nháp & giáo án đã sinh bởi Gemini
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex gap-1.5 overflow-x-auto">
          {[
            { id: "all", label: "Tất cả" },
            { id: "draft", label: "Bản nháp" },
            { id: "assigned", label: "Đã giao" },
            { id: "archived", label: "Lưu trữ" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                filter === tab.id
                  ? "bg-orange-500 text-white font-bold"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Plan List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              Chưa có giáo án nào trong mục này.
            </div>
          ) : (
            filtered.map((plan) => {
              const exerciseCount = plan.exercises ? plan.exercises.length : 0;
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    onSelectPlan(plan.id);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          plan.status === "Nháp"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                            : plan.status === "Đã giao"
                            ? "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600"
                        }`}
                      >
                        {plan.status}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {plan.updatedAt}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {plan.name}
                    </h4>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 truncate">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-orange-500" />
                        {exerciseCount} bài
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {plan.duration}p
                      </span>
                      {plan.level && (
                        <>
                          <span>·</span>
                          <span className="truncate">{plan.level}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
