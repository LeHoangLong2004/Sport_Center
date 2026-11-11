import { useState, useEffect, type ReactNode } from "react";
import type { MemberScreen } from "./types";
import MemberShellModern from "./components/MemberShellModern";
import MemberDashboard from "./views/MemberDashboard";
import MemberBooking from "./views/MemberBooking";
import MemberSchedule from "./views/MemberSchedule";
import MemberPackages from "./views/MemberPackages";
import MemberPayments from "./views/MemberPayments";
import MemberWorkouts from "./views/MemberWorkouts";
import MemberAttendance from "./views/MemberAttendance";
import MemberReviews from "./views/MemberReviews";
import MemberChat from "./views/MemberChat";
import MemberSupport from "./views/MemberSupport";
import MemberProfileModern from "./views/MemberProfileModern";
import MemberProgress from "./views/MemberProgress";
import { ProductShopPage, type ProductOrder } from "./views/ProductShopPage";
import { ProductPaymentFlow } from "../PaymentFlow/ProductPaymentFlow";
import { CatalogPackage, PackagePeriod } from "../../services/packageApi";
import PaymentFlow from "../PaymentFlow";
import { PageTransition } from "../../components/PageTransition";

/**
 * Thông tin lựa chọn gói tập khi tiến hành Checkout
 */
export type CheckoutSelection = {
  item: CatalogPackage;
  duration: PackagePeriod;
  discountPct: number;
};

/**
 * Component Cổng thông tin Hội viên (Member Portal).
 * Điều phối toàn bộ các phân hệ dành cho hội viên Sport Center:
 * - Dashboard: Tổng quan chỉ số sức khỏe, KPI buổi tập, lớp học sắp diễn ra.
 * - Booking & Schedule: Đặt chỗ lớp học thể thao, xem lịch tập cá nhân.
 * - Packages & Payments: Tra cứu gói tập, mua gói, lịch sử hóa đơn và thanh toán.
 * - Workouts & Attendance: Xem giáo án tập luyện, lịch sử điểm danh check-in/out.
 * - Reviews & Chat: Đánh giá chất lượng Huấn luyện viên, chat với HLV và AI Assistant.
 * - Shop: Mua sắm sản phẩm, thực phẩm bổ sung và phụ kiện phòng gym.
 * 
 * @param initialPage Trang khởi tạo hiển thị mặc định
 * @param onCheckout Callback khi hội viên chọn mua gói tập
 * @param onProductPayment Callback khi hội viên thanh toán đơn hàng sản phẩm
 * @param onLogout Callback xử lý khi hội viên đăng xuất
 */
export default function MemberPortal({
  initialPage = "dashboard",
  onCheckout: onExternalCheckout,
  onProductPayment: onExternalProductPayment,
  onLogout,
}: {
  initialPage?: string;
  onCheckout?: (selection: CheckoutSelection) => void;
  onProductPayment?: (order: ProductOrder) => void;
  onLogout?: () => void;
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
      payment: "payments",
      payments: "payments",
      invoices: "payments",
      invoice: "payments",
      workout: "workouts",
      workouts: "workouts",
      attendance: "attendance",
      diemdanh: "attendance",
      "diem-danh": "attendance",
      reports: "progress",
      progress: "progress",
      inbody: "progress",
      reviews: "reviews",
      chat: "chat",
      messages: "chat",
      message: "chat",
      ai: "support",
      "move-ai": "support",
      assistant: "support",
      "tro-ly-ai": "support",
      support: "support",
      shop: "shop",
      profile: "profile",
    };
    if (map[raw]) return map[raw];
    if (map[initialPage]) return map[initialPage];
    return "dashboard";
  };

  const [screen, setScreen] = useState<MemberScreen>(getInitialScreen);
  const [checkout, setCheckout] = useState<CheckoutSelection | null>(null);
  const [productPaymentOrder, setProductPaymentOrder] = useState<ProductOrder | null>(null);

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
        payment: "payments",
        payments: "payments",
        invoices: "payments",
        invoice: "payments",
        workout: "workouts",
        workouts: "workouts",
        attendance: "attendance",
        diemdanh: "attendance",
        "diem-danh": "attendance",
        reports: "dashboard",
        progress: "dashboard",
        reviews: "reviews",
        chat: "chat",
        messages: "chat",
        message: "chat",
        ai: "support",
        "move-ai": "support",
        assistant: "support",
        "tro-ly-ai": "support",
        support: "support",
        shop: "shop",
        profile: "profile",
      };
      if (map[raw]) {
        setScreen(map[raw]);
        // Checkout is an in-memory flow. When the browser Back button
        // changes the hash, leave that flow as well so the rendered UI
        // follows the URL without requiring a full page refresh.
        setCheckout(null);
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

  if (productPaymentOrder) {
    return (
      <ProductPaymentFlow
        order={productPaymentOrder}
        onBack={() => {
          setProductPaymentOrder(null);
          setScreen("shop");
          window.location.hash = "#member-shop";
        }}
        onCompleted={() => {
          setProductPaymentOrder(null);
          setScreen("shop");
          window.location.hash = "#member-shop";
        }}
      />
    );
  }

  const renderScreen = (s: MemberScreen) => {
    switch (s) {
      case "dashboard":
        return <MemberDashboard onNavigate={navigateTo} />;
      case "booking":
        return <MemberBooking onNavigate={navigateTo} />;
      case "schedule":
        return <MemberSchedule onNavigate={navigateTo} />;
      case "attendance":
        return <MemberAttendance onNavigate={navigateTo} />;
      case "packages":
        return (
          <MemberPackages
            onNavigate={navigateTo}
            onCheckout={(item, duration, discountPct) => {
              const selection = { item, duration, discountPct };
              if (onExternalCheckout) {
                onExternalCheckout(selection);
                return;
              }
              setCheckout(selection);
            }}
          />
        );
      case "payments":
        return <MemberPayments onNavigate={navigateTo} />;
      case "workouts":
        return <MemberWorkouts onNavigate={navigateTo} />;
      case "reviews":
        return <MemberReviews onNavigate={navigateTo} />;
      case "chat":
        return <MemberChat onNavigate={navigateTo} />;
      case "support":
        return <MemberSupport onNavigate={navigateTo} />;
      case "shop":
        return (
          <ProductShopPage
            embedded
            onOnlinePayment={(order) => {
              if (onExternalProductPayment) {
                onExternalProductPayment(order);
                return;
              }
              setProductPaymentOrder(order);
            }}
            onNavigate={() => {
              navigateTo("dashboard");
              window.location.hash = "#member-dashboard";
            }}
          />
        );
      case "profile":
        return <MemberProfileModern onNavigate={navigateTo} />;
      case "progress":
        return <MemberProgress />;
      default:
        return <MemberDashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <MemberShellModern currentScreen={screen} onNavigate={navigateTo} onLogout={onLogout}>
      <PageTransition pageKey={screen}>
        {renderScreen(screen)}
      </PageTransition>
    </MemberShellModern>
  );
}
