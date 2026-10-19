import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import type { MockMember } from "../../services/api";
import { DateInput } from "../../../../components/DateInput";

interface AssignmentDropdownItem {
  id: string;
  label: string;
}

interface AssignmentDropdownProps {
  placeholder: string;
  items: AssignmentDropdownItem[];
  onSelect: (item: AssignmentDropdownItem) => void;
}

const AssignmentDropdown: React.FC<AssignmentDropdownProps> = ({ placeholder, items, onSelect }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 flex items-center justify-between text-left"
      >
        <span className="truncate">{placeholder}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="listbox" className="absolute left-0 top-full mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-30 py-1">
          {items.length === 0 ? (
            <div className="px-3 py-2 text-slate-400">Không có dữ liệu</div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="option"
                onClick={() => { onSelect(item); setOpen(false); }}
                className="block w-full px-3 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300"
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

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
  assignTarget, assignDeadline, setAssignDeadline, assignNote, setAssignNote,
  uniqueClasses, members, onClose, onAssign,
}) => {
  if (!assignTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Giao giáo án</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-slate-500 dark:text-slate-400">
          Chọn lớp học hoặc học viên để giao giáo án <span className="font-semibold text-slate-800 dark:text-slate-200">"{assignTarget.curricName}"</span>:
        </p>
        <div>
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Hạn hoàn thành (Deadline):</label>
          <DateInput value={assignDeadline} onChange={setAssignDeadline} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs mb-3" />
          <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ghi chú bài tập về nhà:</label>
          <input type="text" placeholder="VD: Tập 3 hiệp, nghỉ đủ 45s giữa các hiệp..." value={assignNote} onChange={(e) => setAssignNote(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs" />
        </div>
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">Chọn lớp học phụ trách:</span>
          <AssignmentDropdown placeholder="Chọn lớp học..." items={uniqueClasses.map((cls) => ({ id: cls.id, label: cls.name }))} onSelect={(selected) => onAssign("class", selected.id, selected.label)} />
        </div>
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">Hoặc chọn học viên kèm 1-1:</span>
          <AssignmentDropdown
            placeholder="Chọn học viên 1-1..."
            items={members.map((member) => ({ id: member.id, label: `${member.name} (${member.code})` }))}
            onSelect={(selected) => {
              const member = members.find((item) => item.id === selected.id);
              if (member) onAssign("member", member.id, member.name);
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
};
