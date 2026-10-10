import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Dumbbell, PackageCheck, Plus, ShieldCheck, Sparkles } from "lucide-react"
import { CatalogPackage, PackageOrder, PackageAPI, SportFormat } from "../../../services/packageApi"
import {
  blankPackage, formatLabels, MembershipCard, PackageDraft, PackageEditor, periods, SportCard, Category, money,
} from "../components/PackageComponents"

export function PackagesWorkspace() {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([])
  const [orders, setOrders] = useState<PackageOrder[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog")
  const [draft, setDraft] = useState<PackageDraft | null>(null)
  const [sportFilter, setSportFilter] = useState("all")
  const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [orderSearch, setOrderSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [nextCatalog, nextOrders] = await Promise.all([PackageAPI.getPackages(), PackageAPI.getOrders()])
      setCatalog(nextCatalog)
      setOrders(nextOrders)
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải danh mục gói.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadData() }, [loadData])

  const membership = useMemo(() => catalog.filter((item) => item.category === "membership"), [catalog])

  const sportPackages = useMemo(
    () => catalog.filter((item) =>
      item.category === "sport" &&
      (sportFilter === "all" || item.sport === sportFilter) &&
      (formatFilter === "all" || item.format === formatFilter) &&
      (statusFilter === "all" || (statusFilter === "active" ? item.isActive : !item.isActive))
    ),
    [catalog, sportFilter, formatFilter, statusFilter],
  )

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const visibleOrders = orders.filter((order) =>
    `${order.userName} ${order.userEmail} ${order.packageSnapshot.name} ${order.id}`
      .toLowerCase().includes(orderSearch.toLowerCase()),
  )

  const edit = (item: CatalogPackage) => {
    setError("")
    setDraft({ ...item, prices: { ...item.prices }, benefits: [...item.benefits], terms: [...item.terms] })
  }

  const save = async () => {
    if (!draft) return
    setError("")

    if (!draft.name.trim() || !draft.description.trim() || !draft.benefits.length) {
      setError("Vui lòng nhập tên, mô tả và ít nhất một quyền lợi."); return
    }
    if (periods.some((p) => !Number.isFinite(draft.prices[p]) || draft.prices[p] < 0) ||
      (draft.tier !== "basic" && periods.some((p) => draft.prices[p] <= 0))) {
      setError("Mỗi kỳ hạn cần có giá hợp lệ; hạng trả phí không được có giá bằng 0."); return
    }
    if ([draft.groupDiscountPct, draft.coachDiscountPct].some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
      setError("Tỷ lệ ưu đãi phải nằm trong khoảng 0–100%."); return
    }
    if (draft.category === "sport" && (!draft.sport?.trim() || !draft.area?.trim() || !draft.format)) {
      setError("Gói môn tập cần có bộ môn, khu sử dụng và hình thức."); return
    }
    if (draft.category === "sport" && draft.format !== "self" && (!draft.sessionsPerMonth || !draft.minutesPerSession)) {
      setError("Gói có Coach cần có số buổi và thời lượng mỗi buổi."); return
    }
    if (draft.category === "sport" && !draft.terms.length) {
      setError("Gói môn tập cần có ít nhất một điều kiện sử dụng."); return
    }

    try {
      setSaving(true)
      await PackageAPI.savePackage(
        { ...draft, name: draft.name.trim(), description: draft.description.trim(), sport: draft.sport?.trim(), area: draft.area?.trim() },
        !catalog.some((item) => item.id === draft.id)
      )
      setDraft(null)
      setNotice("Đã lưu cấu hình. Danh mục Member được cập nhật cho các lần mua mới.")
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu cấu hình.")
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item: CatalogPackage) => {
    try {
      setError("")
      await PackageAPI.setPackageActive(item.id, !item.isActive)
      setNotice(item.isActive ? "Đã ngừng bán gói. Đơn và quyền đã mua vẫn được giữ nguyên." : "Đã mở bán gói.")
      await loadData()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Không thể đổi trạng thái gói.")
    }
  }

  const confirmPayment = async (order: PackageOrder) => {
    if (!window.confirm(`Xác nhận đã nhận ${money(order.total)} cho đơn ${order.id}? Giao dịch này chỉ được xác nhận một lần.`)) return
    try {
      setError("")
      await PackageAPI.confirmPayment(order.id)
      setNotice(`Đã xác nhận thanh toán đơn ${order.id}; quyền lợi được kích hoạt hoặc xếp lịch theo thời hạn gói.`)
      await loadData()
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Không thể xác nhận thanh toán.")
    }
  }

  if (loading) return <div className="p-8 text-sm text-slate-500">Đang tải danh mục gói...</div>

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">CENTER MANAGER · GÓI TẬP</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {category ? (category === "membership" ? "Quản lý gói thành viên" : "Quản lý gói môn tập") : "Quản lí gói"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {category ? "Cập nhật danh mục, giá và quyền lợi cho các lần mua mới." : "Quản lý hạng thành viên, sản phẩm môn tập và đơn chờ thanh toán."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {category && (
            <button type="button" onClick={() => { setCategory(null); setActiveTab("catalog") }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300">
              <ArrowLeft size={16} /> Chọn loại gói
            </button>
          )}
          <button type="button" onClick={() => { setActiveTab("orders"); setCategory(null) }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${activeTab === "orders" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            <PackageCheck size={16} /> Đơn thanh toán{" "}
            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs text-amber-950">{pendingOrders.length}</span>
            )}
          </button>
          {category === "sport" && (
            <button type="button" onClick={() => setDraft(blankPackage("sport"))}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
              <Plus size={17} /> Tạo gói môn
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {/* Content */}
      {activeTab === "orders" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Đơn mua và xác nhận thanh toán</h2>
              <p className="mt-1 text-sm text-slate-500">Chỉ xác nhận khi đã nhận tiền; thao tác xác nhận chỉ thực hiện một lần.</p>
            </div>
            <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Tìm tên, mã đơn, gói..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:max-w-xs" />
          </div>
          {visibleOrders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Chưa có đơn phù hợp.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {visibleOrders.map((order) => (
                <article key={order.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-slate-900">{order.packageSnapshot.name}</strong>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "pending" ? "bg-amber-50 text-amber-800" : order.status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                        {order.status === "pending" ? "Chờ thanh toán" : order.status === "paid" ? (order.startDate && new Date(order.startDate) > new Date() ? "Đã thanh toán · Chờ hiệu lực" : "Đã thanh toán") : "Thất bại"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{order.userName}{order.userEmail && ` · ${order.userEmail}`}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.id} · {order.durationMonths} tháng · Tạo {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                    {order.startDate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Hiệu lực {new Date(order.startDate).toLocaleDateString("vi-VN")} – {new Date(order.endDate!).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Cần thanh toán</p>
                      <strong className="text-lg text-slate-900">{money(order.total)}</strong>
                      {order.discountPct > 0 && <p className="text-xs text-emerald-700">Đã giảm {order.discountPct}%</p>}
                    </div>
                    {order.status === "pending" && (
                      <button type="button" onClick={() => void confirmPayment(order)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                        <Check size={16} /> Xác nhận đã thu
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : !category ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button type="button" onClick={() => setCategory("membership")}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg">
            <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700"><Sparkles size={22} /></span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Gói thành viên</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Cấu hình Cơ bản, Plus, Premium, giá theo kỳ hạn và ưu đãi.</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Quản lý hạng thành viên →</span>
          </button>
          <button type="button" onClick={() => setCategory("sport")}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-300 hover:shadow-lg">
            <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700"><Dumbbell size={22} /></span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">Gói môn tập</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">Quản lý môn, khu tập, hình thức, hạn mức, giá và quyền lợi.</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-teal-700">Quản lý danh mục môn →</span>
          </button>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950 md:col-span-2">
            <strong>Danh mục dùng chung:</strong> thay đổi cấu hình sẽ hiển thị ngay cho Member khi mua gói mới. Đơn đã tạo giữ nguyên snapshot về giá, quyền lợi và điều kiện.
          </div>
        </section>
      ) : category === "membership" ? (
        <section>
          <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>Chỉ có ba mã hạng ổn định. Cơ bản miễn phí và không thể ngừng bán; thay đổi chỉ ảnh hưởng đơn mới.</span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {membership.map((item) => (
              <MembershipCard key={item.id} item={item} onEdit={() => edit(item)} onToggle={() => void toggle(item)} />
            ))}
          </div>
        </section>
      ) : (
        <section>
          {/* Sport filters */}
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Bộ môn
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800">
                <option value="all">Tất cả bộ môn</option>
                {[...new Set(catalog.filter((i) => i.category === "sport").map((i) => i.sport).filter(Boolean))].map((sport) => (
                  <option key={sport}>{sport}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Hình thức
              <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value as "all" | SportFormat)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800">
                <option value="all">Tất cả hình thức</option>
                {Object.entries(formatLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Trạng thái
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800">
                <option value="all">Tất cả</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
            </label>
          </div>
          {sportPackages.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {sportPackages.map((item) => (
                <SportCard key={item.id} item={item} onEdit={() => edit(item)} onToggle={() => void toggle(item)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Dumbbell className="mx-auto text-slate-400" size={28} />
              <h2 className="mt-3 font-bold text-slate-800">Chưa có gói môn phù hợp</h2>
              <p className="mt-1 text-sm text-slate-500">Điều chỉnh bộ lọc hoặc tạo gói môn mới.</p>
            </div>
          )}
        </section>
      )}

      {draft && (
        <PackageEditor draft={draft} onChange={setDraft} onClose={() => setDraft(null)} onSave={() => void save()} saving={saving} />
      )}
    </div>
  )
}
