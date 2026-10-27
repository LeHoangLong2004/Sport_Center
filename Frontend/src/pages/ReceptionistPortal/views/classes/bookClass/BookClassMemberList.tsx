import React from "react";

interface Props {
  selectedMember: any;
  allFilteredMembers: any[];
  pagedMembers: any[];
  memberSearch: string;
  memberPage: number;
  totalMemberPages: number;
  onSelectMember: (id: string) => void;
  onClearSelectedMember: () => void;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
}

export function BookClassMemberList({
  selectedMember,
  allFilteredMembers,
  pagedMembers,
  memberSearch,
  memberPage,
  totalMemberPages,
  onSelectMember,
  onClearSelectedMember,
  onSearchChange,
  onPageChange,
}: Props) {
  const MEMBERS_PER_PAGE = 4;

  return (
    <div className="flex flex-col gap-2 pt-1">
      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
        <span>Chọn hội viên cần đặt hộ:</span>
        {!selectedMember && (
          <span className="text-[11px] font-normal text-slate-400">
            {allFilteredMembers.length} hội viên khả dụng
          </span>
        )}
      </label>

      {/* If member is selected: show clean profile card */}
      {selectedMember ? (
        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between animate-in fade-in zoom-in-95 duration-150 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ring-2 ring-purple-300">
              {(selectedMember.fullName || "M").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedMember.fullName}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Đã chọn
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {selectedMember.phoneNumber || selectedMember.phone || selectedMember.email || "Hội viên"}
                {selectedMember.packageName ? ` • ${selectedMember.packageName}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSelectedMember}
            className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-white hover:bg-purple-100/80 border border-purple-200 rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            Đổi người
          </button>
        </div>
      ) : (
        /* Search input & paginated clean list */
        <div className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="Gõ tên, SĐT hoặc email hội viên..."
              value={memberSearch}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
            />
            <svg
              className="absolute left-2.5 text-slate-400 pointer-events-none"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {memberSearch && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange("");
                }}
                className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Paginated Member list */}
          <div
            data-member-list="true"
            className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs divide-y divide-slate-100"
          >
            {pagedMembers.length > 0 ? (
              pagedMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectMember(m.id);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50/80 active:bg-purple-100/80 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="size-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {(m.fullName || "M").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-800 group-hover:text-purple-700 block truncate">
                        {m.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {m.phoneNumber || m.phone || m.email || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.packageName ? (
                      <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200/80 px-2 py-0.5 rounded-md font-semibold">
                        {m.packageName}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                        Hội viên
                      </span>
                    )}
                    <svg
                      className="size-3.5 text-slate-300 group-hover:text-purple-600 transition-colors"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-6 px-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  Không tìm thấy hội viên phù hợp{memberSearch ? ` với "${memberSearch}"` : ""}.
                </p>
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange("");
                    }}
                    className="mt-2 text-xs font-semibold text-purple-600 hover:underline cursor-pointer"
                  >
                    Xóa từ khóa tìm kiếm
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {allFilteredMembers.length > MEMBERS_PER_PAGE && (
            <div className="flex items-center justify-between px-1 text-xs text-slate-500">
              <span className="text-[11px]">
                Hội viên <strong>{(memberPage - 1) * MEMBERS_PER_PAGE + 1} - {Math.min(memberPage * MEMBERS_PER_PAGE, allFilteredMembers.length)}</strong> / {allFilteredMembers.length}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={memberPage === 1}
                  onClick={() => onPageChange(Math.max(1, memberPage - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors flex items-center gap-1 bg-white cursor-pointer"
                >
                  ‹ Trước
                </button>
                <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  {memberPage} / {totalMemberPages}
                </span>
                <button
                  type="button"
                  disabled={memberPage === totalMemberPages}
                  onClick={() => onPageChange(Math.min(totalMemberPages, memberPage + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors flex items-center gap-1 bg-white cursor-pointer"
                >
                  Sau ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
