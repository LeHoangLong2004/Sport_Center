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
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
              {item.sport}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
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
            <Check size={15} className="mt-0.5 shrink-0 text-teal-600" />
            {benefit}
          </p>
        ))}
      </div>
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
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
