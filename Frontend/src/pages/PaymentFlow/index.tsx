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

export default function PaymentFlow({ onExit, initialPlan }: { onExit: () => void; initialPlan?: PackageId }) {
  const [screen, setScreen] = useState<Screen>(initialPlan ? "member-info" : "package")
  const [period, setPeriod] = useState<BillingPeriod>("yearly")
  const [pkg, setPkg] = useState<PackageId>(initialPlan || "fitness")
  const [method, setMethod] = useState<PaymentMethodId>("qr")

  function goProcessing() {
    setScreen("processing")
    window.setTimeout(() => setScreen("success"), 2200)
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
