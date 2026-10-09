import React, { useState, useEffect } from "react";
import SiteApp from "./SiteApp";
import MemberPortal from "./pages/MemberPortal";
import CoachPortal from "./pages/CoachPortal";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentFlow from "./pages/PaymentFlow";
import ReceptionistPortal from "./pages/ReceptionistPortal";

import { Registration } from "./components/Auth/Registration";
import { Login } from "./components/Auth/Login";
import { ForgotPassword } from "./components/Auth/ForgotPassword";
import { Verification } from "./components/Auth/Verification";
import { MemberPage } from "./pages/MemberPortal/shared";

function AdminPortal({
  onExit,
  initialStep = "register",
  initialMemberPage = "overview",
}: {
  onExit: () => void
  initialStep?: "register" | "login" | "verify" | "forgotPassword" | "member" | "dashboard"
  initialMemberPage?: MemberPage
}) {
  const [step, setStep] = useState<
    "register" | "login" | "verify" | "forgotPassword" | "member" | "dashboard"
  >(initialStep)
  const [verifyTarget, setVerifyTarget] = useState<"member" | "login">("member")

  if (step === "member") {
    return <MemberPortal initialPage={initialMemberPage} />
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
        }
        else if (role === "coach") {
          window.location.hash = "coach-portal"
        } else if (role === "receptionist") {
          window.location.hash = "receptionist"
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
  return adminHashes.has(hash)
}

function isCoachHash(hash: string) {
  return coachHashes.has(hash)
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

  useEffect(() => {
    if (paymentOpen && !selectedPlanId) {
      window.location.hash = "pricing";
    }
  }, [paymentOpen, selectedPlanId]);

  if (paymentOpen) {
    if (!selectedPlanId) {
      return null;
    }

    return (
      <PaymentFlow
        initialPlan={selectedPlanId as any}
        initialPeriod={selectedPeriod as any}
        onExit={(dest = "home") => {
          window.location.hash = dest
          setPaymentOpen(false)
          setSelectedPlanId(undefined)
          setSelectedPeriod(undefined)
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
              : [
                "#member",
                "#classes",
                "#booking-confirm",
                "#schedule",
                "#booking-success",
                "#workout-detail",
                "#move-ai",
              ].includes(window.location.hash)
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
        window.location.hash = "payment"
        setPaymentOpen(true)
      }}
    />
  )
}
