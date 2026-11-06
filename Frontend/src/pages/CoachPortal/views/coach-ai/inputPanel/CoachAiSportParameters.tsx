import React, { useState } from "react";
import { Check, Plus, X } from "lucide-react";
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
  const [customTool, setCustomTool] = useState("");

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleAddCustomTool = () => {
    const trimmed = customTool.trim();
    if (!trimmed) return;
    if (!equipment.includes(trimmed)) {
      setEquipment((prev) => [...prev, trimmed]);
    }
    setCustomTool("");
  };

  const customAddedEquipment = equipment.filter(
    (item) => !EQUIPMENT_OPTIONS.includes(item)
  );

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
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Mục tiêu buổi tập
          </label>
          <span className="text-[11px] text-slate-400 font-normal">
            (Tự nhập hoặc chọn gợi ý bên dưới)
          </span>
        </div>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Nhập mục tiêu buổi tập của bạn hoặc chọn gợi ý nhanh..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-400"
        />
        <div className="flex flex-col gap-1.5 pt-0.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Gợi ý nhanh theo mục tiêu:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_PRESETS.map((p) => {
              const isSelected = goal.trim() === p.trim();
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setGoal(isSelected ? "" : p)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-500 text-white border-orange-500 font-semibold shadow-xs"
                      : "border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700"
                  }`}
                >
                  + {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <span>Dụng cụ / Thiết bị có sẵn</span>
          </label>
          <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            {equipment.length > 0 ? `(${equipment.length} đã chọn)` : "(Chưa chọn dụng cụ)"}
          </span>
        </div>

        {/* Input for custom equipment outside suggestions */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={customTool}
            onChange={(e) => setCustomTool(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustomTool();
              }
            }}
            placeholder="Nhập dụng cụ / thiết bị khác nếu chưa có trong gợi ý (VD: Dây nhảy, Máy chèo thuyền...)"
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={handleAddCustomTool}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>

        {/* Custom equipment badges that were typed by coach */}
        {customAddedEquipment.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Dụng cụ tự nhập:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {customAddedEquipment.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white border border-orange-500 shadow-sm"
                >
                  <Check className="w-3 h-3 text-white" />
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => toggleEquipment(item)}
                    className="hover:bg-orange-600 p-0.5 rounded-full cursor-pointer transition ml-0.5"
                    title="Xóa dụng cụ này"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Equipment Options */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Gợi ý dụng cụ có sẵn (Bấm để chọn/bỏ chọn):
          </span>
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
