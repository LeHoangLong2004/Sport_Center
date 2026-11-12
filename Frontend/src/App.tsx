import React, { useState, useEffect } from "react";
import SiteApp from "./SiteApp";
import CoachPortal from "./pages/CoachPortal";
import PaymentFlow from "./pages/PaymentFlow";
import { ProductPaymentFlow } from "./pages/PaymentFlow/ProductPaymentFlow";
import ReceptionistPortal from "./pages/ReceptionistPortal";
import AdminPortal from "./components/AdminPortal";
import type { CatalogPackage, PackagePeriod } from "./services/packageApi";
import type { ProductOrder } from "./pages/MemberPortal/views/ProductShopPage";
import {
  coachHashes,
  adminHashes,
  paymentHashes,
  receptionistHashes,
  isAdminHash,
  isReceptionistHash,
  isCoachHash,
} from "./utils/routeHashes";

/**
 * Component gốc của ứng dụng (Root Application Component).
 * Lắng nghe URL Hash (`window.location.hash`) để điều hướng giữa các phân hệ:
 * - Landing Page công khai (`SiteApp`)
 * - Cổng thông tin Hội viên & Quản trị viên (`AdminPortal` điều phối MemberPortal / AdminDashboard / Auth)
 * - Cổng thông tin Huấn luyện viên (`CoachPortal`)
 * - Cổng nghiệp vụ Lễ tân quầy tiếp đón (`ReceptionistPortal`)
 * - Luồng thanh toán Checkout trực tuyến (`PaymentFlow` & `ProductPaymentFlow`)
 */
export default function App() {
  const [adminOpen, setAdminOpen] = useState(
    () => isAdminHash(window.location.hash),
  );
  const [coachOpen, setCoachOpen] = useState(
    () => isCoachHash(window.location.hash),
  );
  const [paymentOpen, setPaymentOpen] = useState(
    () => paymentHashes.has(window.location.hash),
  );
  const [receptionistOpen, setReceptionistOpen] = useState(
    () => isReceptionistHash(window.location.hash),
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>();
  const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | undefined>();
  const [selectedDuration, setSelectedDuration] = useState<PackagePeriod | undefined>();
  const [selectedDiscountPct, setSelectedDiscountPct] = useState(0);
  const [selectedProductOrder, setSelectedProductOrder] = useState<ProductOrder | undefined>();

  useEffect(() => {
    if (paymentOpen) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [paymentOpen]);

  useEffect(() => {
    const sync = () => {
      setAdminOpen(isAdminHash(window.location.hash));
      setCoachOpen(isCoachHash(window.location.hash));
      setPaymentOpen(paymentHashes.has(window.location.hash));
      setReceptionistOpen(isReceptionistHash(window.location.hash));
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (receptionistOpen) {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role?.toLowerCase();
    if (!user || (role !== "receptionist" && role !== "admin" && role !== "manager")) {
      const demoRec = {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        fullName: "Nguyễn Văn Lễ Tân",
        role: "Receptionist",
        email: "receptionist01@smartgym.com",
        avatarUrl: null,
      };
      localStorage.setItem("user", JSON.stringify(demoRec));
    }

    return (
      <ReceptionistPortal
        onExit={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.hash = "home";
          setReceptionistOpen(false);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }}
      />
    );
  }

  if (paymentOpen) {
    if (selectedProductOrder) {
      const exitProductPayment = () => {
        setSelectedProductOrder(undefined);
        setPaymentOpen(false);
        window.location.hash = "member-shop";
      };

      return (
        <ProductPaymentFlow
          order={selectedProductOrder}
          onBack={exitProductPayment}
          onCompleted={exitProductPayment}
        />
      );
    }

    return (
      <PaymentFlow
        initialPlan={selectedPackage ? undefined : (selectedPlanId as any)}
        initialPeriod={selectedPackage ? undefined : (selectedPeriod as any)}
        initialPackage={selectedPackage}
        initialDuration={selectedDuration}
        initialDiscountPct={selectedDiscountPct}
        onExit={(dest = "home") => {
          window.location.hash = selectedPackage && dest === "member" ? "member-packages" : dest;
          setPaymentOpen(false);
          setSelectedPlanId(undefined);
          setSelectedPeriod(undefined);
          setSelectedPackage(undefined);
          setSelectedDuration(undefined);
          setSelectedDiscountPct(0);
          setSelectedProductOrder(undefined);
        }}
      />
    );
  }

  if (coachOpen) {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const role = user?.role?.toLowerCase();
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token || !user || (role !== "coach" && role !== "admin" && role !== "manager")) {
      window.location.hash = "login";
      setCoachOpen(false);
      setAdminOpen(true);
      return null;
    }
    return (
      <CoachPortal
        onExit={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.location.hash = "login";
          setCoachOpen(false);
          setAdminOpen(true);
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }}
      />
    );
  }

  if (adminOpen) {
    return (
      <AdminPortal
        onRoleSwitch={(role) => {
          if (role === "coach") {
            setCoachOpen(true);
            setAdminOpen(false);
            setReceptionistOpen(false);
            setPaymentOpen(false);
          } else if (role === "receptionist") {
            setReceptionistOpen(true);
            setCoachOpen(false);
            setAdminOpen(false);
            setPaymentOpen(false);
          } else if (role === "admin") {
            setAdminOpen(true);
            setCoachOpen(false);
            setReceptionistOpen(false);
            setPaymentOpen(false);
          } else {
            setAdminOpen(true);
            setCoachOpen(false);
            setReceptionistOpen(false);
            setPaymentOpen(false);
          }
        }}
        initialStep={
          window.location.hash.startsWith("#dashboard")
            ? "dashboard"
            : window.location.hash === "#admin" || window.location.hash === "#login"
              ? "login"
              : window.location.hash.startsWith("#member") ||
                  [
                    "#classes",
                    "#booking-confirm",
                    "#schedule",
                    "#booking-success",
                    "#workout-detail",
                    "#move-ai",
                    "#ai",
                    "#support",
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
                    : window.location.hash === "#move-ai" ||
                        window.location.hash === "#ai" ||
                        window.location.hash === "#support" ||
                        window.location.hash.startsWith("#member-support")
                      ? "ai"
                      : "overview"
        }
        onMemberCheckout={(selection) => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          setSelectedPlanId(undefined);
          setSelectedPeriod(undefined);
          setSelectedPackage(selection.item);
          setSelectedDuration(selection.duration);
          setSelectedDiscountPct(selection.discountPct);
          setSelectedProductOrder(undefined);
          window.location.hash = "payment";
          setPaymentOpen(true);
        }}
        onMemberProductPayment={(order) => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          setSelectedPlanId(undefined);
          setSelectedPeriod(undefined);
          setSelectedPackage(undefined);
          setSelectedDuration(undefined);
          setSelectedDiscountPct(0);
          setSelectedProductOrder(order);
          window.location.hash = "payment";
          setPaymentOpen(true);
        }}
        onExit={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.hash = "home";
          setAdminOpen(false);
        }}
      />
    );
  }

  return (
    <SiteApp
      onOpenAdmin={() => {
        window.location.hash = "login";
        setAdminOpen(true);
      }}
      onOpenRegister={() => {
        window.location.hash = "register";
        setAdminOpen(true);
      }}
      onOpenPayment={(planId, periodId) => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        setSelectedPlanId(planId);
        setSelectedPeriod(periodId);
        setSelectedPackage(undefined);
        setSelectedDuration(undefined);
        setSelectedDiscountPct(0);
        setSelectedProductOrder(undefined);
        window.location.hash = "payment";
        setPaymentOpen(true);
      }}
    />
  );
}
