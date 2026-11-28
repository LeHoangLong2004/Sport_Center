import React from 'react';
import { DateInput } from '../../../../components/DateInput';
import { centerDateParts } from '../../../../utils/scheduleTimeHelper';
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
  isEditing: boolean;
  leadTimeValidation: { valid: boolean; message: string } | null;
  weekdayValidation: { valid: boolean; message: string } | null;
}

const WEEK_DAYS = [
  { label: 'T2', val: 1 }, { label: 'T3', val: 2 }, { label: 'T4', val: 3 },
  { label: 'T5', val: 4 }, { label: 'T6', val: 5 }, { label: 'T7', val: 6 }, { label: 'CN', val: 0 },
];

// ── Shared style tokens đồng bộ với theme dự án ────────────────
const inputCls =
  'w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium ' +
  'bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white outline-none ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal ' +
  'focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 ' +
  'shadow-2xs transition-all';

const selectCls = `${inputCls} cursor-pointer`;

const FieldLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="mb-1.5">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {children} <span className="text-red-500 font-bold">*</span>
    </label>
    {hint && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
  </div>
);

const OptionalLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">{children}</label>
);

const Divider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">{label}</span>
    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
  </div>
);
// ──────────────────────────────────────────────────────────────

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
  isEditing,
  leadTimeValidation,
  weekdayValidation,
}: CreateClassFormFieldsProps) {
  const isRecurring = !!formData.isRecurring;
  const isPtOneToOne = formData.trainingMode === 'PT_ONE_TO_ONE';
  const currentDays = formData.daysOfWeek || [1, 4];
  const durationMinutes = Number(formData.durationMinutes);
  const startDateTime = formData.scheduleDate && formData.scheduleTime
    ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}:00+07:00`)
    : null;
  const validStartDateTime = startDateTime && !Number.isNaN(startDateTime.getTime()) ? startDateTime : null;
  const endDateTime = validStartDateTime && Number.isFinite(durationMinutes) && durationMinutes > 0
    ? new Date(validStartDateTime.getTime() + durationMinutes * 60_000)
    : null;
  const endTimeParts = endDateTime ? centerDateParts(endDateTime) : null;
  const sessionEndTime = endTimeParts ? `${endTimeParts.hour}:${endTimeParts.minute}` : null;
  const sessionEndsNextDay = Boolean(
    endDateTime && validStartDateTime &&
    centerDateParts(endDateTime).day !== centerDateParts(validStartDateTime).day
  );

  let courseEndDate: string | null = null;
  const weeks = Number(formData.weeks);
  const totalSessions = Number(formData.totalSessions);
  if (isRecurring && formData.scheduleDate && currentDays.length > 0 && weeks > 0 &&
      totalSessions === weeks * currentDays.length) {
    const [year, month, day] = formData.scheduleDate.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(startDate.getTime())) {
      const scheduledDates: Date[] = [];
      for (let dayOffset = 0; dayOffset < weeks * 7; dayOffset += 1) {
        const weekday = new Date(Date.UTC(year, month - 1, day + dayOffset)).getUTCDay();
        if (currentDays.includes(weekday)) {
          scheduledDates.push(new Date(Date.UTC(year, month - 1, day + dayOffset)));
        }
      }
      if (scheduledDates.length === totalSessions) {
        const lastDate = scheduledDates[scheduledDates.length - 1];
        courseEndDate = `${String(lastDate.getUTCDate()).padStart(2, '0')}/${String(lastDate.getUTCMonth() + 1).padStart(2, '0')}/${lastDate.getUTCFullYear()}`;
      }
    }
  }

  const toggleDay = (dayVal: number) => {
    let newDays: number[];
    if (currentDays.includes(dayVal)) {
      if (currentDays.length <= 1) return;
      newDays = currentDays.filter(d => d !== dayVal);
    } else {
      newDays = [...currentDays, dayVal].sort((a, b) => a - b);
    }
    setFormData(prev => ({ ...prev, daysOfWeek: newDays, totalSessions: newDays.length * (prev.weeks || 10) }));
  };

  const handleWeeksChange = (w: number) => {
    const safeWeeks = Math.max(1, Math.min(52, w));
    setFormData(prev => ({ ...prev, weeks: safeWeeks, totalSessions: (prev.daysOfWeek?.length || 2) * safeWeeks }));
  };

  return (
    <div className="space-y-6">

      {/* ══ 1. HÌNH THỨC LỚP ══ */}
      {!isEditing && <div>
        <Divider label="Hình thức lớp học" />
        <div className="grid grid-cols-2 gap-3.5 mt-3">
          {[
            { icon: '👤', label: 'Lớp PT 1–1', sub: 'Một học viên · lịch tập định kỳ', val: 'PT_ONE_TO_ONE' as const },
            { icon: '🔄', label: 'Lớp nhóm định kỳ', sub: 'Lặp lại theo các ngày trong tuần', val: 'GROUP' as const },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() =>
                setFormData(prev => ({
                  ...prev,
                  trainingMode: opt.val,
                  isRecurring: true,
                  capacity: opt.val === 'PT_ONE_TO_ONE' ? 1 : (prev.capacity === 1 ? 20 : prev.capacity),
                  daysOfWeek: prev.daysOfWeek?.length ? prev.daysOfWeek : [1, 4],
                  weeks: prev.weeks || 10,
                  totalSessions: (prev.daysOfWeek?.length || 2) * (prev.weeks || 10),
                }))
              }
              className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer select-none ${
                (isPtOneToOne ? 'PT_ONE_TO_ONE' : 'GROUP') === opt.val
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-slate-600 hover:bg-emerald-50/20 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-2xl shrink-0">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${(isPtOneToOne ? 'PT_ONE_TO_ONE' : 'GROUP') === opt.val ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.sub}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                (isPtOneToOne ? 'PT_ONE_TO_ONE' : 'GROUP') === opt.val
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}>
                {(isPtOneToOne ? 'PT_ONE_TO_ONE' : 'GROUP') === opt.val && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>}

      {/* ══ 2. THÔNG TIN LỚP ══ */}
      <div>
        <Divider label="Thông tin lớp học" />
        <div className="space-y-4 mt-3">
          {/* Tên lớp */}
          <div>
            <FieldLabel>Tên lớp học</FieldLabel>
            <input
              required type="text" name="className"
              value={formData.className}
              onChange={e => { e.target.setCustomValidity(''); handleChange(e); }}
              onInvalid={e => { (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập tên lớp học.'); }}
              className={inputCls}
              placeholder="VD: Yoga phục hồi cột sống buổi sáng"
            />
          </div>

          {/* Môn + Phòng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Môn học</FieldLabel>
              <select required name="sportId" value={formData.sportId} onChange={handleChange} className={selectCls}>
                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">— Chọn môn học —</option>
                {sports.map(s => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {s.name}
                  </option>
                ))}
              </select>
              {isCoachMode && sports.length === 0 && !loadingData && (
                <p className="mt-1.5 text-xs text-orange-600 dark:text-orange-400 font-medium">⚠ Chưa được phân công môn nào.</p>
              )}
              {isCoachMode && sports.length > 0 && (
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Có {sports.length} môn được phân công</p>
              )}
            </div>
            <div>
              <FieldLabel>Phòng tập</FieldLabel>
              <select required name="facilityId" value={formData.facilityId} onChange={handleChange} className={selectCls}>
                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">— Chọn phòng —</option>
                {facilities.map(f => (
                  <option key={f.id} value={f.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 3. LỊCH HỌC ══ */}
      <div>
        <Divider label="Lịch học & Quy mô" />
        <div className="space-y-4 mt-3">

          {/* Ngày + Giờ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel hint={isCoachMode ? 'Tối thiểu từ ngày mai' : undefined}>
                {isRecurring ? 'Ngày bắt đầu khóa học' : 'Ngày diễn ra'}
              </FieldLabel>
              <DateInput
                required
                value={formData.scheduleDate}
                onChange={value => setFormData(prev => ({ ...prev, scheduleDate: value }))}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel hint={isCoachMode ? 'Phải cách thời điểm hiện tại ≥ 24 giờ' : undefined}>
                Giờ bắt đầu
              </FieldLabel>
              <input
                required type="time" name="scheduleTime"
                value={formData.scheduleTime}
                onChange={e => { e.target.setCustomValidity(''); handleChange(e); }}
                onInvalid={e => { (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập giờ học.'); }}
                className={inputCls}
              />
            </div>
          </div>

          {/* Thời lượng + Sức chứa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Thời lượng buổi tập</FieldLabel>
              <div className="relative">
                <input
                  required type="number" name="durationMinutes" min="15" max="480"
                  value={formData.durationMinutes}
                  onChange={e => { e.target.setCustomValidity(''); handleChange(e); }}
                  onInvalid={e => { (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập thời lượng.'); }}
                  className={`${inputCls} pr-16`}
                  placeholder="60"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
                  phút
                </span>
              </div>
            </div>
            <div>
              {isPtOneToOne ? (
                <>
                  <OptionalLabel>Sức chứa</OptionalLabel>
                  <div className={`${inputCls} text-slate-600 dark:text-slate-300`}>1 học viên (cố định cho PT 1–1)</div>
                </>
              ) : (
                <>
                  <FieldLabel>Sức chứa tối đa</FieldLabel>
                  <div className="relative">
                    <input
                      required type="number" name="capacity" min="2" max="500"
                      value={formData.capacity}
                      onChange={e => { e.target.setCustomValidity(''); handleChange(e); }}
                      onInvalid={e => { (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập sức chứa.'); }}
                      className={`${inputCls} pr-16`}
                      placeholder="20"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
                      học viên
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Cảnh báo lead time (dành cho Coach) */}
          {leadTimeValidation && !leadTimeValidation.valid && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{leadTimeValidation.message}</p>
            </div>
          )}

          {/* Cấu hình lặp định kỳ */}
          {isRecurring && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 sm:p-5 space-y-4">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Cấu hình lịch lặp định kỳ</p>

              {/* Day picker buttons */}
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Chọn các ngày trong tuần</p>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {WEEK_DAYS.map(day => {
                    const sel = currentDays.includes(day.val);
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => toggleDay(day.val)}
                        className={`h-10 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 ${
                          sel
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
                {weekdayValidation && !weekdayValidation.valid && (
                  <p role="alert" className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
                    {weekdayValidation.message}
                  </p>
                )}
              </div>

              {/* Weeks + Total */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <OptionalLabel>Số tuần đào tạo</OptionalLabel>
                  <input
                    type="number" min="1" max="52"
                    value={formData.weeks || 10}
                    onChange={e => handleWeeksChange(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <OptionalLabel>Tổng số buổi dự kiến</OptionalLabel>
                  <div className="w-full border-2 border-emerald-300 dark:border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/30 text-center flex items-center justify-center">
                    {formData.totalSessions || currentDays.length * (formData.weeks || 10)} buổi
                  </div>
                </div>
              </div>
            </div>
          )}

          {(courseEndDate || sessionEndTime) && (
            <div className="rounded-2xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/70 dark:bg-sky-950/30 p-4 sm:p-5">
              <p className="text-sm font-bold text-sky-900 dark:text-sky-200 mb-3">Thời điểm kết thúc dự kiến</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courseEndDate && (
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 px-3.5 py-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ngày kết thúc khóa học</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{courseEndDate}</p>
                  </div>
                )}
                {sessionEndTime && (
                  <div className="rounded-xl bg-white/80 dark:bg-slate-900/60 px-3.5 py-3">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Giờ kết thúc mỗi buổi</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {sessionEndTime}{sessionEndsNextDay ? ' (sang ngày hôm sau)' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ 4. HUẤN LUYỆN VIÊN ══ */}
      <div>
        <Divider label="Huấn luyện viên phụ trách" />
        <div className="mt-3">
          {isCoachMode ? (
            <div className="flex items-center gap-4 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm shadow-emerald-500/25">
                {currentCoachName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentCoachName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tài khoản Coach đang đăng nhập</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full shrink-0">
                Active
              </span>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Chọn huấn luyện viên <span className="text-red-500 font-bold">*</span>
              </label>
              <select required name="coachId" value={formData.coachId} onChange={handleChange} className={selectCls}>
                <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">— Chọn huấn luyện viên —</option>
                {coaches.map(c => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                    {c.fullName || c.email}
                  </option>
                ))}
              </select>
              {loadingData && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang tải danh sách HLV...
                </p>
              )}
              {!loadingData && coaches.length === 0 && (
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1.5">⚠ Chưa có HLV nào trong hệ thống.</p>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
