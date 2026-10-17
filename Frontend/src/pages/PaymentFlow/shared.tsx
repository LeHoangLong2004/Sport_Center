import React from "react";
import { DateInput } from "../../components/DateInput";

export const A = "/assets"

export type Screen =
  | "package"
  | "member-info"
  | "payment-method"
  | "otp"
  | "processing"
  | "success"
  | "failed"
  | "invoice"
  | "card"

export type BillingPeriod = "monthly" | "yearly"
export type PaymentMethodId = "qr" | "card" | "wallet" | "counter"

export type FlowPackage = {
  id: string
  category?: "membership" | "sport"
  name: string
  tagline: string
  monthly: number
  yearly: number
  features: string[]
  description?: string
  details?: { label: string; value: string }[]
  terms?: string[]
  orderId?: string
  orderStatus?: "pending" | "paid" | "failed"
  startDate?: string
  checkoutTotal?: number
  checkoutListPrice?: number
  checkoutDiscount?: number
  periodLabel?: string
}

export function getPaymentSummary(pkg: FlowPackage, period: BillingPeriod) {
  const total = pkg.checkoutTotal ?? (period === "yearly" ? pkg.yearly : pkg.monthly)
  const listPrice = pkg.checkoutListPrice ??
    (period === "yearly" ? Math.round(pkg.yearly * 1.2) : Math.round(pkg.monthly * 1.15))

  return {
    total,
    listPrice,
    discount: pkg.checkoutDiscount ?? listPrice - total,
    periodLabel: pkg.periodLabel ?? (period === "yearly" ? "Gói 12 tháng" : "Gói 1 tháng"),
  }
}


export function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " đ"
}

export function CustomDatePicker({ value, onChange, placeholder = "dd/mm/yyyy" }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="flex bg-white border border-[#cbd5e1] focus-within:border-[#2563eb] rounded-[10px] w-full overflow-hidden transition-colors">
      <DateInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 outline-none px-[16px] py-[12px] font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px] bg-transparent min-w-0"
      />
      <div className="w-[48px] border-l border-[#cbd5e1] flex items-center justify-center bg-[#f8fafc] shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
    </div>
  );
}


export function Stepper({ active }: { active: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-center py-8 w-full">
      <div className="flex gap-4 items-center">
        {([
          { n: 1, label: "1. Chọn gói tập" },
          null,
          { n: 2, label: "2. Hồ sơ hội viên" },
          null,
          { n: 3, label: "3. Thanh toán" },
          null,
          { n: 4, label: "4. Hoàn tất" },
        ] as ({ n: number; label: string } | null)[]).map((item, i) => {
          if (!item) {
            return (
              <div key={i} className="h-0 w-16 relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/19e1f.svg`} className="block w-full" alt="" />
                </div>
              </div>
            )
          }
          const done = item.n < active
          const isActive = item.n === active
          return (
            <div key={i} className="flex gap-2 items-center">
              {done ? (
                <div className="bg-[#f0fdf4] border border-[#16a34a] flex items-center justify-center rounded-[12px] size-6">
                  <img src={`${A}/33974.svg`} className="size-3" alt="" />
                </div>
              ) : isActive ? (
                <div className="bg-teal-500 flex items-center justify-center rounded-[12px] size-6">
                  <span className="font-['Inter'] font-semibold text-white text-[12px]">{item.n}</span>
                </div>
              ) : (
                <div className="border border-[#cbd5e1] flex items-center justify-center rounded-[12px] size-6">
                  <span className="font-['Inter'] font-semibold text-[#64748b] text-[12px]">{item.n}</span>
                </div>
              )}
              <span className={`font-['Inter'] text-sm whitespace-nowrap ${
                isActive ? "font-bold text-teal-600" : "font-semibold text-[#64748b]"
              }`}>
                {item.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function OrderSummarySidebar({
  pkg,
  period,
  formData,
  screen,
}: {
  pkg: any;
  period: BillingPeriod;
  formData?: any;
  screen?: string;
}) {
  const { listPrice, discount, total, periodLabel } = getPaymentSummary(pkg, period);
  const title = screen === "otp" ? "Tóm tắt đơn hàng" : "Tóm tắt gói tập đã chọn";

  let memberName = formData?.fullName;
  let branchName = formData?.branch;
  let startDate = formData?.startDate;

  if (!memberName || !branchName) {
    try {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        const u = JSON.parse(uStr);
        if (!memberName) memberName = u.fullName || u.email;
      }
    } catch {}
  }

  const getEndDateStr = () => {
    if (!startDate) return "";
    try {
      const d = new Date(startDate);
      const months = period === "yearly" ? 12 : 1;
      d.setMonth(d.getMonth() + months);
      return d.toLocaleDateString("vi-VN");
    } catch {
      return "";
    }
  };

  const startStr = startDate ? startDate.split("-").reverse().join("/") : "...";
  const endStr = getEndDateStr();
  const dateRange = endStr ? `${startStr} → ${endStr}` : startStr;

  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-[416px] shrink-0">
      <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">{title}</p>
      <div className="flex items-center justify-between w-full">
        <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{pkg.name}</p>
        <div className="bg-teal-50 flex items-start px-3 py-1 rounded-[12px] border border-teal-200">
          <p className="font-['Inter'] font-bold text-teal-600 text-xs">{periodLabel}</p>
        </div>
      </div>
      {screen !== "otp" && pkg.features && (
        <div className="flex flex-col gap-3 w-full">
          {pkg.features.map((f: string) => (
            <div key={f} className="flex gap-2 items-center w-full">
              <img src={`${A}/6b931.svg`} className="size-[14px] shrink-0" alt="" />
              <p className="font-['Inter'] font-normal text-[#334155] text-[13px] flex-1">{f}</p>
            </div>
          ))}
        </div>
      )}
      {(memberName || branchName) && (
        <div className="flex flex-col gap-3 w-full text-[13px]">
          {[
            ["Hội viên:", memberName || "Hội viên SportCenter"],
            ["Cơ sở chính:", branchName || "Chi nhánh Quận 1 - Flagship Center"],
            ["Thời hạn tập:", dateRange],
          ].map(([label, val]) => (
            <div key={label} className="flex items-start justify-between w-full">
              <span className="font-['Inter'] font-normal text-[#64748b]">{label}</span>
              <span className="font-['Inter'] font-semibold text-[#0f172a] text-right truncate max-w-[220px]">{val}</span>
            </div>
          ))}
        </div>
      )}
      <div className="h-0 w-full relative">
        <div className="absolute inset-[-1px_0_0_0]">
          <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
        </div>
      </div>
      <div className="flex flex-col gap-3 w-full text-sm">
        <div className="flex items-start justify-between w-full">
          <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
          <span className="font-['Inter'] font-semibold text-[#0f172a]">{fmt(listPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="flex items-start justify-between w-full">
            <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi giảm giá</span>
            <span className="font-['Inter'] font-bold text-[#16a34a]">-{fmt(discount)}</span>
          </div>
        )}
      </div>
      <div className="h-0 w-full relative">
        <div className="absolute inset-[-1px_0_0_0]">
          <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
        </div>
      </div>
      <div className="flex items-baseline justify-between w-full">
        <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
        <span className="font-['Inter'] font-extrabold text-teal-600 text-2xl">{fmt(total)}</span>
      </div>
      <div className="flex gap-2 items-start w-full">
        <img src={`${A}/5a31b.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
        <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Thanh toán bảo mật và kích hoạt ngay lập tức</span>
      </div>
    </div>
  );
}
