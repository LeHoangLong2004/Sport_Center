import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

import {
  ClassesFilters,
  ClassesGrid,
  ClassesToast,
} from "./ClassesPageSections";

export function ClassesPage() {
  const [category, setCategory] = useState("Tất cả lớp");
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [shift, setShift] = useState("Tất cả");
  const [coachQuery, setCoachQuery] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [sports, setSports] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [memberId, setMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [memberPage, setMemberPage] = useState(1);
  const MEMBERS_PER_PAGE = 4;
  const [loadingBook, setLoadingBook] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchClasses = () => {
    fetch("/api/classes/available")
      .then((r) => r.json())
      .then((data) => {
        const images = [
          "60eeb.png",
          "340d3.png",
          "b0a09.png",
          "25c0c.png",
          "5709f.png",
          "8b5dc.png",
        ];
        const dayNames = [
          "Chủ Nhật",
          "Thứ Hai",
          "Thứ Ba",
          "Thứ Tư",
          "Thứ Năm",
          "Thứ Sáu",
          "Thứ Bảy",
        ];

        const mapped = data.map((d: any, i: number) => {
          const date = new Date(d.scheduleTime);
          const day = dayNames[date.getDay()];
          const dd = String(date.getDate()).padStart(2, "0");
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const hh = String(date.getHours()).padStart(2, "0");
          const min = String(date.getMinutes()).padStart(2, "0");

          return {
            id: d.id,
            sportName: d.sportName,
            title: d.className || d.name || "Lớp học",
            coach: d.coachName || "N/A",
            schedule: `${day}, ${dd}/${mm} • ${hh}:${min} (${d.durationMinutes} phút)`,
            room: `Phòng: ${d.facilityName}`,
            spacesText: `Còn ${d.availableSpots ?? d.capacity - (d.currentEnrolled || d.currentBookings || 0)} chỗ`,
            spaces:
              d.availableSpots ??
              d.capacity - (d.currentEnrolled || d.currentBookings || 0),
            image: images[i % images.length],
            startHour: date.getHours(),
            date: date.getDate(),
            rawDate: d.scheduleTime,
          };
        });
        setClasses(mapped);
      })
      .catch((e) => console.error(e));
  };

  React.useEffect(() => {
    fetchClasses();

    fetch("/api/sports")
      .then((r) => r.json())
      .then((data) => setSports(data))
      .catch((e) => console.error(e));

    const token = localStorage.getItem("token");
    if (token) {
      // First try members-lookup endpoint (lighter and faster)
      fetch("/api/users/members-lookup", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (r.ok) return r.json();
          return fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json());
        })
        .then((data) => {
          if (Array.isArray(data)) {
            const list = data.filter((u: any) => !u.roleName || u.roleName.toLowerCase() === "member");
            setMembersList(list);
          }
        })
        .catch((e) => console.error("Error loading members:", e));
    }
  }, []);

  // Block ALL scroll on page when modal is open
  // We must use native listener with passive:false because the scroll container
  // is a child div (overflow-y-auto), not document.body, so body.style.overflow
  // alone doesn't work.
  React.useEffect(() => {
    if (!selectedClass) return;

    const blockScroll = (e: Event) => {
      // Allow scrolling INSIDE the member list inside the modal
      const target = e.target as HTMLElement;
      if (target.closest('[data-member-list="true"]')) return;
      e.preventDefault();
    };

    document.addEventListener("wheel", blockScroll, { passive: false });
    document.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      document.removeEventListener("wheel", blockScroll);
      document.removeEventListener("touchmove", blockScroll);
    };
  }, [selectedClass]);

  const visibleClasses = useMemo(
    () =>
      classes.filter((item) => {
        const matchCoach = item.coach
          .toLowerCase()
          .includes(coachQuery.toLowerCase());
        const matchCategory =
          category === "Tất cả lớp" ||
          (item.sportName &&
            item.sportName.toLowerCase().includes(category.toLowerCase())) ||
          item.title.toLowerCase().includes(category.toLowerCase());

        let matchShift = true;
        if (shift.includes("Sáng")) {
          matchShift = item.startHour >= 6 && item.startHour < 12;
        } else if (shift.includes("Chiều")) {
          matchShift = item.startHour >= 12 && item.startHour < 17;
        } else if (shift.includes("Tối")) {
          matchShift = item.startHour >= 17 && item.startHour < 22;
        }

        const matchDay = selectedDate === 0 || item.date === selectedDate;

        return matchCoach && matchCategory && matchShift && matchDay;
      }),
    [coachQuery, category, shift, selectedDate, classes],
  );

  // Filter members matching search query
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

  React.useEffect(() => {
    if (memberPage > totalMemberPages) {
      setMemberPage(1);
    }
  }, [totalMemberPages, memberPage]);

  const selectedMember = useMemo(
    () => membersList.find((m) => String(m.id) === String(memberId)),
    [membersList, memberId]
  );

  const handleCloseModal = () => {
    setSelectedClass(null);
    setMemberId("");
    setMemberSearch("");
    setMemberPage(1);
  };

  const handleBookForMember = async () => {
    if (!memberId || !selectedClass) return;
    setLoadingBook(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `/api/classes/${selectedClass.id}/book-for-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ MemberId: memberId }),
        },
      );
      const d = await res.json();
      if (res.ok) {
        showToast("Đặt lớp thành công cho hội viên!", "success");
        handleCloseModal();
        fetchClasses(); // Refresh data
      } else {
        showToast(d.message || "Không thể đặt lớp", "error");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra: " + String(e), "error");
    } finally {
      setLoadingBook(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 flex-1 w-full max-w-6xl mx-auto relative">
      <ClassesToast toast={toast} />
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            Quản lý Lớp học & Đặt hộ
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Hỗ trợ hội viên tra cứu và giữ chỗ lớp học trực tiếp tại quầy.
          </p>
        </div>
      </div>

      <ClassesFilters
        sports={sports}
        category={category}
        setCategory={setCategory}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        coachQuery={coachQuery}
        setCoachQuery={setCoachQuery}
        shift={shift}
        setShift={setShift}
      />
      <ClassesGrid
        visibleClasses={visibleClasses}
        setSelectedClass={(cls) => {
          setSelectedClass(cls);
          setMemberId("");
          setMemberSearch("");
          setMemberPage(1);
        }}
      />

      {/* Booking Modal - Compact, Paginated, No scroll cut-off, Anti-freeze */}
      {selectedClass &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none overscroll-contain animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseModal();
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
                  onClick={handleCloseModal}
                  className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 size-7 flex items-center justify-center rounded-full transition-colors border border-slate-200 text-xs font-bold"
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
                    <strong className="font-semibold text-slate-800 truncate block">{selectedClass.room.replace("Phòng: ", "")}</strong>
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
                        className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:text-purple-800 bg-white hover:bg-purple-100/80 border border-purple-200 rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
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
                            className="absolute right-2 text-slate-400 hover:text-slate-600 text-xs font-bold p-0.5"
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
                              className="w-full text-left px-3.5 py-2.5 hover:bg-purple-50/80 active:bg-purple-100/80 flex items-center justify-between text-xs transition-colors group"
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
                                className="mt-2 text-xs font-semibold text-purple-600 hover:underline"
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
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors flex items-center gap-1 bg-white"
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
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-[11px] font-semibold transition-colors flex items-center gap-1 bg-white"
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
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleBookForMember}
                  disabled={!memberId || loadingBook}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-purple-500/20 flex items-center gap-1.5"
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
        )}
    </div>
  );
}
