import { createPortal } from "react-dom";
import { X, Trash2 } from "lucide-react";
import type { UnifiedScheduleItem } from "./types";

interface Props {
  slot: UnifiedScheduleItem | null;
  onClose: () => void;
  onDelete: (slotId: string) => void;
}

export default function OpenPtDetailModal({ slot, onClose, onDelete }: Props) {
  if (!slot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Lịch trống 1–1 (Đang mở nhận HV)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3 text-xs">
          <div className="space-y-2.5 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Bộ môn:</span>
              <span className="font-bold text-slate-900 dark:text-white">{slot.sport} (1–1)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Ngày dạy:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{slot.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Khung giờ:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{slot.startTime} – {slot.endTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Phòng / Khu vực:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{slot.room}</span>
            </div>
            {slot.note && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium block mb-1">Ghi chú cho hội viên:</span>
                <p className="italic text-slate-600 dark:text-slate-300">"{slot.note}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={() => onDelete(slot.id)}
            className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hủy ca trống này
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
