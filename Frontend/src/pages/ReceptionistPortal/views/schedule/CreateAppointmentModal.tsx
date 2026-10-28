import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar, X, AlertCircle, Search, RefreshCw, Check } from "lucide-react";
import { DateInput } from "../../../../components/DateInput";
import type { Coach, CustomerModeType, DateQuickChoiceType, Member } from "./types";
import {
  PRESET_SERVICES,
  TIME_SLOTS,
  getTodayIso,
  getTomorrowIso,
  isSlotInPast,
} from "./constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  coaches: Coach[];
  members: Member[];
  onCreated: () => void;
}

export const CreateAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  coaches,
  members,
  onCreated,
}) => {
  const [customerMode, setCustomerMode] = useState<CustomerModeType>("member");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);
  const [isCustomService, setIsCustomService] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(getTodayIso());
  const [dateQuickChoice, setDateQuickChoice] = useState<DateQuickChoiceType>("today");
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Set initial selected coach
  useEffect(() => {
    if (coaches.length > 0 && !selectedCoachId) {
      setSelectedCoachId(coaches[0].id);
    }
  }, [coaches, selectedCoachId]);

  // Auto-switch to next available time slot if selectedTime is in the past for today
  useEffect(() => {
    if (selectedDate === getTodayIso()) {
      if (isSlotInPast(selectedTime, selectedDate)) {
        const nextAvailable = TIME_SLOTS.find((s) => !isSlotInPast(s, selectedDate));
        if (nextAvailable) setSelectedTime(nextAvailable);
      }
    }
  }, [selectedDate, selectedTime]);

  // Close member dropdown on click outside
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
  }, []);

  // Filtered members for dropdown search
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    let finalCustomerName = "";
    if (customerMode === "member") {
      if (!selectedMember) {
        setFormError("Vui lòng chọn một hội viên từ danh sách.");
        return;
      }
      const memberDisplayName = selectedMember.fullName || selectedMember.name || "";
      const memberPhone = selectedMember.phoneNumber ? ` (${selectedMember.phoneNumber})` : "";
      finalCustomerName = `${memberDisplayName}${memberPhone}`;
    } else {
      if (!guestName.trim()) {
        setFormError("Vui lòng nhập họ và tên khách hàng.");
        return;
      }
      const phoneSuffix = guestPhone.trim() ? ` (${guestPhone.trim()})` : "";
      finalCustomerName = `${guestName.trim()}${phoneSuffix}`;
    }

    const finalTitle = isCustomService
      ? customTitle.trim()
      : PRESET_SERVICES[selectedServiceIndex]?.title || "";

    if (!finalTitle) {
      setFormError("Vui lòng chọn hoặc nhập nội dung lịch hẹn.");
      return;
    }

    const coach = coaches.find((c) => c.id === selectedCoachId);
    if (!coach) {
      setFormError("Vui lòng chọn Huấn luyện viên phụ trách.");
      return;
    }

    if (!selectedTime) {
      setFormError("Vui lòng chọn thời gian hẹn.");
      return;
    }

    if (!selectedDate) {
      setFormError("Vui lòng chọn hoặc nhập ngày hẹn hợp lệ theo định dạng dd/mm/yyyy.");
      return;
    }

    const todayIso = getTodayIso();
    if (selectedDate < todayIso) {
      setFormError("Ngày hẹn không được trước ngày hôm nay.");
      return;
    }

    if (selectedDate === todayIso) {
      const parts = selectedTime.split(":");
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const slotDate = new Date();
        slotDate.setHours(h, m, 0, 0);
        if (slotDate < new Date()) {
          setFormError(`Khung giờ ${selectedTime} hôm nay đã trôi qua. Vui lòng chọn khung giờ khác.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          title: finalTitle,
          customerName: finalCustomerName,
          coachName: coach.fullName,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(result?.message || "Không thể tạo lịch hẹn. Vui lòng kiểm tra lại.");
        setSubmitting(false);
        return;
      }

      // Reset form state
      setGuestName("");
      setGuestPhone("");
      setSelectedMember(null);
      setCustomTitle("");
      setIsCustomService(false);
      setSelectedDate(getTodayIso());
      setDateQuickChoice("today");
      setFormError("");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setFormError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Compact Header */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">
              Tạo Lịch Hẹn Coach & Tư Vấn
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
          {formError && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px] flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Customer Selection */}
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
                  <div className="flex items-center justify-between p-2 bg-blue-50/80 border border-blue-200 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                        {(selectedMember.fullName || selectedMember.name || "M").slice(0, 2).toUpperCase()}
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
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
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
                          <div className="p-2 text-center text-slate-400 text-[11px]">
                            Không tìm thấy hội viên
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

          {/* 2. Service Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                2. Dịch vụ / Buổi hẹn
              </span>
              <button
                type="button"
                onClick={() => setIsCustomService(!isCustomService)}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                {isCustomService ? "Chọn có sẵn" : "Nhập tay"}
              </button>
            </div>

            {isCustomService ? (
              <input
                type="text"
                required
                placeholder="Nhập tên dịch vụ lịch hẹn..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
              />
            ) : (
              <select
                value={selectedServiceIndex}
                onChange={(e) => setSelectedServiceIndex(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
              >
                {PRESET_SERVICES.map((s, idx) => (
                  <option key={idx} value={idx}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Coach Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              3. Huấn luyện viên phụ trách *
            </span>
            <select
              value={selectedCoachId}
              onChange={(e) => setSelectedCoachId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
            >
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} — {c.specialty || "HLV Cá nhân"} ({c.phoneNumber || "N/A"})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                4. Ngày hẹn *
              </span>
              <span className="text-[11px] text-blue-600 font-medium">
                {selectedDate ? (
                  (() => {
                    const parts = selectedDate.split("-");
                    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : selectedDate;
                  })()
                ) : ""}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDateQuickChoice("today");
                  setSelectedDate(getTodayIso());
                }}
                className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
                  dateQuickChoice === "today"
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Hôm nay
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateQuickChoice("tomorrow");
                  setSelectedDate(getTomorrowIso());
                }}
                className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
                  dateQuickChoice === "tomorrow"
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Ngày mai
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateQuickChoice("custom");
                }}
                className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition cursor-pointer text-center ${
                  dateQuickChoice === "custom"
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Chọn ngày khác
              </button>
            </div>

            {dateQuickChoice === "custom" && (
              <div className="relative flex items-center">
                <DateInput
                  value={selectedDate}
                  onChange={(iso) => setSelectedDate(iso)}
                  placeholder="dd/mm/yyyy"
                  className="w-full mt-0.5 pl-3 pr-9 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500 bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (hiddenDateInputRef.current) {
                      try {
                        hiddenDateInputRef.current.showPicker();
                      } catch {
                        hiddenDateInputRef.current.focus();
                      }
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 cursor-pointer transition"
                  title="Mở lịch chọn ngày"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <input
                  ref={hiddenDateInputRef}
                  type="date"
                  min={getTodayIso()}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>
            )}
          </div>

          {/* 5. Time Selection */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                5. Khung giờ hẹn *
              </span>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-[11px] text-blue-600 hover:underline cursor-pointer"
              >
                {isCustomTime ? "Khung giờ sẵn" : "Giờ khác"}
              </button>
            </div>

            {isCustomTime ? (
              <input
                type="time"
                required
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-500"
              />
            ) : (
              <div className="grid grid-cols-5 gap-1.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  const inPast = isSlotInPast(slot, selectedDate);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={inPast}
                      onClick={() => !inPast && setSelectedTime(slot)}
                      className={`py-1 rounded text-[11px] font-mono font-bold border transition ${
                        inPast
                          ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed line-through"
                          : isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs cursor-pointer"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 cursor-pointer"
                      }`}
                      title={inPast ? "Khung giờ này đã trôi qua trong ngày hôm nay" : undefined}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Compact Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Xác nhận & Báo HLV</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
