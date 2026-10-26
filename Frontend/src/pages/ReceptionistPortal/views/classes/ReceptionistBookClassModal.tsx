import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";

interface ReceptionistBookClassModalProps {
  selectedClass: any;
  membersList: any[];
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

export function ReceptionistBookClassModal({
  selectedClass,
  membersList,
  onClose,
  onSuccess,
  onError,
}: ReceptionistBookClassModalProps) {
  const [memberId, setMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 4;
  const [loadingBook, setLoadingBook] = useState(false);

  useEffect(() => {
    if (!selectedClass) {
      setMemberId("");
      setMemberSearch("");
      setMemberPage(1);
    }
  }, [selectedClass]);

  const handleClose = () => {
    setMemberId("");
    setMemberSearch("");
    setMemberPage(1);
    onClose();
  };

  const allFilteredMembers = useMemo(() => {
    if (!memberSearch.trim()) {
      return membersList;
    }
    const q = memberSearch.toLowerCase().trim();
    return membersList.filter((m) => {
      const name = (m.fullName || "").toLowerCase();
      const phone = (m.phoneNumber || m.phone || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const code = (m.memberCode || "").toLowerCase();
      return name.includes(q) || phone.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [membersList, memberSearch]);

  const totalMemberPages = Math.max(1, Math.ceil(allFilteredMembers.length / MEMBERS_PER_PAGE));

  const pagedMembers = useMemo(() => {
    const start = (memberPage - 1) * MEMBERS_PER_PAGE;
    return allFilteredMembers.slice(start, start + MEMBERS_PER_PAGE);
  }, [allFilteredMembers, memberPage]);

  useEffect(() => {
    if (memberPage > totalMemberPages) {
      setMemberPage(1);
    }
  }, [totalMemberPages, memberPage]);

  const selectedMember = useMemo(
    () => membersList.find((m) => String(m.id) === String(memberId)),
    [membersList, memberId]
  );

  const handleBookForMember = async () => {
    if (!memberId || !selectedClass) return;
    setLoadingBook(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}/book-for-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ MemberId: memberId }),
      });
      const d = await res.json();
      if (res.ok) {
        onSuccess("Đặt lớp thành công cho hội viên!");
        handleClose();
      } else {
        onError(d.message || "Không thể đặt lớp");
      }
    } catch (e) {
      onError("Có lỗi xảy ra: " + String(e));
    } finally {
      setLoadingBook(false);
    }
  };

  if (!selectedClass) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none overscroll-contain animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="size-2 rounded-full bg-purple-600 animate-pulse" />
            <h3 className="font-bold text-base text-slate-800">
              Đặt hộ lớp học
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 size-7 flex items-center justify-center rounded-full transition-colors border border-slate-200 text-xs font-bold cursor-pointer"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Class Summary */}
          <div className="flex gap-3.5 items-center p-3 bg-slate-50/90 rounded-2xl border border-slate-100">
            <img
              src={`/assets/member-booking/${selectedClass.image}`}
              className="size-14 rounded-xl object-cover shadow-2xs shrink-0 border border-slate-200"
              alt=""
            />
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <h4 className="font-bold text-slate-800 text-sm leading-snug truncate">
                {selectedClass.title}
              </h4>
              <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                {selectedClass.schedule}
              </p>
            </div>
          </div>

          {/* Class Info Pill */}
          <div className="bg-purple-50/80 border border-purple-100/90 p-3 rounded-xl grid grid-cols-3 gap-2 text-xs text-purple-900">
            <div className="truncate">
              <span className="text-purple-500 font-medium block text-[10px] uppercase">HLV</span>
              <strong className="font-semibold text-slate-800 truncate block">{selectedClass.coach}</strong>
            </div>
            <div className="truncate">
              <span className="text-purple-500 font-medium block text-[10px] uppercase">Phòng</span>
              <strong className="font-semibold text-slate-800 truncate block">{selectedClass.room?.replace?.("Phòng: ", "") || selectedClass.room}</strong>
            </div>
            <div className="truncate">
              <span className="text-purple-500 font-medium block text-[10px] uppercase">Chỗ trống</span>
              <strong className="font-semibold text-emerald-600 truncate block">{selectedClass.spacesText}</strong>
            </div>
          </div>

          {/* Member Selection Section */}
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
                  onClick={() => {
                    setMemberId("");
                    setMemberSearch("");
                    setMemberPage(1);
                  }}
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
                      setMemberSearch(e.target.value);
                      setMemberPage(1);
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
                        setMemberSearch("");
                        setMemberPage(1);
                      }}
                      className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Paginated Member list - No ugly cut-off rows, fixed height */}
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
                          setMemberId(m.id);
                          setMemberSearch("");
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
                            setMemberSearch("");
                            setMemberPage(1);
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
                        onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
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
                        onClick={() => setMemberPage((p) => Math.min(totalMemberPages, p + 1))}
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
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleBookForMember}
            disabled={!memberId || loadingBook}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            {loadingBook ? (
              <>
                <svg className="animate-spin size-3 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Xác nhận đặt lớp"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
