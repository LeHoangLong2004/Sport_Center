import React from "react";

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


export function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " đ"
}

export function CustomDatePicker({ value, onChange, placeholder = "dd/mm/yyyy" }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  const [text, setText] = React.useState(() => {
    if (!value) return "";
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  });

  React.useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setText(`${parts[2]}/${parts[1]}/${parts[0]}`);
      }
    } else {
      setText("");
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d/]/g, '');
    
    // Auto-insert slashes
    if (val.length === 2 && !val.includes('/') && text.length < val.length) {
      val += '/';
    } else if (val.length === 5 && val.split('/').length === 2 && text.length < val.length) {
      val += '/';
    }
    
    if (val.length > 10) val = val.substring(0, 10);
    setText(val);

    if (val.length === 10) {
      const parts = val.split('/');
      if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
        const iso = `${parts[2]}-${parts[1]}-${parts[0]}`;
        onChange(iso);
      }
    } else if (val === '') {
      onChange('');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex bg-white border border-[#cbd5e1] focus-within:border-[#2563eb] rounded-[10px] w-full overflow-hidden transition-colors">
      <input
        type="text"
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        className="flex-1 outline-none px-[16px] py-[12px] font-['Inter:Medium'] font-medium text-[#0f172a] text-[14px] bg-transparent min-w-0"
        maxLength={10}
      />
      <div className="relative w-[48px] border-l border-[#cbd5e1] flex items-center justify-center bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors cursor-pointer shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <input
          type="date"
          value={value || ''}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
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

export function OrderSummarySidebar({ pkg, period, screen }: { pkg: any; period: BillingPeriod; screen?: string }) {
  const p = pkg;
  const listPrice = period === "yearly" ? Math.round(p.yearly * 1.2) : Math.round(p.monthly * 1.15)
  const discount = listPrice - (period === "yearly" ? p.yearly : p.monthly)
  const total = period === "yearly" ? p.yearly : p.monthly
  const periodLabel = period === "yearly" ? "Gói 6 tháng" : "Gói 1 tháng"
  const title = screen === "otp" ? "Tóm tắt đơn hàng" : "Tóm tắt gói tập đã chọn"

  return (
    <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-[416px] shrink-0">
      <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">{title}</p>
      <div className="flex items-center justify-between w-full">
        <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{p.name}</p>
        <div className="bg-teal-50 flex items-start px-3 py-1 rounded-[12px] border border-teal-200">
          <p className="font-['Inter'] font-bold text-teal-600 text-xs">{periodLabel}</p>
        </div>
      </div>
      {screen !== "otp" && (
        <div className="flex flex-col gap-3 w-full">
          {p.features.map((f: string) => (
            <div key={f} className="flex gap-2 items-center w-full">
              <img src={`${A}/6b931.svg`} className="size-[14px] shrink-0" alt="" />
              <p className="font-['Inter'] font-normal text-[#334155] text-[13px] flex-1">{f}</p>
            </div>
          ))}
        </div>
      )}
      {screen === "otp" && (
        <div className="flex flex-col gap-3 w-full text-[13px]">
          {[
            ["Hội viên:", "Nguyễn Lan Anh"],
            ["Cơ sở chính:", "Chi nhánh Q.1 - Flagship Center"],
            ["Thời hạn tập:", "21/09/2026 → 21/03/2027"],
          ].map(([label, val]) => (
            <div key={label} className="flex items-start justify-between w-full">
              <span className="font-['Inter'] font-normal text-[#64748b]">{label}</span>
              <span className="font-['Inter'] font-semibold text-[#0f172a]">{val}</span>
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
        <div className="flex items-start justify-between w-full">
          <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
          <span className="font-['Inter'] font-bold text-[#16a34a]">-{fmt(discount)}</span>
        </div>
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
  )
}