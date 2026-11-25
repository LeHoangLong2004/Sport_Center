import React from "react";
import { AlertTriangle, X, ShieldAlert, ArrowDownCircle, Loader2 } from "lucide-react";
import type { MembershipStatus } from "../../../../services/packageApi";

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  membershipStatus: MembershipStatus;
  isCancelling: boolean;
}

export default function CancelMembershipModal({
  isOpen,
  onClose,
  onConfirm,
  membershipStatus,
  isCancelling,
}: CancelMembershipModalProps) {
  if (!isOpen) return null;

  const daysLeft = membershipStatus.endDate
    ? Math.max(0, Math.ceil((new Date(membershipStatus.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Danger Accent */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-rose-500/10 to-transparent">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Hủy gói thành viên
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xác nhận hạ cấp về Hạng Cơ bản (Miễn phí)
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-2 space-y-4">
          {/* Current Package Overview Box */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Gói đang sử dụng:</span>
              <span className="font-black text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                {membershipStatus.name || "Gói thành viên"}
              </span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/30">
                <span className="text-slate-500 dark:text-slate-400">Thời hạn còn lại:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {daysLeft} ngày (hết hạn: {membershipStatus.endDate ? new Date(membershipStatus.endDate).toLocaleDateString("vi-VN") : "N/A"})
                </span>
              </div>
            )}
          </div>

          {/* Warning Points */}
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Toàn bộ ưu đãi đặt lớp (<strong>{membershipStatus.groupDiscountPct || 8}%</strong>) và Coach 1-1 sẽ chấm dứt ngay lập tức.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowDownCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>
                Tài khoản sẽ được chuyển ngay về <strong>Hạng Cơ Bản (Miễn phí)</strong>. Quyền ưu tiên đặt lịch trước và vé mời bạn bè sẽ quay về mức cơ bản.
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            * Lưu ý: Gói đã hủy sẽ không được hoàn tiền tự động theo quy định của trung tâm. Bạn có thể nâng cấp lại bất kỳ lúc nào.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 p-6 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            Giữ lại gói
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isCancelling}
            className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang hủy gói...</span>
              </>
            ) : (
              <span>Xác nhận hủy gói</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

