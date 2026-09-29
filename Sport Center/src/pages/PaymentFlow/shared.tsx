import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react"

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
export type PackageId = "swim" | "fitness" | "premium"
export type PaymentMethodId = "qr" | "card" | "wallet" | "counter"

export const packages = {
  swim: {
    name: "Swim Focus",
    tagline: "Bể bơi không giới hạn",
    monthly: 890000,
    yearly: 8900000,
    features: ["Toàn quyền sử dụng bể bơi & phòng thay đồ", "Giáo án luyện tập cơ bản", "App theo dõi chỉ số cơ thể"],
  },
  fitness: {
    name: "Fitness Plus",
    tagline: "Phổ biến nhất",
    monthly: 1090000,
    yearly: 10900000,
    features: ["Toàn quyền sử dụng Gym, Cardio & Functional", "Tham gia toàn bộ lớp Group-X không giới hạn", "Tặng 2 buổi PT 1-kèm-1 và tủ đồ cá nhân"],
  },
  premium: {
    name: "Premium",
    tagline: "Tiết kiệm nhất",
    monthly: 1390000,
    yearly: 13900000,
    features: ["Tất cả đặc quyền Fitness Plus", "Phòng tắm VIP, Sauna & Jacuzzi", "4 buổi PT chuyên sâu mỗi tháng"],
  },
}

export function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " đ"
}

export function Header() {
  return (
    <div className="bg-white border-b border-[#e2e8f0] shrink-0 w-full">
      <div className="flex h-[72px] items-center justify-between px-20 w-full">
        <div className="flex gap-3 items-center">
          <div className="bg-[#10b981] flex items-center justify-center rounded-[10px] size-10">
            <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-xl">SC</span>
          </div>
          <div className="flex flex-col gap-px">
            <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[16px] tracking-[0.5px]">SPORTCENTER</span>
            <span className="font-['Manrope'] font-bold text-[#10b981] text-[9px] tracking-[1px] uppercase">Energy platform</span>
          </div>
        </div>
        <div className="flex gap-8 items-center font-['Manrope'] font-semibold text-[#0f172a] text-sm tracking-[-0.2px]">
          {["Bộ môn", "Lớp học", "Huấn luyện viên", "Gói tập", "Về chúng tôi", "Liên hệ"].map((link) => (
            <span key={link} className="cursor-pointer hover:text-[#2563eb] transition-colors">{link}</span>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-[#2563eb] flex items-center justify-center rounded-[18px] size-9">
            <span className="font-['Manrope'] font-bold text-white text-sm">LA</span>
          </div>
          <span className="font-['Manrope'] font-bold text-[#0b1f3a] text-sm">Nguyễn Lan Anh</span>
        </div>
      </div>
    </div>
  )
}

export function Stepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center py-8 w-full">
      <div className="flex gap-4 items-center">
        {([
          { n: 1, label: "1. Chọn gói tập" },
          null,
          { n: 2, label: "2. Thông tin hội viên" },
          null,
          { n: 3, label: "3. Thanh toán & Kích hoạt" },
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
                <div className="bg-[#2563eb] flex items-center justify-center rounded-[12px] size-6">
                  <span className="font-['Inter'] font-semibold text-white text-[12px]">{item.n}</span>
                </div>
              ) : (
                <div className="border border-[#cbd5e1] flex items-center justify-center rounded-[12px] size-6">
                  <span className="font-['Inter'] font-semibold text-[#64748b] text-[12px]">{item.n}</span>
                </div>
              )}
              <span className={`font-['Inter'] text-sm whitespace-nowrap ${
                isActive ? "font-bold text-[#2563eb]" : "font-semibold text-[#64748b]"
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

export function OrderSummarySidebar({ pkg, period, screen }: { pkg: PackageId; period: BillingPeriod; screen?: string }) {
  const p = packages[pkg]
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
        <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
          <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">{periodLabel}</p>
        </div>
      </div>
      {screen !== "otp" && (
        <div className="flex flex-col gap-3 w-full">
          {p.features.map((f) => (
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
        <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">{fmt(total)}</span>
      </div>
      <div className="flex gap-2 items-start w-full">
        <img src={`${A}/5a31b.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
        <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Thanh toán bảo mật và kích hoạt ngay lập tức</span>
      </div>
    </div>
  )
}