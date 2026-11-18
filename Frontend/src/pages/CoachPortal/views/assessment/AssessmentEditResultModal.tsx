import React from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Check, Lock } from "lucide-react";
import type { AssessmentRecord, MockSession } from "../../services/api";
import { isAttendanceLocked24h } from "../../utils/attendanceLock";

interface Props {
  isOpen: boolean;
  draft: Partial<AssessmentRecord>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<AssessmentRecord>>>;
  currentMember?: { id: string; name: string; code: string };
  currentSession?: MockSession;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
  addMetric: (label?: string, unit?: string) => void;
}

export default function AssessmentEditResultModal({
  isOpen,
  draft,
  setDraft,
  currentMember,
  currentSession,
  isSaving,
  onSave,
  onClose,
  addMetric,
}: Props) {
  if (!isOpen) return null;

  const isCurrentSessionExpired = isAttendanceLocked24h(currentSession?.date, currentSession?.startTime);

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0 bg-slate-50/70 dark:bg-slate-850">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Học viên: {currentMember?.name || "Học viên"}
              </span>
              {currentSession && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Buổi: {currentSession.className} ({currentSession.date})
                </span>
              )}
              {isCurrentSessionExpired && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Buổi học đã đóng (Quá 24 giờ)
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isCurrentSessionExpired
                ? "Xem kết quả & tiến độ buổi học (Chỉ xem)"
                : "Ghi nhận kết quả & tiến độ buổi học"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto flex-1 custom-scrollbar min-h-0">
          {/* Banner cảnh báo đã đóng khi quá 24h */}
          {isCurrentSessionExpired && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ ) - Chỉ xem kết quả.</span>
            </div>
          )}

          {/* 1. Mức độ hoàn thành */}
          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Mức độ hoàn thành bài tập
              </label>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                (draft.completion || 0) >= 80
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : (draft.completion || 0) >= 60
                  ? "bg-slate-100 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              }`}>
                {draft.completion || 0}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              disabled={isCurrentSessionExpired}
              value={draft.completion || 0}
              onChange={(e) => setDraft({ ...draft, completion: +e.target.value })}
              className={`w-full accent-emerald-500 ${isCurrentSessionExpired ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            />
            {!isCurrentSessionExpired && (
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-slate-400 mr-1">Mốc nhanh:</span>
                {[50, 70, 80, 90, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDraft({ ...draft, completion: val })}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      draft.completion === val
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Chỉ số tập luyện & Thể lực */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                  Chỉ số tập luyện & Thể lực
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isCurrentSessionExpired
                    ? "Các thành tích và chỉ số đã được ghi nhận cho buổi học này"
                    : "Ghi nhận mức tạ, cự ly, số lần hoặc thành tích đạt được"}
                </span>
              </div>
              {!isCurrentSessionExpired && (
                <button
                  type="button"
                  onClick={() => addMetric("", "")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm chỉ số
                </button>
              )}
            </div>

            {/* Quick suggestion chips (chỉ hiện khi chưa khóa) */}
            {!isCurrentSessionExpired && (
              <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Gợi ý nhanh:</span>
                {[
                  { label: "Mức tạ", unit: "kg" },
                  { label: "Quãng đường", unit: "km" },
                  { label: "Thời gian", unit: "phút" },
                  { label: "Số rep", unit: "lần" },
                  { label: "Nhịp tim", unit: "bpm" },
                  { label: "Calo", unit: "kcal" },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => addMetric(chip.label, chip.unit)}
                    className="px-2 py-0.5 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300 dark:hover:bg-slate-650 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer shadow-2xs"
                  >
                    + {chip.label} ({chip.unit})
                  </button>
                ))}
              </div>
            )}

            {/* Metric Items List */}
            {(!draft.metrics || draft.metrics.length === 0) ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                {isCurrentSessionExpired
                  ? "Không có chỉ số tập luyện nào được ghi nhận cho buổi này."
                  : "Chưa có chỉ số nào. Bấm vào các nút gợi ý nhanh ở trên hoặc nút \"+ Thêm chỉ số\"."}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Columns */}
                <div className="flex items-center gap-2 px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex-1 min-w-0">Tên bài tập / Chỉ số</span>
                  <span className="w-24 shrink-0 text-center">Giá trị</span>
                  <span className="w-24 shrink-0 text-center">Đơn vị</span>
                  {!isCurrentSessionExpired && <span className="w-8 shrink-0"></span>}
                </div>

                {draft.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700"
                  >
                    <input
                      type="text"
                      placeholder="VD: Đẩy ngực, Plank, Chạy bộ..."
                      value={m.label}
                      readOnly={isCurrentSessionExpired}
                      onChange={(e) => {
                        const ms = [...(draft.metrics || [])];
                        ms[i] = { ...m, label: e.target.value };
                        setDraft({ ...draft, metrics: ms });
                      }}
                      className={`flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                        isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="VD: 60"
                      value={m.value}
                      readOnly={isCurrentSessionExpired}
                      onChange={(e) => {
                        const ms = [...(draft.metrics || [])];
                        ms[i] = { ...m, value: e.target.value };
                        setDraft({ ...draft, metrics: ms });
                      }}
                      className={`w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                        isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="kg, km, s..."
                      value={m.unit}
                      readOnly={isCurrentSessionExpired}
                      onChange={(e) => {
                        const ms = [...(draft.metrics || [])];
                        ms[i] = { ...m, unit: e.target.value };
                        setDraft({ ...draft, metrics: ms });
                      }}
                      className={`w-24 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-2 text-xs text-center text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                        isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-800/80 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    {!isCurrentSessionExpired && (
                      <button
                        type="button"
                        onClick={() => {
                          const ms = draft.metrics!.filter((_, j) => j !== i);
                          setDraft({ ...draft, metrics: ms });
                        }}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                        title="Xóa chỉ số này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Nhận xét buổi tập */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
              Nhận xét của Huấn luyện viên
            </label>
            <textarea
              value={draft.comment || ""}
              readOnly={isCurrentSessionExpired}
              onChange={(e) => setDraft({ ...draft, comment: e.target.value })}
              rows={3}
              className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none resize-none leading-relaxed ${
                isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-850 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              }`}
              placeholder={
                isCurrentSessionExpired
                  ? "Không có nhận xét nào được lưu."
                  : "Nhận xét kỹ thuật, sự tập trung và mức độ nỗ lực của học viên trong buổi học này..."
              }
            />
          </div>

          {/* 4. Hướng tập tiếp theo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
              Kế hoạch & Định hướng buổi tập tiếp theo
            </label>
            <input
              type="text"
              value={draft.nextStep || ""}
              readOnly={isCurrentSessionExpired}
              onChange={(e) => setDraft({ ...draft, nextStep: e.target.value })}
              className={`w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none ${
                isCurrentSessionExpired ? "bg-slate-100/70 dark:bg-slate-850 cursor-default" : "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              }`}
              placeholder={
                isCurrentSessionExpired
                  ? "Không có định hướng nào được ghi nhận."
                  : "VD: Nâng mức tạ Bench Press lên 65kg, cải thiện nhịp thở khi Squat..."
              }
            />
          </div>
        </div>

        {/* Footer */}
        {isCurrentSessionExpired ? (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Buổi học đã đóng ( Không thể sửa điểm vì đã quá 24 giờ )</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer hover:bg-slate-800"
            >
              Đóng
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/70 dark:bg-slate-900/60 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? "Đang lưu..." : "Lưu kết quả"}</span>
            </button>
          </div>
        )}
        
      </div>
    </div>,
    document.body
  );
}

