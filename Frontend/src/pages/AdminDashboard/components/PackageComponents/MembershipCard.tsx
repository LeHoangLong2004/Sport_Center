import React from "react";
import { Check, Edit3 } from "lucide-react";
import { CatalogPackage } from "../../../../services/packageApi";
import { money, periods } from "./utils";

export function MembershipCard({
  item,
  onEdit,
  onToggle,
}: {
  item: CatalogPackage
  onEdit: () => void
  onToggle: () => void
}) {
  const colors =
    item.tier === "premium"
      ? "from-amber-500 to-orange-500"
      : item.tier === "plus"
        ? "from-blue-600 to-indigo-500"
        : "from-slate-600 to-slate-500"

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-br ${colors} p-5 text-white`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/75">
              {item.tier === "basic" ? "MẶC ĐỊNH" : item.tier}
            </span>
            <h3 className="mt-1 text-2xl font-extrabold">{item.name}</h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              item.isActive
                ? "bg-white/20 text-white"
                : "bg-black/15 text-white/80"
            }`}
          >
            {item.tier === "basic"
              ? "Luôn bật"
              : item.isActive
                ? "Đang bán"
                : "Ngừng bán"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-5 text-white/85">
          {item.description}
        </p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Tổng giá theo kỳ hạn
        </h4>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {periods.map((period) => (
            <div key={period} className="rounded-lg bg-slate-50 p-2.5">
              <span className="block text-xs text-slate-500">
                {period} tháng
              </span>
              <strong className="mt-1 block text-sm text-slate-900">
                {money(item.prices[period])}
              </strong>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Quyền lợi
          </h4>
          {item.benefits.map((benefit, index) => (
            <p
              key={`${benefit}-${index}`}
              className="flex gap-2 text-sm leading-5 text-slate-700"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-teal-600" />
              {benefit}
            </p>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-950">
          <span>Ưu đãi tự tập/lớp nhóm</span>
          <strong className="text-right">{item.groupDiscountPct}%</strong>
          <span>Ưu đãi Coach 1–1</span>
          <strong className="text-right">{item.coachDiscountPct}%</strong>
          <span>Đặt lớp trước</span>
          <strong className="text-right">{item.bookingAdvanceHours} giờ</strong>
        </div>
        <div className="mt-auto flex gap-2 pt-5">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
          >
            <Edit3 size={15} /> Chỉnh sửa
          </button>
          {item.tier !== "basic" && (
            <button
              type="button"
              onClick={onToggle}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold ${
                item.isActive
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {item.isActive ? "Ngừng bán" : "Mở bán"}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
