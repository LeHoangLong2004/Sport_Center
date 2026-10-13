import { AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  auditReason: string;
  setAuditReason: (reason: string) => void;
  onConfirm: () => void;
}

export default function AttendanceAuditReasonModal({
  isOpen,
  onClose,
  className,
  auditReason,
  setAuditReason,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Lý do điều chỉnh điểm danh
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Buổi học <strong>{className}</strong> đã được chốt sổ trước đó. Vui lòng nhập lý do điều chỉnh để lưu vào lịch sử nhật ký.
        </p>

        <textarea
          rows={3}
          required
          placeholder="VD: Học viên báo đến muộn do kẹt xe, đã xác nhận lại với học viên..."
          value={auditReason}
          onChange={(e) => setAuditReason(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        ></textarea>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!auditReason.trim()}
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50"
          >
            Xác nhận lưu
          </button>
        </div>
      </div>
    </div>
  );
}
