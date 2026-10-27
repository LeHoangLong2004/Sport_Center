import React from "react";

interface Props {
  onClose: () => void;
}

export function BookClassHeader({ onClose }: Props) {
  return (
    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
      <div className="flex items-center gap-2.5">
        <div className="size-2 rounded-full bg-purple-600 animate-pulse" />
        <h3 className="font-bold text-base text-slate-800">
          Đặt hộ lớp học
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 size-7 flex items-center justify-center rounded-full transition-colors border border-slate-200 text-xs font-bold cursor-pointer"
        aria-label="Đóng"
      >
        ✕
      </button>
    </div>
  );
}
