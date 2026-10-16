import React, { useEffect, useState } from "react"
import { DateInput } from "../../../components/DateInput"

type Plan = {
  id: string
  planName: string
  description?: string
  price: number
}

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
  paymentMethod: "bank_transfer",
}

export function RegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState("")
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/api/packages/plans")
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải danh sách gói tập.")
        return (await response.json()) as Plan[]
      })
      .then((data) => {
        if (cancelled) return
        setPlans(Array.isArray(data) ? data : [])
        setSelectedPlan(data[0]?.id ?? "")
      })
      .catch((reason: Error) => {
        if (!cancelled) setError(reason.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitRegistration = async () => {
    setError("")
    setSubmitted(false)

    if (!form.fullName || !form.phoneNumber || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại, email và mật khẩu.")
      return
    }
    if (!selectedPlan) {
      setError("Chưa có gói tập để đăng ký.")
      return
    }

    setSubmitting(true)
    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phoneNumber: form.phoneNumber,
          email: form.email,
          password: form.password,
          roleName: "member",
        }),
      })
      const registerData = await registerResponse.json().catch(() => null)
      if (!registerResponse.ok) {
        throw new Error(registerData?.message ?? "Không thể tạo tài khoản hội viên.")
      }

      const subscriptionResponse = await fetch("/api/subscriptions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registerData.token}`,
        },
        body: JSON.stringify({
          packageId: selectedPlan,
          billingPeriod: "monthly",
          paymentMethod: form.paymentMethod,
        }),
      })
      const subscriptionData = await subscriptionResponse.json().catch(() => null)
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData?.message ?? "Tạo gói đăng ký thất bại.")
      }

      setSubmitted(true)
      setForm(initialForm)
      setSelectedPlan(plans[0]?.id ?? "")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Đăng ký thất bại.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-start p-[32px] w-full">
      <div className="flex gap-[24px] items-start shrink-0 w-full">
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-[20px] items-start min-w-0 p-[28px] rounded-[12px]">
          <span className="font-extrabold text-[#0f172a] text-[18px]">Thông tin cá nhân hội viên</span>
          <Field label="Họ và tên khách hàng *">
            <input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          </Field>
          <div className="flex gap-[16px] items-start w-full">
            <Field label="Số điện thoại *">
              <input value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} />
            </Field>
            <Field label="Địa chỉ Email *">
              <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </Field>
          </div>
          <div className="flex gap-[16px] items-start w-full">
            <Field label="Ngày sinh">
              <DateInput value={form.dateOfBirth} onChange={(value) => updateField("dateOfBirth", value)} />
            </Field>
            <Field label="Số CCCD/Passport">
              <input value={form.identityNumber} onChange={(e) => updateField("identityNumber", e.target.value)} />
            </Field>
          </div>
          <Field label="Mật khẩu tạm thời *">
            <input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          </Field>
          <Field label="Ghi chú y tế / Thể trạng">
            <textarea value={form.healthNote} onChange={(e) => updateField("healthNote", e.target.value)} />
          </Field>
        </div>

        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-[20px] items-start p-[28px] rounded-[12px] shrink-0 w-[580px]">
          <span className="font-extrabold text-[#0f172a] text-[18px]">Chọn gói tập hội viên</span>
          {loadingPlans && <p className="text-[#64748b] text-[14px]">Đang tải gói tập...</p>}
          {!loadingPlans && plans.length === 0 && <p className="text-[#dc2626] text-[14px]">Database chưa có gói tập đang hoạt động.</p>}
          <div className="flex flex-col gap-[10px] items-start w-full">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id
              return (
                <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} className={`flex items-center justify-between p-[14px] rounded-[8px] shrink-0 w-full text-left ${active ? "bg-[#eff6ff] border-[#3b82f6] border-[1.5px]" : "border border-[#e2e8f0]"}`}>
                  <div>
                    <span className="font-bold text-[#0f172a] text-[14px]">{plan.planName}</span>
                    <span className="block text-[#64748b] text-[12px]">{plan.description}</span>
                  </div>
                  <span className="font-extrabold text-[#0f172a] text-[15px]">{Number(plan.price).toLocaleString("vi-VN")}đ</span>
                </button>
              )
            })}
          </div>
          <Field label="Phương thức thanh toán *">
            <select value={form.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)}>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="cash">Tiền mặt tại quầy</option>
              <option value="card">Thẻ qua POS</option>
              <option value="qr">QR Code</option>
              <option value="wallet">Ví điện tử</option>
            </select>
          </Field>
          {error && <p className="text-[#dc2626] text-[14px]">{error}</p>}
          {submitted && <p className="text-[#16a34a] text-[14px]">Đã tạo tài khoản và gói đăng ký trong database.</p>}
          <button type="button" disabled={submitting || loadingPlans || plans.length === 0} onClick={submitRegistration} className="bg-[#3b82f6] disabled:opacity-60 flex items-center justify-center p-[14px] rounded-[8px] w-full">
            <span className="font-bold text-[15px] text-white">{submitting ? "ĐANG XỬ LÝ..." : submitted ? "ĐÃ ĐĂNG KÝ THÀNH CÔNG" : "HOÀN TẤT ĐĂNG KÝ HỘI VIÊN"}</span>
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
        className: "bg-[#f8fafc] border border-[#e2e8f0] p-[12px] rounded-[8px] text-[#0f172a] text-[14px] w-full outline-none",
      })}
    </div>
  )
}
