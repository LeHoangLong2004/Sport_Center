import React from "react";
import { createPortal } from "react-dom";
import { Lock, Sparkles, ArrowRight, X, Clock, Calendar, ShieldCheck } from "lucide-react";

interface EarlyBookingModalProps {
  target: {
    item: any;
    opensAtDateStr: string;
    advanceHours: number;
    tierName: string;
    isMaxTier?: boolean;
  } | null;
  onClose: () => void;
  onUpgrade?: () => void;
}

export const EarlyBookingModal: React.FC<EarlyBookingModalProps> = ({
  target,
  onClose,
  onUpgrade,
}) => {
  if (!target) return null;
  const { item, opensAtDateStr, advanceHours, tierName } = target;
  const isMaxTier =
    target.isMaxTier ??
    (advanceHours >= 120 || (tierName || "").toLowerCase().includes("premium"));

  const advanceText =
    advanceHours >= 24 ? `${Math.round(advanceHours / 24)} ngày (${advanceHours} giờ)` : `${advanceHours} giờ`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start gap-3.5 border-b border-slate-100 p-5 dark:border-slate-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            <Lock className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Lớp học chưa mở đặt chỗ
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Áp dụng theo chính sách mở lịch của từng hạng thành viên
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Class Target Info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {item.name}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Khung giờ: {item.startTime} - {item.endTime} ({item.dateStr || "Sắp tới"})
              </span>
            </div>
          </div>

          {/* Time notice box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Calendar className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Thời gian mở đặt cho hạng {tierName}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-850 dark:text-amber-200 font-medium">
              Hạng <strong>{tierName}</strong> được mở đặt trước tối đa <strong>{advanceText}</strong> trước giờ bắt đầu. Lớp học này sẽ chính thức mở nhận đặt chỗ cho bạn vào lúc:
            </p>
            <div className="rounded-xl bg-amber-100/80 dark:bg-amber-900/40 px-3 py-2 text-center text-xs font-black text-amber-900 dark:text-amber-200 tracking-wide border border-amber-300/50">
              ⏰ {opensAtDateStr}
            </div>
          </div>

          {/* Upsell Banner or VIP Privilege Notice */}
          {isMaxTier ? (
            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-white p-4 dark:border-amber-800/60 dark:from-amber-950/30 dark:to-slate-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Đặc quyền mở đặt sớm nhất hệ thống (VIP)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                Bạn đang sở hữu hạng thành viên cao nhất với đặc quyền đặt trước <strong>5 ngày</strong> (sớm hơn các hạng khác từ 2 – 4 ngày). Lớp học này sẽ mở ưu tiên cho bạn đầu tiên vào đúng thời điểm trên.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-4 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-slate-900 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Muốn giữ chỗ sớm ngay hôm nay?</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                Thành viên <strong>Plus (mở trước 3 ngày)</strong> và <strong>Premium (mở trước 5 ngày)</strong> đang được ưu tiên đặt giữ chỗ lớp này ngay lúc này.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors ${
              isMaxTier
                ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 border-transparent font-bold"
                : "text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            Đã hiểu
          </button>
          {!isMaxTier && onUpgrade && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onUpgrade();
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nâng cấp hạng ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

