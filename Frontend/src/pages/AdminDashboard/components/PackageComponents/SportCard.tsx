import React from "react";
import { Check, Edit3 } from "lucide-react";
import { CatalogPackage } from "../../../../services/packageApi";
import { money, periods, formatLabels } from "./utils";

export function SportCard({
  item,
  onEdit,
  onToggle,
}: {
  item: CatalogPackage
  onEdit: () => void
  onToggle: () => void
}) {
  const s = (item.sport || "").toLowerCase()
  const sportBadgeClass =
    s.includes("bơi") || s.includes("swim")
      ? "bg-sky-100 text-sky-800"
      : s.includes("yoga") || s.includes("pilates")
        ? "bg-violet-100 text-violet-800"
        : s.includes("box") || s.includes("kick")
          ? "bg-rose-100 text-rose-800"
          : s.includes("cầu lông") || s.includes("tennis")
            ? "bg-amber-100 text-amber-800"
            : "bg-emerald-100 text-emerald-800"

  const formatBadgeClass =
    item.format === "coach"
      ? "bg-amber-50 text-amber-700 border border-amber-200/70"
      : item.format === "group"
        ? "bg-blue-50 text-blue-700 border border-blue-200/70"
        : "bg-slate-100 text-slate-600"

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sportBadgeClass}`}>
              {item.sport}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${formatBadgeClass}`}>
              {formatLabels[item.format || "self"]}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {item.area} · {item.description}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.isActive
              ? "bg-emerald-50 text-emerald-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.isActive ? "Đang bán" : "Ngừng bán"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {periods.map((period) => (
          <div key={period} className="rounded-lg bg-slate-50 p-2.5">
            <span className="block text-xs text-slate-500">{period} tháng</span>
            <strong className="mt-1 block text-sm text-slate-900">
              {money(item.prices[period])}
            </strong>
          </div>
        ))}
      </div>
      {item.format !== "self" ? (
        <p className="mt-3 text-xs text-slate-600">
          {item.sessionsPerMonth || 0} buổi/tháng ·{" "}
          {item.minutesPerSession || 0} phút/buổi · tối đa{" "}
          {item.format === "coach" ? 1 : item.maxClassSize || 1} người
        </p>
      ) : (
        <p className="mt-3 text-xs text-slate-600">
          Khung giờ: {item.accessHours || "Theo giờ mở cửa"}
        </p>
      )}
      <div className="mt-4 flex-1 space-y-1.5">
        {item.benefits.map((benefit, index) => (
          <p
            key={`${benefit}-${index}`}
            className="flex gap-2 text-sm text-slate-700"
          >
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-600" />
            {benefit}
          </p>
        ))}
      </div>
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
        >
          <Edit3 size={15} /> Chỉnh sửa
        </button>
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
      </div>
    </article>
  )
}
