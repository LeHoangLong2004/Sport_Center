// PackageMemberComponents.tsx - Sub-components for PackagesPage
import { Check, Dumbbell, Info, ShieldCheck, Sparkles, TicketCheck } from "lucide-react"
import {
  CatalogPackage, MembershipStatus, PackageOrder, PackagePeriod, SportFormat,
} from "../../../services/packageApi"

export const periods: PackagePeriod[] = [1, 3, 6, 12]

export const formatLabel: Record<SportFormat, string> = {
  self: "Tự tập",
  group: "Lớp nhóm",
  coach: "Coach 1–1",
}

export const money = (amount: number) => `${new Intl.NumberFormat("vi-VN").format(amount)}đ`

export const dateLabel = (date?: string) =>
  date ? new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Đang chờ xác nhận"

export function orderStatusLabel(order: PackageOrder) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (order.status === "pending") return "Chờ thanh toán"
  if (order.status === "failed") return "Thanh toán thất bại"
  if (order.startDate && new Date(order.startDate).getTime() > today.getTime()) return "Đã thanh toán · Chờ hiệu lực"
  if (order.endDate && new Date(order.endDate).getTime() < today.getTime()) return "Hết hạn"
  return "Đang hiệu lực"
}

export function getProjectedDates(item: CatalogPackage, duration: PackagePeriod, orders: PackageOrder[]) {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const priorOrders = orders.filter(
    (order) => order.status === "paid" && order.packageSnapshot.category === item.category &&
      (item.category !== "sport" || order.packageSnapshot.sport === item.sport) && order.endDate,
  )
  const latestEnd = priorOrders.reduce((latest, order) => {
    const endDate = new Date(order.endDate!)
    return endDate > latest ? endDate : latest
  }, now)
  const start = new Date(latestEnd)
  if (latestEnd > now) start.setDate(start.getDate() + 1)
  const end = new Date(start); const day = end.getDate()
  end.setDate(1); end.setMonth(end.getMonth() + duration)
  const finalDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()
  end.setDate(Math.min(day, finalDay)); end.setDate(end.getDate() - 1)
  return { start, end }
}

export function PackageCard({
  item, duration, onDurationChange, onChoose, membership, disabled = false,
}: {
  item: CatalogPackage; duration: PackagePeriod
  onDurationChange: (duration: PackagePeriod) => void; onChoose: () => void
  membership?: MembershipStatus; disabled?: boolean
}) {
  const price = item.prices[duration]
  const discountPct = item.category === "sport" && membership
    ? item.format === "coach" ? membership.coachDiscountPct : membership.groupDiscountPct
    : 0
  const discount = Math.round((price * discountPct) / 100)
  const format = item.format ? formatLabel[item.format] : ""

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {item.category === "sport" && item.sport && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">{item.sport}</span>
            )}
            {format && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{format}</span>}
            {item.tier === "premium" && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Nổi bật</span>
            )}
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
        </div>
        <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
          {item.category === "membership" ? <Sparkles size={20} /> : <Dumbbell size={20} />}
        </div>
      </div>
      {item.category !== "membership" && (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Khu tập</span>
          <strong className="text-right text-slate-800">{item.area || item.sport}</strong>
          {item.sessionsPerMonth && <><span className="text-slate-500">Hạn mức</span><strong className="text-right text-slate-800">{item.sessionsPerMonth} buổi/tháng</strong></>}
          {item.minutesPerSession && <><span className="text-slate-500">Thời lượng</span><strong className="text-right text-slate-800">{item.minutesPerSession} phút/buổi</strong></>}
          {item.maxClassSize && <><span className="text-slate-500">Sĩ số tối đa</span><strong className="text-right text-slate-800">{item.maxClassSize} người</strong></>}
          {item.accessHours && <><span className="text-slate-500">Khung giờ</span><strong className="text-right text-slate-800">{item.accessHours}</strong></>}
        </div>
      )}
      <label className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor={`period-${item.id}`}>Thời hạn</label>
      <select id={`period-${item.id}`} value={duration} onChange={(e) => onDurationChange(Number(e.target.value) as PackagePeriod)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
        {periods.map((period) => (
          <option key={period} value={period}>{period} tháng · {money(item.prices[period])}</option>
        ))}
      </select>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">{money(price - discount)}</p>
          <p className="text-xs text-slate-500">Tổng tiền · {money(Math.round((price - discount) / duration))}/tháng tham khảo</p>
        </div>
        {discountPct > 0 && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Giảm {discountPct}%</span>
        )}
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Quyền lợi</h4>
        <ul className="mt-2 space-y-2">
          {item.benefits.map((benefit, index) => (
            <li key={`${benefit}-${index}`} className="flex gap-2 text-sm leading-5 text-slate-700">
              <Check size={16} className="mt-0.5 shrink-0 text-teal-600" />{benefit}
            </li>
          ))}
        </ul>
        {(item.terms.length > 0 || item.lockerTerms) && (
          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-teal-700">Điều kiện sử dụng</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {item.terms.map((term, i) => <li key={`${term}-${i}`}>{term}</li>)}
              {item.lockerTerms && <li>{item.lockerTerms}</li>}
            </ul>
          </details>
        )}
      </div>
      {item.category === "membership" && (
        <p className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <Info size={16} className="mt-0.5 shrink-0" />
          Gói thành viên chỉ cấp ưu đãi, không bao gồm quyền vào khu tập.
        </p>
      )}
      {item.category === "sport" && item.format !== "self" && (
        <p className="mt-3 text-xs text-slate-500">
          Đã bao gồm quyền sử dụng khu {item.sport}; không cần mua thêm gói tự tập cùng môn.
        </p>
      )}
      <button type="button" onClick={onChoose} disabled={disabled}
        className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600">
        {disabled ? "Hạng mặc định" : "Chọn gói này"}
      </button>
    </article>
  )
}

export function MembershipSummary({ membership }: { membership: MembershipStatus }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-5 text-white shadow-lg sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Hạng thành viên hiện tại</span>
          <h2 className="mt-2 text-2xl font-extrabold">{membership.name}</h2>
          <p className="mt-1 text-sm text-slate-300">
            {membership.tier === "basic"
              ? "Miễn phí · Không giới hạn thời hạn"
              : `Hiệu lực ${dateLabel(membership.startDate)} – ${dateLabel(membership.endDate)}`}
          </p>
        </div>
        {membership.tier !== "basic" && (
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-100">
            {membership.endDate && new Date(membership.endDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) ? "Hết hạn" : "Đang hiệu lực"}
          </span>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {membership.benefits.map((benefit, index) => (
          <div key={`${benefit}-${index}`} className="flex gap-2 rounded-xl bg-white/10 p-3 text-sm leading-5 text-slate-100">
            <Check size={16} className="mt-0.5 shrink-0 text-teal-300" />{benefit}
          </div>
        ))}
      </div>
      {membership.tier !== "basic" && (
        <p className="mt-4 text-xs text-slate-300">
          Đặt lớp trước {membership.bookingAdvanceHours} giờ · Tủ đồ: {membership.lockerTerms}
        </p>
      )}
    </div>
  )
}

export function OrderList({ orders, title = "Đơn mua và gói đã đăng ký" }: { orders: PackageOrder[]; title?: string }) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{orders.length} đơn</span>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">Chưa có đơn hoặc gói đã đăng ký.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">{order.packageSnapshot.name}</strong>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "pending" ? "bg-amber-50 text-amber-800" : orderStatusLabel(order).includes("Hết hạn") ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>
                    {orderStatusLabel(order)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Mã {order.id} · {order.durationMonths} tháng · Tạo {dateLabel(order.createdAt)}</p>
                {order.startDate && (
                  <p className="mt-1 text-xs text-slate-500">Hiệu lực {dateLabel(order.startDate)} – {dateLabel(order.endDate)}</p>
                )}
              </div>
              <strong className="text-lg text-slate-900">{money(order.total)}</strong>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export function ConfirmOrderModal({
  selected, membership, selectedDuration, projectedDates, onClose, onConfirm,
}: {
  selected: CatalogPackage; membership: MembershipStatus | null
  selectedDuration: PackagePeriod; projectedDates: { start: Date; end: Date } | null
  onClose: () => void; onConfirm: () => void
}) {
  const discountPct = selected.category === "sport"
    ? selected.format === "coach" ? membership?.coachDiscountPct ?? 0 : membership?.groupDiscountPct ?? 0
    : 0
  const total = selected.prices[selectedDuration] - Math.round((selected.prices[selectedDuration] * discountPct) / 100)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4" role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" aria-labelledby="package-confirm-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <span className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700"><TicketCheck size={20} /></span>
        <h2 id="package-confirm-title" className="mt-3 text-xl font-bold text-slate-900">Xác nhận tạo đơn</h2>
        <p className="mt-1 text-sm text-slate-500">Kiểm tra thông tin và điều kiện trước khi tiếp tục.</p>
        <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-3"><span className="text-slate-500">Gói</span><strong className="text-right text-slate-900">{selected.name}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Kỳ hạn</span><strong className="text-slate-900">{selectedDuration} tháng</strong></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Bắt đầu dự kiến</span><strong className="text-slate-900">{dateLabel(projectedDates?.start.toISOString())}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Kết thúc dự kiến</span><strong className="text-slate-900">{dateLabel(projectedDates?.end.toISOString())}</strong></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Giá niêm yết</span><strong className="text-slate-900">{money(selected.prices[selectedDuration])}</strong></div>
          {selected.category === "sport" && (
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Ưu đãi hạng {membership?.name || "hiện tại"}</span>
              <strong className="text-emerald-700">−{money(Math.round((selected.prices[selectedDuration] * discountPct) / 100))}</strong>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base">
            <strong className="text-slate-900">Tổng cần thanh toán</strong>
            <strong className="text-teal-800">{money(total)}</strong>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          {selected.benefits.map((benefit, i) => <li key={`${benefit}-${i}`}>• {benefit}</li>)}
        </ul>
        {selected.terms.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
            {selected.terms.map((term, i) => <li key={`${term}-${i}`}>{term}</li>)}
          </ul>
        )}
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          Khi tạo đơn, gói chưa được kích hoạt. Trung tâm cần xác nhận đã nhận thanh toán; đơn đã tạo sẽ giữ nguyên giá và quyền lợi tại thời điểm này.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input type="checkbox" required className="mt-1 accent-teal-700" id="terms-accepted" />
          Tôi đã đọc quyền lợi, điều kiện và xác nhận tạo đơn chờ thanh toán.
        </label>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Quay lại</button>
          <button type="button" onClick={() => {
            const checkbox = document.getElementById("terms-accepted") as HTMLInputElement | null
            if (checkbox?.checked) onConfirm()
          }} className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800">
            Tạo đơn chờ thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}
