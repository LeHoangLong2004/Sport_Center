import React from "react";
import { Zap, Dumbbell, HeartPulse, Flame, Sparkles } from "lucide-react";
import { ROUTINE_PRESETS, type RoutinePreset } from "../types";

interface Props {
  onApplyPreset?: (preset: RoutinePreset) => void;
}

export function CoachAiPresetCards({ onApplyPreset }: Props) {
  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
      case "Dumbbell":
        return <Dumbbell className="w-3.5 h-3.5 text-orange-500" />;
      case "HeartPulse":
        return <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />;
      case "Flame":
        return <Flame className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Mẫu giáo án 1-Click (Gợi ý nhanh theo mục tiêu phổ biến)</span>
        </label>
        <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
          Bấm chọn để nạp nhanh toàn bộ thông số
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {ROUTINE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset?.(preset)}
            className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-orange-50/80 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700/60 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer active:scale-[0.98] shadow-2xs"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300 flex items-center gap-1">
                {getPresetIcon(preset.icon)}
                <span>{preset.badge}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{preset.durationMinutes}p</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:hover:text-orange-400 transition-colors line-clamp-1">
                {preset.title}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {preset.sportName} · {preset.level}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
