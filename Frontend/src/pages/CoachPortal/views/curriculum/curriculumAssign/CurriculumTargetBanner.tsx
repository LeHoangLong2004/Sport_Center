import React from "react";

interface Props {
  assignTarget: {
    curricId: string;
    curricName: string;
    sport?: string;
    level?: string;
  };
}

export function CurriculumTargetBanner({ assignTarget }: Props) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Nội dung lấy từ kế hoạch
        </span>
        {assignTarget.sport && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            {assignTarget.sport} {assignTarget.level ? `• ${assignTarget.level}` : ""}
          </span>
        )}
      </div>
      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
        {assignTarget.curricName}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Hệ thống tạo một lượt bài tập về nhà riêng cho người nhận; kế hoạch mẫu trong thư viện không bị biến thành lượt giao.
      </p>
    </div>
  );
}
