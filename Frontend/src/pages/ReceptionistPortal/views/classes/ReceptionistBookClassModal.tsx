import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookClassHeader } from "./bookClass/BookClassHeader";
import { BookClassSummary } from "./bookClass/BookClassSummary";
import { BookClassMemberList } from "./bookClass/BookClassMemberList";

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
        <BookClassHeader onClose={handleClose} />

        <div className="p-6 flex flex-col gap-4">
          <BookClassSummary selectedClass={selectedClass} />

          <BookClassMemberList
            selectedMember={selectedMember}
            allFilteredMembers={allFilteredMembers}
            pagedMembers={pagedMembers}
            memberSearch={memberSearch}
            memberPage={memberPage}
            totalMemberPages={totalMemberPages}
            onSelectMember={(id) => {
              setMemberId(id);
              setMemberSearch("");
            }}
            onClearSelectedMember={() => {
              setMemberId("");
              setMemberSearch("");
              setMemberPage(1);
            }}
            onSearchChange={(search) => {
              setMemberSearch(search);
              setMemberPage(1);
            }}
            onPageChange={setMemberPage}
          />
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
