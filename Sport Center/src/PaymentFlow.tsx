import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react"

const A = "/assets"

type Screen =
  | "package"
  | "member-info"
  | "payment-method"
  | "otp"
  | "processing"
  | "success"
  | "failed"
  | "invoice"
  | "card"

type BillingPeriod = "monthly" | "yearly"
type PackageId = "swim" | "fitness" | "premium"
type PaymentMethodId = "qr" | "card" | "wallet" | "counter"

const packages = {
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

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " đ"
}

function Header() {
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

function Stepper({ active }: { active: 1 | 2 | 3 }) {
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

function OrderSummarySidebar({ pkg, period, screen }: { pkg: PackageId; period: BillingPeriod; screen?: string }) {
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

function PackageScreen({
  period,
  setPeriod,
  selected,
  setSelected,
  onNext,
}: {
  period: BillingPeriod
  setPeriod: (p: BillingPeriod) => void
  selected: PackageId
  setSelected: (p: PackageId) => void
  onNext: () => void
}) {
  const cards: { id: PackageId; badge?: string; badgeColor?: string; dark?: boolean }[] = [
    { id: "swim" },
    { id: "fitness", badge: "PHỔ BIẾN NHẤT", badgeColor: "blue" },
    { id: "premium", badge: "TIẾT KIỆM NHẤT", badgeColor: "amber", dark: true },
  ]

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={1} />
      <div className="flex flex-col gap-2 items-center pb-8 pt-4 w-full text-center">
        <p className="font-['Inter'] font-bold text-[#0f172a] text-[28px] leading-[36px]">Chọn Gói Tập Phù Hợp</p>
        <p className="font-['Inter'] font-normal text-[#64748b] text-[15px] w-[560px]">
          Đầu tư vào sức khỏe với gói thành viên linh hoạt. Hủy bất kỳ lúc nào.
        </p>
      </div>

      <div className="flex items-center justify-center pb-8 w-full">
        <div className="bg-[#e2e8f0] flex p-1 rounded-full gap-1">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`px-6 py-2 rounded-full text-sm font-['Inter'] font-semibold transition-all ${
              period === "monthly"
                ? "bg-[#2563eb] text-white shadow"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Thanh toán tháng
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`px-6 py-2 rounded-full text-sm font-['Inter'] font-semibold transition-all flex items-center gap-2 ${
              period === "yearly"
                ? "bg-[#2563eb] text-white shadow"
                : "text-[#64748b] hover:text-[#0f172a]"
            }`}
          >
            Thanh toán năm
            {period === "yearly" && (
              <span className="bg-white text-[#2563eb] text-[10px] font-bold px-2 py-0.5 rounded-full">Tiết kiệm 20%</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-start justify-center gap-6 pb-20 px-20 w-full flex-wrap">
        {cards.map(({ id, badge, badgeColor, dark }) => {
          const p = packages[id]
          const price = period === "yearly" ? p.yearly : p.monthly
          const unit = period === "yearly" ? "/năm" : "/tháng"
          const isSelected = selected === id
          const isFitness = id === "fitness"

          return (
            <div
              key={id}
              onClick={() => setSelected(id)}
              className={`flex flex-col gap-6 items-start p-8 rounded-[20px] w-[384px] cursor-pointer transition-all relative ${
                dark
                  ? "bg-[#0f172a] text-white"
                  : isFitness
                  ? "bg-white border-2 border-[#2563eb] shadow-[0px_16px_16px_rgba(30,58,138,0.11)]"
                  : "bg-white border border-[#e2e8f0]"
              } ${isSelected && !isFitness && !dark ? "ring-2 ring-[#2563eb]" : ""}`}
            >
              {badge && (
                <div className={`flex items-start px-3 py-1 rounded-[20px] absolute -top-3 left-6 ${
                  badgeColor === "blue" ? "bg-[#2563eb]" : "bg-[#d97706]"
                }`}>
                  <span className="font-['Inter'] font-bold text-white text-[11px] uppercase tracking-wide">{badge}</span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <p className={`font-['Inter'] font-extrabold text-2xl ${dark ? "text-white" : "text-[#0f172a]"}`}>{p.name}</p>
                <p className={`font-['Inter'] font-normal text-sm ${dark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>{p.tagline}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`font-['Inter'] font-extrabold text-[36px] ${dark ? "text-white" : isFitness ? "text-[#2563eb]" : "text-[#0f172a]"}`}>
                  {price.toLocaleString("vi-VN")}đ
                </span>
                <span className={`font-['Inter'] font-normal text-sm ${dark ? "text-[#94a3b8]" : "text-[#64748b]"}`}>{unit}</span>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {p.features.map((f) => (
                  <div key={f} className="flex gap-3 items-start">
                    <img src={`${A}/edb69.svg`} className="size-[18px] mt-0.5 shrink-0" alt="" />
                    <span className={`font-['Inter'] font-normal text-sm ${dark ? "text-[#cbd5e1]" : "text-[#334155]"}`}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelected(id); onNext() }}
                className={`w-full py-3 rounded-[10px] font-['Inter'] font-bold text-sm transition-all ${
                  dark
                    ? "bg-white text-[#0f172a] hover:bg-[#f1f5f9]"
                    : isFitness
                    ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                    : "border border-[#2563eb] text-[#2563eb] hover:bg-[#eff6ff]"
                }`}
              >
                Chọn gói này →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MemberInfoScreen({
  pkg,
  period,
  onNext,
  onBack,
}: {
  pkg: PackageId
  period: BillingPeriod
  onNext: () => void
  onBack: () => void
}) {
  const [agreed, setAgreed] = useState(true)

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={2} />
      <div className="flex flex-col gap-2 items-center pb-4 pt-4 w-full text-center">
        <p className="font-['Inter'] font-bold text-[#0f172a] text-[28px] leading-[36px]">Xác nhận hồ sơ & Thiết lập gói tập</p>
        <p className="font-['Inter'] font-normal text-[#64748b] text-[15px] w-[720px]">
          Vui lòng kiểm tra thông tin cá nhân và thời gian kích hoạt trước khi thanh toán.
        </p>
      </div>

      <div className="flex items-start justify-center pb-20 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Thông tin cá nhân hội viên</p>
              <div className="flex flex-col gap-[7px] w-full">
                <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Họ và tên *</label>
                <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                  <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nguyễn Lan Anh</span>
                </div>
              </div>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Số điện thoại *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">0901 234 567</span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Email nhận thông báo *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">lananh.nguyen@email.com</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Ngày sinh</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">15/08/1998</span>
                    <img src={`${A}/a54a6.svg`} className="size-[14px]" alt="" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Giới tính</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nữ</span>
                    <img src={`${A}/8e3c6.svg`} className="h-[6px] w-[10px]" alt="" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-[7px] w-full">
                <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Liên hệ khẩn cấp (Người thân &amp; SĐT)</label>
                <div className="bg-white border border-[#cbd5e1] flex items-center px-4 py-3 rounded-[8px] w-full">
                  <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Nguyễn Văn A - 0912 345 678</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Thiết lập thời gian &amp; Địa điểm tập luyện</p>
              <div className="flex gap-4 items-start w-full">
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Ngày bắt đầu kích hoạt gói *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">21/09/2026</span>
                    <img src={`${A}/a54a6.svg`} className="size-[14px]" alt="" />
                  </div>
                </div>
                <div className="flex flex-col flex-1 gap-[7px] min-w-0">
                  <label className="font-['Manrope'] font-bold text-[#0f172a] text-[13px]">Cơ sở tập luyện chính *</label>
                  <div className="bg-white border border-[#cbd5e1] flex items-center justify-between px-4 py-3 rounded-[8px] w-full">
                    <span className="font-['Manrope'] font-medium text-[#0f172a] text-sm">Chi nhánh Quận 1 - Flagship Center</span>
                    <img src={`${A}/8e3c6.svg`} className="h-[6px] w-[10px]" alt="" />
                  </div>
                </div>
              </div>
              <div className="bg-[#eff6ff] flex gap-2.5 items-center p-3 rounded-[8px] w-full">
                <img src={`${A}/db498.svg`} className="size-4 shrink-0" alt="" />
                <p className="font-['Inter'] font-medium text-[#2563eb] text-[13px] flex-1 leading-[18px]">
                  Gói tập 6 tháng của bạn sẽ có hiệu lực từ ngày 21/09/2026 đến hết ngày 21/03/2027.
                </p>
              </div>
            </div>

            <div className="flex items-start w-full">
              <button
                type="button"
                onClick={onBack}
                className="bg-white border-[1.5px] border-[#64748b] flex items-center px-6 py-3 rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
              >
                ← Quay lại chọn gói khác
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start w-[416px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Tóm tắt gói tập đã chọn</p>
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{packages[pkg].name}</p>
                <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
                  <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">Gói 6 tháng</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                {packages[pkg].features.map((f) => (
                  <div key={f} className="flex gap-2 items-center w-full">
                    <img src={`${A}/6b931.svg`} className="size-[14px] shrink-0" alt="" />
                    <p className="font-['Inter'] font-normal text-[#334155] text-[13px] flex-1">{f}</p>
                  </div>
                ))}
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full text-sm">
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter'] font-semibold text-[#0f172a]">12.000.000 đ</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
                  <span className="font-['Inter'] font-bold text-[#16a34a]">-1.100.000 đ</span>
                </div>
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
                <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">10.900.000 đ</span>
              </div>
              <div className="flex gap-2.5 items-start w-full">
                <div className="bg-[#2563eb] flex items-center justify-center rounded-[4px] size-[18px] shrink-0">
                  <img src={`${A}/20925.svg`} className="size-[10px]" alt="" />
                </div>
                <p
                  className="font-['Inter'] font-normal text-[#64748b] text-[12px] leading-[18px] flex-1 cursor-pointer"
                  onClick={() => setAgreed(!agreed)}
                >
                  Tôi đồng ý với Quy chế hoạt động và Điều khoản thành viên của trung tâm thể thao.
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="bg-[#2563eb] flex items-center justify-center py-[14px] rounded-[8px] w-full font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
              >
                Tiến hành thanh toán →
              </button>
              <div className="flex gap-1.5 items-start justify-center w-full">
                <img src={`${A}/5a31b.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
                <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Thanh toán bảo mật và kích hoạt ngay lập tức</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentMethodScreen({
  pkg,
  period,
  method,
  setMethod,
  onNext,
  onBack,
}: {
  pkg: PackageId
  period: BillingPeriod
  method: PaymentMethodId
  setMethod: (m: PaymentMethodId) => void
  onNext: () => void
  onBack: () => void
}) {
  const methods: { id: PaymentMethodId; icon: string; label: string; sub: string }[] = [
    { id: "qr", icon: `${A}/66769.svg`, label: "Chuyển khoản QR (Vietcombank)", sub: "Quét mã QR ngân hàng — Nhận ngay xác nhận" },
    { id: "card", icon: `${A}/b41b0.svg`, label: "Thẻ tín dụng / ghi nợ", sub: "Visa, MasterCard, JCB — Thanh toán nhanh 3D Secure" },
    { id: "wallet", icon: `${A}/d8a69.svg`, label: "Ví điện tử (MoMo / ZaloPay)", sub: "Liên kết ví điện tử — Ưu đãi hoàn tiền 5%" },
    { id: "counter", icon: `${A}/a4eee.svg`, label: "Thanh toán tại quầy", sub: "Đến trực tiếp trung tâm trong 24 giờ" },
  ]

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />

      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg">Chọn phương thức thanh toán</p>
              <div className="flex flex-col gap-3 w-full">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`flex gap-4 items-center p-4 rounded-[12px] w-full text-left transition-all ${
                      method === m.id
                        ? "bg-[#eff6ff] border-2 border-[#2563eb]"
                        : "bg-white border border-[#e2e8f0] hover:border-[#93c5fd]"
                    }`}
                  >
                    <div className={`flex items-center justify-center rounded-full size-5 shrink-0 ${
                      method === m.id
                        ? "bg-[#2563eb]"
                        : "border-2 border-[#cbd5e1]"
                    }`}>
                      {method === m.id && <div className="bg-white rounded-full size-2" />}
                    </div>
                    <img src={m.icon} className="size-8 shrink-0" alt="" />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">{m.label}</span>
                      <span className="font-['Inter'] font-normal text-[#64748b] text-xs">{m.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {method === "qr" && (
              <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
                <p className="font-['Inter'] font-bold text-[#0f172a] text-lg">Thông tin chuyển khoản</p>
                <div className="flex gap-8 items-start w-full">
                  <div className="flex flex-col gap-4 flex-1 min-w-0">
                    <div className="bg-[#f8fafc] rounded-[12px] p-5 flex flex-col gap-3">
                      {[
                        ["Ngân hàng", "Vietcombank (VCB)"],
                        ["Số tài khoản", "1234567890123"],
                        ["Chủ tài khoản", "SPORTCENTER VIET NAM"],
                        ["Chi nhánh", "Hồ Chí Minh"],
                      ].map(([label, val]) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="font-['Inter'] font-normal text-[#64748b] text-sm">{label}</span>
                          <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">{val}</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter'] font-normal text-[#64748b] text-sm">Nội dung chuyển khoản</span>
                        <span className="font-['Inter'] font-bold text-[#2563eb] text-sm">SC LA 2026 FIT6</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-['Inter'] font-normal text-[#64748b] text-sm">Số tiền</span>
                        <span className="font-['Inter'] font-extrabold text-[#2563eb] text-base">10.900.000 đ</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-center shrink-0">
                    <div className="bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-center rounded-[12px] size-[200px]">
                      <img src={`${A}/cfa8b.svg`} className="size-[160px]" alt="QR Code" />
                    </div>
                    <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] text-center w-[200px]">
                      Quét mã QR bằng app ngân hàng để chuyển tiền tự động
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-3 items-start p-4 rounded-[12px] w-full">
              <span className="text-[#d97706] text-lg">⏳</span>
              <p className="font-['Inter'] font-medium text-[#92400e] text-sm leading-[20px] flex-1">
                <strong>Lưu ý:</strong> Mã QR và thông tin thanh toán có hiệu lực trong <strong>15 phút</strong>. Vui lòng hoàn tất giao dịch trước khi hết hạn.
              </p>
            </div>

            <div className="flex items-start w-full gap-3">
              <button
                type="button"
                onClick={onBack}
                className="bg-white border-[1.5px] border-[#64748b] flex items-center px-6 py-3 rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
              >
                ← Quay lại
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start w-[416px] shrink-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-full">
              <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Tóm tắt đơn hàng</p>
              <div className="flex items-center justify-between w-full">
                <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{packages[pkg].name}</p>
                <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
                  <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">Gói 6 tháng</p>
                </div>
              </div>
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
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full text-sm">
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
                  <span className="font-['Inter'] font-semibold text-[#0f172a]">12.000.000 đ</span>
                </div>
                <div className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
                  <span className="font-['Inter'] font-bold text-[#16a34a]">-1.100.000 đ</span>
                </div>
              </div>
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-baseline justify-between w-full">
                <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
                <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">10.900.000 đ</span>
              </div>
              <div className="bg-[#fffbeb] border border-[#fcd34d] flex gap-2 items-center p-3 rounded-[8px] w-full">
                <span className="text-[#d97706] text-sm">⏰</span>
                <p className="font-['Inter'] font-medium text-[#92400e] text-[12px] flex-1 leading-[16px]">
                  Hoàn tất trước <strong>15:00 hôm nay</strong> để nhận kích hoạt ngay
                </p>
              </div>
              <button
                type="button"
                onClick={onNext}
                className="bg-[#2563eb] flex items-center justify-center py-[14px] rounded-[8px] w-full font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
              >
                Xác nhận thanh toán →
              </button>
              <div className="flex gap-1.5 items-start justify-center w-full">
                <img src={`${A}/ce483.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
                <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Giao dịch được bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OTPScreen({
  pkg,
  period,
  onConfirm,
  onCancel,
}: {
  pkg: PackageId
  period: BillingPeriod
  onConfirm: () => void
  onCancel: () => void
}) {
  const [digits, setDigits] = useState(["8", "5", "2", "0", "", ""])
  const [seconds, setSeconds] = useState(45)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [])

  function updateDigit(i: number, val: string) {
    const d = val.replace(/\D/g, "").slice(-1)
    setDigits((cur) => cur.map((x, idx) => (idx === i ? d : x)))
    if (d && i < 5) inputs.current[i + 1]?.focus()
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />

      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="flex gap-8 items-start w-[1280px]">
          <div className="flex flex-1 flex-col items-start min-w-0">
            <div className="bg-white border border-[#e2e8f0] flex flex-col gap-7 items-start p-8 rounded-[16px] w-full">
              <div className="flex flex-col gap-2 w-full">
                <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[24px]">Xác minh mã giao dịch OTP</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-sm leading-[20px]">
                  Chúng tôi đã gửi mã xác thực giao dịch OTP gồm 6 chữ số đến số điện thoại{" "}
                  <strong className="text-[#0f172a]">0901 234 567</strong> và email{" "}
                  <strong className="text-[#0f172a]">lananh.nguyen@email.com</strong>
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-3 items-start justify-center w-full">
                  {digits.map((d, i) => {
                    const isActive = i === 4
                    return (
                      <div key={i} className="relative">
                        <input
                          ref={(el) => { inputs.current[i] = el }}
                          value={d}
                          onChange={(e) => updateDigit(i, e.target.value)}
                          onKeyDown={(e) => handleKey(i, e)}
                          maxLength={1}
                          inputMode="numeric"
                          className={`size-16 rounded-[12px] text-center font-['Inter'] font-bold text-[#0f172a] text-[28px] outline-none ${
                            isActive
                              ? "border-2 border-[#2563eb]"
                              : "border border-[#e2e8f0]"
                          } bg-white`}
                        />
                        {isActive && !d && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#2563eb] h-6 w-0.5 animate-pulse" />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-1.5 items-start justify-center w-full text-[#64748b] text-[13px]">
                  <span className="font-['Inter'] font-normal">Không nhận được mã?</span>
                  <span className="font-['Inter'] font-semibold">
                    Gửi lại mã sau <span className="text-[#2563eb]">{seconds}s</span>
                  </span>
                </div>
              </div>

              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/c7fb6.svg`} className="block w-full" alt="" />
                </div>
              </div>

              <div className="flex gap-4 items-start w-full">
                <button
                  type="button"
                  onClick={onCancel}
                  className="border border-[#64748b] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-[15px] hover:bg-[#f8fafc] transition-colors"
                >
                  Hủy giao dịch
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="bg-[#2563eb] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
                >
                  Xác nhận OTP
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] flex flex-col gap-5 items-start p-6 rounded-[16px] w-[416px] shrink-0">
            <p className="font-['Inter'] font-bold text-[#0f172a] text-lg w-full">Tóm tắt đơn hàng</p>
            <div className="flex items-center justify-between w-full">
              <p className="font-['Inter'] font-extrabold text-[#0f172a] text-xl">{packages[pkg].name}</p>
              <div className="bg-[#eff6ff] flex items-start px-3 py-1 rounded-[12px]">
                <p className="font-['Inter'] font-bold text-[#2563eb] text-xs">Gói 6 tháng</p>
              </div>
            </div>
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
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full text-sm">
              <div className="flex items-start justify-between w-full">
                <span className="font-['Inter'] font-normal text-[#64748b]">Giá niêm yết</span>
                <span className="font-['Inter'] font-semibold text-[#0f172a]">12.000.000 đ</span>
              </div>
              <div className="flex items-start justify-between w-full">
                <span className="font-['Inter'] font-normal text-[#64748b]">Ưu đãi gói theo năm (-20%)</span>
                <span className="font-['Inter'] font-bold text-[#16a34a]">-1.100.000 đ</span>
              </div>
            </div>
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/d2600.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex items-baseline justify-between w-full">
              <span className="font-['Inter'] font-semibold text-[#0f172a] text-base">Tổng thanh toán</span>
              <span className="font-['Inter'] font-extrabold text-[#2563eb] text-2xl">10.900.000 đ</span>
            </div>
            <div className="flex gap-1.5 items-start justify-center w-full">
              <img src={`${A}/5a31b.svg`} className="size-3 mt-0.5 shrink-0" alt="" />
              <span className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Giao dịch được mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingScreen() {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[640px]">
          <div className="relative size-20">
            <div className="absolute inset-0 border-4 border-[#e2e8f0] rounded-full" />
            <div className="absolute inset-0 border-4 border-t-[#2563eb] rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <img src={`${A}/cb2ea.svg`} className="size-8" alt="" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Đang xử lý thanh toán...</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Vui lòng không đóng trang này. Giao dịch của bạn đang được xử lý an toàn.
            </p>
          </div>
          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3 items-start p-6 rounded-[16px] w-full">
            {[
              { label: "Đã nhận mã OTP", done: true },
              { label: "Đang xác thực giao dịch...", active: true },
              { label: "Kích hoạt thành viên", done: false },
            ].map(({ label, done, active }) => (
              <div key={label} className="flex gap-3 items-center">
                <div className={`size-4 rounded-full flex items-center justify-center shrink-0 ${
                  done ? "bg-[#16a34a]" : active ? "border-2 border-[#2563eb] animate-pulse" : "border-2 border-[#e2e8f0]"
                }`}>
                  {done && <span className="text-white text-[8px]">✓</span>}
                </div>
                <span className={`font-['Inter'] text-sm ${
                  done ? "font-semibold text-[#16a34a]" : active ? "font-semibold text-[#2563eb]" : "font-normal text-[#94a3b8]"
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({
  onActivate,
  onHome,
  onInvoice,
}: {
  onActivate: () => void
  onHome: () => void
  onInvoice: () => void
}) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px]">
          <div className="relative size-20">
            <img src={`${A}/48b1a.svg`} className="absolute block inset-0 size-full" alt="" />
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Đăng Ký Thành Viên Thành Công!</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Chào mừng hội viên Nguyễn Lan Anh gia nhập câu lạc bộ SportCenter
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-4 items-start p-6 rounded-[16px] w-full">
            {[
              ["Mã đơn đăng ký", "#SC-2026-09-001"],
              ["Gói thành viên", "Fitness Plus - 6 Tháng"],
              ["Thời gian hiệu lực", "21/09/2026 → 21/03/2027"],
              ["Cơ sở kích hoạt", "Chi nhánh Quận 1 - Flagship Center"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-start justify-between w-full">
                <span className="font-['Inter'] font-normal text-[#64748b] text-[13px]">{label}</span>
                <span className="font-['Inter'] font-bold text-[#0f172a] text-sm">{val}</span>
              </div>
            ))}
            <div className="h-0 w-full relative">
              <div className="absolute inset-[-1px_0_0_0]">
                <img src={`${A}/6be3b.svg`} className="block w-full" alt="" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full">
              <span className="font-['Inter'] font-semibold text-[#0f172a] text-sm">Tổng tiền đã thanh toán</span>
              <span className="font-['Inter'] font-extrabold text-[#16a34a] text-xl">10.900.000 đ</span>
            </div>
          </div>

          <div className="bg-[#eff6ff] flex gap-2.5 items-center p-3 rounded-[12px] w-full">
            <img src={`${A}/db498.svg`} className="size-4 shrink-0" alt="" />
            <p className="font-['Inter'] font-medium text-[#2563eb] text-[13px] flex-1 leading-[18px]">
              Mã kích hoạt thẻ và hướng dẫn đặt lịch đã được gửi đến số điện thoại của bạn. Hãy hoàn thành kích hoạt thẻ trực tuyến ngay tiếp theo.
            </p>
          </div>

          <div className="flex gap-2 items-start justify-center w-full">
            <button
              type="button"
              onClick={onInvoice}
              className="border border-[#64748b] flex-1 flex items-center justify-center py-2 rounded-[6px] font-['Inter'] font-semibold text-[#64748b] text-sm hover:bg-[#f8fafc] transition-colors"
            >
              Xem hóa đơn điện tử
            </button>
          </div>

          <div className="flex gap-4 items-start w-full">
            <button
              type="button"
              onClick={onHome}
              className="border-[1.5px] border-[#0b1f3a] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#0b1f3a] text-[15px] hover:bg-[#f8fafc] transition-colors"
            >
              Về trang chủ
            </button>
            <button
              type="button"
              onClick={onActivate}
              className="bg-[#2563eb] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
            >
              Kích hoạt thẻ thành viên ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FailedScreen({
  onRetry,
  onChangeMethod,
}: {
  onRetry: () => void
  onChangeMethod: () => void
}) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <Stepper active={3} />
      <div className="flex items-start justify-center pb-20 pt-4 px-20 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-8 items-center p-12 rounded-[24px] w-[800px]">
          <div className="bg-[#fef2f2] flex items-center justify-center rounded-[40px] size-20">
            <img src={`${A}/ef3a3.svg`} className="size-10" alt="" />
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <p className="font-['Inter'] font-extrabold text-[#0f172a] text-[28px]">Giao Dịch Thất Bại</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-sm">
              Hệ thống không thể xử lý thanh toán từ tài khoản của bạn
            </p>
          </div>

          <div className="bg-[#fef2f2] border border-[#dc2626] border-[0.5px] flex flex-col gap-2.5 items-start p-5 rounded-[12px] w-full">
            <p className="font-['Inter'] font-bold text-[#dc2626] text-[15px]">Lý do lỗi thanh toán:</p>
            <p className="font-['Inter'] font-normal text-[#0f172a] text-sm leading-[20px]">
              Tài khoản không đủ số dư khả dụng (Error Code: bank_9921) hoặc quá thời hạn giao dịch chuyển khoản cho phép từ cổng thanh toán QR.
            </p>
          </div>

          <div className="flex flex-col gap-4 items-start w-full">
            <div className="flex gap-4 items-start w-full">
              <button
                type="button"
                onClick={onChangeMethod}
                className="border border-[#64748b] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-[#64748b] text-[15px] hover:bg-[#f8fafc] transition-colors"
              >
                Chọn phương thức khác
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="bg-[#2563eb] flex flex-1 items-center justify-center py-[14px] rounded-[8px] font-['Inter'] font-bold text-white text-[15px] hover:bg-[#1d4ed8] transition-colors"
              >
                Thử lại ngay
              </button>
            </div>
            <div className="flex gap-1.5 items-start justify-center w-full text-[13px]">
              <span className="font-['Inter'] font-normal text-[#64748b]">Cần hỗ trợ kỹ thuật?</span>
              <span className="font-['Inter'] font-bold text-[#2563eb] cursor-pointer">Liên hệ ngay 1900 1234 (Miễn phí)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InvoiceScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <div className="flex flex-col gap-6 items-center pb-20 pt-10 px-20 w-full">
        <div className="flex items-center justify-between w-[800px]">
          <button
            type="button"
            onClick={onBack}
            className="font-['Inter'] font-semibold text-[#64748b] text-sm hover:text-[#0f172a] transition-colors"
          >
            ← Quay lại trang chủ
          </button>
          <div className="flex gap-3 items-start">
            <button type="button" className="border border-[#64748b] flex gap-2 items-center px-4 py-[10px] rounded-[6px] font-['Inter'] font-semibold text-[#64748b] text-[13px] hover:bg-[#f8fafc] transition-colors">
              <img src={`${A}/025b2.svg`} className="size-[14px]" alt="" />
              Gửi qua Email
            </button>
            <button type="button" className="bg-[#2563eb] flex gap-2 items-center px-4 py-[10px] rounded-[6px] font-['Inter'] font-semibold text-white text-[13px] hover:bg-[#1d4ed8] transition-colors">
              <img src={`${A}/b30d5.svg`} className="size-[14px]" alt="" />
              Tải PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] shadow-[0px_12px_12px_rgba(15,23,42,0.03)] flex flex-col gap-8 items-start p-12 rounded-[16px] w-[800px]">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2 items-start">
              <div className="flex gap-2 items-center">
                <div className="bg-[#10b981] flex items-center justify-center rounded-[6px] size-7">
                  <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SC</span>
                </div>
                <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SPORTCENTER</span>
              </div>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[12px] w-[280px]">
                Chi nhánh Q.1: Flagship Center, 123 Lê Lợi, Phường Bến Thành, Quận 1, Tp. Hồ Chí Minh
              </p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">MST: 0312345678</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <p className="font-['Inter'] font-extrabold text-[#0b1f3a] text-xl">HÓA ĐƠN ĐIỆN TỬ</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Số hóa đơn: #SC-2026-09-001</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Ngày lập: 21/09/2026 10:15</p>
            </div>
          </div>

          <div className="h-0 w-full relative">
            <div className="absolute inset-[-1px_0_0_0]">
              <img src={`${A}/e3ff5.svg`} className="block w-full" alt="" />
            </div>
          </div>

          <div className="flex gap-10 items-start w-full">
            <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
              <p className="font-['Inter'] font-bold text-[#64748b] text-[12px] uppercase">KHÁCH HÀNG / HỘI VIÊN</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-[15px]">Nguyễn Lan Anh</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">SĐT: 0901 234 567</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Email: lananh.nguyen@email.com</p>
            </div>
            <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
              <p className="font-['Inter'] font-bold text-[#64748b] text-[12px] uppercase">PHƯƠNG THỨC THANH TOÁN</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-[15px]">Chuyển khoản (Vietcombank QR)</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Mã giao dịch: VCB-9923812</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Trạng thái: Đã hoàn tất</p>
            </div>
          </div>

          <div className="flex flex-col items-start w-full">
            <div className="bg-[#f8fafc] border-t border-b border-[#e2e8f0] flex font-['Inter'] font-bold items-start py-3 w-full text-[#0f172a] text-[13px]">
              <p className="flex-1 min-w-0">Chi tiết dịch vụ</p>
              <p className="text-right w-[120px]">Đơn giá</p>
              <p className="text-center w-[80px]">SL</p>
              <p className="text-right w-[140px]">Thành tiền</p>
            </div>
            <div className="border-b border-[#e2e8f0] flex items-start py-4 w-full">
              <div className="flex flex-1 flex-col gap-1 items-start min-w-0">
                <p className="font-['Inter'] font-bold text-[#0f172a] text-sm">Gói thành viên Fitness Plus (6 Tháng)</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">Đặc quyền Fitness, Group-X, xông hơi Sauna &amp; 2 buổi PT</p>
              </div>
              <p className="font-['Inter'] font-normal text-[#0f172a] text-sm text-right w-[120px]">12.000.000 đ</p>
              <p className="font-['Inter'] font-normal text-[#0f172a] text-sm text-center w-[80px]">1</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-sm text-right w-[140px]">12.000.000 đ</p>
            </div>
          </div>

          <div className="flex items-start justify-end w-full">
            <div className="flex flex-col gap-3 items-start w-[340px]">
              {[
                { label: "Tạm tính:", val: "12.000.000 đ", cls: "font-semibold text-[#0f172a]" },
                { label: "Ưu đãi năm (-20%):", val: "-1.100.000 đ", cls: "font-bold text-[#16a34a]" },
                { label: "Thuế GTGT (0%):", val: "0 đ", cls: "text-[#0f172a]" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b] text-[13px]">{label}</span>
                  <span className={`font-['Inter'] text-sm ${cls}`}>{val}</span>
                </div>
              ))}
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/a47bf.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="font-['Inter'] font-bold text-[#0f172a] text-sm">Tổng cộng thanh toán:</span>
                <span className="font-['Inter'] font-extrabold text-[#2563eb] text-lg">10.900.000 đ</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-6 w-full">
            <div className="flex flex-col gap-1 items-start font-['Inter'] font-normal text-[#64748b] text-[11px]">
              <p>Hóa đơn này được khởi tạo trực tuyến và có giá trị pháp lý.</p>
              <p>Cảm ơn bạn đã lựa chọn SportCenter!</p>
            </div>
            <div className="flex flex-col gap-1 items-center w-40">
              <p className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Đại diện SportCenter</p>
              <p className="font-['Inter'] font-bold text-[#16a34a] text-[12px]">ĐÃ KÝ SỐ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MembershipCardScreen({ onHome }: { onHome: () => void }) {
  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <Header />
      <div className="flex flex-col gap-8 items-center pb-20 pt-10 px-20 w-full">
        <div className="flex flex-col gap-3 items-center w-full">
          <div className="bg-[#f0fdf4] flex items-center justify-center rounded-[32px] size-16">
            <img src={`${A}/288cc.svg`} className="size-8" alt="" />
          </div>
          <p className="font-['Inter'] font-extrabold text-[#0b1f3a] text-[32px] text-center">
            Chúc Mừng Thẻ Thành Viên Đã Sẵn Sàng!
          </p>
          <p className="font-['Inter'] font-normal text-[#64748b] text-[16px] text-center w-[640px]">
            Thẻ thành viên điện tử (Digital Membership Card) của bạn đã được kích hoạt thành công trên hệ thống SportCenter Việt Nam.
          </p>
        </div>

        <div className="bg-[#0b1f3a] flex items-start overflow-hidden rounded-[24px] shadow-[0px_16px_32px_0px_rgba(30,58,138,0.16)] w-[760px]">
          <div className="flex flex-1 flex-col h-[420px] items-start justify-between min-w-0 p-10">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2 items-center">
                <div className="bg-white flex items-center justify-center rounded-[6px] size-7">
                  <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SC</span>
                </div>
                <span className="font-['Manrope'] font-extrabold text-white text-[14px]">SPORTCENTER</span>
              </div>
              <div className="bg-[#2563eb] flex items-start px-3 py-1 rounded-[12px]">
                <span className="font-['Inter'] font-bold text-white text-[11px] uppercase">Fitness Plus</span>
              </div>
            </div>

            <div className="flex gap-5 items-center w-full">
              <div className="bg-white flex flex-col items-start overflow-hidden rounded-[36px] size-[72px] shrink-0">
                <img src={`${A}/dd66b.png`} className="size-full object-cover" alt="Hội viên" />
              </div>
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-extrabold text-white text-lg">Nguyễn Lan Anh</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">
                  Mã hội viên: <span className="font-['Inter'] font-bold text-[#10b981]">SC-2026-001234</span>
                </p>
              </div>
            </div>

            <div className="flex gap-10 items-start w-full">
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] uppercase">Cơ sở kích hoạt</p>
                <p className="font-['Inter'] font-semibold text-white text-[13px]">Flagship Center Q.1</p>
              </div>
              <div className="flex flex-col gap-1 items-start">
                <p className="font-['Inter'] font-normal text-[#64748b] text-[11px] uppercase">Ngày hết hạn</p>
                <p className="font-['Inter'] font-semibold text-white text-[13px]">21/03/2027</p>
              </div>
            </div>
          </div>

          <div className="bg-[#112240] flex flex-col gap-4 h-[420px] items-center justify-center p-10 shrink-0 w-[260px]">
            <div className="bg-white flex flex-col items-start p-3 rounded-[16px]">
              <div className="flex items-center justify-center overflow-hidden size-[120px]">
                <img src={`${A}/68b48.svg`} className="size-[120px]" alt="QR Code" />
              </div>
            </div>
            <p className="font-['Inter'] font-semibold text-[#64748b] text-[11px] text-center w-full">
              Quét mã tại quầy lễ tân để check-in và nhận phòng tập
            </p>
          </div>
        </div>

        <div className="flex gap-6 items-start w-[760px]">
          <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 items-start min-w-0 p-6 rounded-[16px]">
            <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[16px]">Đặt lịch tập với huấn luyện viên</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-[13px] leading-[18px] w-full">
              Bạn có đặc quyền 2 buổi PT định hướng thể chất miễn phí. Hãy thiết lập ngay.
            </p>
            <button type="button" className="border border-[#2563eb] flex items-center justify-center py-2 rounded-[6px] w-full font-['Inter'] font-bold text-[#2563eb] text-[13px] hover:bg-[#eff6ff] transition-colors">
              Đặt lịch PT miễn phí
            </button>
          </div>
          <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 items-start min-w-0 p-6 rounded-[16px]">
            <p className="font-['Inter'] font-bold text-[#0b1f3a] text-[16px]">Khám phá lớp học Group-X</p>
            <p className="font-['Inter'] font-normal text-[#64748b] text-[13px] leading-[18px] w-full">
              Đăng ký đặt chỗ trước các lớp học cao cấp Yoga, Zumba, và Spinning hàng tuần.
            </p>
            <button type="button" className="bg-[#2563eb] flex items-center justify-center py-2 rounded-[6px] w-full font-['Inter'] font-bold text-white text-[13px] hover:bg-[#1d4ed8] transition-colors">
              Khám phá lịch lớp học
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onHome}
          className="font-['Inter'] font-semibold text-[#64748b] text-sm hover:text-[#0f172a] transition-colors"
        >
          ← Quay về trang chủ
        </button>
      </div>
    </div>
  )
}

export default function PaymentFlow({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>("package")
  const [period, setPeriod] = useState<BillingPeriod>("yearly")
  const [pkg, setPkg] = useState<PackageId>("fitness")
  const [method, setMethod] = useState<PaymentMethodId>("qr")

  function goProcessing() {
    setScreen("processing")
    window.setTimeout(() => setScreen("success"), 2200)
  }

  if (screen === "package") {
    return (
      <PackageScreen
        period={period}
        setPeriod={setPeriod}
        selected={pkg}
        setSelected={setPkg}
        onNext={() => setScreen("member-info")}
      />
    )
  }
  if (screen === "member-info") {
    return (
      <MemberInfoScreen
        pkg={pkg}
        period={period}
        onNext={() => setScreen("payment-method")}
        onBack={() => setScreen("package")}
      />
    )
  }
  if (screen === "payment-method") {
    return (
      <PaymentMethodScreen
        pkg={pkg}
        period={period}
        method={method}
        setMethod={setMethod}
        onNext={() => setScreen("otp")}
        onBack={() => setScreen("member-info")}
      />
    )
  }
  if (screen === "otp") {
    return (
      <OTPScreen
        pkg={pkg}
        period={period}
        onConfirm={goProcessing}
        onCancel={() => setScreen("failed")}
      />
    )
  }
  if (screen === "processing") {
    return <ProcessingScreen />
  }
  if (screen === "success") {
    return (
      <SuccessScreen
        onActivate={() => setScreen("card")}
        onHome={onExit}
        onInvoice={() => setScreen("invoice")}
      />
    )
  }
  if (screen === "failed") {
    return (
      <FailedScreen
        onRetry={() => setScreen("otp")}
        onChangeMethod={() => setScreen("payment-method")}
      />
    )
  }
  if (screen === "invoice") {
    return <InvoiceScreen onBack={() => setScreen("success")} />
  }
  if (screen === "card") {
    return <MembershipCardScreen onHome={onExit} />
  }

  return null
}
