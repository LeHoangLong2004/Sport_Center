import React from "react";
import { Sparkles, Sliders } from "lucide-react";
import type { MockMember, CoachClassOverview, SportOption } from "../../services/api";
import type { MemberProfileData } from "../member-profile/types";
import { type RoutinePreset } from "./types";
import { CoachAiTargetSelector } from "./CoachAiTargetSelector";
import { CoachAiPresetCards } from "./inputPanel/CoachAiPresetCards";
import { CoachAiSportParameters } from "./inputPanel/CoachAiSportParameters";

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
  equipment,
  setEquipment,
  durationMinutes,
  setDurationMinutes,
  exerciseCount,
  setExerciseCount,
  isGenerating,
  onGenerate,
}) => {
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

      <CoachAiPresetCards onApplyPreset={onApplyPreset} />

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
        <CoachAiSportParameters
          sports={sports}
          sportId={sportId}
          setSportId={setSportId}
          level={level}
          setLevel={setLevel}
          goal={goal}
          setGoal={setGoal}
          equipment={equipment || []}
          setEquipment={setEquipment || (() => {})}
          durationMinutes={durationMinutes}
          setDurationMinutes={setDurationMinutes}
          exerciseCount={exerciseCount}
          setExerciseCount={setExerciseCount}
        />
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
