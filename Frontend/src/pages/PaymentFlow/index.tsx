import React, { useState } from "react";
import { Screen, BillingPeriod, PaymentMethodId } from "./shared";
import { CheckoutHeader, CheckoutFooter } from "./CheckoutHeader";
import { PackageScreen } from "./PackageScreen";
import { MemberInfoScreen } from "./MemberInfoScreen";
import { PaymentMethodScreen } from "./PaymentMethodScreen";
import { OTPScreen } from "./OTPScreen";
import { ProcessingScreen } from "./ProcessingScreen";
import { SuccessScreen } from "./SuccessScreen";
import { FailedScreen } from "./FailedScreen";
import { InvoiceScreen } from "./InvoiceScreen";
import { MembershipCardScreen } from "./MembershipCardScreen";
import { PackageAPI, CatalogPackage, PackageCheckout, PackagePeriod } from "../../services/packageApi";
import { FlowPackage } from "./shared";
import { toFlowPackage } from "./packageMapper";

export default function PaymentFlow({
  onExit,
  initialPlan,
  initialPeriod,
  initialPackage,
  initialDuration,
  initialDiscountPct = 0,
}: {
  onExit: (dest?: string) => void;
  initialPlan?: string;
  initialPeriod?: string;
  initialPackage?: CatalogPackage;
  initialDuration?: PackagePeriod;
  initialDiscountPct?: number;
}) {
  const [screen, setScreen] = useState<Screen>(initialPackage || initialPlan ? "payment-method" : "package");
  const [period, setPeriod] = useState<BillingPeriod>((initialPeriod as BillingPeriod) || "yearly");
  const [pkg, setPkg] = useState<string>(initialPackage?.id || initialPlan || "");
  const [method, setMethod] = useState<PaymentMethodId>("qr");
  const [allPackages, setAllPackages] = useState<Record<string, FlowPackage>>(() =>
    initialPackage
      ? { [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct, undefined, true) }
      : {},
  );
  const [loading, setLoading] = useState(!initialPackage);
  const [loadError, setLoadError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      fullName: "",
      phone: "",
      email: "",
      dob: "",
      gender: "",
      emergencyContact: "",
      startDate: (() => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${today.getFullYear()}-${month}-${day}`;
      })(),
      branch: "Chi nhánh Quận 1 - Flagship Center"
    };

    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        return {
          ...defaultData,
          fullName: u.fullName || u.name || "",
          phone: u.phoneNumber || u.phone || "",
          email: u.email || "",
          dob: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : (u.dob ? u.dob.split('T')[0] : ""),
          gender: u.gender || "",
          emergencyContact: u.emergencyContact || ""
        };
      }
    } catch {}

    return defaultData;
  });

  // Always fetch latest profile from backend to ensure all fields (phone, etc.) are up to date
  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;
      const u = JSON.parse(userStr);
      if (!u?.id) return;

      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      fetch(`/api/users/${u.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((userData) => {
          if (!userData) return;
          const userPhone = userData.phoneNumber || userData.phone || "";
          setFormData((prev: any) => ({
            ...prev,
            fullName: prev.fullName || userData.fullName || "",
            phone: prev.phone || userPhone,
            email: prev.email || userData.email || "",
            dob: prev.dob || (userData.dateOfBirth ? userData.dateOfBirth.split("T")[0] : ""),
            gender: prev.gender || userData.gender || "",
            emergencyContact: prev.emergencyContact || userData.emergencyContact || "",
          }));

          // Synchronize localStorage
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...u,
              fullName: userData.fullName || u.fullName,
              email: userData.email || u.email,
              phoneNumber: userPhone || u.phoneNumber || u.phone || "",
              phone: userPhone || u.phone || u.phoneNumber || "",
              dateOfBirth: userData.dateOfBirth || u.dateOfBirth || "",
              gender: userData.gender || u.gender || "",
              emergencyContact: userData.emergencyContact || u.emergencyContact || "",
            })
          );
        })
        .catch(() => {});
    } catch {}
  }, []);

  React.useEffect(() => {
    if (initialPackage) {
      setAllPackages({
        [initialPackage.id]: toFlowPackage(initialPackage, initialDuration || 1, initialDiscountPct, undefined, true),
      });
      setPkg(initialPackage.id);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadPackages = async () => {
      setLoading(true);
      try {
        const data = await PackageAPI.getPackages();
        const dict: Record<string, FlowPackage> = {};
        data.filter((item) => item.isActive).forEach((item) => {
          dict[item.id] = toFlowPackage(item, 1, 0);
        });
        if (cancelled) return;
        setAllPackages(dict);
        setPkg((current) => initialPlan && dict[initialPlan] ? initialPlan : current && dict[current] ? current : Object.keys(dict)[0] || "");
        setLoadError("");
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : "Không thể tải danh mục gói.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadPackages();
    return () => { cancelled = true; };
  }, [initialPlan, initialPackage, initialDuration, initialDiscountPct]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">Đang tải dữ liệu...</div>;
  }

  const pkgData = allPackages[pkg] || Object.values(allPackages)[0];

  if (!loading && !pkgData) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8fafc] p-6 text-center">
        <p className="text-sm text-red-700">{loadError || "Không tìm thấy thông tin gói tập."}</p>
        <button type="button" onClick={() => onExit("member")} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
          Quay lại
        </button>
      </div>
    );
  }

  async function goProcessing() {
    setScreen("processing");
    try {
      const duration: PackagePeriod = initialPackage
        ? initialDuration || 1
        : period === "yearly" ? 12 : 1;
      const checkout: PackageCheckout = await PackageAPI.checkout(
        pkgData.id,
        duration,
        method,
        formData.startDate || undefined,
      );
      window.localStorage.setItem("latestInvoiceId", checkout.invoiceId);
      const checkedPackage = toFlowPackage(
        checkout.order.packageSnapshot,
        checkout.order.durationMonths,
        checkout.order.discountPct,
        checkout.order,
      );
      setAllPackages({ [checkout.order.packageId]: checkedPackage });
      setPkg(checkout.order.packageId);
      setPaymentError("");
      setScreen("success");
    } catch (e) {
      console.error(e);
      setPaymentError(e instanceof Error ? e.message : "Thanh toán không thành công.");
      setScreen("failed");
    }
  }

  if (screen === "package") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <PackageScreen
            allPackages={allPackages}
            period={period}
            setPeriod={setPeriod}
            selected={pkg}
            setSelected={setPkg}
            onNext={() => setScreen("payment-method")}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "member-info") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <MemberInfoScreen
            pkg={pkgData}
            period={period}
            formData={formData}
            setFormData={setFormData}
            onNext={() => setScreen("payment-method")}
            onBack={() => {
              if (initialPackage) onExit("member");
              else if (initialPlan) onExit("pricing");
              else setScreen("package");
            }}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "payment-method") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <PaymentMethodScreen
            pkg={pkgData}
            period={period}
            method={method}
            setMethod={setMethod}
            formData={formData}
            setFormData={setFormData}
            onNext={() => {
              if (method === "card") {
                setScreen("otp");
              } else {
                void goProcessing();
              }
            }}
            onBack={() => {
              if (initialPackage) onExit("member");
              else if (initialPlan) onExit("pricing");
              else setScreen("package");
            }}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "otp") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <OTPScreen
            pkg={pkgData}
            period={period}
            formData={formData}
            phone={formData.phone}
            email={formData.email}
            onConfirm={goProcessing}
            onCancel={() => setScreen("failed")}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "processing") {
    return <ProcessingScreen />;
  }
  if (screen === "success") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <SuccessScreen
            pkg={pkgData}
            period={period}
            formData={formData}
            onActivate={() => setScreen("card")}
            onHome={onExit}
            onInvoice={() => setScreen("invoice")}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "failed") {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <CheckoutHeader onExit={() => onExit("member")} />
        <div className="flex-1">
          <FailedScreen
            onRetry={goProcessing}
            onChangeMethod={() => setScreen("payment-method")}
            error={paymentError}
          />
        </div>
        <CheckoutFooter />
      </div>
    );
  }
  if (screen === "invoice") {
    return <InvoiceScreen onBack={() => setScreen("success")} />;
  }
  if (screen === "card") {
    return <MembershipCardScreen onHome={onExit} />;
  }

  return null;
}
