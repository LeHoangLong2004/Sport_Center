import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import type { CustomerModeType, Member } from "../types";

interface AppointmentCustomerSelectorProps {
  customerMode: CustomerModeType;
  setCustomerMode: (mode: CustomerModeType) => void;
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
  memberSearch: string;
  setMemberSearch: (search: string) => void;
  members: Member[];
  guestName: string;
  setGuestName: (name: string) => void;
  guestPhone: string;
  setGuestPhone: (phone: string) => void;
  showMemberDropdown: boolean;
  setShowMemberDropdown: (show: boolean) => void;
}

export const AppointmentCustomerSelector: React.FC<AppointmentCustomerSelectorProps> = ({
  customerMode,
  setCustomerMode,
  selectedMember,
  setSelectedMember,
  memberSearch,
  setMemberSearch,
  members,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  showMemberDropdown,
  setShowMemberDropdown,
}) => {
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(e.target as Node)
      ) {
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setShowMemberDropdown]);

  const filteredMembers = React.useMemo(() => {
    if (!memberSearch.trim()) return members.slice(0, 8);
    const q = memberSearch.toLowerCase().trim();
    return members
      .filter(
        (m) =>
          (m.fullName && m.fullName.toLowerCase().includes(q)) ||
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.phoneNumber && m.phoneNumber.includes(q)) ||
          (m.memberCode && m.memberCode.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [members, memberSearch]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
          1. Khách hàng
        </span>
        {/* Small Segmented Switch */}
        <div className="flex p-0.5 bg-slate-100 rounded text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => {
              setCustomerMode("member");
              setShowMemberDropdown(false);
            }}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              customerMode === "member"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Hội viên
          </button>
          <button
            type="button"
            onClick={() => {
              setCustomerMode("guest");
              setShowMemberDropdown(false);
            }}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              customerMode === "guest"
                ? "bg-white text-blue-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Khách mới
          </button>
        </div>
      </div>

      {customerMode === "member" ? (
        <div className="relative" ref={memberDropdownRef}>
          {selectedMember ? (
            <div className="flex items-center justify-between p-2 bg-purple-50/80 border border-purple-200 rounded text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {(selectedMember.fullName || selectedMember.name || "M")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <span className="font-bold text-slate-800">
                  {selectedMember.fullName || selectedMember.name}
                </span>
                <span className="text-slate-500 text-[11px]">
                  ({selectedMember.phoneNumber || "Chưa có SĐT"})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMember(null);
                  setMemberSearch("");
                }}
                className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer"
              >
                Đổi
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, SĐT hoặc mã hội viên..."
                  value={memberSearch}
                  onFocus={() => setShowMemberDropdown(true)}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Floating Dropdown */}
              {showMemberDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-36 overflow-y-auto z-30 divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <div className="p-3 text-center text-[11px] text-slate-400">
                      Không tìm thấy hội viên nào
                    </div>
                  ) : (
                    filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedMember(m);
                          setShowMemberDropdown(false);
                        }}
                        className="w-full flex items-center justify-between p-2 hover:bg-blue-50 text-left text-xs transition cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800">
                          {m.fullName || m.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {m.phoneNumber || "Không có SĐT"}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            required
            placeholder="Họ tên khách *"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
          />
          <input
            type="tel"
            required
            placeholder="Số điện thoại *"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
};
