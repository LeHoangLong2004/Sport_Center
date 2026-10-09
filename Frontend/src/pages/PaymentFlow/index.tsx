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

const PAYMENT_METHOD_IDS: Record<PaymentMethodId, number> = {
  qr: 0,
  card: 1,
  wallet: 2,
  counter: 3,
};

export default function PaymentFlow({ onExit, initialPlan, initialPeriod }: { onExit: (dest?: string) => void; initialPlan?: string; initialPeriod?: string }) {
  const [screen, setScreen] = useState<Screen>(initialPlan ? "member-info" : "package")
  const [period, setPeriod] = useState<BillingPeriod>((initialPeriod as BillingPeriod) || "yearly")
  const [pkg, setPkg] = useState<string>(initialPlan || "")
  const [method, setMethod] = useState<PaymentMethodId>("qr")
  const [allPackages, setAllPackages] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullName: "",
      phone: "",
      email: "",
      dob: "",
      gender: "Nữ",
      emergencyContact: "",
      startDate: new Date().toISOString().split('T')[0],
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
    fetch("/api/packages")
      .then(res => res.json())
      .then(data => {
        const dict: Record<string, any> = {};
        data.forEach((p: any) => {
          dict[p.id] = {
            id: p.id,
            name: p.name,
            tagline: p.packageType === "membership" ? "Gói Thành Viên" : "Gói Tập",
            monthly: p.monthlyPrice,
            yearly: p.yearlyPrice || (p.monthlyPrice * 10),
            features: p.features?.map((f: any) => typeof f === 'string' ? f : f.featureText || "") || []
          };
        });
        setAllPackages(dict);
        if (!initialPlan && data.length > 0) {
          setPkg(data[0].id);
        } else if (initialPlan && !dict[initialPlan] && data.length > 0) {
          setPkg(data[0].id);
        } else if (initialPlan && dict[initialPlan]) {
          setPkg(initialPlan);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [initialPlan]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">Đang tải dữ liệu...</div>;
  }

  const pkgData = allPackages[pkg] || Object.values(allPackages)[0];

  async function goProcessing() {
    setScreen("processing");
    try {
      const storedUser = window.localStorage.getItem("user");
      const userId = storedUser ? JSON.parse(storedUser)?.id : null;
      if (!userId) {
        setScreen("failed");
        return;
      }

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

      if (!createRes.ok) throw new Error("Create failed");
      const { invoiceId } = await createRes.json();

      // Thanh toán tiền mặt tại quầy: ghi nhận thu tiền rồi hoàn tất hóa đơn.
      const processUrl = method === "counter"
        ? `/api/payments/${invoiceId}/record-cash`
        : `/api/payments/${invoiceId}/process`;

      const processRes = await fetch(processUrl, { method: "POST" });

      if (!processRes.ok) throw new Error("Process failed");

      window.localStorage.setItem("latestInvoiceId", invoiceId);

      setScreen("success");
    } catch (e) {
      console.error(e);
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
              if (initialPlan) onExit("pricing")
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

