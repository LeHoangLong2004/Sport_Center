import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ArrowLeft,
  Check,
  Clock3,
  Dumbbell,
  Info,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from "lucide-react"

import {
  CatalogPackage,
  PackageOrder,
  MembershipStatus,
  PackageAPI,
  PackagePeriod,
  SportFormat,
  getMembershipStatus,
} from "../../../services/packageApi"

const periods: PackagePeriod[] = [1, 3, 6, 12]

const formatLabel: Record<SportFormat, string> = {
  self: "Tự tập",

  group: "Lớp nhóm",

  coach: "Coach 1–1",
}

const money = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)}đ`

const dateLabel = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Đang chờ xác nhận"

function orderStatusLabel(order: PackageOrder) {
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  if (order.status === "pending") return "Chờ thanh toán"

  if (order.status === "failed") return "Thanh toán thất bại"

  if (order.startDate && new Date(order.startDate).getTime() > today.getTime())
    return "Đã thanh toán · Chờ hiệu lực"

  if (order.endDate && new Date(order.endDate).getTime() < today.getTime())
    return "Hết hạn"

  return "Đang hiệu lực"
}

function getProjectedDates(
  item: CatalogPackage,
  duration: PackagePeriod,
  orders: PackageOrder[],
) {
  const now = new Date()

  now.setHours(0, 0, 0, 0)

  const priorOrders = orders.filter(
    (order) =>
      order.status === "paid" &&
      order.packageSnapshot.category === item.category &&
      (item.category !== "sport" ||
        order.packageSnapshot.sport === item.sport) &&
      order.endDate,
  )

  const latestEnd = priorOrders.reduce((latest, order) => {
    const endDate = new Date(order.endDate!)

    return endDate > latest ? endDate : latest
  }, now)

  const start = new Date(latestEnd)

  if (latestEnd > now) start.setDate(start.getDate() + 1)

  const end = new Date(start)

  const day = end.getDate()

  end.setDate(1)

  end.setMonth(end.getMonth() + duration)

  const finalDay = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()

  end.setDate(Math.min(day, finalDay))

  end.setDate(end.getDate() - 1)

  return { start, end }
}

function PackageCard({
  item,

  duration,

  onDurationChange,

  onChoose,

  membership,

  disabled = false,
}: {
  item: CatalogPackage

  duration: PackagePeriod

  onDurationChange: (duration: PackagePeriod) => void

  onChoose: () => void

  membership?: MembershipStatus

  disabled?: boolean
}) {
  const price = item.prices[duration]

  const discountPct =
    item.category === "sport" && membership
      ? item.format === "coach"
        ? membership.coachDiscountPct
        : membership.groupDiscountPct
      : 0

  const discount = Math.round((price * discountPct) / 100)

  const format = item.format ? formatLabel[item.format] : ""

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {item.category === "sport" && item.sport && (
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">
                {item.sport}
              </span>
            )}
            {format && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {format}
              </span>
            )}
            {item.tier === "premium" && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                Nổi bật
              </span>
            )}
          </div>
          <h3 className="mt-3 text-xl font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {item.description}
          </p>
        </div>
        <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
          {item.category === "membership" ? (
            <Sparkles size={20} />
          ) : (
            <Dumbbell size={20} />
          )}
        </div>
      </div>

      {item.category !== "membership" && (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-sm">
          <span className="text-slate-500">Khu tập</span>
          <strong className="text-right text-slate-800">
            {item.area || item.sport}
          </strong>
          {item.sessionsPerMonth && (
            <>
              <span className="text-slate-500">Hạn mức</span>
              <strong className="text-right text-slate-800">
                {item.sessionsPerMonth} buổi/tháng
              </strong>
            </>
          )}
          {item.minutesPerSession && (
            <>
              <span className="text-slate-500">Thời lượng</span>
              <strong className="text-right text-slate-800">
                {item.minutesPerSession} phút/buổi
              </strong>
            </>
          )}
          {item.maxClassSize && (
            <>
              <span className="text-slate-500">Sĩ số tối đa</span>
              <strong className="text-right text-slate-800">
                {item.maxClassSize} người
              </strong>
            </>
          )}
          {item.accessHours && (
            <>
              <span className="text-slate-500">Khung giờ</span>
              <strong className="text-right text-slate-800">
                {item.accessHours}
              </strong>
            </>
          )}
        </div>
      )}

      <label
        className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
        htmlFor={`period-${item.id}`}
      >
        Thời hạn
      </label>
      <select
        id={`period-${item.id}`}
        value={duration}
        onChange={(event) =>
          onDurationChange(Number(event.target.value) as PackagePeriod)
        }
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      >
        {periods.map((period) => (
          <option key={period} value={period}>
            {period} tháng · {money(item.prices[period])}
          </option>
        ))}
      </select>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-slate-900">
            {money(price - discount)}
          </p>
          <p className="text-xs text-slate-500">
            Tổng tiền · {money(Math.round((price - discount) / duration))}/tháng
            tham khảo
          </p>
        </div>
        {discountPct > 0 && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Giảm {discountPct}%
          </span>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Quyền lợi
        </h4>
        <ul className="mt-2 space-y-2">
          {item.benefits.map((benefit, index) => (
            <li
              key={`${benefit}-${index}`}
              className="flex gap-2 text-sm leading-5 text-slate-700"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-teal-600" />
              {benefit}
            </li>
          ))}
        </ul>
        {(item.terms.length > 0 || item.lockerTerms) && (
          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-teal-700">
              Điều kiện sử dụng
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {item.terms.map((term, index) => (
                <li key={`${term}-${index}`}>{term}</li>
              ))}
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
          Đã bao gồm quyền sử dụng khu {item.sport}; không cần mua thêm gói tự
          tập cùng môn.
        </p>
      )}

      <button
        type="button"
        onClick={onChoose}
        disabled={disabled}
        className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
      >
        {disabled ? "Hạng mặc định" : "Chọn gói này"}
      </button>
    </article>
  )
}

export function PackagesPage() {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([])

  const [orders, setOrders] = useState<PackageOrder[]>([])

  const [membership, setMembership] = useState<MembershipStatus | null>(null)

  const [category, setCategory] = useState<"membership" | "sport" | null>(null)

  const [periodsByPackage, setPeriodsByPackage] =
    useState<Record<string, PackagePeriod>>({})

  const [sportFilter, setSportFilter] = useState("Tất cả môn")

  const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all")

  const [selected, setSelected] = useState<CatalogPackage | null>(null)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")

  const [notice, setNotice] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [nextCatalog, nextOrders] = await Promise.all([
        PackageAPI.getPackages(),
        PackageAPI.getMyOrders(),
      ])

      setCatalog(nextCatalog)

      setOrders(nextOrders)

      setMembership(getMembershipStatus(nextOrders, nextCatalog))

      setError("")
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải dữ liệu gói tập.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const membershipPackages = useMemo(
    () =>
      catalog.filter(
        (item) =>
          item.category === "membership" &&
          (item.tier === "basic" || item.isActive),
      ),

    [catalog],
  )

  const availableSports = useMemo(
    () => catalog.filter((item) => item.category === "sport" && item.isActive),
    [catalog],
  )

  const sports = useMemo(
    () =>
      availableSports.filter(
        (item) =>
          (sportFilter === "Tất cả môn" || item.sport === sportFilter) &&
          (formatFilter === "all" || item.format === formatFilter),
      ),

    [availableSports, sportFilter, formatFilter],
  )

  const sportNames = useMemo(
    () =>
      [
        ...new Set(availableSports.map((item) => item.sport).filter(Boolean)),
      ] as string[],
    [availableSports],
  )

  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length

  const selectedDuration = selected ? periodsByPackage[selected.id] || 1 : 1

  const projectedDates = selected
    ? getProjectedDates(selected, selectedDuration, orders)
    : null

  const createOrder = async () => {
    if (!selected) return

    try {
      const duration = periodsByPackage[selected.id] || 1

      const order = await PackageAPI.createOrder(selected.id, duration)

      setSelected(null)

      setNotice(
        `Đã tạo đơn ${order.id}. Quyền lợi chỉ được kích hoạt sau khi trung tâm xác nhận thanh toán.`,
      )

      await loadData()
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Không thể tạo đơn gói tập.",
      )
    }
  }

  if (loading) {
    return (
      <section className="mp-overview-content">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          Đang tải danh mục gói tập...
        </div>
      </section>
    )
  }

  if (error && catalog.length === 0) {
    return (
      <section className="mp-overview-content">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"
        >
          <p className="font-semibold">Không thể tải dữ liệu gói tập từ máy chủ.</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              void loadData()
            }}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800"
          >
            Thử tải lại
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="mp-overview-content">
      <div className="mp-page-heading">
        <div>
          <span className="mp-kicker">GÓI TẬP CỦA TÔI</span>
          <p>
            {category
              ? category === "membership"
                ? "Gói thành viên"
                : "Gói môn tập"
              : "Quyền lợi và gói tập của bạn"}
          </p>
          <small>
            {category
              ? "Xem chi tiết, điều kiện và giá trước khi tạo đơn."
              : "Chọn loại gói để xem quyền lợi, giá và các gói bạn đã đăng ký."}
          </small>
        </div>
        {category && (
          <button
            type="button"
            onClick={() => setCategory(null)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-700"
          >
            <ArrowLeft size={16} /> Quay lại chọn loại gói
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      {!category ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setCategory("membership")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-300 hover:shadow-lg"
            >
              <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
                <Sparkles size={22} />
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Gói thành viên
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Xem hạng Cơ bản, Plus, Premium và các ưu đãi đang áp dụng.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">
                Khám phá hạng thành viên <span aria-hidden="true">→</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("sport")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg"
            >
              <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
                <Dumbbell size={22} />
              </span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                Gói môn tập
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Chọn môn, khu tập, hình thức hướng dẫn và thời hạn phù hợp.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Tìm gói môn tập <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>
          {membership && <MembershipSummary membership={membership} />}
          <OrderList orders={orders} />
        </>
      ) : category === "membership" ? (
        <>
          {membership && <MembershipSummary membership={membership} />}
          <div className="mb-5 mt-8 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Các hạng thành viên
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn kỳ hạn để xem tổng giá cần thanh toán.
              </p>
            </div>
            <span className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex">
              <ShieldCheck size={15} /> Giá kỳ hạn là tổng tiền
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {membershipPackages.map((item) => (
              <PackageCard
                key={item.id}
                item={item}
                duration={periodsByPackage[item.id] || 1}
                onDurationChange={(duration) =>
                  setPeriodsByPackage((current) => ({
                    ...current,
                    [item.id]: duration,
                  }))
                }
                onChoose={() => item.tier !== "basic" && setSelected(item)}
                membership={membership}
                disabled={item.tier === "basic"}
              />
            ))}
          </div>
          <OrderList
            orders={orders.filter(
              (order) => order.packageSnapshot.category === "membership",
            )}
            title="Đơn và hạng thành viên của tôi"
          />
        </>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-sm text-teal-950">
                Hạng hiện tại: {membership?.name || "Chưa có dữ liệu hạng"}
              </strong>
              <p className="mt-1 text-sm text-teal-800">
                Ưu đãi gói môn: {membership?.groupDiscountPct ?? 0}% tự tập/lớp nhóm ·{" "}
                {membership?.coachDiscountPct ?? 0}% Coach 1–1.
              </p>
            </div>
            <label className="text-sm font-semibold text-teal-950">
              Môn tập
              <select
                value={sportFilter}
                onChange={(event) => setSportFilter(event.target.value)}
                className="ml-2 rounded-lg border border-teal-200 bg-white px-3 py-2 font-normal text-slate-700"
              >
                <option>Tất cả môn</option>
                {sportNames.map((sport) => (
                  <option key={sport}>{sport}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {(["all", "self", "group", "coach"] as const).map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setFormatFilter(format)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  formatFilter === format
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {format === "all" ? "Tất cả hình thức" : formatLabel[format]}
              </button>
            ))}
          </div>
          {sports.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {sports.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  duration={periodsByPackage[item.id] || 1}
                  onDurationChange={(duration) =>
                    setPeriodsByPackage((current) => ({
                      ...current,
                      [item.id]: duration,
                    }))
                  }
                  onChoose={() => setSelected(item)}
                  membership={membership}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Dumbbell className="mx-auto text-slate-400" size={30} />
              <h2 className="mt-3 font-bold text-slate-800">
                Không có gói phù hợp
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Thử chọn môn hoặc hình thức khác để xem thêm gói đang mở bán.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSportFilter("Tất cả môn")
                  setFormatFilter("all")
                }}
                className="mt-4 text-sm font-semibold text-teal-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
          <OrderList
            orders={orders.filter(
              (order) => order.packageSnapshot.category === "sport",
            )}
            title="Gói môn đã đăng ký"
          />
        </>
      )}

      {pendingCount > 0 && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <Clock3 size={17} /> Bạn có {pendingCount} đơn chờ trung tâm xác nhận
          thanh toán. Quyền lợi chưa được kích hoạt.
        </p>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-confirm-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <span className="inline-flex rounded-lg bg-teal-50 p-2 text-teal-700">
              <TicketCheck size={20} />
            </span>
            <h2
              id="package-confirm-title"
              className="mt-3 text-xl font-bold text-slate-900"
            >
              Xác nhận tạo đơn
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Kiểm tra thông tin và điều kiện trước khi tiếp tục.
            </p>
            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Gói</span>
                <strong className="text-right text-slate-900">
                  {selected.name}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Kỳ hạn</span>
                <strong className="text-slate-900">
                  {selectedDuration} tháng
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Bắt đầu dự kiến</span>
                <strong className="text-slate-900">
                  {dateLabel(projectedDates?.start.toISOString())}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Kết thúc dự kiến</span>
                <strong className="text-slate-900">
                  {dateLabel(projectedDates?.end.toISOString())}
                </strong>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Giá niêm yết</span>
                <strong className="text-slate-900">
                  {money(selected.prices[selectedDuration])}
                </strong>
              </div>
              {selected.category === "sport" && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">
                    Ưu đãi hạng {membership?.name || "hiện tại"}
                  </span>
                  <strong className="text-emerald-700">
                    −
                    {money(
                      Math.round(
                        (selected.prices[selectedDuration] *
                          (selected.format === "coach"
                            ? membership?.coachDiscountPct ?? 0
                            : membership?.groupDiscountPct ?? 0)) /
                          100,
                      ),
                    )}
                  </strong>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 text-base">
                <strong className="text-slate-900">Tổng cần thanh toán</strong>
                <strong className="text-teal-800">
                  {money(
                    selected.prices[selectedDuration] -
                      Math.round(
                        (selected.prices[selectedDuration] *
                          (selected.category === "sport"
                            ? selected.format === "coach"
                              ? membership?.coachDiscountPct ?? 0
                              : membership?.groupDiscountPct ?? 0
                            : 0)) /
                          100,
                      ),
                  )}
                </strong>
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {selected.benefits.map((benefit, index) => (
                <li key={`${benefit}-${index}`}>• {benefit}</li>
              ))}
            </ul>
            {selected.terms.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-500">
                {selected.terms.map((term, index) => (
                  <li key={`${term}-${index}`}>{term}</li>
                ))}
              </ul>
            )}
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Khi tạo đơn, gói chưa được kích hoạt. Trung tâm cần xác nhận đã
              nhận thanh toán; đơn đã tạo sẽ giữ nguyên giá và quyền lợi tại
              thời điểm này.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                required
                className="mt-1 accent-teal-700"
                id="terms-accepted"
              />
              Tôi đã đọc quyền lợi, điều kiện và xác nhận tạo đơn chờ thanh
              toán.
            </label>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => {
                  const checkbox = document.getElementById(
                    "terms-accepted",
                  ) as HTMLInputElement | null

                  if (checkbox?.checked) void createOrder()
                }}
                className="flex-1 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Tạo đơn chờ thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function MembershipSummary({ membership }: { membership: MembershipStatus }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-5 text-white shadow-lg sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
            Hạng thành viên hiện tại
          </span>
          <h2 className="mt-2 text-2xl font-extrabold">{membership.name}</h2>
          <p className="mt-1 text-sm text-slate-300">
            {membership.tier === "basic"
              ? "Miễn phí · Không giới hạn thời hạn"
              : `Hiệu lực ${dateLabel(membership.startDate)} – ${dateLabel(membership.endDate)}`}
          </p>
        </div>
        {membership.tier !== "basic" && (
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-100">
            {membership.endDate &&
            new Date(membership.endDate).setHours(0, 0, 0, 0) <
              new Date().setHours(0, 0, 0, 0)
              ? "Hết hạn"
              : "Đang hiệu lực"}
          </span>
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {membership.benefits.map((benefit, index) => (
          <div
            key={`${benefit}-${index}`}
            className="flex gap-2 rounded-xl bg-white/10 p-3 text-sm leading-5 text-slate-100"
          >
            <Check size={16} className="mt-0.5 shrink-0 text-teal-300" />
            {benefit}
          </div>
        ))}
      </div>
      {membership.tier !== "basic" && (
        <p className="mt-4 text-xs text-slate-300">
          Đặt lớp trước {membership.bookingAdvanceHours} giờ · Tủ đồ:{" "}
          {membership.lockerTerms}
        </p>
      )}
    </div>
  )
}

function OrderList({
  orders,
  title = "Đơn mua và gói đã đăng ký",
}: {
  orders: PackageOrder[]
  title?: string
}) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{orders.length} đơn</span>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
          Chưa có đơn hoặc gói đã đăng ký.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">
                    {order.packageSnapshot.name}
                  </strong>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      order.status === "pending"
                        ? "bg-amber-50 text-amber-800"
                        : orderStatusLabel(order).includes("Hết hạn")
                          ? "bg-slate-100 text-slate-600"
                          : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {orderStatusLabel(order)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Mã {order.id} · {order.durationMonths} tháng · Tạo{" "}
                  {dateLabel(order.createdAt)}
                </p>
                {order.startDate && (
                  <p className="mt-1 text-xs text-slate-500">
                    Hiệu lực {dateLabel(order.startDate)} –{" "}
                    {dateLabel(order.endDate)}
                  </p>
                )}
              </div>
              <strong className="text-lg text-slate-900">
                {money(order.total)}
              </strong>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
