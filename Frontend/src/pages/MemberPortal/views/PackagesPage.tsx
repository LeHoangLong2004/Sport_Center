import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Clock3, Dumbbell, ShieldCheck, Sparkles } from "lucide-react"
import {
  CatalogPackage, PackageOrder, MembershipStatus, PackageAPI, PackagePeriod, SportFormat, getMembershipStatus,
} from "../../../services/packageApi"
import {
  ConfirmOrderModal, dateLabel, formatLabel, getProjectedDates, MembershipSummary, money, OrderList, PackageCard, periods,
} from "../components/PackageMemberComponents"

export function PackagesPage() {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([])
  const [orders, setOrders] = useState<PackageOrder[]>([])
  const [membership, setMembership] = useState<MembershipStatus | null>(null)
  const [category, setCategory] = useState<"membership" | "sport" | null>(null)
  const [periodsByPackage, setPeriodsByPackage] = useState<Record<string, PackagePeriod>>({})
  const [sportFilter, setSportFilter] = useState("Tất cả môn")
  const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all")
  const [selected, setSelected] = useState<CatalogPackage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [nextCatalog, nextOrders] = await Promise.all([PackageAPI.getPackages(), PackageAPI.getMyOrders()])
      setCatalog(nextCatalog)
      setOrders(nextOrders)

      let memStatus = getMembershipStatus(nextOrders, nextCatalog)
      try {
        const { MemberAPI } = await import('../services/api')
        const subs = await MemberAPI.getMySubscriptions()
        if (subs && subs.length > 0) {
          const memSub = subs.find((s: any) => s.packageType === 'membership')
          if (memSub && (memSub.paymentStatus === 1 || memSub.paymentStatus === 'Completed') && new Date(memSub.endDate) > new Date()) {
            memStatus = {
              ...memStatus,
              name: memSub.packageName || "Hội viên",
              tier: memSub.packageName?.toLowerCase().includes("premium") ? "premium" : memSub.packageName?.toLowerCase().includes("plus") ? "plus" : "basic",
              startDate: memSub.startDate, endDate: memSub.endDate,
              benefits: memStatus?.benefits || [], groupDiscountPct: memStatus?.groupDiscountPct || 0,
              coachDiscountPct: memStatus?.coachDiscountPct || 0, bookingAdvanceHours: memStatus?.bookingAdvanceHours || 0,
              lockerTerms: memStatus?.lockerTerms || "",
            }
          }
        }
      } catch (e) { console.error("Could not fetch subscriptions", e) }

      setMembership(memStatus)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu gói tập.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const membershipPackages = useMemo(
    () => catalog.filter((item) => item.category === "membership" && (item.tier === "basic" || item.isActive)),
    [catalog],
  )
  const availableSports = useMemo(() => catalog.filter((item) => item.category === "sport" && item.isActive), [catalog])
  const sports = useMemo(
    () => availableSports.filter((item) =>
      (sportFilter === "Tất cả môn" || item.sport === sportFilter) &&
      (formatFilter === "all" || item.format === formatFilter)
    ),
    [availableSports, sportFilter, formatFilter],
  )
  const sportNames = useMemo(
    () => [...new Set(availableSports.map((item) => item.sport).filter(Boolean))] as string[],
    [availableSports],
  )
  const pendingCount = orders.filter((order) => order.status === "pending").length
  const selectedDuration = selected ? periodsByPackage[selected.id] || 1 : 1
  const projectedDates = selected ? getProjectedDates(selected, selectedDuration, orders) : null

  const createOrder = async () => {
    if (!selected) return
    try {
      const duration = periodsByPackage[selected.id] || 1
      const order = await PackageAPI.createOrder(selected.id, duration)
      setSelected(null)
      setNotice(`Đã tạo đơn ${order.id}. Quyền lợi chỉ được kích hoạt sau khi trung tâm xác nhận thanh toán.`)
      await loadData()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Không thể tạo đơn gói tập.")
    }
  }

  if (loading) {
    return (
      <section className="mp-overview-content">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Đang tải danh mục gói tập...</div>
      </section>
    )
  }

  if (error && catalog.length === 0) {
    return (
      <section className="mp-overview-content">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold">Không thể tải dữ liệu gói tập từ máy chủ.</p>
          <p className="mt-1">{error}</p>
          <button type="button" onClick={() => { setLoading(true); void loadData() }}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">Thử tải lại</button>
        </div>
      </section>
    )
  }

  return (
    <section className="mp-overview-content">
      <div className="mp-page-heading">
        <div>
          <span className="mp-kicker">GÓI TẬP CỦA TÔI</span>
          <p>{category ? (category === "membership" ? "Gói thành viên" : "Gói môn tập") : "Quyền lợi và gói tập của bạn"}</p>
          <small>
            {category ? "Xem chi tiết, điều kiện và giá trước khi tạo đơn." : "Chọn loại gói để xem quyền lợi, giá và các gói bạn đã đăng ký."}
          </small>
        </div>
        {category && (
          <button type="button" onClick={() => setCategory(null)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-300 hover:text-teal-700">
            <ArrowLeft size={16} /> Quay lại chọn loại gói
          </button>
        )}
      </div>

      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {!category ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button type="button" onClick={() => setCategory("membership")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-300 hover:shadow-lg">
              <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700"><Sparkles size={22} /></span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Gói thành viên</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Xem hạng Cơ bản, Plus, Premium và các ưu đãi đang áp dụng.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-teal-700">Khám phá hạng thành viên <span aria-hidden="true">→</span></span>
            </button>
            <button type="button" onClick={() => setCategory("sport")}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg">
              <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700"><Dumbbell size={22} /></span>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Gói môn tập</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Chọn môn, khu tập, hình thức hướng dẫn và thời hạn phù hợp.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">Tìm gói môn tập <span aria-hidden="true">→</span></span>
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
              <h2 className="text-xl font-bold text-slate-900">Các hạng thành viên</h2>
              <p className="mt-1 text-sm text-slate-500">Chọn kỳ hạn để xem tổng giá cần thanh toán.</p>
            </div>
            <span className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex">
              <ShieldCheck size={15} /> Giá kỳ hạn là tổng tiền
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {membershipPackages.map((item) => (
              <PackageCard key={item.id} item={item} duration={periodsByPackage[item.id] || 1}
                onDurationChange={(duration) => setPeriodsByPackage((curr) => ({ ...curr, [item.id]: duration }))}
                onChoose={() => item.tier !== "basic" && setSelected(item)}
                membership={membership || undefined} disabled={item.tier === "basic"} />
            ))}
          </div>
          <OrderList orders={orders.filter((o) => o.packageSnapshot.category === "membership")} title="Đơn và hạng thành viên của tôi" />
        </>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-sm text-teal-950">Hạng hiện tại: {membership?.name || "Chưa có dữ liệu hạng"}</strong>
              <p className="mt-1 text-sm text-teal-800">
                Ưu đãi gói môn: {membership?.groupDiscountPct ?? 0}% tự tập/lớp nhóm · {membership?.coachDiscountPct ?? 0}% Coach 1–1.
              </p>
            </div>
            <label className="text-sm font-semibold text-teal-950">
              Môn tập
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                className="ml-2 rounded-lg border border-teal-200 bg-white px-3 py-2 font-normal text-slate-700">
                <option>Tất cả môn</option>
                {sportNames.map((sport) => <option key={sport}>{sport}</option>)}
              </select>
            </label>
          </div>
          <div className="mb-5 flex flex-wrap gap-2">
            {(["all", "self", "group", "coach"] as const).map((format) => (
              <button key={format} type="button" onClick={() => setFormatFilter(format)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${formatFilter === format ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400"}`}>
                {format === "all" ? "Tất cả hình thức" : formatLabel[format]}
              </button>
            ))}
          </div>
          {sports.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {sports.map((item) => (
                <PackageCard key={item.id} item={item} duration={periodsByPackage[item.id] || 1}
                  onDurationChange={(duration) => setPeriodsByPackage((curr) => ({ ...curr, [item.id]: duration }))}
                  onChoose={() => setSelected(item)} membership={membership || undefined} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Dumbbell className="mx-auto text-slate-400" size={30} />
              <h2 className="mt-3 font-bold text-slate-800">Không có gói phù hợp</h2>
              <p className="mt-1 text-sm text-slate-500">Thử chọn môn hoặc hình thức khác để xem thêm gói đang mở bán.</p>
              <button type="button" onClick={() => { setSportFilter("Tất cả môn"); setFormatFilter("all") }}
                className="mt-4 text-sm font-semibold text-teal-700">Xóa bộ lọc</button>
            </div>
          )}
          <OrderList orders={orders.filter((o) => o.packageSnapshot.category === "sport")} title="Gói môn đã đăng ký" />
        </>
      )}

      {pendingCount > 0 && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          <Clock3 size={17} /> Bạn có {pendingCount} đơn chờ trung tâm xác nhận thanh toán. Quyền lợi chưa được kích hoạt.
        </p>
      )}

      {selected && (
        <ConfirmOrderModal
          selected={selected} membership={membership}
          selectedDuration={selectedDuration as PackagePeriod}
          projectedDates={projectedDates}
          onClose={() => setSelected(null)}
          onConfirm={() => void createOrder()}
        />
      )}
    </section>
  )
}
