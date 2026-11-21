import React from 'react';
import { DateInput } from '../../../../components/DateInput';
import type { CreateClassFormData } from './useCreateClassForm';

interface CreateClassFormFieldsProps {
  formData: CreateClassFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateClassFormData>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  sports: any[];
  facilities: any[];
  coaches: any[];
  currentCoachName: string;
  loadingData: boolean;
  isCoachMode: boolean;
  leadTimeValidation: { valid: boolean; message: string } | null;
}

const WEEK_DAYS = [
  { label: "Thứ 2", val: 1 },
  { label: "Thứ 3", val: 2 },
  { label: "Thứ 4", val: 3 },
  { label: "Thứ 5", val: 4 },
  { label: "Thứ 6", val: 5 },
  { label: "Thứ 7", val: 6 },
  { label: "Chủ Nhật", val: 0 },
];

export function CreateClassFormFields({
  formData,
  setFormData,
  handleChange,
  sports,
  facilities,
  coaches,
  currentCoachName,
  loadingData,
  isCoachMode,
  leadTimeValidation,
}: CreateClassFormFieldsProps) {
  const isRecurring = !!formData.isRecurring;
  const currentDays = formData.daysOfWeek || [1, 4];

  const toggleDay = (dayVal: number) => {
    let newDays: number[];
    if (currentDays.includes(dayVal)) {
      if (currentDays.length <= 1) return; // giữ tối thiểu 1 ngày
      newDays = currentDays.filter(d => d !== dayVal);
    } else {
      newDays = [...currentDays, dayVal].sort((a, b) => a - b);
    }
    const weeks = formData.weeks || 10;
    setFormData(prev => ({
      ...prev,
      daysOfWeek: newDays,
      totalSessions: newDays.length * weeks
    }));
  };

  const handleWeeksChange = (w: number) => {
    const safeWeeks = Math.max(1, w);
    setFormData(prev => ({
      ...prev,
      weeks: safeWeeks,
      totalSessions: (prev.daysOfWeek?.length || 2) * safeWeeks
    }));
  };

  return (
    <>
      {/* Chọn hình thức lớp */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Hình thức lớp học</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isRecurring: false }))}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              !isRecurring
                ? "bg-white text-emerald-700 border border-emerald-500 shadow-xs"
                : "bg-slate-100 text-slate-600 border border-transparent hover:bg-white"
            }`}
          >
            🗓️ Lớp đơn lẻ (1 buổi)
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              isRecurring: true,
              daysOfWeek: prev.daysOfWeek?.length ? prev.daysOfWeek : [1, 4],
              weeks: prev.weeks || 10,
              totalSessions: (prev.daysOfWeek?.length || 2) * (prev.weeks || 10)
            }))}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
              isRecurring
                ? "bg-white text-emerald-700 border border-emerald-500 shadow-xs"
                : "bg-slate-100 text-slate-600 border border-transparent hover:bg-white"
            }`}
          >
            🔄 Khóa học chu kỳ (Định kỳ tuần)
          </button>
        </div>
      </div>

      {/* Tên lớp học */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Tên lớp học</label>
        <input
          required
          type="text"
          name="className"
          value={formData.className}
          onChange={(e) => {
            e.target.setCustomValidity("");
            handleChange(e);
          }}
          onInvalid={(e) => {
            (e.target as HTMLInputElement).setCustomValidity("Vui lòng nhập tên lớp học.");
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          placeholder="VD: Yoga thư giãn"
        />
      </div>

      {/* Cấu hình chu kỳ tuần khi chọn Khóa học định kỳ */}
      {isRecurring && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wide mb-1.5">
              Chọn các ngày học trong tuần (Bấm để chọn):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WEEK_DAYS.map(day => {
                const isSelected = currentDays.includes(day.val);
                return (
                  <button
                    key={day.val}
                    type="button"
                    onClick={() => toggleDay(day.val)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Thời lượng khóa (Tuần)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.weeks || 10}
                onChange={(e) => handleWeeksChange(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tổng số buổi dự kiến</label>
              <div className="w-full border border-emerald-200 rounded-lg px-3 py-1.5 text-sm bg-emerald-50/80 font-bold text-emerald-900">
                {formData.totalSessions || (currentDays.length * (formData.weeks || 10))} buổi
              </div>
            </div>
          </div>

          {/* Lộ trình tóm tắt */}
          <div className="p-2.5 bg-white/90 rounded-lg border border-emerald-100 text-xs text-slate-700 space-y-0.5">
            <span className="font-bold text-emerald-800 block">📋 Tóm tắt lộ trình khóa học:</span>
            <p>
              • Quy mô: <strong>{formData.totalSessions || (currentDays.length * (formData.weeks || 10))} buổi</strong> ({formData.weeks || 10} tuần, mỗi tuần {currentDays.length} buổi).
            </p>
            <p>
              • Lịch học: <strong>{currentDays.map(d => WEEK_DAYS.find(w => w.val === d)?.label).filter(Boolean).join(", ")}</strong> lúc <strong>{formData.scheduleTime || "--:--"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Ngày & Giờ học */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">
            {isRecurring ? "Ngày bắt đầu (Khai giảng)" : "Ngày học"}
          </label>
          <DateInput
            required
            value={formData.scheduleDate}
            onChange={(value) => setFormData((prev) => ({ ...prev, scheduleDate: value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {isCoachMode && (
            <p className="mt-1 text-[11px] text-slate-500">Tối thiểu từ ngày mai trở đi</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Giờ học</label>
          <input
            required
            type="time"
            name="scheduleTime"
            value={formData.scheduleTime}
            onChange={(e) => {
              e.target.setCustomValidity("");
              handleChange(e);
            }}
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity("Vui lòng nhập đầy đủ giờ học và chọn buổi sáng/chiều (AM hoặc PM).");
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          {isCoachMode && (
            <p className="mt-1 text-[11px] text-slate-500">Cách hiện tại ≥ 24h</p>
          )}
        </div>
      </div>

      {/* Cảnh báo quy định thời gian */}
      {leadTimeValidation && !leadTimeValidation.valid && (
        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800">
          <svg className="h-4 w-4 shrink-0 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{leadTimeValidation.message}</span>
        </div>
      )}

      {/* Môn học & Phòng tập */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Môn học</label>
          <select
            required
            name="sportId"
            value={formData.sportId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white"
          >
            <option value="">
              -- {sports.length === 0 ? (isCoachMode ? "Chưa được phân công môn nào" : "Không có môn") : "Chọn môn học"} --
            </option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {isCoachMode && sports.length === 0 && !loadingData && (
            <p className="mt-1 text-[11px] text-slate-600 font-medium">Bạn chưa được Quản lý phân công môn nào để mở lớp.</p>
          )}
          {isCoachMode && sports.length > 0 && (
            <p className="mt-1 text-[11px] text-slate-500">Chỉ hiển thị các môn bạn được phân công ({sports.length} môn).</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Phòng tập</label>
          <select
            required
            name="facilityId"
            value={formData.facilityId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white"
          >
            <option value="">-- Chọn phòng tập --</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Huấn luyện viên */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Huấn luyện viên</label>
        {isCoachMode ? (
          <>
            <div className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 font-medium">
              {currentCoachName}
            </div>
            <p className="mt-1 text-xs text-slate-500">Đề xuất sẽ được gắn với tài khoản Coach đang đăng nhập.</p>
          </>
        ) : (
          <>
            <select
              required
              name="coachId"
              value={formData.coachId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500 bg-white"
            >
              <option value="">-- Chọn HLV --</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.email}
                </option>
              ))}
            </select>
            {loadingData && <p className="text-xs text-slate-600 mt-1">Đang tải dữ liệu...</p>}
            {!loadingData && coaches.length === 0 && <p className="text-xs text-red-600 mt-1">Chưa có HLV nào trong hệ thống.</p>}
          </>
        )}
      </div>

      {/* Thời lượng & Sức chứa */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Thời lượng (Phút)</label>
          <input
            required
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={(e) => {
              e.target.setCustomValidity("");
              handleChange(e);
            }}
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity("Vui lòng nhập thời lượng lớp học (phút).");
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Sức chứa (Người)</label>
          <input
            required
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={(e) => {
              e.target.setCustomValidity("");
              handleChange(e);
            }}
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity("Vui lòng nhập sức chứa tối đa của lớp học.");
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>
    </>
  );
}

