import { AlertTriangle, X } from "lucide-react";

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

  const presetReasons = [
    "Học viên đến muộn sau khi đã chốt sổ",
    "Điều chỉnh do nhầm lẫn thao tác",
    "Lễ tân bổ sung học viên vào lớp sau giờ bắt đầu",
    "Học viên xin phép về sớm do lý do sức khỏe",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Lý do điều chỉnh điểm danh
              </h3>
              <p className="text-xs text-slate-400">
                Lớp: <span className="font-semibold text-slate-700 dark:text-slate-300">{className}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Sổ điểm danh này đã được chốt trước đó. Nhằm đảm bảo tính minh bạch cho hệ thống quản lý trung tâm, vui lòng nêu rõ lý do điều chỉnh để lưu vào lịch sử kiểm toán.
        </p>

        {/* Quick reasons */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Lý do phổ biến (nhấn để chọn nhanh)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {presetReasons.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAuditReason(preset)}
                className={`text-xs px-2.5 py-1 rounded-lg border text-left transition-colors ${
                  auditReason === preset
                    ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/30 dark:border-orange-600 dark:text-orange-300 font-medium"
                    : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Nội dung lý do <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Nhập lý do chi tiết..."
            value={auditReason}
            onChange={(e) => setAuditReason(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={!auditReason.trim()}
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 rounded-xl transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            Xác nhận lưu điều chỉnh
          </button>
        </div>
      </div>
    </div>
  );
}
