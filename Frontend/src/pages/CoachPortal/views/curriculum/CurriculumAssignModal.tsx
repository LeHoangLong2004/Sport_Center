import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  Check,
  ChevronDown,
  Dumbbell,
  FileText,
  Search,
  Send,
  User,
  Users,
  X,
} from "lucide-react";
import type { MockMember } from "../../services/api";
import { DateInput } from "../../../../components/DateInput";

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
      // Default to today if deadline not set
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

  const filteredClasses = uniqueClasses.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          {/* Target Plan Summary Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Giáo án được chọn
              </span>
              {assignTarget.sport && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {assignTarget.sport} {assignTarget.level ? `• ${assignTarget.level}` : ""}
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              {assignTarget.curricName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Học viên sẽ nhận và xem trực tiếp các bài tập trong giáo án này trên tài khoản cá nhân để theo dõi và tập luyện.
            </p>
          </div>

          {/* Target Type Selector (Segmented Toggle) */}
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

          {/* Selection Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="font-bold text-xs text-slate-800 dark:text-slate-200 block mb-1.5">
              {targetType === "class" ? "Chọn lớp học phụ trách:" : "Chọn học viên kèm 1-1:"}
            </label>

            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`w-full p-3 rounded-xl border transition-all text-xs flex items-center justify-between text-left ${
                selectedId
                  ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white font-medium"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {targetType === "class" ? (
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <span className="truncate">
                  {selectedName ||
                    (targetType === "class" ? "Chọn lớp học để giao..." : "Chọn học viên 1-1...")}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-2 space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={targetType === "class" ? "Tìm theo tên lớp..." : "Tìm học viên theo tên/mã..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pt-1">
                  {targetType === "class" ? (
                    filteredClasses.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Không tìm thấy lớp học nào
                      </div>
                    ) : (
                      filteredClasses.map((cls) => {
                        const isSelected = selectedId === cls.id;
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => {
                              setSelectedId(cls.id);
                              setSelectedName(cls.name);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <span className="truncate">{cls.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                          </button>
                        );
                      })
                    )
                  ) : filteredMembers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Không tìm thấy học viên nào
                    </div>
                  ) : (
                    filteredMembers.map((m) => {
                      const isSelected = selectedId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(m.id);
                            setSelectedName(m.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-medium">{m.name}</span>
                            <span className="ml-1.5 text-[11px] text-slate-400">({m.code})</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

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
