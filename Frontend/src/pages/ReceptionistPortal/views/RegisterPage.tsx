import React, { useEffect, useMemo, useState } from "react"
import { Crown, Dumbbell, Check } from "lucide-react"
import { DateInput } from "../../../components/DateInput"
import { PackageAPI, CatalogPackage } from "../../../services/packageApi"

type FormState = {
  fullName: string
  phoneNumber: string
  email: string
  password: string
  dateOfBirth: string
  identityNumber: string
  healthNote: string
  paymentMethod: string
}

const initialForm: FormState = {
  fullName: "",
  phoneNumber: "",
  email: "",
  password: "",
  dateOfBirth: "",
  identityNumber: "",
  healthNote: "",
  paymentMethod: "counter",
}

export function RegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [packages, setPackages] = useState<CatalogPackage[]>([])
  const [activeCategory, setActiveCategory] = useState<"membership" | "sport">("membership")
  const [selectedPlan, setSelectedPlan] = useState<string>("membership-basic")
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    PackageAPI.getPackages()
      .then((data) => {
        if (cancelled) return
        const activePackages = Array.isArray(data) ? data.filter((p) => p.isActive) : []
        setPackages(activePackages)
        const defaultPkg = activePackages.find((p) => p.id === "membership-basic") || activePackages[0]
        if (defaultPkg) {
          setSelectedPlan(defaultPkg.id)
          setActiveCategory(defaultPkg.category === "sport" ? "sport" : "membership")
        }
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingPackages(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const membershipPackages = useMemo(
    () => packages.filter((pkg) => pkg.category === "membership"),
    [packages]
  )
  const sportPackages = useMemo(
    () => packages.filter((pkg) => pkg.category === "sport"),
    [packages]
  )

  const displayedPackages = activeCategory === "membership" ? membershipPackages : sportPackages
  const selectedPackage = packages.find((p) => p.id === selectedPlan)
  const selectedPrice = selectedPackage?.prices?.[1] ?? 0

  const handleSelectTab = (category: "membership" | "sport") => {
    setActiveCategory(category)
    const list = category === "membership" ? membershipPackages : sportPackages
    if (list.length > 0 && !list.some((p) => p.id === selectedPlan)) {
      setSelectedPlan(list[0].id)
    }
  }

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitRegistration = async () => {
    setError("")
    setSubmitted(false)

    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.email.trim() || !form.password) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại, email và mật khẩu tạm thời.")
      return
    }
    if (form.password.length < 6) {
      setError("Mật khẩu tạm thời phải có ít nhất 6 ký tự.")
      return
    }
    if (!selectedPlan) {
      setError("Chưa chọn gói tập để đăng ký.")
      return
    }

    setSubmitting(true)
    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phoneNumber: form.phoneNumber.trim(),
          email: form.email.trim(),
          password: form.password,
          roleName: "member",
        }),
      })
      const registerData = await registerResponse.json().catch(() => null)
      if (!registerResponse.ok) {
        const errorMsg = registerData?.message || ""
        if (errorMsg.includes("Email already exists")) {
          throw new Error("Email này đã được sử dụng. Vui lòng nhập email khác.")
        }
        if (errorMsg.includes("Phone number already exists")) {
          throw new Error("Số điện thoại này đã được sử dụng. Vui lòng nhập số điện thoại khác.")
        }
        throw new Error(errorMsg || "Không thể tạo tài khoản hội viên.")
      }

      const subscriptionResponse = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registerData.token}`,
        },
        body: JSON.stringify({
          packageId: selectedPlan,
          billingPeriod: "monthly",
          paymentMethod: selectedPrice === 0 ? "counter" : form.paymentMethod,
        }),
      })
      const subscriptionData = await subscriptionResponse.json().catch(() => null)
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData?.message ?? "Tạo gói đăng ký thất bại.")
      }

      setSubmitted(true)
      setForm(initialForm)
      const defaultPkg = packages.find((p) => p.id === "membership-basic") || packages[0]
      if (defaultPkg) {
        setSelectedPlan(defaultPkg.id)
        setActiveCategory(defaultPkg.category === "sport" ? "sport" : "membership")
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Đăng ký thất bại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        {/* Cột trái: Thông tin cá nhân hội viên */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[28px] rounded-[12px]">
          <span className="font-extrabold text-[#0f172a] text-[18px]">Thông tin cá nhân hội viên</span>
          <form className="flex flex-col gap-[20px] w-full" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
            <Field label="Họ và tên khách hàng *">
              <input
                autoComplete="off"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
              />
            </Field>
            <div className="flex gap-[16px] items-start w-full">
              <Field label="Số điện thoại *">
                <input
                  autoComplete="off"
                  value={form.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                />
              </Field>
              <Field label="Địa chỉ Email *">
                <input
                  type="text"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex gap-[16px] items-start w-full">
              <Field label="Ngày sinh">
                <DateInput value={form.dateOfBirth} onChange={(value) => updateField("dateOfBirth", value)} />
              </Field>
              <Field label="Số CCCD/Passport">
                <input
                  autoComplete="off"
                  value={form.identityNumber}
                  onChange={(e) => updateField("identityNumber", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Mật khẩu tạm thời *">
              <input
                type="text"
                autoComplete="off"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </Field>
            <Field label="Ghi chú y tế / Thể trạng">
              <textarea
                value={form.healthNote}
                onChange={(e) => updateField("healthNote", e.target.value)}
              />
            </Field>
          </form>
        </div>

        {/* Cột phải: Chọn gói tập hội viên (Đồng bộ với Catalog) */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[28px] rounded-[12px] shrink-0 w-[580px]">
          <div className="flex items-center justify-between w-full">
            <span className="font-extrabold text-[#0f172a] text-[18px]">Chọn gói tập hội viên</span>
            <span className="text-[12px] text-[#64748b]">Đồng bộ hệ thống</span>
          </div>

          {/* Phân loại Tab: Hạng hội viên vs Gói bộ môn */}
          <div className="flex bg-[#f1f5f9] p-1 rounded-[10px] w-full gap-1">
            <button
              type="button"
              onClick={() => handleSelectTab("membership")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] font-bold text-[13px] transition-all cursor-pointer ${
                activeCategory === "membership"
                  ? "bg-white text-[#0f172a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Hạng hội viên</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {membershipPackages.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab("sport")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-[8px] font-bold text-[13px] transition-all cursor-pointer ${
                activeCategory === "sport"
                  ? "bg-white text-[#0f172a] shadow-xs"
                  : "text-[#64748b] hover:text-[#0f172a]"
              }`}
            >
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Gói bộ môn</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                {sportPackages.length}
              </span>
            </button>
          </div>

          {loadingPackages && <p className="text-[#64748b] text-[14px]">Đang tải danh mục gói tập...</p>}
          {!loadingPackages && displayedPackages.length === 0 && (
            <p className="text-[#dc2626] text-[14px]">Chưa có gói tập nào đang hoạt động trong danh mục này.</p>
          )}

          {/* Danh sách gói tập */}
          <div className="flex flex-col gap-[10px] items-start w-full max-h-[340px] overflow-y-auto pr-1">
            {displayedPackages.map((pkg) => {
              const active = selectedPlan === pkg.id
              const price = pkg.prices?.[1] ?? 0
              const isFree = price === 0

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPlan(pkg.id)}
                  className={`group flex flex-col gap-2 p-[14px] rounded-[10px] shrink-0 w-full text-left transition-all cursor-pointer ${
                    active
                      ? "bg-emerald-50/70 border-2 border-emerald-600 shadow-xs"
                      : "border border-[#e2e8f0] hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0f172a] text-[14px]">{pkg.name}</span>
                      {pkg.category === "membership" && pkg.tier && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            pkg.tier === "premium"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : pkg.tier === "plus"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {pkg.tier === "premium" ? "VIP" : pkg.tier === "plus" ? "Plus" : "Cơ bản"}
                        </span>
                      )}
                      {pkg.category === "sport" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {pkg.format === "coach" ? "Coach 1-1" : pkg.format === "group" ? "Lớp nhóm" : "Tự tập"}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      {isFree ? (
                        <span className="font-extrabold text-emerald-600 text-[14px]">0đ (Miễn phí)</span>
                      ) : (
                        <span className="font-extrabold text-[#0f172a] text-[14px]">
                          {price.toLocaleString("vi-VN")}đ
                          <span className="text-[11px] font-normal text-[#64748b]">/th</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {pkg.description && (
                    <p className="text-[#64748b] text-[12px] line-clamp-1">{pkg.description}</p>
                  )}
                  {pkg.benefits && pkg.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {pkg.benefits.slice(0, 2).map((benefit, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white/90 border border-slate-200/80 px-2 py-0.5 rounded-md"
                        >
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="truncate max-w-[220px]">{benefit}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Hộp tóm tắt gói đã chọn */}
          {selectedPackage && (
            <div className="w-full p-[14px] rounded-[10px] bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between">
              <div>
                <span className="block text-[11px] text-[#64748b] font-medium uppercase tracking-wider">
                  Gói đăng ký đã chọn
                </span>
                <span className="font-bold text-[#0f172a] text-[14px]">
                  {selectedPackage.name} ({selectedPackage.category === "membership" ? "Hạng hội viên" : "Gói bộ môn"})
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] text-[#64748b] font-medium uppercase tracking-wider">
                  Số tiền cần thu
                </span>
                <span className="font-extrabold text-[16px] text-emerald-600">
                  {selectedPrice === 0 ? "0đ (Miễn phí)" : `${selectedPrice.toLocaleString("vi-VN")}đ`}
                </span>
              </div>
            </div>
          )}

          {/* Phương thức thanh toán */}
          <Field label="Phương thức thanh toán *">
            {selectedPrice === 0 ? (
              <input
                type="text"
                readOnly
                disabled
                value="Miễn phí (Không cần thanh toán)"
                className="bg-[#f1f5f9] text-[#64748b] cursor-not-allowed"
              />
            ) : (
              <select value={form.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)}>
                <option value="counter">Tiền mặt tại quầy</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng (QR)</option>
                <option value="wallet">Ví điện tử</option>
              </select>
            )}
          </Field>

          {error && <p className="text-[#dc2626] text-[14px]">{error}</p>}
          {submitted && <p className="text-emerald-600 text-[14px]">Đã tạo tài khoản và kích hoạt gói đăng ký thành công!</p>}
          <button
            type="button"
            disabled={submitting || loadingPackages || packages.length === 0}
            onClick={submitRegistration}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center p-[14px] rounded-[8px] w-full transition-all cursor-pointer shadow-sm"
          >
            <span className="font-bold text-[15px] text-white">
              {submitting ? "ĐANG XỬ LÝ..." : submitted ? "ĐÃ ĐĂNG KÝ THÀNH CÔNG" : "HOÀN TẤT ĐĂNG KÝ HỘI VIÊN"}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-[8px] items-start min-w-0 w-full">
      <label className="font-semibold text-[#64748b] text-[14px]">{label}</label>
      {React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className:
          "bg-[#f8fafc] border border-[#e2e8f0] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none",
      })}
    </div>
  )
}
