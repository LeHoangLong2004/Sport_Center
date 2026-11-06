import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Dumbbell,
  FileText,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import type { MockMember } from "../../services/api";
import { DateInput } from "../../../../components/DateInput";
import { CurriculumTargetBanner } from "./curriculumAssign/CurriculumTargetBanner";
import { CurriculumRecipientDropdown } from "./curriculumAssign/CurriculumRecipientDropdown";

interface CurriculumAssignModalProps {
  assignTarget: {
    curricId: string;
    curricName: string;
    sport?: string;
    level?: string;
  } | null;
  assignDeadline: string;
  setAssignDeadline: (d: string) => void;
  assignNote: string;
  setAssignNote: (n: string) => void;
  uniqueClasses: { id: string; name: string }[];
  members: MockMember[];
  onClose: () => void;
  onAssign: (type: "class" | "member", id: string, name: string) => void | Promise<void>;
  isSubmitting?: boolean;
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
  isSubmitting = false,
}) => {
  const [targetType, setTargetType] = useState<"class" | "member">("class");
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize or reset when modal opens or assignTarget changes
  useEffect(() => {
    if (assignTarget) {
      if (!assignDeadline) {
        const today = new Date().toISOString().split("T")[0];
        setAssignDeadline(today);
      }
      setSelectedId("");
      setSelectedName("");
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  }, [assignTarget]);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (!assignTarget) return null;

  const handleSelectTab = (type: "class" | "member") => {
    setTargetType(type);
    setSelectedId("");
    setSelectedName("");
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    onAssign(targetType, selectedId, selectedName);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Giao giáo án tập luyện
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Áp dụng cho buổi tập trực tiếp tại trung tâm dưới sự giám sát của HLV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <CurriculumTargetBanner assignTarget={assignTarget} />

          {/* Target Type Selector */}
          <div>
            <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-2">
              Đối tượng giao giáo án:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => handleSelectTab("class")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  targetType === "class"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Lớp học ({uniqueClasses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTab("member")}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  targetType === "member"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-xs border border-slate-200/60 dark:border-slate-700"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Học viên 1-1 ({members.length})</span>
              </button>
            </div>
          </div>

          <CurriculumRecipientDropdown
            targetType={targetType}
            selectedId={selectedId}
            selectedName={selectedName}
            isDropdownOpen={isDropdownOpen}
            searchQuery={searchQuery}
            dropdownRef={dropdownRef}
            uniqueClasses={uniqueClasses}
            members={members}
            setIsDropdownOpen={setIsDropdownOpen}
            setSearchQuery={setSearchQuery}
            onSelect={(id, name) => {
              setSelectedId(id);
              setSelectedName(name);
              setIsDropdownOpen(false);
            }}
          />

          {/* Session Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Ngày tập áp dụng tại trung tâm:</span>
              </label>
              <span className="text-[11px] text-slate-400">Buổi tập</span>
            </div>
            <DateInput
              value={assignDeadline}
              onChange={setAssignDeadline}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:border-emerald-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Thời điểm học viên/lớp thực hiện giáo án này dưới sự giám sát của HLV.
            </p>
          </div>

          {/* Coach Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Lưu ý & Hướng dẫn của Coach cho buổi tập:</span>
              </label>
            </div>
            <textarea
              rows={3}
              placeholder="VD: Chú ý kỹ thuật thở khi bơi sải, khởi động kỹ cơ vai, quan sát nhịp tim sau mỗi hiệp..."
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:border-emerald-500 outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || isSubmitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              !selectedId || isSubmitting
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-emerald-600/20 cursor-pointer"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? "Đang giao giáo án..." : "Xác nhận giao giáo án"}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
