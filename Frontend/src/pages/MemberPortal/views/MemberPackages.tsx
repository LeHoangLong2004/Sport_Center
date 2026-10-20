import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { MemberScreen } from "../types";
import {
  PackageAPI,
  CatalogPackage,
  PackageOrder,
  PackagePeriod,
  SportFormat,
  getMembershipStatus,
  MembershipStatus,
} from "../../../services/packageApi";
import { Crown, Dumbbell, CheckCircle2, AlertCircle, X } from "lucide-react";
import MembershipTab from "./packages/MembershipTab";
import SportTab from "./packages/SportTab";
import PackageCheckoutModal from "./packages/PackageCheckoutModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
  onCheckout?: (
    item: CatalogPackage,
    duration: PackagePeriod,
    discountPct: number
  ) => void;
}

export default function MemberPackages({ onNavigate, onCheckout }: Props) {
  const [activeTab, setActiveTab] = useState<"membership" | "sport">("membership");
  const [catalog, setCatalog] = useState<CatalogPackage[]>([]);
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<PackagePeriod>(1);
  const [sportFilter, setSportFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState<"all" | SportFormat>("all");

  // Quick checkout modal state
  const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | null>(null);
  const [checkoutDuration, setCheckoutDuration] = useState<PackagePeriod>(1);
  const [checkoutMethod, setCheckoutMethod] = useState<"qr" | "counter">("qr");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [apiCatalog, apiOrders] = await Promise.all([
        PackageAPI.getPackages().catch(() => []),
        PackageAPI.getMyOrders().catch(() => []),
      ]);

      setCatalog(apiCatalog || []);
      setOrders(apiOrders || []);
    } catch (err) {
      console.warn("Failed to load packages from API", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Compute active membership status
  const membershipStatus = useMemo<MembershipStatus>(() => {
    const status = getMembershipStatus(orders, catalog);
    if (status) return status;
    return {
      tier: "basic",
      name: "Hội viên Cơ bản",
      benefits: [
        "Hạng mặc định miễn phí trọn đời",
        "Có thể mua riêng từng gói môn tập",
        "Tủ đồ tiêu chuẩn trong ca tập",
        "1 lần đo InBody khi kích hoạt",
      ],
      groupDiscountPct: 0,
      coachDiscountPct: 0,
      bookingAdvanceHours: 24,
      lockerTerms: "Tủ đồ tiêu chuẩn trong ca tập.",
    };
  }, [orders, catalog]);

  // Filter membership packages
  const membershipPackages = useMemo(() => {
    return catalog.filter((pkg) => pkg.category === "membership" && pkg.isActive);
  }, [catalog]);

  // Active sport orders
  const activeSportOrders = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return orders.filter(
      (order) =>
        order.status === "paid" &&
        order.packageSnapshot.category === "sport" &&
        (!order.endDate || order.endDate.slice(0, 10) >= todayStr)
    );
  }, [orders]);

  // Available sport packages for browsing
  const availableSportPackages = useMemo(() => {
    return catalog.filter((pkg) => {
      if (pkg.category !== "sport" || !pkg.isActive) return false;
      if (sportFilter !== "all" && pkg.sport !== sportFilter) return false;
      if (formatFilter !== "all" && pkg.format !== formatFilter) return false;
      return true;
    });
  }, [catalog, sportFilter, formatFilter]);

  // Sport options for filter dropdown
  const sportOptions = useMemo(() => {
    const set = new Set<string>();
    catalog
      .filter((p) => p.category === "sport" && p.sport)
      .forEach((p) => set.add(p.sport!));
    return Array.from(set);
  }, [catalog]);

  // Calculate discount for a package based on active membership tier
  const calculateDiscount = useCallback(
    (pkg: CatalogPackage): { discountPct: number; originalPrice: number; finalPrice: number } => {
      const orig = pkg.prices[selectedDuration] || pkg.prices[1] || 0;
      if (pkg.category === "membership") {
        return { discountPct: 0, originalPrice: orig, finalPrice: orig };
      }
      let discountPct = 0;
      if (pkg.format === "coach") {
        discountPct = membershipStatus.coachDiscountPct || 0;
      } else {
        discountPct = membershipStatus.groupDiscountPct || 0;
      }
      const finalPrice = Math.round(orig * (1 - discountPct / 100));
      return { discountPct, originalPrice: orig, finalPrice };
    },
    [membershipStatus, selectedDuration]
  );

  // Handle start purchase
  const handleStartPurchase = (pkg: CatalogPackage) => {
    const { discountPct } = calculateDiscount(pkg);
    if (onCheckout) {
      onCheckout(pkg, selectedDuration, discountPct);
      return;
    }
    setSelectedPackage(pkg);
    setCheckoutDuration(selectedDuration);
  };

  // Submit quick checkout
  const handleQuickCheckout = async () => {
    if (!selectedPackage) return;
    try {
      setIsSubmitting(true);
      await PackageAPI.checkout(
        selectedPackage.id,
        checkoutDuration,
        checkoutMethod
      );
      setFeedback({
        type: "success",
        text: `Đã tạo đơn đăng ký gói "${selectedPackage.name}". Vui lòng kiểm tra mục Thanh toán & Hóa đơn để đối soát!`,
      });
      setSelectedPackage(null);
      await loadData();
      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "ORDER_CREATED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch {}
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Không thể khởi tạo đơn thanh toán. Vui lòng thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-red-50 dark:bg-red-950/70 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-75 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER WITH CATEGORY TABS */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
              Trung Tâm Thể Thao Đa Năng
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            Gói tập & Dịch vụ của tôi
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hệ thống phân tách rõ ràng giữa <strong>Gói Thành Viên</strong> (nền tảng đặc quyền, chiết khấu, tiện ích thư giãn) và <strong>Gói Môn Tập</strong> (quyền vào sàn tập riêng từng môn: Gym, Bơi, Yoga, Boxing...).
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("membership")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "membership"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>1. Gói Thành Viên</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
              {membershipStatus.tier.toUpperCase()}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sport")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sport"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Dumbbell className="w-4 h-4 text-emerald-500" />
            <span>2. Gói Môn Tập</span>
            {activeSportOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {activeSportOrders.length} đang có
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: GÓI THÀNH VIÊN */}
      {activeTab === "membership" && (
        <MembershipTab
          membershipStatus={membershipStatus}
          membershipPackages={membershipPackages}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          onStartPurchase={handleStartPurchase}
          catalog={catalog}
        />
      )}

      {/* TAB 2: GÓI MÔN TẬP */}
      {activeTab === "sport" && (
        <SportTab
          activeSportOrders={activeSportOrders}
          availableSportPackages={availableSportPackages}
          membershipStatus={membershipStatus}
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          sportFilter={sportFilter}
          onSportFilterChange={setSportFilter}
          formatFilter={formatFilter}
          onFormatFilterChange={setFormatFilter}
          sportOptions={sportOptions}
          calculateDiscount={calculateDiscount}
          onStartPurchase={handleStartPurchase}
          onNavigate={onNavigate}
        />
      )}

      {/* QUICK CHECKOUT MODAL */}
      <PackageCheckoutModal
        selectedPackage={selectedPackage}
        onClose={() => setSelectedPackage(null)}
        checkoutDuration={checkoutDuration}
        checkoutMethod={checkoutMethod}
        onSelectCheckoutMethod={setCheckoutMethod}
        calculateDiscount={calculateDiscount}
        isSubmitting={isSubmitting}
        onSubmit={handleQuickCheckout}
      />
    </div>
  );
}

