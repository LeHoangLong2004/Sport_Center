import React from "react";
import { Check } from "lucide-react";
import type { SportOption } from "../../../services/api";
import { LEVEL_OPTIONS, EQUIPMENT_OPTIONS, GOAL_PRESETS, DURATION_PRESETS } from "../types";

interface Props {
  sports: SportOption[];
  sportId: string;
  setSportId: (id: string) => void;
  level: string;
  setLevel: (lvl: string) => void;
  goal: string;
  setGoal: (goal: string) => void;
  equipment: string[];
  setEquipment: React.Dispatch<React.SetStateAction<string[]>>;
  durationMinutes: number;
  setDurationMinutes: (d: number) => void;
  exerciseCount: number;
  setExerciseCount: (c: number) => void;
}

export function CoachAiSportParameters({
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
}: Props) {
  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  return (
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

      {/* Equipment Multi-select */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span>Dụng cụ / Thiết bị có sẵn</span>
          <span className="text-[11px] text-slate-400 font-normal">
            ({equipment.length} đã chọn)
          </span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = equipment.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleEquipment(item)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                    : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
                <span>{item}</span>
              </button>
            );
          })}
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
  );
}
