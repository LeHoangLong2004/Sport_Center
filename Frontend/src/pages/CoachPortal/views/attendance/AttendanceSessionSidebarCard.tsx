import React from "react";
import { 
  Clock, 
  MapPin, 
  Dumbbell, 
  ShieldCheck, 
  ChevronDown, 
  FileText, 
  Award, 
  Lock
} from "lucide-react";
import type { MockSession } from "../../services/api";

interface Props {
  selectedSessionId: string;
  onSessionChange: (id: string) => void;
  activeSessions: MockSession[];
  session: MockSession;
  isFinalized: boolean;
  isDraft?: boolean;
  isEditingThisSession: boolean;
  isLocked: boolean;
  isSaving: boolean;
  isPast24h?: boolean;
  stats: {
    total: number;
    attended: number;
    absent: number;
    pending: number;
    attendanceRate: number;
  };
  onSave: () => void;
  onSaveDraft: () => void;
  onNavigateToAssessment: () => void;
  onOpenReasonModal: () => void;
}

export default function AttendanceSessionSidebarCard({
  selectedSessionId,
  onSessionChange,
  activeSessions,
  session,
  isFinalized,
  isDraft,
  isEditingThisSession,
  isLocked,
  isSaving,
  isPast24h,
  stats,
  onSave,
  onSaveDraft,
  onNavigateToAssessment,
  onOpenReasonModal,
}: Props) {
  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${dayName}, ${dd}/${mm}/${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-5 sticky top-6">
      {/* PHẦN 1: CHỌN CA DẠY & TRẠNG THÁI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Ca dạy điểm danh
          </label>
          {isPast24h ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3 text-slate-500" /> Đã khóa (Quá 24h)
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isFinalized
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : isDraft
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {isFinalized ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Đã chốt sổ
                </>
              ) : isDraft ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Đang điểm danh
                </>
              ) : (
                "Chưa điểm danh"
              )}
            </span>
          )}
        </div>

        {/* Dropdown ca dạy */}
        <div className="relative">
          <select
            value={selectedSessionId || ""}
            onChange={(e) => onSessionChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-8 py-2.5 text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
          >
            {activeSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.className} — {s.startTime}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* PHẦN 2: CHI TIẾT BUỔI TẬP (DẠNG DANH SÁCH DỌC CÓ ICON) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
          {session.className}
        </h3>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{session.startTime} - {session.endTime}</span>
          <span className="text-slate-400 text-[11px]">({formatSessionDate(session.date)})</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{session.room || "Gym Area • Tầng 2"}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Dumbbell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {session.sport || "Gym"} {session.level ? `• ${session.level}` : ""}
          </span>
        </div>
      </div>

      {/* PHẦN 3: THỐNG KÊ SĨ SỐ TRỰC QUAN (3 Ô RÕ RÀNG) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Thống kê sĩ số
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {stats.attendanceRate}% chuyên cần
          </span>
        </div>

        {/* 3 ô thống kê gọn gàng: Tổng sĩ số | Có mặt | Vắng mặt */}
        <div className="grid grid-cols-3 gap-2">
          {/* Tổng */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block mb-0.5">Tổng sĩ số</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>

          {/* Có mặt */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-0.5">Có mặt</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.attended}</span>
          </div>

          {/* Vắng */}
          <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40 text-center">
            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">Vắng mặt</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">{stats.absent}</span>
          </div>
        </div>

        {/* Thanh Progress bar chuyên cần mỏng */}
        {stats.total > 0 && (
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
            <div
              style={{ width: `${(stats.attended / stats.total) * 100}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Có mặt: ${stats.attended}`}
            />
            <div
              style={{ width: `${(stats.absent / stats.total) * 100}%` }}
              className="bg-rose-500 transition-all duration-300"
              title={`Vắng: ${stats.absent}`}
            />
            <div
              style={{ width: `${(stats.pending / stats.total) * 100}%` }}
              className="bg-slate-200 dark:bg-slate-700 transition-all duration-300"
              title={`Chưa điểm danh: ${stats.pending}`}
            />
          </div>
        )}
      </div>

      {/* PHẦN 4: CỤM NÚT THAO TÁC CA DẠY (XẾP DỌC FULL-WIDTH) */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* Nút Primary: Chốt sổ / Khóa quá 24h */}
        {isPast24h ? (
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200/60 dark:border-slate-700"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Đã khóa vĩnh viễn (Quá 24h)</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isSaving || (isLocked && !isEditingThisSession)}
            onClick={() => {
              if (isEditingThisSession) onOpenReasonModal();
              else onSave();
            }}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-xl transition-all shadow-sm ${
              isLocked && !isEditingThisSession
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 cursor-pointer shadow-md"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{isEditingThisSession ? "Lưu điều chỉnh sổ điểm danh" : isLocked ? "Sổ điểm danh đã chốt" : "Chốt sổ điểm danh"}</span>
          </button>
        )}

        {/* Nút Phụ: Lưu bản nháp (khi chưa chốt & chưa quá 24h) */}
        {!isFinalized && !isPast24h && (
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveDraft}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Lưu bản nháp</span>
          </button>
        )}

        {/* Nút phụ: Đánh giá buổi học */}
        <button
          type="button"
          onClick={onNavigateToAssessment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-colors cursor-pointer"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Đánh giá ca tập sau giờ</span>
        </button>
      </div>
    </div>
  );
}
