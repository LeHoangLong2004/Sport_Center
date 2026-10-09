import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ArrowLeft,
  Check,
  Dumbbell,
  Edit3,
  PackageCheck,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"

import {
  CatalogPackage,
  PackageOrder,
  PackageAPI,
  PackagePeriod,
  SportFormat,
} from "../../../services/packageApi"

const periods: PackagePeriod[] = [1, 3, 6, 12]

const formatLabels: Record<SportFormat, string> = {
  self: "Tự tập",
  group: "Lớp nhóm",
  coach: "Coach 1–1",
}

const money = (amount: number) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)}đ`

const linesToText = (lines: string[]) => lines.join("\n")

const textToLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

type Category = "membership" | "sport"

type PackageDraft = CatalogPackage

function blankPackage(category: Category): PackageDraft {
  if (category === "membership")
    throw new Error("Chỉ có thể chỉnh sửa ba hạng thành viên có sẵn.")

  return {
    id: `sport-${Date.now()}`,
    category,
    name: "",
    description: "",
    isActive: true,

    prices: { 1: 0, 3: 0, 6: 0, 12: 0 },
    benefits: [],
    terms: [],

    groupDiscountPct: 0,
    coachDiscountPct: 0,
    bookingAdvanceHours: 0,
    lockerTerms: "",

    sport: "",
    area: "",
    format: "self",
    sessionsPerMonth: 0,

    minutesPerSession: 0,
    maxClassSize: undefined,
    accessHours: "",
  }
}

function MembershipCard({
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

function SportCard({
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

function PackageEditor({
  draft,
  onChange,
  onClose,
  onSave,
  saving,
}: {
  draft: PackageDraft
  onChange: (draft: PackageDraft) => void
  onClose: () => void
  onSave: () => void
  saving: boolean
}) {
  const isMembership = draft.category === "membership"

  const setField = <K extends keyof PackageDraft,>(
    key: K,
    value: PackageDraft[K],
  ) => onChange({ ...draft, [key]: value })

  const setPrice = (period: PackagePeriod, value: number) =>
    onChange({ ...draft, prices: { ...draft.prices, [period]: value } })

  const fieldClass =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

  const labelClass = "block text-sm font-semibold text-slate-700"

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-editor-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {isMembership
                ? "Cấu hình hạng thành viên"
                : "Danh mục gói môn tập"}
            </span>
            <h2
              id="package-editor-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {draft.name || "Tạo gói môn tập"}
            </h2>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </header>
        <div className="max-h-[calc(92vh-145px)] space-y-6 overflow-y-auto px-6 py-5">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Thông tin chung
            </h3>
            {isMembership ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Hạng hệ thống</label>
                  <input
                    disabled
                    value={
                      draft.tier === "basic"
                        ? "Cơ bản"
                        : draft.tier === "plus"
                          ? "Plus"
                          : "Premium"
                    }
                    className={`${fieldClass} bg-slate-50`}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tên hiển thị</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setField("name", event.target.value)}
                    className={fieldClass}
                    maxLength={60}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Tên gói</label>
                  <input
                    value={draft.name}
                    onChange={(event) => setField("name", event.target.value)}
                    className={fieldClass}
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Bộ môn</label>
                  <input
                    value={draft.sport || ""}
                    onChange={(event) => setField("sport", event.target.value)}
                    className={fieldClass}
                    placeholder="Ví dụ: Yoga, Boxing"
                    maxLength={50}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Khu sử dụng</label>
                  <input
                    value={draft.area || ""}
                    onChange={(event) => setField("area", event.target.value)}
                    className={fieldClass}
                    placeholder="Ví dụ: Studio Yoga"
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Hình thức</label>
                  <select
                    value={draft.format}
                    onChange={(event) =>
                      setField("format", event.target.value as SportFormat)
                    }
                    className={fieldClass}
                  >
                    <option value="self">Tự tập</option>
                    <option value="group">Lớp nhóm</option>
                    <option value="coach">Coach 1–1</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Mô tả</label>
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                className={fieldClass}
                rows={2}
                maxLength={240}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isActive}
                disabled={draft.tier === "basic"}
                onChange={(event) => setField("isActive", event.target.checked)}
                className="size-4 accent-blue-600"
              />{" "}
              Đang mở bán
              {draft.tier === "basic" && (
                <span className="text-xs font-normal text-slate-500">
                  (Cơ bản luôn được bật)
                </span>
              )}
            </label>
          </section>
          <section>
            <h3 className="text-sm font-bold text-slate-900">
              Tổng giá theo kỳ hạn
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Nhập tổng giá của từng kỳ, không tự nhân giá tháng.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {periods.map((period) => (
                <label key={period} className={labelClass}>
                  {period} tháng
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={draft.prices[period]}
                    disabled={draft.tier === "basic"}
                    onChange={(event) =>
                      setPrice(period, Number(event.target.value))
                    }
                    className={`${fieldClass} disabled:bg-slate-100`}
                    required
                  />
                </label>
              ))}
            </div>
          </section>
          {isMembership ? (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Quy tắc ưu đãi
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className={labelClass}>
                  Giảm tự tập/lớp nhóm (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.groupDiscountPct}
                    onChange={(event) =>
                      setField("groupDiscountPct", Number(event.target.value))
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Giảm Coach 1–1 (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.coachDiscountPct}
                    onChange={(event) =>
                      setField("coachDiscountPct", Number(event.target.value))
                    }
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Đặt lớp trước (giờ)
                  <input
                    type="number"
                    min={0}
                    value={draft.bookingAdvanceHours}
                    onChange={(event) =>
                      setField(
                        "bookingAdvanceHours",
                        Number(event.target.value),
                      )
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className={labelClass}>
                Điều kiện tủ đồ
                <textarea
                  value={draft.lockerTerms}
                  onChange={(event) =>
                    setField("lockerTerms", event.target.value)
                  }
                  className={fieldClass}
                  rows={2}
                />
              </label>
            </section>
          ) : (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Cấu hình hình thức
              </h3>
              {draft.format === "self" ? (
                <label className={labelClass}>
                  Khung giờ sử dụng
                  <input
                    value={draft.accessHours || ""}
                    onChange={(event) =>
                      setField("accessHours", event.target.value)
                    }
                    className={fieldClass}
                    placeholder="Ví dụ: 06:00–22:00"
                  />
                </label>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className={labelClass}>
                    Buổi mỗi tháng
                    <input
                      type="number"
                      min={1}
                      value={draft.sessionsPerMonth || ""}
                      onChange={(event) =>
                        setField("sessionsPerMonth", Number(event.target.value))
                      }
                      className={fieldClass}
                      required
                    />
                  </label>
                  <label className={labelClass}>
                    Phút mỗi buổi
                    <input
                      type="number"
                      min={1}
                      value={draft.minutesPerSession || ""}
                      onChange={(event) =>
                        setField(
                          "minutesPerSession",
                          Number(event.target.value),
                        )
                      }
                      className={fieldClass}
                      required
                    />
                  </label>
                  {draft.format === "group" ? (
                    <label className={labelClass}>
                      Sĩ số tối đa
                      <input
                        type="number"
                        min={1}
                        value={draft.maxClassSize || ""}
                        onChange={(event) =>
                          setField("maxClassSize", Number(event.target.value))
                        }
                        className={fieldClass}
                        required
                      />
                    </label>
                  ) : (
                    <div>
                      <span className={labelClass}>Sĩ số</span>
                      <p className={`${fieldClass} bg-slate-50`}>
                        Cố định 1 người
                      </p>
                    </div>
                  )}
                </div>
              )}
              <label className={labelClass}>
                Điều kiện sử dụng
                <textarea
                  value={linesToText(draft.terms)}
                  onChange={(event) =>
                    setField("terms", textToLines(event.target.value))
                  }
                  className={fieldClass}
                  rows={3}
                  placeholder="Mỗi điều kiện một dòng"
                  required
                />
              </label>
            </section>
          )}
          {!isMembership && draft.format === "self" && (
            <label className={labelClass}>
              Điều kiện sử dụng
              <textarea
                value={linesToText(draft.terms)}
                onChange={(event) =>
                  setField("terms", textToLines(event.target.value))
                }
                className={fieldClass}
                rows={3}
                placeholder="Mỗi điều kiện một dòng"
                required
              />
            </label>
          )}
          <section className="space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quyền lợi bổ sung
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Mỗi dòng là một quyền lợi. Nội dung mô tả không tự thực thi thay
                cho tính năng hệ thống.
              </p>
            </div>
            <textarea
              value={linesToText(draft.benefits)}
              onChange={(event) =>
                setField("benefits", textToLines(event.target.value))
              }
              className={fieldClass}
              rows={4}
              placeholder="Nhập mỗi quyền lợi trên một dòng"
              required
            />
          </section>
          <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>
              Giá và quyền lợi được chụp lại khi tạo đơn. Chỉnh sửa danh mục chỉ
              áp dụng cho đơn mua mới; ngừng bán không thu hồi gói đã thanh
              toán.
            </span>
          </div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            <Check size={16} />
            {saving ? "Đang lưu..." : "Lưu cấu hình"}
          </button>
        </footer>
      </div>
    </div>
  )
}

export function PackagesWorkspace() {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([])

  const [orders, setOrders] = useState<PackageOrder[]>([])

  const [category, setCategory] = useState<Category | null>(null)

  const [activeTab, setActiveTab] = useState<"catalog" | "orders">("catalog")

  const [draft, setDraft] = useState<PackageDraft | null>(null)

  const [sportFilter, setSportFilter] = useState("all")

  const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all")

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all")

  const [orderSearch, setOrderSearch] = useState("")

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")

  const [notice, setNotice] = useState("")

  const loadData = useCallback(async () => {
    try {
      const [nextCatalog, nextOrders] = await Promise.all([
        PackageAPI.getPackages(),
        PackageAPI.getOrders(),
      ])

      setCatalog(nextCatalog)

      setOrders(nextOrders)

      setError("")
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh mục gói.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const membership = useMemo(
    () => catalog.filter((item) => item.category === "membership"),
    [catalog],
  )

  const sportPackages = useMemo(
    () =>
      catalog.filter(
        (item) =>
          item.category === "sport" &&
          (sportFilter === "all" || item.sport === sportFilter) &&
          (formatFilter === "all" || item.format === formatFilter) &&
          (statusFilter === "all" ||
            (statusFilter === "active" ? item.isActive : !item.isActive)),
      ),
    [catalog, sportFilter, formatFilter, statusFilter],
  )

  const pendingOrders = orders.filter((order) => order.status === "pending")

  const visibleOrders = orders.filter((order) =>
    `${order.userName} ${order.userEmail} ${order.packageSnapshot.name} ${order.id}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase()),
  )

  const edit = (item: CatalogPackage) => {
    setError("")
    setDraft({
      ...item,
      prices: { ...item.prices },
      benefits: [...item.benefits],
      terms: [...item.terms],
    })
  }

  const save = async () => {
    if (!draft) return

    setError("")

    if (
      !draft.name.trim() ||
      !draft.description.trim() ||
      !draft.benefits.length
    ) {
      setError("Vui lòng nhập tên, mô tả và ít nhất một quyền lợi.")
      return
    }

    if (
      periods.some(
        (period) =>
          !Number.isFinite(draft.prices[period]) || draft.prices[period] < 0,
      ) ||
      (draft.tier !== "basic" &&
        periods.some((period) => draft.prices[period] <= 0))
    ) {
      setError(
        "Mỗi kỳ hạn cần có giá hợp lệ; hạng trả phí không được có giá bằng 0.",
      )
      return
    }

    if (
      [draft.groupDiscountPct, draft.coachDiscountPct].some(
        (value) => !Number.isFinite(value) || value < 0 || value > 100,
      )
    ) {
      setError("Tỷ lệ ưu đãi phải nằm trong khoảng 0–100%.")
      return
    }

    if (
      draft.category === "sport" &&
      (!draft.sport?.trim() || !draft.area?.trim() || !draft.format)
    ) {
      setError("Gói môn tập cần có bộ môn, khu sử dụng và hình thức.")
      return
    }

    if (
      draft.category === "sport" &&
      draft.format !== "self" &&
      (!draft.sessionsPerMonth || !draft.minutesPerSession)
    ) {
      setError("Gói có Coach cần có số buổi và thời lượng mỗi buổi.")
      return
    }

    if (draft.category === "sport" && !draft.terms.length) {
      setError("Gói môn tập cần có ít nhất một điều kiện sử dụng.")
      return
    }

    try {
      setSaving(true)

      await PackageAPI.savePackage({
        ...draft,
        name: draft.name.trim(),
        description: draft.description.trim(),
        sport: draft.sport?.trim(),
        area: draft.area?.trim(),
      }, !catalog.some((item) => item.id === draft.id))

      setDraft(null)

      setNotice(
        "Đã lưu cấu hình. Danh mục Member được cập nhật cho các lần mua mới.",
      )

      await loadData()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Không thể lưu cấu hình.",
      )
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item: CatalogPackage) => {
    try {
      setError("")
      await PackageAPI.setPackageActive(item.id, !item.isActive)
      setNotice(
        item.isActive
          ? "Đã ngừng bán gói. Đơn và quyền đã mua vẫn được giữ nguyên."
          : "Đã mở bán gói.",
      )
      await loadData()
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Không thể đổi trạng thái gói.",
      )
    }
  }

  const confirmPayment = async (order: PackageOrder) => {
    if (
      !window.confirm(
        `Xác nhận đã nhận ${money(order.total)} cho đơn ${order.id}? Giao dịch này chỉ được xác nhận một lần.`,
      )
    )
      return

    try {
      setError("")
      await PackageAPI.confirmPayment(order.id)
      setNotice(
        `Đã xác nhận thanh toán đơn ${order.id}; quyền lợi được kích hoạt hoặc xếp lịch theo thời hạn gói.`,
      )
      await loadData()
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Không thể xác nhận thanh toán.",
      )
    }
  }

  if (loading)
    return (
      <div className="p-8 text-sm text-slate-500">Đang tải danh mục gói...</div>
    )

  return (
    <div className="flex min-h-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            CENTER MANAGER · GÓI TẬP
          </span>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {category
              ? category === "membership"
                ? "Quản lý gói thành viên"
                : "Quản lý gói môn tập"
              : "Quản lí gói"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {category
              ? "Cập nhật danh mục, giá và quyền lợi cho các lần mua mới."
              : "Quản lý hạng thành viên, sản phẩm môn tập và đơn chờ thanh toán."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {category && (
            <button
              type="button"
              onClick={() => {
                setCategory(null)
                setActiveTab("catalog")
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-blue-300"
            >
              <ArrowLeft size={16} /> Chọn loại gói
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveTab("orders")
              setCategory(null)
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
              activeTab === "orders"
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <PackageCheck size={16} /> Đơn thanh toán{" "}
            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs text-amber-950">
                {pendingOrders.length}
              </span>
            )}
          </button>
          {category === "sport" && (
            <button
              type="button"
              onClick={() => setDraft(blankPackage("sport"))}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800"
            >
              <Plus size={17} /> Tạo gói môn
            </button>
          )}
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      {activeTab === "orders" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Đơn mua và xác nhận thanh toán
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chỉ xác nhận khi đã nhận tiền; thao tác xác nhận chỉ thực hiện
                một lần.
              </p>
            </div>
            <input
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
              placeholder="Tìm tên, mã đơn, gói..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
            />
          </div>
          {visibleOrders.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              Chưa có đơn phù hợp.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {visibleOrders.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-sm text-slate-900">
                        {order.packageSnapshot.name}
                      </strong>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.status === "pending"
                            ? "bg-amber-50 text-amber-800"
                            : order.status === "paid"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        {order.status === "pending"
                          ? "Chờ thanh toán"
                          : order.status === "paid"
                            ? order.startDate &&
                              new Date(order.startDate) > new Date()
                              ? "Đã thanh toán · Chờ hiệu lực"
                              : "Đã thanh toán"
                            : "Thất bại"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.userName}
                      {order.userEmail && ` · ${order.userEmail}`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.id} · {order.durationMonths} tháng · Tạo{" "}
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                    {order.startDate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Hiệu lực{" "}
                        {new Date(order.startDate).toLocaleDateString("vi-VN")}{" "}
                        – {new Date(order.endDate!).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4 lg:justify-end">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Cần thanh toán</p>
                      <strong className="text-lg text-slate-900">
                        {money(order.total)}
                      </strong>
                      {order.discountPct > 0 && (
                        <p className="text-xs text-emerald-700">
                          Đã giảm {order.discountPct}%
                        </p>
                      )}
                    </div>
                    {order.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => void confirmPayment(order)}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                      >
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
          <button
            type="button"
            onClick={() => setCategory("membership")}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-300 hover:shadow-lg"
          >
            <span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Gói thành viên
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Cấu hình Cơ bản, Plus, Premium, giá theo kỳ hạn và ưu đãi.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-blue-700">
              Quản lý hạng thành viên →
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCategory("sport")}
            className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-300 hover:shadow-lg"
          >
            <span className="inline-flex rounded-xl bg-teal-50 p-3 text-teal-700">
              <Dumbbell size={22} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Gói môn tập
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Quản lý môn, khu tập, hình thức, hạn mức, giá và quyền lợi.
            </p>
            <span className="mt-4 inline-flex text-sm font-semibold text-teal-700">
              Quản lý danh mục môn →
            </span>
          </button>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950 md:col-span-2">
            <strong>Danh mục dùng chung:</strong> thay đổi cấu hình sẽ hiển thị
            ngay cho Member khi mua gói mới. Đơn đã tạo giữ nguyên snapshot về
            giá, quyền lợi và điều kiện.
          </div>
        </section>
      ) : category === "membership" ? (
        <section>
          <div className="mb-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <ShieldCheck size={17} className="mt-0.5 shrink-0" />
            <span>
              Chỉ có ba mã hạng ổn định. Cơ bản miễn phí và không thể ngừng bán;
              thay đổi chỉ ảnh hưởng đơn mới.
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {membership.map((item) => (
              <MembershipCard
                key={item.id}
                item={item}
                onEdit={() => edit(item)}
                onToggle={() => void toggle(item)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Bộ môn
              <select
                value={sportFilter}
                onChange={(event) => setSportFilter(event.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
              >
                <option value="all">Tất cả bộ môn</option>
                {[
                  ...new Set(
                    catalog
                      .filter((item) => item.category === "sport")
                      .map((item) => item.sport)
                      .filter(Boolean),
                  ),
                ].map((sport) => (
                  <option key={sport}>{sport}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Hình thức
              <select
                value={formatFilter}
                onChange={(event) =>
                  setFormatFilter(event.target.value as "all" | SportFormat)
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
              >
                <option value="all">Tất cả hình thức</option>
                {Object.entries(formatLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Trạng thái
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "all" | "active" | "inactive",
                  )
                }
                className="mt-1.5 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-800"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
            </label>
          </div>
          {sportPackages.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {sportPackages.map((item) => (
                <SportCard
                  key={item.id}
                  item={item}
                  onEdit={() => edit(item)}
                  onToggle={() => void toggle(item)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Dumbbell className="mx-auto text-slate-400" size={28} />
              <h2 className="mt-3 font-bold text-slate-800">
                Chưa có gói môn phù hợp
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Điều chỉnh bộ lọc hoặc tạo gói môn mới.
              </p>
            </div>
          )}
        </section>
      )}
      {draft && (
        <PackageEditor
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={() => void save()}
          saving={saving}
        />
      )}
    </div>
  )
}
