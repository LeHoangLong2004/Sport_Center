import React, { useState } from "react";
import { Screen, BillingPeriod, PackageId, PaymentMethodId } from "./shared";
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

export default function PaymentFlow({ onExit, initialPlan }: { onExit: () => void; initialPlan?: PackageId }) {
  const [screen, setScreen] = useState<Screen>(initialPlan ? "member-info" : "package")
  const [period, setPeriod] = useState<BillingPeriod>("yearly")
  const [pkg, setPkg] = useState<PackageId>(initialPlan || "fitness")
  const [method, setMethod] = useState<PaymentMethodId>("qr")

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
          userId,
          packageId: pkg,
          amount: period === "yearly" ? 5000000 : 500000,
          paymentMethod: PAYMENT_METHOD_IDS[method],
          billingPeriod: period,
          autoRenew: false,
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
      <PackageScreen
        period={period}
        setPeriod={setPeriod}
        selected={pkg}
        setSelected={setPkg}
        onNext={() => setScreen("member-info")}
      />
    )
  }
  if (screen === "member-info") {
    return (
      <MemberInfoScreen
        pkg={pkg}
        period={period}
        onNext={() => setScreen("payment-method")}
        onBack={() => setScreen("package")}
      />
    )
  }
  if (screen === "payment-method") {
    return (
      <PaymentMethodScreen
        pkg={pkg}
        period={period}
        method={method}
        setMethod={setMethod}
        onNext={() => setScreen("otp")}
        onBack={() => setScreen("member-info")}
      />
    )
  }
  if (screen === "otp") {
    return (
      <OTPScreen
        pkg={pkg}
        period={period}
        onConfirm={goProcessing}
        onCancel={() => setScreen("failed")}
      />
    )
  }
  if (screen === "processing") {
    return <ProcessingScreen />
  }
  if (screen === "success") {
    return (
      <SuccessScreen
        onActivate={() => setScreen("card")}
        onHome={onExit}
        onInvoice={() => setScreen("invoice")}
      />
    )
  }
  if (screen === "failed") {
    return (
      <FailedScreen
        onRetry={() => setScreen("otp")}
        onChangeMethod={() => setScreen("payment-method")}
      />
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
