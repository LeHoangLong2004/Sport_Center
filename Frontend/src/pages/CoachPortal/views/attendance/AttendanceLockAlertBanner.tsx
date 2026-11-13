import React from "react";
import { Lock, Info, AlertTriangle, Edit3, X } from "lucide-react";

interface AttendanceLockAlertBannerProps {
  session: {
    startTime: string;
    date: string;
  };
  isExpired24h: boolean;
  isLocked: boolean;
  isEditingThisSession: boolean;
  deadlineInfo: {
    formattedDeadline: string;
    remainingText: string;
  };
  onEditClick: () => void;
  onCancelEditClick: () => void;
}

export const AttendanceLockAlertBanner: React.FC<AttendanceLockAlertBannerProps> = ({
  session,
  isExpired24h,
  isLocked,
  isEditingThisSession,
  deadlineInfo,
  onEditClick,
  onCancelEditClick,
}) => {
  if (isExpired24h) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-800/50 text-amber-950 dark:text-amber-200 text-xs sm:text-sm animate-in fade-in">
        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <p className="font-bold text-sm text-amber-900 dark:text-amber-200">
            Buổi học đã đóng (Không thể sửa điểm vì đã quá 24 giờ)
          </p>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Ca học bắt đầu lúc <strong>{session.startTime} ngày {session.date}</strong>. Quy định trung tâm chỉ cho phép HLV điểm danh hoặc chỉnh sửa trong vòng <strong>24 giờ</strong> kể từ lúc bắt đầu ca học (đã hết hạn lúc <strong>{deadlineInfo.formattedDeadline}</strong>).
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
            🔒 Danh sách học viên và trạng thái điểm danh hiện tại ở chế độ chỉ xem (Read-only). HLV không thể điểm danh bổ sung hay sửa lại.
          </p>
        </div>
      </div>
    );
  }

  if (isEditingThisSession) {
    return (
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Đang ở chế độ điều chỉnh điểm danh ({deadlineInfo.remainingText}).</p>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Bạn có thể cập nhật lại trạng thái học viên hoặc thêm ghi chú. Khi hoàn tất, hãy nhấn nút <strong>&ldquo;Lưu điều chỉnh cho buổi này&rdquo;</strong> ở thanh bên cạnh và nhập lý do điều chỉnh.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancelEditClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg hover:bg-rose-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5 text-rose-600" />
          Hủy điều chỉnh
        </button>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-900/50 text-slate-900 dark:text-slate-300 text-xs sm:text-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Sổ điểm danh buổi học này đã được chốt.</p>
            <p className="text-xs text-slate-700 dark:text-slate-400 mt-0.5">
              Danh sách học viên hiện đang ở chế độ xem. Nếu phát hiện sai sót cần chỉnh sửa, hãy nhấn <strong>&ldquo;Điều chỉnh điểm danh&rdquo;</strong> ({deadlineInfo.remainingText}).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg hover:bg-amber-100/60 transition-colors shadow-2xs shrink-0 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-amber-600" />
          Điều chỉnh điểm danh
        </button>
      </div>
    );
  }

  return null;
};

export default AttendanceLockAlertBanner;

