import { useState, useEffect, type ReactNode } from "react";
import type { MemberScreen } from "./types";
import MemberShellModern from "./components/MemberShellModern";
import MemberDashboard from "./views/MemberDashboard";
import MemberBooking from "./views/MemberBooking";
import MemberSchedule from "./views/MemberSchedule";
import MemberPackages from "./views/MemberPackages";
import MemberPayments from "./views/MemberPayments";
import MemberWorkouts from "./views/MemberWorkouts";
import MemberReviews from "./views/MemberReviews";
import MemberChat from "./views/MemberChat";
import MemberSupport from "./views/MemberSupport";
import MemberProfileModern from "./views/MemberProfileModern";
import { ProductShopPage } from "./views/ProductShopPage";
import { CatalogPackage, PackagePeriod } from "../../services/packageApi";
import PaymentFlow from "../PaymentFlow";

type CheckoutSelection = {
  item: CatalogPackage;
  duration: PackagePeriod;
  discountPct: number;
};

export default function MemberPortal({
  initialPage = "dashboard",
}: {
  initialPage?: string;
}) {
  const getInitialScreen = (): MemberScreen => {
    const raw = (window.location.hash || "").replace("#member-", "").replace("#", "");
    const map: Record<string, MemberScreen> = {
      member: "dashboard",
      overview: "dashboard",
      dashboard: "dashboard",
      classes: "booking",
      booking: "booking",
      schedule: "schedule",
      packages: "packages",
      payment: "profile",
      payments: "profile",
      workout: "workouts",
      workouts: "workouts",
      reports: "dashboard",
      progress: "dashboard",
      reviews: "reviews",
      chat: "chat",
      messages: "chat",
      message: "chat",
      ai: "support",
      support: "support",
      shop: "dashboard",
      profile: "profile",
    };
    if (map[raw]) return map[raw];
    if (map[initialPage]) return map[initialPage];
    return "dashboard";
  };

  const [screen, setScreen] = useState<MemberScreen>(getInitialScreen);
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null);

  // Sync hashchange with screen state
  useEffect(() => {
    const onHashChange = () => {
      const raw = (window.location.hash || "").replace("#member-", "").replace("#", "");
      const map: Record<string, MemberScreen> = {
        member: "dashboard",
        overview: "dashboard",
        dashboard: "dashboard",
        classes: "booking",
        booking: "booking",
        schedule: "schedule",
        packages: "packages",
        payment: "profile",
        payments: "profile",
        workout: "workouts",
        workouts: "workouts",
        reports: "dashboard",
        progress: "dashboard",
        reviews: "reviews",
        chat: "chat",
        messages: "chat",
        message: "chat",
        ai: "support",
        support: "support",
        shop: "dashboard",
        profile: "profile",
      };
      if (map[raw]) {
        setScreen(map[raw]);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = (s: MemberScreen) => {
    setScreen(s);
    window.location.hash = `#member-${s}`;
  };

  if (checkout) {
    return (
      <PaymentFlow
        initialPackage={checkout.item}
        initialDuration={checkout.duration}
        initialDiscountPct={checkout.discountPct}
        onExit={() => setCheckout(null)}
      />
    );
  }

  const screenNodes: Record<MemberScreen, ReactNode> = {
    dashboard: <MemberDashboard onNavigate={navigateTo} />,
    booking: <MemberBooking onNavigate={navigateTo} />,
    schedule: <MemberSchedule onNavigate={navigateTo} />,
    packages: (
      <MemberPackages
        onNavigate={navigateTo}
        onCheckout={(item, duration, discountPct) =>
          setCheckout({ item, duration, discountPct })
        }
      />
    ),
    payments: <MemberPayments onNavigate={navigateTo} />,
    workouts: <MemberWorkouts onNavigate={navigateTo} />,
    reviews: <MemberReviews onNavigate={navigateTo} />,
    chat: <MemberChat onNavigate={navigateTo} />,
    support: <MemberSupport onNavigate={navigateTo} />,
    shop: (
      <ProductShopPage
        onNavigate={() => {
          navigateTo("dashboard");
          window.location.hash = "#member-dashboard";
        }}
      />
    ),
    profile: <MemberProfileModern onNavigate={navigateTo} />,
  };

  if ((window.location.hash || "").includes("shop")) {
    return (
      <ProductShopPage
        onNavigate={() => {
          window.location.hash = "#member-dashboard";
          navigateTo("dashboard");
        }}
      />
    );
  }

  return (
    <MemberShellModern currentScreen={screen} onNavigate={navigateTo}>
      {screenNodes[screen] || <MemberDashboard onNavigate={navigateTo} />}
    </MemberShellModern>
  );
}
