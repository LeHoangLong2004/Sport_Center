import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCreateClassForm } from './createClass/useCreateClassForm';
import { CreateClassFormFields } from './createClass/CreateClassFormFields';

interface CreateClassModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  editData?: any;
  mode?: 'manager' | 'coach';
}

export function CreateClassModal({ onClose, onSuccess, editData, mode = 'manager' }: CreateClassModalProps) {
  const modalRootRef = useRef<HTMLDivElement>(null);

  const {
    isCoachMode, formData, setFormData, handleChange,
    sports, facilities, coaches, currentCoachName,
    loadingData, loading, error, success, leadTimeValidation, weekdayValidation, handleSubmit,
  } = useCreateClassForm({ editData, mode, onSuccess, onClose });

  // Lock scroll on background elements
  useEffect(() => {
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const modalEl = modalRootRef.current;
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('.manager-page-content, .portal-page-enter, [class*="overflow-y-auto"]')
    ).filter(el => !modalEl || !modalEl.contains(el));
    const saved = containers.map(el => ({ el, v: el.style.overflow }));
    containers.forEach(el => { el.style.overflow = 'hidden'; });
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      saved.forEach(({ el, v }) => { el.style.overflow = v; });
    };
  }, []);

  const isRecurring = !!formData.isRecurring;
  const isPtOneToOne = formData.trainingMode === 'PT_ONE_TO_ONE';
  const WEEK_DAYS = [
    { label: 'T2', val: 1 }, { label: 'T3', val: 2 }, { label: 'T4', val: 3 },
    { label: 'T5', val: 4 }, { label: 'T6', val: 5 }, { label: 'T7', val: 6 }, { label: 'CN', val: 0 },
  ];
  const currentDays = formData.daysOfWeek || [1, 4];
  const totalSessions = formData.totalSessions || currentDays.length * (formData.weeks || 10);
  const selectedSport = sports.find(s => s.id === formData.sportId);
  const selectedFacility = facilities.find(f => f.id === formData.facilityId);
  const selectedCoach = coaches.find(c => c.id === formData.coachId);

  const modeConfig = isCoachMode
    ? {
        label: 'Đề xuất mở lớp học',
        sub: 'Coach Portal · Chờ Quản lý phê duyệt',
        badge: 'Coach Mode',
        badgeCls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
        dot: 'bg-violet-500',
      }
    : editData
    ? {
        label: 'Cập nhật lớp học',
        sub: 'Quản lý · Chỉnh sửa thông tin lịch học',
        badge: 'Edit Mode',
        badgeCls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      }
    : {
        label: 'Tạo lớp học mới',
        sub: 'Quản lý · Thiết lập lịch đào tạo & môn học',
        badge: 'Create Mode',
        badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };

  const modalContent = (
    <div
      ref={modalRootRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/75 p-4 overscroll-contain backdrop-blur-xs animate-in fade-in duration-150"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 transition-colors"
        onClick={e => e.stopPropagation()}
      >
        {/* ══ HEADER ══ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            {/* SC brand logo */}
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25 shrink-0">
              <span className="text-white font-extrabold text-sm tracking-wide">SC</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {modeConfig.label}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {modeConfig.sub}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${modeConfig.badgeCls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${modeConfig.dot} shrink-0`} />
              {modeConfig.badge}
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700/80"
              aria-label="Đóng"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ══ BODY 2 CỘT NGANG ══ */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Preview panel is intentionally hidden to keep the proposal form focused. */}
          <div className="hidden">
            <div className="p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Xem trước thông tin
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Tự động cập nhật</span>
              </div>

              {/* Tên lớp */}
              <PreviewCard>
                <PreviewRow label="Tên lớp học">
                  <span className={`text-sm font-bold leading-snug break-words ${formData.className ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 italic font-normal text-xs'}`}>
                    {formData.className || 'Chưa nhập tên lớp...'}
                  </span>
                </PreviewRow>
              </PreviewCard>

              {/* Hình thức */}
              <PreviewCard>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{isPtOneToOne ? '👤' : isRecurring ? '🔄' : '🗓️'}</span>
                  <PreviewRow label="Hình thức học">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {isPtOneToOne ? 'PT 1–1 · định kỳ' : isRecurring ? 'Lớp nhóm · định kỳ' : 'Một buổi'}
                    </span>
                  </PreviewRow>
                </div>
              </PreviewCard>

              {/* Môn học & Phòng */}
              {(selectedSport || selectedFacility) && (
                <PreviewCard>
                  {selectedSport && (
                    <PreviewRow label="Môn thể thao">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedSport.name}
                      </span>
                    </PreviewRow>
                  )}
                  {selectedFacility && (
                    <div className={selectedSport ? "mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60" : ""}>
                      <PreviewRow label="Phòng tập">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {selectedFacility.name}
                        </span>
                      </PreviewRow>
                    </div>
                  )}
                </PreviewCard>
              )}

              {/* HLV */}
              {(selectedCoach || isCoachMode) && (
                <PreviewCard>
                  <PreviewRow label="Huấn luyện viên phụ trách">
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {(isCoachMode ? currentCoachName : (selectedCoach?.fullName || selectedCoach?.email || 'H'))[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {isCoachMode ? currentCoachName : (selectedCoach?.fullName || selectedCoach?.email)}
                      </span>
                    </div>
                  </PreviewRow>
                </PreviewCard>
              )}

              {/* Thời gian */}
              {formData.scheduleDate && (
                <PreviewCard>
                  <PreviewRow label={isRecurring ? 'Ngày bắt đầu khóa học' : 'Ngày diễn ra'}>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formData.scheduleDate}</span>
                    {formData.scheduleTime && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                        🕐 {formData.scheduleTime} · {formData.durationMinutes || 60} phút
                      </span>
                    )}
                  </PreviewRow>
                </PreviewCard>
              )}

              {/* Sức chứa */}
              {Number(formData.capacity) > 0 && (
                <PreviewCard>
                  <PreviewRow label="Quy mô lớp">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {isPtOneToOne ? '1 học viên' : formData.capacity} <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">{isPtOneToOne ? '· PT 1–1' : 'học viên tối đa'}</span>
                    </span>
                  </PreviewRow>
                </PreviewCard>
              )}

              {/* Lộ trình định kỳ */}
              {isRecurring && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 space-y-2">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">📋 Lộ trình đào tạo</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {totalSessions} <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">tổng số buổi</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formData.weeks || 10} tuần · {currentDays.length} buổi/tuần
                  </p>
                  <div className="flex gap-1 flex-wrap pt-1">
                    {currentDays.map(d => (
                      <span key={d} className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs shadow-emerald-600/30">
                        {WEEK_DAYS.find(w => w.val === d)?.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Coach mode note */}
              {isCoachMode && (
                <div className="rounded-xl border border-violet-200 dark:border-violet-800/80 bg-violet-50/80 dark:bg-violet-950/40 p-3.5 mt-0.5">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">⏱ Lưu ý đề xuất</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Đề xuất phải trước lịch học <strong className="text-violet-700 dark:text-violet-300">≥ 24 giờ</strong> để Quản lý kịp xét duyệt.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL: Form nhập liệu ── */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-slate-900">

            {/* Thông báo lỗi / thành công */}
            {(error || success) && (
              <div className="px-6 pt-5 space-y-2 shrink-0">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm rounded-xl border border-red-200 dark:border-red-800">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{success}</span>
                  </div>
                )}
              </div>
            )}

            {/* Form scrollable container */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <CreateClassFormFields
                  formData={formData} setFormData={setFormData} handleChange={handleChange}
                  sports={sports} facilities={facilities} coaches={coaches}
                  currentCoachName={currentCoachName} loadingData={loadingData}
                    isCoachMode={isCoachMode} isEditing={!!editData} leadTimeValidation={leadTimeValidation}
                    weekdayValidation={weekdayValidation}
                />
              </div>

              {/* FOOTER */}
              <div className="shrink-0 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                  {isCoachMode
                    ? 'Đề xuất sẽ được gửi đến Quản lý để phê duyệt.'
                    : editData ? 'Thay đổi sẽ được áp dụng ngay sau khi lưu.'
                    : 'Lớp học sẽ mở và sẵn sàng tiếp nhận học viên.'}
                </p>
                <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading || (leadTimeValidation !== null && !leadTimeValidation.valid) || (weekdayValidation !== null && !weekdayValidation.valid)}
                    className="px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : isCoachMode ? '📤 Gửi đề xuất' : editData ? '💾 Lưu thay đổi' : '✅ Tạo lớp học'}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

// ── Shared preview components ───────────────────────────────────
function PreviewCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-1.5 shadow-2xs transition-colors">
      {children}
    </div>
  );
}

function PreviewRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      {children}
    </div>
  );
}
