import React from "react";
import { A, BillingPeriod, PackageId, packages, Header, Stepper } from "./shared";

export function PackageScreen({
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