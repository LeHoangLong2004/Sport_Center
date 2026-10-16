import React, { useState, useEffect } from "react";
import SiteApp from "./SiteApp";
import MemberPortal from "./pages/MemberPortal";
import CoachPortal from "./pages/CoachPortal";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentFlow from "./pages/PaymentFlow";
import { ProductPaymentFlow } from "./pages/PaymentFlow/ProductPaymentFlow";
import ReceptionistPortal from "./pages/ReceptionistPortal";
import type { CatalogPackage, PackagePeriod } from "./services/packageApi";
import type { CheckoutSelection } from "./pages/MemberPortal";
import type { ProductOrder } from "./pages/MemberPortal/views/ProductShopPage";

import { Registration } from "./components/Auth/Registration";
import { Login } from "./components/Auth/Login";
import { ForgotPassword } from "./components/Auth/ForgotPassword";
import { Verification } from "./components/Auth/Verification";
import { MemberPage } from "./pages/MemberPortal/shared";

function AdminPortal({
  onExit,
  initialStep = "register",
  initialMemberPage = "overview",
  onMemberCheckout,
  onMemberProductPayment,
}: {
  onExit: () => void
  initialStep?: "register" | "login" | "verify" | "forgotPassword" | "member" | "dashboard"
  initialMemberPage?: MemberPage
  onMemberCheckout?: (selection: CheckoutSelection) => void
  onMemberProductPayment?: (order: ProductOrder) => void
}) {
  const [step, setStep] = useState<
    "register" | "login" | "verify" | "forgotPassword" | "member" | "dashboard"
  >(initialStep)
  const [verifyTarget, setVerifyTarget] = useState<"member" | "login">("member")

  if (step === "member") {
    return (
      <MemberPortal
        initialPage={initialMemberPage}
        onCheckout={onMemberCheckout}
        onProductPayment={onMemberProductPayment}
      />
    )
  }

  if (step === "dashboard") {
    return <AdminDashboard onLogout={onExit} />
  }

  if (step === "register") {
    return (
      <Registration
        onLogin={() => setStep("login")}
        onRegistered={() => {
          setVerifyTarget("member")
          setStep("verify")
        }}
        onHome={onExit}
      />
    )
  }

  if (step === "forgotPassword") {
    return (
      <ForgotPassword
        onLogin={() => setStep("login")}
        onSubmit={() => {
          setVerifyTarget("login")
          setStep("verify")
        }}
      />
    )
  }

  if (step === "verify") {
    return (
      <Verification onVerified={() => setStep(verifyTarget)} />
    )
  }

  return (
    <Login
      onLogin={() => {
        window.location.hash = "member"
        setStep("member")
      }}
      onLoginAs={(role) => {
        if (role === "admin") {
          window.location.hash = "dashboard"
          setStep("dashboard")
        } else if (role === "coach") {
          window.location.hash = "coach-portal"
          window.location.reload()
        } else if (role === "receptionist") {
          window.location.hash = "receptionist"
          window.location.reload()
        } else {
          window.location.hash = "member"
          setStep("member")
        }
      }}
      onRegister={() => setStep("register")}
      onForgotPassword={() => setStep("forgotPassword")}
      onHome={onExit}
    />
  )
}

const coachHashes = new Set([
  "#coach-portal",
  "#coach-dashboard",
  "#coach-schedule",
  "#coach-class-detail",
  "#coach-attendance",
  "#coach-members",
  "#coach-member-profile",
  "#coach-curriculum",
  "#coach-assessment",
  "#coach-notifications",
  "#coach-profile",
  "#coach-settings",
  "#coach-ai",
  "#coach-chat",
  "#coach-reviews",
])

const adminHashes = new Set([
  "#admin",
  "#login",
  "#dashboard",
  "#register",
  "#member",
  "#classes",
  "#booking-confirm",
  "#schedule",
  "#booking-success",
  "#workout-detail",
  "#move-ai",
])

const paymentHashes = new Set(["#payment"])
const receptionistHashes = new Set(["#receptionist"])

function isAdminHash(hash: string) {
  return hash.startsWith("#member") || adminHashes.has(hash)
}

function isCoachHash(hash: string) {
  return hash.startsWith("#coach") || coachHashes.has(hash)
}

export default function App() {
  const [adminOpen, setAdminOpen] = useState(
    () => isAdminHash(window.location.hash),
  )
  const [coachOpen, setCoachOpen] = useState(
    () => isCoachHash(window.location.hash),
  )
  const [paymentOpen, setPaymentOpen] = useState(
    () => paymentHashes.has(window.location.hash),
  )
  const [receptionistOpen, setReceptionistOpen] = useState(
    () => receptionistHashes.has(window.location.hash),
  )
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>()
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>()
  const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | undefined>()
  const [selectedDuration, setSelectedDuration] = useState<PackagePeriod | undefined>()
  const [selectedDiscountPct, setSelectedDiscountPct] = useState(0)
  const [selectedProductOrder, setSelectedProductOrder] = useState<ProductOrder | undefined>()

  useEffect(() => {
    if (paymentOpen && !selectedPlanId && !selectedPackage && !selectedProductOrder) {
      window.location.hash = "pricing";
    }
  }, [paymentOpen, selectedPlanId, selectedPackage, selectedProductOrder]);

  useEffect(() => {
    const sync = () => {
      setAdminOpen(isAdminHash(window.location.hash))
      setCoachOpen(isCoachHash(window.location.hash))
      setPaymentOpen(paymentHashes.has(window.location.hash))
      setReceptionistOpen(receptionistHashes.has(window.location.hash))
    }
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [])

  if (receptionistOpen) {
    return (
      <ReceptionistPortal
        onExit={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.hash = "home"
          setReceptionistOpen(false)
        }}
      />
    )
  }

  if (paymentOpen) {
    if (!selectedPlanId && !selectedPackage && !selectedProductOrder) {
      return null;
    }

    if (selectedProductOrder) {
      const exitProductPayment = () => {
        setSelectedProductOrder(undefined)
        setPaymentOpen(false)
        window.location.hash = "member-shop"
      }

      return (
        <ProductPaymentFlow
          order={selectedProductOrder}
          onBack={exitProductPayment}
          onCompleted={exitProductPayment}
        />
      )
    }

    return (
      <PaymentFlow
        initialPlan={selectedPackage ? undefined : selectedPlanId as any}
        initialPeriod={selectedPackage ? undefined : selectedPeriod as any}
        initialPackage={selectedPackage}
        initialDuration={selectedDuration}
        initialDiscountPct={selectedDiscountPct}
        onExit={(dest = "home") => {
          window.location.hash = selectedPackage && dest === "member"
            ? "member-packages"
            : dest
          setPaymentOpen(false)
          setSelectedPlanId(undefined)
          setSelectedPeriod(undefined)
          setSelectedPackage(undefined)
          setSelectedDuration(undefined)
          setSelectedDiscountPct(0)
          setSelectedProductOrder(undefined)
        }}
      />
    )
  }

  if (coachOpen) {
    return <CoachPortal />
  }

  if (adminOpen) {
    return (
      <AdminPortal
        initialStep={
          window.location.hash === "#dashboard"
            ? "dashboard"
            : (window.location.hash === "#admin" || window.location.hash === "#login")
              ? "login"
              : (
                window.location.hash.startsWith("#member") ||
                [
                  "#classes",
                  "#booking-confirm",
                  "#schedule",
                  "#booking-success",
                  "#workout-detail",
                  "#move-ai",
                ].includes(window.location.hash)
              )
                ? "member"
                : "register"
        }
        initialMemberPage={
          window.location.hash === "#classes"
            ? "classes"
            : window.location.hash === "#booking-confirm"
              ? "confirm"
              : window.location.hash === "#schedule"
                ? "schedule"
                : window.location.hash === "#booking-success"
                  ? "success"
                  : window.location.hash === "#workout-detail"
                    ? "workout"
                    : window.location.hash === "#move-ai"
                      ? "ai"
                      : "overview"
        }
        onMemberCheckout={(selection) => {
          setSelectedPlanId(undefined)
          setSelectedPeriod(undefined)
          setSelectedPackage(selection.item)
          setSelectedDuration(selection.duration)
          setSelectedDiscountPct(selection.discountPct)
          setSelectedProductOrder(undefined)
          window.location.hash = "payment"
          setPaymentOpen(true)
        }}
        onMemberProductPayment={(order) => {
          setSelectedPlanId(undefined)
          setSelectedPeriod(undefined)
          setSelectedPackage(undefined)
          setSelectedDuration(undefined)
          setSelectedDiscountPct(0)
          setSelectedProductOrder(order)
          window.location.hash = "payment"
          setPaymentOpen(true)
        }}
        onExit={() => {
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          window.location.hash = "home"
          setAdminOpen(false)
        }}
      />
    )
  }

  return (
    <SiteApp
      onOpenAdmin={() => {
        window.location.hash = "login"
        setAdminOpen(true)
      }}
      onOpenRegister={() => {
        window.location.hash = "register"
        setAdminOpen(true)
      }}
      onOpenPayment={(planId, periodId) => {
        setSelectedPlanId(planId)
        setSelectedPeriod(periodId)
        setSelectedPackage(undefined)
        setSelectedDuration(undefined)
        setSelectedDiscountPct(0)
        setSelectedProductOrder(undefined)
        window.location.hash = "payment"
        setPaymentOpen(true)
      }}
    />
  )
}
