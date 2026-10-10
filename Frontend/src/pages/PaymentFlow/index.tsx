import React, { useState } from "react";
import { Screen, BillingPeriod, PaymentMethodId } from "./shared";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
import { PackageScreen } from "./PackageScreen";
import { MemberInfoScreen } from "./MemberInfoScreen";
import { PaymentMethodScreen } from "./PaymentMethodScreen";
import { OTPScreen } from "./OTPScreen";
import { ProcessingScreen } from "./ProcessingScreen";
import { SuccessScreen } from "./SuccessScreen";
import { FailedScreen } from "./FailedScreen";
import { InvoiceScreen } from "./InvoiceScreen";
import { MembershipCardScreen } from "./MembershipCardScreen";
import { PackageAPI, CatalogPackage, PackageCheckout, PackageOrder, PackagePaymentMethod, PackagePeriod } from "../../services/packageApi";
import { FlowPackage } from "./shared";

const PAYMENT_METHOD_IDS: Record<PaymentMethodId, number> = {
  qr: 0,
  card: 1,
  wallet: 2,
  counter: 3,
};

function toFlowPackage(
  item: CatalogPackage,
  duration: PackagePeriod,
  discountPct: number,
  order?: PackageOrder,
): FlowPackage {
  const listPrice = order?.subtotal ?? item.prices[duration]
  const discount = order?.discountAmount ?? Math.round((listPrice * discountPct) / 100)
  const details = [
    { label: "Loại gói", value: item.category === "membership" ? "Gói thành viên" : "Gói môn tập" },
    { label: "Thời hạn", value: `${order?.durationMonths ?? duration} tháng` },
    ...(item.tier ? [{ label: "Hạng", value: item.tier }] : []),
    ...(item.sport ? [{ label: "Môn tập", value: item.sport }] : []),
    ...(item.area ? [{ label: "Khu vực", value: item.area }] : []),
    ...(item.format ? [{ label: "Hình thức", value: ({ self: "Tự tập", group: "Lớp nhóm", coach: "Coach 1–1" } as const)[item.format] }] : []),
    ...(item.sessionsPerMonth ? [{ label: "Số buổi", value: `${item.sessionsPerMonth} buổi/tháng` }] : []),
    ...(item.minutesPerSession ? [{ label: "Thời lượng", value: `${item.minutesPerSession} phút/buổi` }] : []),
    ...(item.maxClassSize ? [{ label: "Sĩ số tối đa", value: `${item.maxClassSize} người` }] : []),
    ...(item.accessHours ? [{ label: "Khung giờ", value: item.accessHours }] : []),
    ...(item.bookingAdvanceHours ? [{ label: "Đặt lớp trước", value: `${item.bookingAdvanceHours} giờ` }] : []),
    ...(item.lockerTerms ? [{ label: "Điều kiện tủ đồ", value: item.lockerTerms }] : []),
    ...(order?.startDate ? [{ label: "Ngày bắt đầu", value: new Date(order.startDate).toLocaleDateString("vi-VN") }] : []),
    ...(order?.endDate ? [{ label: "Ngày kết thúc", value: new Date(order.endDate).toLocaleDateString("vi-VN") }] : []),
  ]

  return {
    id: item.id,
    category: item.category,
    name: item.name,
    tagline: item.category === "membership"
      ? `Gói thành viên${item.tier ? ` · ${item.tier}` : ""}`
      : `Gói môn tập${item.sport ? ` · ${item.sport}` : ""}`,
    monthly: order?.total ?? listPrice - discount,
    yearly: order?.total ?? listPrice - discount,
    features: item.benefits,
    description: item.description,
    details,
    terms: item.terms,
    orderId: order?.id,
    startDate: order?.startDate,
    checkoutTotal: order?.total ?? listPrice - discount,
    checkoutListPrice: listPrice,
    checkoutDiscount: discount,
    periodLabel: `${order?.durationMonths ?? duration} tháng`,
  }
}

export default function PaymentFlow({
  onExit,
  initialPlan,
  initialPeriod,
  initialPackage,
  initialDuration,
  initialDiscountPct = 0,
}: {
  onExit: (dest?: string) => void
  initialPlan?: string
  initialPeriod?: string
  initialPackage?: CatalogPackage
  initialDuration?: PackagePeriod
  initialDiscountPct?: number
}) {
  const [screen, setScreen] = useState<Screen>(initialPackage || initialPlan ? "member-info" : "package")
  const [period, setPeriod] = useState<BillingPeriod>((initialPeriod as BillingPeriod) || "yearly")
  const [pkg, setPkg] = useState<string>(initialPackage?.id || initialPlan || "")
  const [method, setMethod] = useState<PaymentMethodId>("qr")
  const [allPackages, setAllPackages] = useState<Record<string, FlowPackage>>(() =>
    initialPackage
      ? { [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct) }
      : {},
  )
  const [loading, setLoading] = useState(!initialPackage)
  const [loadError, setLoadError] = useState("")
  const [paymentError, setPaymentError] = useState("")

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullName: "",
      phone: "",
      email: "",
      dob: "",
      gender: "Nữ",
      emergencyContact: "",
      startDate: (() => {
        const today = new Date()
        const month = String(today.getMonth() + 1).padStart(2, "0")
        const day = String(today.getDate()).padStart(2, "0")
        return `${today.getFullYear()}-${month}-${day}`
      })(),
      branch: "Chi nhánh Quận 1 - Flagship Center"
    };

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return {
          ...defaultData,
          fullName: u.fullName || "",
          phone: u.phoneNumber || "",
          email: u.email || "",
          dob: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : "",
          gender: u.gender || "Nữ"
        };
      }
    } catch (e) {}

    return defaultData;
  });

  React.useEffect(() => {
    if (initialPackage) {
      setAllPackages({
        [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct),
      })
      setPkg(initialPackage.id)
      setLoading(false)
      return
    }

    let cancelled = false
    const loadPackages = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/packages")
        if (!response.ok) throw new Error(`Không tải được danh mục gói (${response.status}).`)
        const data = await response.json()
        const dict: Record<string, FlowPackage> = {}
        data.forEach((item: any) => {
          const monthly = Number(item.monthlyPrice || 0)
          dict[item.id] = {
            id: item.id,
            name: item.name,
            tagline: item.packageType === "membership" ? "Gói thành viên" : "Gói tập",
            monthly,
            yearly: Number(item.yearlyPrice || monthly * 10),
            features: item.features?.map((feature: any) => typeof feature === "string" ? feature : feature.featureText || "") || [],
          }
        })
        if (cancelled) return
        setAllPackages(dict)
        setPkg((current) => initialPlan && dict[initialPlan] ? initialPlan : current && dict[current] ? current : Object.keys(dict)[0] || "")
        setLoadError("")
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Không thể tải danh mục gói.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPackages()
    return () => { cancelled = true }
  }, [initialPlan, initialPackage, initialDuration, initialDiscountPct])

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">Đang tải dữ liệu...</div>;
  }

  const pkgData = allPackages[pkg] || Object.values(allPackages)[0]

  if (!loading && !pkgData) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc] p-6 text-center">
        <p className="text-sm text-red-700">{loadError || "Không tìm thấy thông tin gói tập."}</p>
        <button type="button" onClick={() => onExit("member")} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
          Quay lại
        </button>
      </div>
    )
  }

  async function goProcessing() {
    setScreen("processing");
    try {
      if (initialPackage) {
        const checkout: PackageCheckout = await PackageAPI.checkout(
          initialPackage.id,
          initialDuration || 1,
          method as PackagePaymentMethod,
          formData.startDate || undefined,
        )
        window.localStorage.setItem("latestInvoiceId", checkout.invoiceId)
        setAllPackages({
          [checkout.order.packageId]: toFlowPackage(
            checkout.order.packageSnapshot,
            checkout.order.durationMonths,
            checkout.order.discountPct,
            checkout.order,
          ),
        })
        setPkg(checkout.order.packageId)
        setPaymentError("")
        setScreen("success")
        return
      }

      const storedUser = window.localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser)?.id : null;
      if (!userId) throw new Error("Không xác định được tài khoản hội viên. Vui lòng đăng nhập lại.")

      const createRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          packageId: pkg,
          amount: period === "yearly" ? pkgData.yearly : pkgData.monthly,
          paymentMethod: PAYMENT_METHOD_IDS[method],
          billingPeriod: period,
          autoRenew: false,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        })
      });

      if (!createRes.ok) throw new Error("Không thể tạo hóa đơn thanh toán.")
      const { invoiceId } = await createRes.json();

      // Thanh toán tiền mặt tại quầy: ghi nhận thu tiền rồi hoàn tất hóa đơn.
      const processUrl = method === "counter"
        ? `/api/payments/${invoiceId}/record-cash`
        : `/api/payments/${invoiceId}/process`;

      const processRes = await fetch(processUrl, { method: "POST" });

      if (!processRes.ok) throw new Error("Không thể xử lý thanh toán.")

      window.localStorage.setItem("latestInvoiceId", invoiceId);

      setScreen("success");
    } catch (e) {
      console.error(e);
      setPaymentError(e instanceof Error ? e.message : "Thanh toán không thành công.")
      setScreen("failed");
    }
  }

  if (screen === "package") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <PackageScreen
            allPackages={allPackages}
            period={period}
            setPeriod={setPeriod}
            selected={pkg}
            setSelected={setPkg}
            onNext={() => setScreen("member-info")}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "member-info") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <MemberInfoScreen
            pkg={pkgData}
            period={period}
            formData={formData}
            setFormData={setFormData}
            onNext={() => setScreen("payment-method")}
            onBack={() => {
              if (initialPackage) onExit("member")
              else if (initialPlan) onExit("pricing")
              else setScreen("package")
            }}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "payment-method") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <PaymentMethodScreen
            pkg={pkgData}
            period={period}
            method={method}
            setMethod={setMethod}
            formData={formData}
            onNext={goProcessing}
            onBack={() => setScreen("member-info")}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "otp") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <OTPScreen
            pkg={pkgData}
            period={period}
            onConfirm={goProcessing}
            onCancel={() => setScreen("failed")}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "processing") {
    return <ProcessingScreen />
  }
  if (screen === "success") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <SuccessScreen
            pkg={pkgData}
            period={period}
            formData={formData}
            onActivate={() => setScreen("card")}
            onHome={onExit}
            onInvoice={() => setScreen("invoice")}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "failed") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <SiteHeader currentRoute="pricing" forceSolidDark={true} />
        <div className="flex-1 pt-[72px]">
          <FailedScreen
            onRetry={goProcessing}
            onChangeMethod={() => setScreen("payment-method")}
            error={paymentError}
          />
        </div>
        <SiteFooter />
      </div>
    )
  }
  if (screen === "invoice") {
    return <InvoiceScreen onBack={() => setScreen("success")} />
  }
  if (screen === "card") {
    return <MembershipCardScreen onHome={onExit} />
  }

  return null
}
