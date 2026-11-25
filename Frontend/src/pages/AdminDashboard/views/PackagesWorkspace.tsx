import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, PackageCheck, Plus, ShieldCheck } from "lucide-react"
import { CatalogPackage, PackageOrder, PackageAPI } from "../../../services/packageApi"
import {
  blankMembershipPackage, MembershipCard, PackageDraft, PackageEditor, periods, money,
} from "../components/PackageComponents"
export function PackagesWorkspace() {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([])
  const [orders, setOrders] = useState<PackageOrder[]>([])
  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog")
  const [draft, setDraft] = useState<PackageDraft | null>(null)
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

  const membership = useMemo(
    () => catalog.filter((item) => item.category === "membership")
      .sort((a, b) => (a.tierRank ?? 0) - (b.tierRank ?? 0)),
    [catalog],
  )

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const visibleOrders = orders.filter((order) =>
    `${order.userName} ${order.userEmail} ${order.packageSnapshot.name} ${order.id}`
      .toLowerCase().includes(orderSearch.toLowerCase()),
  )

  const [orderPage, setOrderPage] = useState(1)
  const orderRowsPerPage = 8

  useEffect(() => {
    setOrderPage(1)
  }, [orderSearch, activeTab])

  const orderTotalPages = Math.ceil(visibleOrders.length / orderRowsPerPage) || 1
  const paginatedOrders = visibleOrders.slice((orderPage - 1) * orderRowsPerPage, orderPage * orderRowsPerPage)

  const getOrderPageNumbers = () => {
    if (orderTotalPages <= 5) return Array.from({ length: orderTotalPages }, (_, i) => i + 1)
    if (orderPage <= 3) return [1, 2, 3, 4, '...', orderTotalPages]
    if (orderPage >= orderTotalPages - 2) return [1, '...', orderTotalPages - 3, orderTotalPages - 2, orderTotalPages - 1, orderTotalPages]
    return [1, '...', orderPage - 1, orderPage, orderPage + 1, '...', orderTotalPages]
  }

  const edit = (item: CatalogPackage) => {
    setError("")
    setDraft({ ...item, prices: { ...item.prices }, benefits: [...item.benefits], terms: [...item.terms] })
  }

  const createMembershipTier = () => {
    setError("")
    setNotice("")
    setActiveTab("catalog")
    setDraft(blankMembershipPackage(membership))
  }

  const save = async () => {
    if (!draft) return
    setError("")

    if (!draft.name.trim() || !draft.description.trim() || !draft.benefits.length) {
      setError("Vui lòng nhập tên, mô tả và ít nhất một quyền lợi."); return
    }
    if (!draft.benefits.some((benefit) => benefit.trim())) {
      setError("Hạng thành viên cần ít nhất một quyền lợi."); return
    }
    if (periods.some((p) => !Number.isFinite(draft.prices[p]) || draft.prices[p] < 0) ||
      (draft.tier !== "basic" && periods.some((p) => draft.prices[p] <= 0))) {
      setError("Mỗi kỳ hạn cần có giá hợp lệ; hạng trả phí không được có giá bằng 0."); return
    }
    if ([draft.groupDiscountPct, draft.coachDiscountPct].some((v) => !Number.isFinite(v) || v < 0 || v > 100)) {
      setError("Tỷ lệ ưu đãi phải nằm trong khoảng 0–100%."); return
    }
    try {
      setSaving(true)

      const finalBenefits = [...draft.benefits.map((b) => b.trim()).filter(Boolean)]

      await PackageAPI.savePackage(
        {
          ...draft,
          name: draft.name.trim(),
          description: draft.description.trim(),
          area: (draft.area || "").trim(),
          benefits: finalBenefits,
        },
        !catalog.some((item) => item.id === draft.id)
      )
      setDraft(null)
      setError("")
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
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-700">CENTER MANAGER · GÓI THÀNH VIÊN</span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Quản lý gói thành viên
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý hạng thành viên, giá và quyền lợi áp dụng cho đơn mới.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTab === "catalog" && (
            <button type="button" onClick={createMembershipTier}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800">
              <Plus size={16} /> Tạo hạng thành viên
            </button>
          )}
          <button type="button" onClick={() => setActiveTab("orders")}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${activeTab === "orders" ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            <PackageCheck size={16} /> Đơn thanh toán{" "}
            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-slate-400 px-2 py-0.5 text-xs text-slate-950">{pendingOrders.length}</span>
            )}
          </button>
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500 sm:max-w-xs" />
          </div>
          {visibleOrders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Chưa có đơn phù hợp.</div>
          ) : (
            <>
              <div className="mt-5 space-y-3">
                {paginatedOrders.map((order) => (
                  <article key={order.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between hover:border-slate-300 transition-colors">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm text-slate-900">{order.packageSnapshot.name}</strong>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "pending" ? "bg-slate-50 text-slate-800" : order.status === "paid" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
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
                      {order.status === "pending" && order.packageSnapshot.category === "membership" && (
                        <button type="button" onClick={() => void confirmPayment(order)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                          <Check size={16} /> Xác nhận đã thu
                        </button>
                      )}
                      {order.status === "pending" && order.packageSnapshot.category === "sport" && (
                        <span className="max-w-48 text-right text-xs text-slate-500">
                          Gói môn đã ngừng kinh doanh; đơn cũ được giữ trong lịch sử.
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination Footer */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
                <span className="text-sm text-slate-500">
                  Hiển thị {visibleOrders.length === 0 ? 0 : (orderPage - 1) * orderRowsPerPage + 1}-{Math.min(orderPage * orderRowsPerPage, visibleOrders.length)} trong tổng số {visibleOrders.length} đơn mua
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    disabled={orderPage === 1}
                    className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${orderPage === 1 ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"}`}
                  >
                    ‹ Trước
                  </button>
                  {getOrderPageNumbers().map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => typeof p === 'number' && setOrderPage(p)}
                      disabled={p === '...'}
                      className={`flex items-center px-3 py-1.5 rounded-md text-[13px] transition-colors ${p === orderPage ? "bg-emerald-600 font-semibold text-white shadow-xs shadow-emerald-600/20" : p === '...' ? "bg-transparent text-slate-400 cursor-default" : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer"}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setOrderPage((p) => Math.min(orderTotalPages, p + 1))}
                    disabled={orderPage === orderTotalPages}
                    className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${orderPage === orderTotalPages ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"}`}
                  >
                    Sau ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      ) : (
        <section>
          <div className="mb-4 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-950">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>Hạng Cơ bản luôn miễn phí và được giữ làm hạng mặc định. Hạng mới được xếp sau các hạng hiện có; thay đổi chỉ ảnh hưởng đơn mới.</span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {membership.map((item) => (
              <MembershipCard key={item.id} item={item} onEdit={() => edit(item)} onToggle={() => void toggle(item)} />
            ))}
          </div>
        </section>
      )}

      {draft && (
        <PackageEditor draft={draft} isNew={!catalog.some((item) => item.id === draft.id)} onChange={setDraft} onClose={() => { setDraft(null); setError(""); }} onSave={() => void save()} saving={saving} error={error} />
      )}
    </div>
  )
}
