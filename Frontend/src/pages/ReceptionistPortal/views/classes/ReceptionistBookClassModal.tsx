import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";
import { BookClassHeader } from "./bookClass/BookClassHeader";
import { BookClassSummary } from "./bookClass/BookClassSummary";
import { BookClassMemberList } from "./bookClass/BookClassMemberList";
import { BookClassAttendeesList } from "./bookClass/BookClassAttendeesList";

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
  const [activeTab, setActiveTab] = useState<"book" | "attendees">("book");
  const [memberId, setMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 4;
  const [loadingBook, setLoadingBook] = useState(false);

  // Attendees list
  const [enrolledMembers, setEnrolledMembers] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [cancellingMemberId, setCancellingMemberId] = useState<string | null>(null);
  const [currentAvailableSpots, setCurrentAvailableSpots] = useState<number>(
    selectedClass?.spaces ?? 0
  );

  const fetchClassDetails = useCallback(async () => {
    if (!selectedClass?.id) return;
    setLoadingAttendees(true);
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}`);
      if (res.ok) {
        const data = await res.json();
        setEnrolledMembers(data.enrolledMembers || []);
        if (typeof data.availableSpots === "number") {
          setCurrentAvailableSpots(data.availableSpots);
        }
      }
    } catch (err) {
      console.error("Error fetching class attendees:", err);
    } finally {
      setLoadingAttendees(false);
    }
  }, [selectedClass?.id]);

  useEffect(() => {
    if (selectedClass) {
      setCurrentAvailableSpots(selectedClass.spaces ?? 0);
      fetchClassDetails();
      // If class is already full, default to attendees tab so receptionist can see who booked or cancel
      if (selectedClass.spaces === 0) {
        setActiveTab("attendees");
      } else {
        setActiveTab("book");
      }
    } else {
      setMemberId("");
      setMemberSearch("");
      setMemberPage(1);
      setEnrolledMembers([]);
      setActiveTab("book");
    }
  }, [selectedClass, fetchClassDetails]);

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
      const d = await res.json().catch(() => null);
      if (res.ok) {
        const memberName = selectedMember?.fullName || selectedMember?.name || "hội viên";
        const className = selectedClass.title || selectedClass.sportName || "lớp học";
        const successMsg = `Đặt lớp "${className}" thành công cho hội viên ${memberName}!`;
        toast.success(successMsg);
        onSuccess(successMsg);
        handleClose();
      } else {
        const errMsg = d?.message || "Không thể đặt lớp cho hội viên. Vui lòng kiểm tra lại số buổi còn lại.";
        toast.error(errMsg);
        onError(errMsg);
      }
    } catch (e: any) {
      const errMsg = "Có lỗi xảy ra khi kết nối máy chủ: " + (e?.message || String(e));
      toast.error(errMsg);
      onError(errMsg);
    } finally {
      setLoadingBook(false);
    }
  };

  const handleCancelForMember = async (attendee: any) => {
    const memberName = attendee.fullName || "hội viên";
    const confirmMsg = `Bạn có chắc chắn muốn hủy lịch tập của học viên "${memberName}"?\n\nSuất tập sẽ được giải phóng hoặc tiền vé sẽ được tự động hoàn lại vào Ví của học viên.`;
    if (!window.confirm(confirmMsg)) return;

    setCancellingMemberId(attendee.memberId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/classes/${selectedClass.id}/cancel-for-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ MemberId: attendee.memberId }),
      });
      const d = await res.json().catch(() => null);
      if (res.ok) {
        const successMsg = d?.message || `Đã hủy lịch tập cho học viên ${memberName} thành công!`;
        toast.success(successMsg);
        onSuccess(successMsg);
        await fetchClassDetails();
      } else {
        const errMsg = d?.message || "Không thể hủy lịch cho học viên.";
        toast.error(errMsg);
        onError(errMsg);
      }
    } catch (e: any) {
      const errMsg = "Lỗi kết nối khi hủy lịch: " + (e?.message || String(e));
      toast.error(errMsg);
      onError(errMsg);
    } finally {
      setCancellingMemberId(null);
    }
  };

  if (!selectedClass) return null;

  // Clone selectedClass with updated available spots for BookClassSummary
  const classSummaryObj = {
    ...selectedClass,
    spacesText: `Còn ${currentAvailableSpots} chỗ`,
    spaces: currentAvailableSpots,
  };

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
          <BookClassSummary selectedClass={classSummaryObj} />

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("book")}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "book"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <UserPlus className="size-3.5" />
              <span>Đặt lớp hộ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("attendees")}
              className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "attendees"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Users className="size-3.5" />
              <span>Học viên đã đăng ký ({enrolledMembers.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "book" ? (
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
          ) : (
            <BookClassAttendeesList
              enrolledMembers={enrolledMembers}
              loading={loadingAttendees}
              cancellingMemberId={cancellingMemberId}
              onCancelMember={handleCancelForMember}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {activeTab === "attendees" && (
              <span>Tổng số học viên: <strong className="text-slate-700">{enrolledMembers.length}</strong></span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Đóng
            </button>
            {activeTab === "book" && (
              <button
                type="button"
                onClick={handleBookForMember}
                disabled={!memberId || loadingBook || currentAvailableSpots <= 0}
                className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                {loadingBook ? (
                  <>
                    <svg className="animate-spin size-3 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Đang xử lý...</span>
                  </>
                ) : currentAvailableSpots <= 0 ? (
                  "Lớp đã hết chỗ"
                ) : (
                  "Xác nhận đặt lớp"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
