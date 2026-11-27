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
  const [facilities, setFacilities] = useState<string[]>([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Set initial selected coach
  useEffect(() => {
    if (coaches.length > 0 && !selectedCoachId) {
      setSelectedCoachId(coaches[0].id);
    }
  }, [coaches, selectedCoachId]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setFacilitiesLoading(true);
    fetch("/api/facilities")
      .then(async (response) => response.ok ? response.json() : [])
      .then((rows) => {
        if (!active) return;
        const names = Array.isArray(rows)
          ? rows.map((facility: any) => String(facility?.name || "").trim()).filter(Boolean)
          : [];
        setFacilities(names);
        setLocation((current) => current && names.includes(current) ? current : names[0] || "");
      })
      .catch(() => { if (active) setFacilities([]); })
      .finally(() => { if (active) setFacilitiesLoading(false); });
    return () => { active = false; };
  }, [isOpen]);

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

    if (!location) {
      setFormError(facilities.length ? "Vui lòng chọn phòng tập." : "Chưa có phòng tập để chọn. Vui lòng cập nhật danh sách phòng tập trước.");
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
      setLocation(facilities[0] || "");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/55 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modern Header */}
        <div className="px-6 py-4 bg-white text-slate-900 flex items-center justify-between shrink-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">LỊCH HẸN & TƯ VẤN</div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Tạo Lịch Hẹn Coach & Tư Vấn
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Sắp xếp buổi tập thử, InBody hoặc tư vấn với HLV
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-5 text-sm">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Customer Selection */}
          <section className="space-y-3">
          <SectionHeading title="1. Khách hàng" />
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
          </section>

          {/* 2 & 3. Service & Coach Selection */}
          <section className="space-y-4">
          <SectionHeading title="2. Dịch vụ & huấn luyện viên" />
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
          </section>

          {/* 4 & 5. Date & Time Selection */}
          <section className="space-y-4">
          <SectionHeading title="3. Lịch hẹn" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AppointmentDateTimeSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
          </div>
          </section>

          <section className="space-y-4">
          <SectionHeading title="4. Chi tiết buổi hẹn" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 font-semibold text-slate-700 text-sm">
              Thời lượng *
              <select required value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="w-full px-3.5 py-3 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white">
                {[30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} phút</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 font-semibold text-slate-700 text-sm">
              Phòng tập *
              <select required value={location} onChange={(event) => setLocation(event.target.value)} disabled={facilitiesLoading || facilities.length === 0} className="w-full px-3.5 py-3 text-sm font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 bg-white disabled:bg-slate-100">
                <option value="">{facilitiesLoading ? "Đang tải danh sách phòng..." : facilities.length ? "— Chọn phòng tập —" : "Chưa có phòng tập"}</option>
                {facilities.map((facility) => <option key={facility} value={facility}>{facility}</option>)}
              </select>
              {facilities.length === 0 && !facilitiesLoading && <span className="text-xs font-normal text-rose-600">Không tải được phòng tập. Hãy kiểm tra danh mục phòng tập.</span>}
            </label>
          </div>
          </section>

          {/* Compact Modal Footer */}
          <div className="sticky bottom-0 -mx-6 -mb-5 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-slate-200 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
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

function SectionHeading({ title }: { title: string }) {
  return <div className="flex items-center gap-3"><span className="shrink-0 text-xs font-extrabold uppercase tracking-widest text-slate-400">{title}</span><span className="h-px flex-1 bg-slate-200" /></div>;
}
