import React from "react";
import type { FlowPackage, PaymentMethodId } from "../shared";

interface PaymentOrderSummaryProps {
  pkg: FlowPackage;
  periodLabel: string;
  formData: any;
  isProduct: boolean;
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromo: () => void;
  promoMessage: string;
  promoDiscount: number;
  listPrice: number;
  discount: number;
  finalTotal: number;
  agreedTerms: boolean;
  onAgreedTermsChange: (agreed: boolean) => void;
  onNext: () => void;
  method: PaymentMethodId;
  fmt: (n: number) => string;
}

export function PaymentOrderSummary({
  pkg,
  periodLabel,
  formData,
  isProduct,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  promoMessage,
  promoDiscount,
  listPrice,
  discount,
  finalTotal,
  agreedTerms,
  onAgreedTermsChange,
  onNext,
  method,
  fmt,
}: PaymentOrderSummaryProps) {
  return (
    <div className="flex flex-col items-start w-full lg:w-[380px] shrink-0 sticky top-14">
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 w-full shadow-md shadow-slate-200/50 flex flex-col gap-2.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-sm md:text-base">
            Tóm tắt đơn hàng
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
            {periodLabel}
          </span>
        </div>

        {/* Package Details */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-sm">
                {pkg.name}
              </h3>
              <p className="text-[11px] text-slate-500">{pkg.tagline}</p>
            </div>
          </div>

          {pkg.description && (
            <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-200/60 pt-1.5">
              {pkg.description}
            </p>
          )}

          {/* Key features checklist */}
          {pkg.features && pkg.features.length > 0 && (
            <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200/60">
              {pkg.features.slice(0, 3).map((f: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                  <span className="text-teal-600 font-bold shrink-0">✓</span>
                  <span className="line-clamp-1">{f}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activation quick info */}
        {!isProduct && (
          <div className="bg-slate-50/60 border border-slate-200/60 rounded-lg p-2 flex justify-between items-center text-[11px]">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Hội viên:</span>
              <span className="font-semibold text-slate-900 truncate max-w-[130px]">
                {formData?.fullName || "Khách hàng"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Ngày kích hoạt:</span>
              <span className="font-semibold text-slate-900">
                {formData?.startDate ? formData.startDate.split("-").reverse().join("/") : "Hôm nay"}
              </span>
            </div>
          </div>
        )}

        {/* Promo code voucher field */}
        <div className="flex flex-col gap-1">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              placeholder="Mã ưu đãi (VD: SPORT10)"
              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-300 focus:border-teal-500 outline-none text-xs text-slate-800 uppercase"
            />
            <button
              type="button"
              onClick={onApplyPromo}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
            >
              Áp dụng
            </button>
          </div>
          {promoMessage && (
            <p
              className={`text-[10px] font-medium ${
                promoDiscount > 0 ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {promoMessage}
            </p>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-slate-200 pt-2 flex flex-col gap-1 text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Giá niêm yết</span>
            <span className="font-semibold text-slate-800">{fmt(listPrice)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span>Ưu đãi gói hội viên</span>
              <span className="font-bold">-{fmt(discount)}</span>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span>Voucher giảm giá</span>
              <span className="font-bold">-{fmt(promoDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Phí dịch vụ & Quản lý</span>
            <span className="font-semibold text-emerald-600">Miễn phí</span>
          </div>
        </div>

        {/* Total Payment */}
        <div className="border-t border-dashed border-slate-200 pt-2 flex items-baseline justify-between">
          <div>
            <span className="block text-[11px] font-semibold text-slate-700">Tổng thanh toán</span>
            <span className="block text-[9px] text-slate-400">Đã bao gồm thuế phí</span>
          </div>
          <span className="font-['Inter:Extra_Bold'] font-extrabold text-teal-600 text-xl tracking-tight">
            {fmt(finalTotal)}
          </span>
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => onAgreedTermsChange(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 leading-3.5">
            Tôi đồng ý với{" "}
            <a href="#rules" className="text-teal-600 underline font-medium" target="_blank" rel="noreferrer">
              Điều khoản dịch vụ
            </a>{" "}
            và Quy chế hội viên SportCenter.
          </span>
        </label>

        {/* Big Action CTA Button */}
        <button
          type="button"
          disabled={!agreedTerms}
          onClick={onNext}
          className={`w-full py-2.5 rounded-xl font-['Inter:Bold'] font-bold text-white text-xs md:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            agreedTerms
              ? "bg-teal-600 hover:bg-teal-700 active:scale-[0.99] shadow-teal-600/20"
              : "bg-slate-300 cursor-not-allowed shadow-none"
          }`}
        >
          <span>
            {method === "counter"
              ? "Xác nhận đặt lịch tại quầy →"
              : `Xác nhận & Thanh toán ${fmt(finalTotal)} →`}
          </span>
        </button>

        {/* Trust Footer */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-0.5">
          <span>🔒 SSL 256-bit</span>
          <span>•</span>
          <span>Kích hoạt tự động</span>
          <span>•</span>
          <span>Hotline: 1900 6868</span>
        </div>

      </div>
    </div>
  );
}
