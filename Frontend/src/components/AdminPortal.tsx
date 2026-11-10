import React, { useState, useEffect } from "react";
import MemberPortal from "../pages/MemberPortal";
import AdminDashboard from "../pages/AdminDashboard";
import { Registration } from "./Auth/Registration";
import { Login } from "./Auth/Login";
import { ForgotPassword } from "./Auth/ForgotPassword";
import { Verification } from "./Auth/Verification";
import { ResetPassword } from "./Auth/ResetPassword";
import { MemberPage } from "../pages/MemberPortal/shared";
import type { CheckoutSelection } from "../pages/MemberPortal";
import type { ProductOrder } from "../pages/MemberPortal/views/ProductShopPage";

export interface AdminPortalProps {
  onExit: () => void;
  initialStep?: "register" | "login" | "verify" | "forgotPassword" | "resetPassword" | "member" | "dashboard";
  initialMemberPage?: MemberPage;
  onMemberCheckout?: (selection: CheckoutSelection) => void;
  onMemberProductPayment?: (order: ProductOrder) => void;
  onRoleSwitch?: (role: "admin" | "coach" | "receptionist" | "member") => void;
}

/**
 * Component điều hướng phân hệ Xác thực và Bảng điều khiển quản trị (Auth & Admin Routing Container).
 * Quản lý trạng thái giữa các bước: Đăng ký (Register), Đăng nhập (Login), Quên/Đổi mật khẩu, và điều hướng vào MemberPortal / AdminDashboard.
 */
export function AdminPortal({
  onExit,
  initialStep = "register",
  initialMemberPage = "overview",
  onMemberCheckout,
  onMemberProductPayment,
  onRoleSwitch,
}: AdminPortalProps) {
  const [step, setStep] = useState<
    "register" | "login" | "verify" | "forgotPassword" | "resetPassword" | "member" | "dashboard"
  >(initialStep);
  const [verifyTarget, setVerifyTarget] = useState<"member" | "login">("member");

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h.startsWith("#dashboard")) {
        setStep("dashboard");
      } else if (
        h.startsWith("#member") ||
        [
          "#classes",
          "#booking-confirm",
          "#schedule",
          "#booking-success",
          "#workout-detail",
          "#move-ai",
          "#ai",
          "#support",
        ].includes(h)
      ) {
        setStep("member");
      } else if (h === "#login" || h === "#admin") {
        setStep("login");
      } else if (h === "#register") {
        setStep("register");
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (step === "member") {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role?.toLowerCase();
    if (!user || (role !== "member" && role !== "user" && role !== "customer")) {
      const demoMember = {
        id: "cd431e48-c84b-4b16-815e-971f3387fd83",
        fullName: "H Long",
        phoneNumber: "0987123456",
        role: "Member",
        email: "long@gmail.com",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
      };
      localStorage.setItem("user", JSON.stringify(demoMember));
    }

    return (
      <MemberPortal
        initialPage={initialMemberPage}
        onCheckout={onMemberCheckout}
        onProductPayment={onMemberProductPayment}
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.hash = "login";
          setStep("login");
        }}
      />
    );
  }

  if (step === "dashboard") {
    return (
      <AdminDashboard
        onLogout={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.hash = "login";
          setStep("login");
        }}
      />
    );
  }

  if (step === "register") {
    return (
      <Registration
        onLogin={() => setStep("login")}
        onRegistered={() => {
          setVerifyTarget("member");
          setStep("verify");
        }}
        onHome={onExit}
      />
    );
  }

  if (step === "forgotPassword") {
    return (
      <ForgotPassword
        onLogin={() => setStep("login")}
        onSubmit={() => setStep("resetPassword")}
      />
    );
  }

  if (step === "resetPassword") {
    return <ResetPassword onLogin={() => setStep("login")} />;
  }

  if (step === "verify") {
    return <Verification onVerified={() => setStep(verifyTarget)} />;
  }

  return (
    <Login
      onLogin={() => {
        window.location.hash = "member";
        setStep("member");
        onRoleSwitch?.("member");
      }}
      onLoginAs={(role) => {
        if (role === "admin") {
          window.location.hash = "dashboard";
          setStep("dashboard");
          onRoleSwitch?.("admin");
        } else if (role === "coach") {
          window.location.hash = "coach-portal";
          onRoleSwitch?.("coach");
        } else if (role === "receptionist") {
          window.location.hash = "receptionist";
          onRoleSwitch?.("receptionist");
        } else {
          window.location.hash = "member";
          setStep("member");
          onRoleSwitch?.("member");
        }
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
      onRegister={() => setStep("register")}
      onForgotPassword={() => setStep("forgotPassword")}
      onHome={onExit}
    />
  );
}
export default AdminPortal;

