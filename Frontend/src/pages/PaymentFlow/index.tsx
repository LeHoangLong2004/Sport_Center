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
import { PackageAPI, CatalogPackage, PackageCheckout, PackageOrder, PackagePeriod } from "../../services/packageApi";
import { FlowPackage } from "./shared";

function toFlowPackage(
  item: CatalogPackage,
  duration: PackagePeriod,
  discountPct: number,
  order?: PackageOrder,
  selectionQuote = false,
): FlowPackage {
  const listPrice = item.prices[duration]
  const discount = Math.round((listPrice * discountPct) / 100)
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
    monthly: order?.total ?? item.prices[1],
    yearly: order?.total ?? item.prices[12],
    features: item.benefits,
    description: item.description,
    details,
    terms: item.terms,
    orderId: order?.id,
    orderStatus: order?.status,
    startDate: order?.startDate,
    checkoutTotal: order?.total ?? (selectionQuote ? listPrice - discount : undefined),
    checkoutListPrice: order?.subtotal ?? (selectionQuote ? listPrice : undefined),
    checkoutDiscount: order?.discountAmount ?? (selectionQuote ? discount : undefined),
    periodLabel: order ? `${order.durationMonths} tháng` : selectionQuote ? `${duration} tháng` : undefined,
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
      ? { [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct, undefined, true) }
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
        [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct, undefined, true),
      })
      setPkg(initialPackage.id)
      setLoading(false)
      return
    }

    let cancelled = false
    const loadPackages = async () => {
      setLoading(true)
      try {
        const data = await PackageAPI.getPackages()
        const dict: Record<string, FlowPackage> = {}
        data.filter((item) => item.isActive).forEach((item) => {
          dict[item.id] = toFlowPackage(item, 1, 0)
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
      const duration: PackagePeriod = initialPackage
        ? initialDuration || 1
        : period === "yearly" ? 12 : 1
      const checkout: PackageCheckout = await PackageAPI.checkout(
        pkgData.id,
        duration,
        method,
        formData.startDate || undefined,
      )
      window.localStorage.setItem("latestInvoiceId", checkout.invoiceId)
      const checkedPackage = toFlowPackage(
        checkout.order.packageSnapshot,
        checkout.order.durationMonths,
        checkout.order.discountPct,
        checkout.order,
      )
      setAllPackages({ [checkout.order.packageId]: checkedPackage })
      setPkg(checkout.order.packageId)
      setPaymentError("")
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
            onNext={() => setScreen("otp")}
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
