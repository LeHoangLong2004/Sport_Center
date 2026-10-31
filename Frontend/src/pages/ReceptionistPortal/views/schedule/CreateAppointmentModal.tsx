import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, X, AlertCircle, RefreshCw, Check } from "lucide-react";
import type { Coach, CustomerModeType, DateQuickChoiceType, Member } from "./types";
import {
  PRESET_SERVICES,
  TIME_SLOTS,
  getTodayIso,
  isSlotInPast,
} from "./constants";
import { AppointmentCustomerSelector } from "./appointmentModal/AppointmentCustomerSelector";
import { AppointmentServiceSelector } from "./appointmentModal/AppointmentServiceSelector";
import { AppointmentDateTimeSelector } from "./appointmentModal/AppointmentDateTimeSelector";

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
            <div className="w-6 h-6 rounded bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-400">
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
          <AppointmentCustomerSelector
            customerMode={customerMode}
            setCustomerMode={setCustomerMode}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
            memberSearch={memberSearch}
            setMemberSearch={setMemberSearch}
            members={members}
            guestName={guestName}
            setGuestName={setGuestName}
            guestPhone={guestPhone}
            setGuestPhone={setGuestPhone}
            showMemberDropdown={showMemberDropdown}
            setShowMemberDropdown={setShowMemberDropdown}
          />

          {/* 2 & 3. Service & Coach Selection */}
          <AppointmentServiceSelector
            isCustomService={isCustomService}
            setIsCustomService={setIsCustomService}
            customTitle={customTitle}
            setCustomTitle={setCustomTitle}
            selectedServiceIndex={selectedServiceIndex}
            setSelectedServiceIndex={setSelectedServiceIndex}
            coaches={coaches}
            selectedCoachId={selectedCoachId}
            setSelectedCoachId={setSelectedCoachId}
          />

          {/* 4 & 5. Date & Time Selection */}
          <AppointmentDateTimeSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateQuickChoice={dateQuickChoice}
            setDateQuickChoice={setDateQuickChoice}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            isCustomTime={isCustomTime}
            setIsCustomTime={setIsCustomTime}
          />

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
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded transition shadow-xs shadow-purple-600/20 cursor-pointer disabled:opacity-50"
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
