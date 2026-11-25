import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, AlertTriangle, CheckCircle2, X, LoaderCircle, Clock } from "lucide-react";
import { parseScheduleTime } from "../../../../utils/scheduleTimeHelper";
import { type CancelBookingTarget } from "./bookingTypes";

interface CancelBookingModalProps {
  cancelTarget: CancelBookingTarget | null;
  onClose: () => void;
  onConfirmCancel: (classId: string, type?: "class" | "pt") => void;
  isCancelling?: boolean;
  membership?: any | null;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  cancelTarget,
  onClose,
  onConfirmCancel,
  isCancelling = false,
  membership,
}) => {
  if (!cancelTarget) return null;

  const isPt = cancelTarget.type === "pt";
  const isNoPaymentClass = !isPt && (
    cancelTarget.isCovered === true ||
    cancelTarget.price === 0
  );

  const ptDiscountRate = (membership?.coachDiscountPct ?? 0) / 100;
  const classDiscountRate = (membership?.groupDiscountPct ?? 0) / 100;
  const defaultPtPrice = Math.round(300000 * (1 - ptDiscountRate));
  const defaultClassPrice = Math.round(150000 * (1 - classDiscountRate));

  const effectivePrice = isNoPaymentClass
    ? 0
    : (cancelTarget.price && cancelTarget.price > 0)
    ? cancelTarget.price
    : (isPt ? defaultPtPrice : defaultClassPrice);

  const priceDisplay = `${effectivePrice.toLocaleString("vi-VN")} đ`;

  // Tính toán thời gian thực tế để biết hội viên đang hủy trước hay sau mốc 2 tiếng (tránh lệch múi giờ UTC+7)
  const isLate = useMemo(() => {
    const now = Date.now();
    let classStartMs: number | null = null;

    // 1. Ưu tiên tuyệt đối từ dateStr và startTime (đã là giờ thực tế hiển thị trên màn hình Việt Nam)
    if (cancelTarget.dateStr && cancelTarget.startTime) {
      let datePart = cancelTarget.dateStr;
      if (datePart.includes("/")) {
        const [d, m, y] = datePart.split("/");
        datePart = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      const [h, min] = cancelTarget.startTime.split(":").map(Number);
      const [y, mon, d] = datePart.split("-").map(Number);
      if (!isNaN(y) && !isNaN(mon) && !isNaN(d) && !isNaN(h) && !isNaN(min)) {
        classStartMs = new Date(y, mon - 1, d, h, min, 0).getTime();
      }
    }

    // 2. Fallback dùng hàm parseScheduleTime chuẩn của trung tâm
    if (classStartMs === null && cancelTarget.scheduleTime) {
      const parsed = parseScheduleTime(cancelTarget.scheduleTime).getTime();
      if (!isNaN(parsed)) {
        classStartMs = parsed;
      }
    }

    if (classStartMs !== null) {
      const diffMs = classStartMs - now;
      // Dưới 2 tiếng (2 * 3600 * 1000 = 7.200.000 ms) là hủy muộn
      return diffMs < 2 * 3600 * 1000;
    }

    return false;
  }, [cancelTarget]);

  const timeInfo = cancelTarget.startTime
    ? `${cancelTarget.startTime}${cancelTarget.endTime ? ` - ${cancelTarget.endTime}` : ""} (${cancelTarget.dateStr || "Hôm nay"})`
    : cancelTarget.dateStr || "";

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (!isCancelling && e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              isLate
                ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300"
                : "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
            }`}
          >
            {isLate ? <AlertTriangle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isLate
                ? isPt
                  ? "Xác nhận hủy lịch PT (Sát giờ tập)"
                  : "Xác nhận hủy lịch (Sát giờ học)"
                : isPt
                ? "Xác nhận hủy lịch kèm riêng 1-1"
                : "Xác nhận hủy đặt lớp"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isLate
                ? isPt
                  ? "Ca tập PT 1-1 sắp bắt đầu trong vòng chưa đầy 2 tiếng."
                  : "Lớp học sắp bắt đầu trong vòng chưa đầy 2 tiếng."
                : isPt
                ? "Bạn có chắc chắn muốn hủy ca tập này với Huấn luyện viên không?"
                : "Bạn có chắc chắn muốn hủy chỗ tại lớp học này không?"}
            </p>
          </div>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Class card info */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {cancelTarget.className}
            </div>
            {timeInfo && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Khung giờ: {timeInfo}</span>
              </div>
            )}
          </div>

          {/* Conditional Policy Box */}
          {isLate ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Cảnh báo hủy muộn (Dưới 2 tiếng)</span>
              </div>
              <ul className="text-[11px] leading-relaxed space-y-1 list-disc pl-4 text-amber-800/90 dark:text-amber-300/90 font-medium">
                <li>
                  {isPt ? (
                    <>Ca tập của bạn sẽ được <strong>giải phóng ngay</strong> để Huấn luyện viên có thể nhận học viên khác.</>
                  ) : (
                    <>Chỗ tập của bạn sẽ được <strong>giải phóng ngay</strong> để nhường lại cho học viên khác.</>
                  )}
                </li>
                {isNoPaymentClass ? (
                  <li>
                    Suất tập sẽ được giải phóng để hội viên khác có thể đăng ký.
                  </li>
                ) : (
                  <li>
                    Theo chính sách trung tâm, chi phí ({priceDisplay}) sẽ <strong>KHÔNG ĐƯỢC HOÀN LẠI</strong> vào ví.
                  </li>
                )}
              </ul>
            </div>
          ) : isNoPaymentClass ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Hủy hợp lệ & Giải phóng suất tập</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90 font-medium">
                Bạn đang hủy trước giờ học trên 2 tiếng. Suất tập sẽ được giải phóng để hội viên khác có thể đăng ký.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Hủy hợp lệ & Hoàn tiền 100%</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800/90 dark:text-emerald-300/90 font-medium">
                Bạn đang hủy trước {isPt ? "ca tập" : "giờ học"} trên 2 tiếng. Số tiền <strong>{priceDisplay}</strong> sẽ được <strong>hoàn trả 100% vào Ví hội viên</strong> của bạn ngay lập tức!
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/30">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50 cursor-pointer"
          >
            {isLate ? (isPt ? "Giữ lại ca tập" : "Giữ lại lịch học") : "Giữ lại lịch"}
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={() => onConfirmCancel(cancelTarget.classId, cancelTarget.type)}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              isLate
                ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
            } disabled:opacity-60`}
          >
            {isCancelling ? (
              <>
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý hủy...</span>
              </>
            ) : isLate ? (
              <span>{isNoPaymentClass ? "Chấp nhận hủy lịch" : "Chấp nhận hủy (Không hoàn tiền)"}</span>
            ) : isNoPaymentClass ? (
              <span>Xác nhận hủy đặt</span>
            ) : (
              <span>Xác nhận hủy & Hoàn tiền</span>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
