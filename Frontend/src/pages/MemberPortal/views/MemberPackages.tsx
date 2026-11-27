import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { MemberScreen } from "../types";
import {
  PackageAPI,
  CatalogPackage,
  PackageOrder,
  PackagePeriod,
  getMembershipStatus,
  MembershipStatus,
  calculateMembershipUpgrade,
} from "../../../services/packageApi";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import MembershipTab from "./packages/MembershipTab";
import CancelMembershipModal from "./packages/CancelMembershipModal";
import UniversalPaymentModal, { UniversalPaymentItem } from "../components/UniversalPaymentModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
  onCheckout?: (
    item: CatalogPackage,
    duration: PackagePeriod,
    discountPct: number
  ) => void;
}

/**
 * Màn hình Quản lý & Mua gói tập (Member Packages View).
 * Cung cấp danh mục gói cước và trạng thái thẻ hội viên:
 * - Gói thẻ thành viên (Membership): Thẻ Basic, Standard, VIP vào toàn bộ hệ thống.
 * - Gói chuyên sâu theo môn (Sport Packages): Yoga, Bơi lội, Boxing, Pilates...
 * - Modal thanh toán nhanh (Quick Checkout): Thanh toán bằng mã QR chuyển khoản hoặc tại quầy.
 * 
 * @param onNavigate Hàm chuyển hướng trang
 * @param onCheckout Callback khi bắt đầu thanh toán gói
 */
export default function MemberPackages({ onNavigate, onCheckout }: Props) {
  const [catalog, setCatalog] = useState<CatalogPackage[]>([]);
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [, setLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<PackagePeriod>(1);

  // Quick checkout modal state
  const [selectedPackage, setSelectedPackage] = useState<CatalogPackage | null>(null);
  const [checkoutDuration, setCheckoutDuration] = useState<PackagePeriod>(1);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Cancel membership modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancellingMembership, setIsCancellingMembership] = useState(false);

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
        "Có thể nâng cấp lên hạng thành viên trả phí",
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

  // Calculate discount for a package based on active membership tier
  const calculateDiscount = useCallback(
    (pkg: CatalogPackage): { discountPct: number; originalPrice: number; finalPrice: number } => {
      const orig = pkg.prices[selectedDuration] || pkg.prices[1] || 0;
      if (pkg.category === "membership") {
        const upgrade = calculateMembershipUpgrade(membershipStatus, pkg, selectedDuration);
        if (upgrade.isUpgrade) {
          const discountPct = upgrade.originalPrice > 0 
            ? Math.round((upgrade.remainingCredit / upgrade.originalPrice) * 100)
            : 0;
          return { discountPct, originalPrice: upgrade.originalPrice, finalPrice: upgrade.finalPrice };
        }
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
    setSelectedPackage(pkg);
    setCheckoutDuration(selectedDuration);
  };

  const universalPaymentItem = useMemo<UniversalPaymentItem | null>(() => {
    if (!selectedPackage) return null;
    const { discountPct, originalPrice, finalPrice } = calculateDiscount(selectedPackage);
    const upgrade = selectedPackage.category === "membership"
      ? calculateMembershipUpgrade(membershipStatus, selectedPackage, checkoutDuration)
      : null;

    const isMembership = selectedPackage.category === "membership";
    const isCurrentTier = isMembership && membershipStatus.tier !== "basic" && membershipStatus.tier === selectedPackage.tier;
    const isRenewal = isCurrentTier;

    let renewalPreview: { currentEndDate: string; newEndDate: string; addedMonths: number } | undefined;
    if (isRenewal && membershipStatus.endDate) {
      const curEnd = new Date(membershipStatus.endDate);
      const curEndStr = curEnd.toLocaleDateString("vi-VN");
      const newEnd = new Date(curEnd);
      newEnd.setMonth(newEnd.getMonth() + checkoutDuration);
      newEnd.setDate(newEnd.getDate() - 1);
      const newEndStr = newEnd.toLocaleDateString("vi-VN");
      renewalPreview = {
        currentEndDate: curEndStr,
        newEndDate: newEndStr,
        addedMonths: checkoutDuration,
      };
    }

    return {
      id: selectedPackage.id,
      categoryTitle: isRenewal
        ? `GIA HẠN GÓI THÀNH VIÊN - ${selectedPackage.name.toUpperCase()}`
        : upgrade?.isUpgrade
        ? "NÂNG CẤP HẠNG THÀNH VIÊN"
        : selectedPackage.category === "membership"
        ? "ĐĂNG KÝ GÓI THÀNH VIÊN"
        : "ĐĂNG KÝ GÓI MÔN TẬP",
      title: isRenewal
        ? `Gia hạn thẻ ${selectedPackage.name}`
        : selectedPackage.name,
      subtitle: isRenewal
        ? `Gia hạn ${checkoutDuration} tháng • Hạng ${selectedPackage.name}`
        : upgrade?.isUpgrade
        ? `${checkoutDuration} tháng • Bù chênh lệch từ gói ${upgrade.currentTierName} (${upgrade.remainingDays} ngày chưa dùng)`
        : `${checkoutDuration} tháng • ${
            selectedPackage.category === "membership"
              ? (selectedPackage.tier ? `Hạng ${selectedPackage.tier.toUpperCase()}` : "Thẻ thành viên")
              : (selectedPackage.sport || "Môn tập")
          }`,
      description: isRenewal && renewalPreview
        ? `Thời hạn gói sẽ được cộng dồn nối tiếp từ ngày ${renewalPreview.currentEndDate} đến ngày ${renewalPreview.newEndDate}.`
        : upgrade?.isUpgrade
        ? `Giá gốc ${originalPrice.toLocaleString("vi-VN")} đ. Khấu trừ ${upgrade.remainingCredit.toLocaleString("vi-VN")} đ từ gói ${upgrade.currentTierName} đang dùng.`
        : selectedPackage.description,
      originalPrice,
      discountPct,
      discountAmount: originalPrice - finalPrice,
      finalPrice,
      memoPrefix: selectedPackage.category === "membership" ? "MEMBER" : "SPORT",
      isRenewal,
      renewalPreview,
    };
  }, [selectedPackage, checkoutDuration, calculateDiscount, membershipStatus]);

  const handleUniversalCheckoutSuccess = async (method: "qr" | "wallet" | "card" | "counter") => {
    if (!selectedPackage) return;
    const pkgName = selectedPackage.name;
    try {
      const checkout = await PackageAPI.checkout(
        selectedPackage.id,
        checkoutDuration,
        method
      );
      setSelectedPackage(null);
      setFeedback({
        type: "success",
        text:
          method === "counter"
            ? `Đã tạo đơn đăng ký gói "${pkgName}". Vui lòng thanh toán tại quầy lễ tân để kích hoạt!`
            : `Thanh toán thành công gói "${pkgName}"! Quyền lợi đã được kích hoạt ngay lập tức.`,
      });
      await loadData();
      // Use the order returned by the successful checkout as well as refreshing
      // the list, so the newly paid renewal is reflected even if the GET is stale.
      if (checkout.order?.status === "paid") {
        setOrders((current) => [
          checkout.order,
          ...current.filter((order) => order.id !== checkout.order.id),
        ]);
      }
      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "ORDER_CREATED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch {}
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Không thể hoàn tất đơn đăng ký gói tập. Vui lòng thử lại.",
      });
    }
  };

  const handleConfirmCancelMembership = async () => {
    setIsCancellingMembership(true);
    try {
      const res = await PackageAPI.cancelMembership();
      toast.success(res.message || "Đã hủy gói thành viên thành công! Tài khoản đã quay về Hạng Cơ bản.");
      setShowCancelModal(false);
      await loadData();
      try {
        const channel = new BroadcastChannel("smartgym_orders_sync");
        channel.postMessage({ type: "MEMBERSHIP_CANCELLED", timestamp: Date.now() });
        channel.close();
        localStorage.setItem("smartgym_order_event", String(Date.now()));
      } catch {}
    } catch (err: any) {
      toast.error(err?.message || "Không thể hủy gói thành viên. Vui lòng thử lại sau!");
    } finally {
      setIsCancellingMembership(false);
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
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
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
            Quản lý hạng thành viên, quyền lợi và thời hạn gói của bạn tại trung tâm.
          </p>
        </div>

      </div>

      <MembershipTab
        membershipStatus={membershipStatus}
        membershipPackages={membershipPackages}
        selectedDuration={selectedDuration}
        onSelectDuration={setSelectedDuration}
        onStartPurchase={handleStartPurchase}
        onCancelMembership={() => setShowCancelModal(true)}
        catalog={catalog}
      />

      {/* UNIVERSAL PAYMENT MODAL */}
      <UniversalPaymentModal
        isOpen={!!selectedPackage}
        item={universalPaymentItem}
        onClose={() => setSelectedPackage(null)}
        onSuccess={handleUniversalCheckoutSuccess}
      />

      {/* CANCEL MEMBERSHIP CONFIRMATION MODAL */}
      <CancelMembershipModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancelMembership}
        membershipStatus={membershipStatus}
        isCancelling={isCancellingMembership}
      />
    </div>
  );
}

