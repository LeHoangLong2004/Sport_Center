import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { MockMember } from "../../services/api";

interface CurriculumAssignModalProps {
  assignTarget: { curricId: string; curricName: string } | null;
  assignDeadline: string;
  setAssignDeadline: (d: string) => void;
  assignNote: string;
  setAssignNote: (n: string) => void;
  uniqueClasses: { id: string; name: string }[];
  members: MockMember[];
  onClose: () => void;
  onAssign: (type: "class" | "member", id: string, name: string) => void;
}

export const CurriculumAssignModal: React.FC<CurriculumAssignModalProps> = ({
  assignTarget,
  assignDeadline,
  setAssignDeadline,
  assignNote,
  setAssignNote,
  uniqueClasses,
  members,
  onClose,
  onAssign,
}) => {
  if (!assignTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Giao giáo án
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-500 dark:text-slate-400">
          Chọn lớp học hoặc học viên để giao giáo án{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            "{assignTarget.curricName}"
          </span>:
        </p>

        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Hạn hoàn thành (Deadline):
          </label>
          <input
            type="date"
            value={assignDeadline}
            onChange={(e) => setAssignDeadline(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"
          />

          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Ghi chú bài tập về nhà:
          </label>
          <input
            type="text"
            placeholder="VD: Tập 3 hiệp, nghỉ đủ 45s giữa các hiệp..."
            value={assignNote}
            onChange={(e) => setAssignNote(e.target.value)}
            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3"
          />
        </div>

        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Chọn Lớp học phụ trách:
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              const selected = uniqueClasses.find((cls) => cls.id === e.target.value);
              if (selected) onAssign("class", selected.id, selected.name);
            }}
            className="w-full p-2.5 mb-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="">Chọn lớp học...</option>
            {uniqueClasses.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
          <div className="hidden flex flex-col gap-1.5">
            {uniqueClasses.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => onAssign("class", cls.id, cls.name)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>📚 Lớp: {cls.name}</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay →</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Hoặc chọn Học viên kèm 1–1:
          </span>
          <select
            defaultValue=""
            onChange={(e) => {
              const selected = members.find((m) => m.id === e.target.value);
              if (selected) onAssign("member", selected.id, selected.name);
            }}
            className="w-full p-2.5 mb-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
          >
            <option value="">Chọn học viên 1-1...</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
          </select>
          <div className="hidden flex flex-col gap-1.5 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onAssign("member", m.id, m.name)}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all font-medium text-slate-800 dark:text-slate-200 flex items-center justify-between"
              >
                <span>👤 {m.name} ({m.code})</span>
                <span className="text-[11px] text-emerald-600 font-semibold">Giao ngay →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
