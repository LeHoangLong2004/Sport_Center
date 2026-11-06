import React from "react";
import { Users, User, ChevronDown, Search, Check } from "lucide-react";
import type { MockMember } from "../../../services/api";

interface Props {
  targetType: "class" | "member";
  selectedId: string;
  selectedName: string;
  isDropdownOpen: boolean;
  searchQuery: string;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  uniqueClasses: { id: string; name: string }[];
  members: MockMember[];
  setIsDropdownOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setSearchQuery: (query: string) => void;
  onSelect: (id: string, name: string) => void;
}

export function CurriculumRecipientDropdown({
  targetType,
  selectedId,
  selectedName,
  isDropdownOpen,
  searchQuery,
  dropdownRef,
  uniqueClasses,
  members,
  setIsDropdownOpen,
  setSearchQuery,
  onSelect,
}: Props) {
  const filteredClasses = uniqueClasses.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
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
                      onClick={() => onSelect(cls.id, cls.name)}
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
                    onClick={() => onSelect(m.id, m.name)}
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
  );
}
