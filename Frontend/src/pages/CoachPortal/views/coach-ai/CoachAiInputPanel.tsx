import React from "react";
import { Sparkles, Sliders, Zap, Dumbbell, HeartPulse, Flame } from "lucide-react";
import type { MockMember, CoachClassOverview, SportOption } from "../../services/api";
import type { MemberProfileData } from "../member-profile/types";
import { LEVEL_OPTIONS, GOAL_PRESETS, DURATION_PRESETS, ROUTINE_PRESETS, type RoutinePreset } from "./types";
import { CoachAiTargetSelector } from "./CoachAiTargetSelector";

interface CoachAiInputPanelProps {
  targetType: "member" | "class";
  setTargetType: (type: "member" | "class") => void;
  targetId: string;
  setTargetId: (id: string) => void;
  onSelectTarget?: (type: "member" | "class", id: string) => void;
  onApplyPreset?: (preset: RoutinePreset) => void;
  memberProfile?: MemberProfileData | null;
  loadingProfile?: boolean;
  members: MockMember[];
  classes: CoachClassOverview[];
  sports: SportOption[];
  sportId: string;
  setSportId: (id: string) => void;
  level: string;
  setLevel: (lvl: string) => void;
  goal: string;
  setGoal: (goal: string) => void;
  equipment?: string[];
  setEquipment?: React.Dispatch<React.SetStateAction<string[]>>;
  durationMinutes: number;
  setDurationMinutes: (d: number) => void;
  exerciseCount: number;
  setExerciseCount: (c: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const CoachAiInputPanel: React.FC<CoachAiInputPanelProps> = ({
  targetType,
  setTargetType,
  targetId,
  setTargetId,
  onSelectTarget,
  onApplyPreset,
  memberProfile,
  loadingProfile,
  members,
  classes,
  sports,
  sportId,
  setSportId,
  level,
  setLevel,
  goal,
  setGoal,
  durationMinutes,
  setDurationMinutes,
  exerciseCount,
  setExerciseCount,
  isGenerating,
  onGenerate,
}) => {

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
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm flex flex-col gap-6 max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-500" />
            <span>1. Thiết lập tiêu chí bài tập cá nhân hóa</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Chọn học viên và yêu cầu buổi tập để Gemini AI phân tích thể lực & lọc bài tập an toàn.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          Google Gemini 1.5 Flash Connected
        </span>
      </div>

      {/* 1-Click Quick Presets (4 across) */}
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
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
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

      {/* 2-Column Balanced Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-2">
        {/* Left Column: Target Selector & Health Metrics */}
        <div className="flex flex-col gap-4">
          <CoachAiTargetSelector
            targetType={targetType}
            setTargetType={setTargetType}
            targetId={targetId}
            setTargetId={setTargetId}
            onSelectTarget={onSelectTarget}
            memberProfile={memberProfile}
            loadingProfile={loadingProfile}
            members={members}
            classes={classes}
          />
        </div>

        {/* Right Column: Sport, Level, Goal, Equipment, Duration */}
        <div className="flex flex-col gap-4">
          {/* Sport & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Bộ môn <span className="text-rose-500">*</span>
              </label>
              <select
                value={sportId}
                onChange={(e) => setSportId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                {sports.length === 0 ? (
                  <option value="">Đang tải bộ môn...</option>
                ) : (
                  sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Trình độ <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1">
                {LEVEL_OPTIONS.map((lvl) => {
                  const active = level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLevel(lvl)}
                      className={`py-2 px-1.5 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                        active
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Goal Input & Chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Mục tiêu buổi tập
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="VD: Giảm mỡ bụng, săn chắc cơ đùi, tăng sức bền..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-400"
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {GOAL_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setGoal(p)}
                  className="text-[11px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Exercise Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Thời lượng
                </label>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                  {durationMinutes} phút
                </span>
              </div>
              <div className="flex gap-1.5">
                {DURATION_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {mins}p
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Số bài tập đề xuất
                </label>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {exerciseCount} bài
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExerciseCount(Math.max(3, exerciseCount - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer text-sm"
                >
                  -
                </button>
                <input
                  type="range"
                  min={3}
                  max={10}
                  value={exerciseCount}
                  onChange={(e) => setExerciseCount(Number(e.target.value))}
                  className="flex-1 accent-orange-500 cursor-pointer h-2"
                />
                <button
                  type="button"
                  onClick={() => setExerciseCount(Math.min(10, exerciseCount + 1))}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer text-sm"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Generate Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/80 flex flex-col gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Gemini AI đang phân tích thể trạng & gợi ý bài tập...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>✨ Bắt đầu phân tích thể lực & Gợi ý bài tập bằng Gemini AI</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          AI tự động áp dụng bộ lọc né chấn thương & kiểm soát xung lực. HLV kiểm duyệt bài tập trước khi giao cho học viên.
        </p>
      </div>
    </div>
  );
};
