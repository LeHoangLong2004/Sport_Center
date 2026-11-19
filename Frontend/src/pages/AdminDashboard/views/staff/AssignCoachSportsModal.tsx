import React from 'react';
import { createPortal } from 'react-dom';
import { Dumbbell, X, Check, Loader2 } from 'lucide-react';

interface AssignCoachSportsModalProps {
  assigningCoach: { realId: string; name: string } | null;
  onClose: () => void;
  onSave: () => void;
  availableSports: { id: string; name: string }[];
  coachSelectedSportIds: string[];
  setCoachSelectedSportIds: React.Dispatch<React.SetStateAction<string[]>>;
  loadingCoachSports: boolean;
  savingCoachSports: boolean;
}

export function AssignCoachSportsModal({
  assigningCoach,
  onClose,
  onSave,
  availableSports,
  coachSelectedSportIds,
  setCoachSelectedSportIds,
  loadingCoachSports,
  savingCoachSports,
}: AssignCoachSportsModalProps) {
  if (!assigningCoach) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overscroll-contain animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 -z-10"
        onClick={() => !savingCoachSports && onClose()}
      />
      <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Dumbbell className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Phân công chuyên môn</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Huấn luyện viên: <strong className="text-slate-800 font-semibold">{assigningCoach.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={savingCoachSports}
            onClick={onClose}
            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtitle / Instructions */}
        <div className="py-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
            <span className="font-bold text-emerald-600 shrink-0">Lưu ý:</span>
            <span>
              Chỉ các bộ môn được <strong>bật trạng thái phụ trách</strong> dưới đây thì HLV mới có quyền mở lớp và được Quản lý xếp lịch dạy.
            </span>
          </div>

          {loadingCoachSports ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-7 animate-spin text-emerald-600" />
              <span className="text-xs text-slate-500 font-medium">Đang đồng bộ danh mục bộ môn...</span>
            </div>
          ) : availableSports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Chưa có bộ môn nào trong hệ thống.</p>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {availableSports.map((s) => {
                const isAssigned = coachSelectedSportIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isAssigned
                        ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-200/60'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div
                        className={`size-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                          isAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isAssigned ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {s.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {isAssigned ? 'Đang được phép đứng lớp bộ môn này' : 'Chưa được phân công phụ trách'}
                        </p>
                      </div>
                    </div>

                    {/* Interactive Toggle Button / Pill */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isAssigned) {
                          setCoachSelectedSportIds((prev) => prev.filter((id) => id !== s.id));
                        } else {
                          setCoachSelectedSportIds((prev) => [...prev, s.id]);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 shrink-0 ${
                        isAssigned
                          ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 hover:bg-emerald-700'
                          : 'border border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <Check size={14} strokeWidth={2.5} />
                          <span>Đang phụ trách</span>
                        </>
                      ) : (
                        <span>+ Phân công môn</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-600">
            Số bộ môn phụ trách:{' '}
            <strong className="text-emerald-700 font-bold text-sm ml-1">
              {coachSelectedSportIds.length}
            </strong>{' '}
            / {availableSports.length}
          </span>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={savingCoachSports}
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={savingCoachSports || loadingCoachSports}
              onClick={onSave}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              {savingCoachSports && <Loader2 size={13} className="animate-spin" />}
              <span>Lưu phân công</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

