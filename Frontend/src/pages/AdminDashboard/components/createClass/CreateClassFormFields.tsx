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

const STANDARD_SHIFTS = [
  { label: "Sáng 06:00", val: "06:00" },
  { label: "Sáng 07:30", val: "07:30" },
  { label: "Sáng 08:30", val: "08:30" },
  { label: "Sáng 09:00", val: "09:00" },
  { label: "Sáng 10:30", val: "10:30" },
  { label: "Chiều 14:00", val: "14:00" },
  { label: "Chiều 15:30", val: "15:30" },
  { label: "Chiều 17:00", val: "17:00" },
  { label: "Tối 18:30", val: "18:30" },
  { label: "Tối 19:30", val: "19:30" },
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
  return (
    <>
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

      {/* Ngày & Giờ học */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Ngày học</label>
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

      {/* Khung ca học chuẩn đồng bộ giữa Coach & Manager */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 space-y-1.5">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
          Khung ca học chuẩn (Bấm để chọn nhanh):
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STANDARD_SHIFTS.map((shift) => (
            <button
              key={shift.val}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, scheduleTime: shift.val }))}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                formData.scheduleTime === shift.val
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50"
              }`}
            >
              {shift.label}
            </button>
          ))}
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

