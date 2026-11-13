import React from "react";
import { Clock } from "lucide-react";
import type { MembershipStatus } from "../../../../services/packageApi";
import type { UniversalPaymentItem } from "../UniversalPaymentModal";

interface UniversalPaymentInvoiceSummaryProps {
  item: UniversalPaymentItem;
  membership: MembershipStatus | null;
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPct: number;
}

export const UniversalPaymentInvoiceSummary: React.FC<UniversalPaymentInvoiceSummaryProps> = ({
  item,
  membership,
  originalPrice,
  finalPrice,
  discountAmount,
  discountPct,
}) => {
  return (
    <>
      {/* 1. Tóm tắt thông tin gói / dịch vụ */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 dark:from-emerald-950/30 dark:to-slate-850 border border-emerald-200/80 dark:border-emerald-800/80">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {item.subtitle || "Dịch vụ"}
          </span>
          {item.discountPct ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Ưu đãi -{item.discountPct}%
            </span>
          ) : null}
        </div>
        <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      {/* Renewal Extension Box */}
      {item.isRenewal && item.renewalPreview && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cộng dồn thời hạn nối tiếp</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Hạn dùng hiện tại:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                đến {item.renewalPreview.currentEndDate}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold">Hạn mới sau gia hạn:</span>
              <span className="font-black text-emerald-700 dark:text-emerald-300">
                đến {item.renewalPreview.newEndDate}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed italic">
            ✓ Toàn bộ ngày chưa dùng được bảo lưu nguyên vẹn. Thời hạn mới tự động cộng thêm {item.renewalPreview.addedMonths} tháng ngay sau ngày hết hạn hiện tại.
          </p>
        </div>
      )}

      {/* 2. Chi tiết hóa đơn */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
          {item.isRenewal ? "Chi tiết hóa đơn gia hạn" : "Chi tiết hóa đơn đăng ký"}
        </span>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Hạng thành viên của bạn:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            {membership?.name || "Hội viên tiêu chuẩn"}
            {membership?.tier === "premium" && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-black">
                VIP
              </span>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Giá gốc niêm yết:</span>
          <span className={`font-semibold ${discountAmount > 0 ? "line-through text-slate-400" : ""}`}>
            {originalPrice.toLocaleString("vi-VN")} đ
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>Ưu đãi thành viên:</span>
            <span>- {discountAmount.toLocaleString("vi-VN")} đ ({discountPct}%)</span>
          </div>
        )}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
          <span className="font-extrabold text-slate-900 dark:text-white text-xs">
            Tổng tiền thanh toán:
          </span>
          <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl font-mono">
            {finalPrice.toLocaleString("vi-VN")} đ
          </span>
        </div>
      </div>
    </>
  );
};

export default UniversalPaymentInvoiceSummary;

