import React from 'react';

interface ClassDetailInfoProps {
  classDetail: {
    sportName?: string;
    facilityName?: string;
    className?: string;
    coachName?: string;
    scheduleTime: string;
    durationMinutes: number;
    currentEnrolled: number;
    capacity: number;
  };
  isPendingProposal: boolean;
}

export function ClassDetailInfo({ classDetail, isPendingProposal }: ClassDetailInfoProps) {
  const scheduleDate = new Date(classDetail.scheduleTime);

  return (
    <>
      {/* Proposal Banner */}
      {isPendingProposal && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-xs">
            <p className="font-bold text-amber-900">Đề xuất lịch dạy từ HLV {classDetail.coachName || 'Coach'}</p>
            <p className="text-amber-700 mt-0.5">Vui lòng kiểm tra kỹ thời gian và phòng tập trước khi phê duyệt.</p>
          </div>
        </div>
      )}

      {/* Class Title Card */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200">
            {classDetail.sportName}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            📍 {classDetail.facilityName}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          {classDetail.className}
        </h3>
      </div>

      {/* Info Grid (4 compact stat cards) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời gian</span>
          <p className="text-xs font-bold text-slate-800 mt-1">
            {scheduleDate.toLocaleDateString('vi-VN')}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {scheduleDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({classDetail.durationMinutes}p)
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Huấn luyện viên</span>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={classDetail.coachName || 'Chưa phân công'}>
            {classDetail.coachName || 'Chưa phân công'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">HLV phụ trách</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phòng tập</span>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate" title={classDetail.facilityName}>
            {classDetail.facilityName}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Địa điểm</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sĩ số</span>
          <p className="text-xs font-bold text-slate-800 mt-1">
            <span className="text-emerald-600">{classDetail.currentEnrolled}</span> / {classDetail.capacity}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Học viên tối đa</p>
        </div>
      </div>
    </>
  );
}
