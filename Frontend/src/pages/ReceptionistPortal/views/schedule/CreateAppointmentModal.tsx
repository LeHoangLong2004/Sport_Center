import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, X, AlertCircle, RefreshCw, Check } from "lucide-react";
import type { Coach, CustomerModeType, Member } from "./types";
import { PRESET_SERVICES } from "./constants";
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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState("Khu PT 1-1 / Sảnh Lễ tân");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set initial selected coach
  useEffect(() => {
    if (coaches.length > 0 && !selectedCoachId) {
      setSelectedCoachId(coaches[0].id);
    }
  }, [coaches, selectedCoachId]);

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

    const appointmentAt = new Date(`${selectedDate}T${selectedTime}:00`);
    const hoursUntilAppointment = (appointmentAt.getTime() - Date.now()) / (60 * 60 * 1000);
    if (!Number.isFinite(hoursUntilAppointment) || hoursUntilAppointment < 24) {
      setFormError("Lịch hẹn cần được đặt trước ít nhất 24 giờ.");
      return;
    }
    if (hoursUntilAppointment > 24 * 7) {
      setFormError("Chỉ có thể đặt lịch hẹn trước tối đa 7 ngày.");
      return;
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
          durationMinutes,
          location: location.trim(),
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
      setSelectedDate("");
      setSelectedTime("");
      setDurationMinutes(60);
      setLocation("Khu PT 1-1 / Sảnh Lễ tân");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modern Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Tạo Lịch Hẹn Coach & Tư Vấn
              </h3>
              <p className="text-[10px] text-emerald-100 font-medium">
                Sắp xếp buổi tập thử, InBody hoặc tư vấn với HLV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/15 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 flex flex-col gap-3 text-xs">
          {formError && (
            <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded text-[11px] flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
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
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              6. Thời lượng *
              <select required value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="w-full px-2.5 py-1.5 text-xs font-normal normal-case border border-slate-200 rounded focus:outline-none focus:border-emerald-500 bg-white">
                {[30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} phút</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
              7. Địa điểm *
              <input required value={location} onChange={(event) => setLocation(event.target.value)} maxLength={120} placeholder="Ví dụ: Khu PT 1-1" className="w-full px-2.5 py-1.5 text-xs font-normal normal-case border border-slate-200 rounded focus:outline-none focus:border-emerald-500 bg-white" />
            </label>
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
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition shadow-xs shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
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
