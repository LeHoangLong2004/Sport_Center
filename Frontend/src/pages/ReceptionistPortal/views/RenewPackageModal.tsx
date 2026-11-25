import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle2,
  QrCode,
  Banknote,
  Sparkles,
  RefreshCw,
  Calendar,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { PackageAPI, CatalogPackage, PackagePeriod } from "../../../services/packageApi";
import { WalletService } from "../../MemberPortal/services/walletService";
import { BankConfigService } from "../../MemberPortal/services/bankConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  member: any;
  onSuccess: (result: { newEndDate: string; packageName: string; totalAmount: number }) => void;
}

export function RenewPackageModal({ isOpen, onClose, member, onSuccess }: Props) {
  const [mode, setMode] = useState<"extend" | "upgrade">("extend");
  const [packages, setPackages] = useState<CatalogPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [durationMonths, setDurationMonths] = useState<PackagePeriod>(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "vietqr">("cash");
  const [submitting, setSubmitting] = useState(false);

  // States kiểm tra biến động số dư VietQR
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkStatusText, setCheckStatusText] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // Prevent background & container scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Also lock any ancestor scroll container in ReceptionistPortal
    const scrollContainers = document.querySelectorAll(".overflow-y-auto");
    const originalStyles = new Map<Element, string>();
    scrollContainers.forEach((el) => {
      const htmlEl = el as HTMLElement;
      originalStyles.set(el, htmlEl.style.overflow);
      htmlEl.style.overflow = "hidden";
    });

    const preventDefaultScroll = (e: WheelEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener("wheel", preventDefaultScroll, { passive: false });
    window.addEventListener("touchmove", preventDefaultScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      scrollContainers.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const orig = originalStyles.get(el);
        if (orig !== undefined) {
          htmlEl.style.overflow = orig;
        }
      });
      window.removeEventListener("wheel", preventDefaultScroll);
      window.removeEventListener("touchmove", preventDefaultScroll);
    };
  }, [isOpen]);

  // Reset status khi đổi phương thức hoặc đổi gói
  useEffect(() => {
    setCheckStatusText(null);
    setIsPaid(false);
  }, [paymentMethod, durationMonths, selectedPackageId, mode]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingPackages(true);
    PackageAPI.getPackages()
      .then((data) => {
        const active = Array.isArray(data) ? data.filter((p) => p.isActive) : [];
        setPackages(active);
        const currentMatch = active.find((p) => p.name.toLowerCase() === (member?.packageName || "").toLowerCase());
        if (currentMatch) {
          setSelectedPackageId(currentMatch.id);
        } else if (active.length > 0) {
          setSelectedPackageId(active[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPackages(false));
  }, [isOpen, member?.packageName]);

  const activePackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPackageId) || null;
  }, [packages, selectedPackageId]);

  // Calculate Price
  const currentPrice = useMemo(() => {
    if (!activePackage) {
      const baseMonthly = Number(member?.totalAmount) || 500000;
      if (durationMonths === 1) return baseMonthly;
      if (durationMonths === 3) return Math.round(baseMonthly * 3 * 0.95);
      if (durationMonths === 6) return Math.round(baseMonthly * 6 * 0.9);
      return Math.round(baseMonthly * 12 * 0.85);
    }
    return activePackage.prices?.[durationMonths] || 500000;
  }, [activePackage, durationMonths, member?.totalAmount]);

  // Calculate new expiry date
  const rawCurrentExpiry = member?.expiryDate || member?.endDate;
  const currentExpiryFormatted = useMemo(() => {
    if (!rawCurrentExpiry) return "N/A";
    const d = new Date(rawCurrentExpiry);
    return isNaN(d.getTime()) ? String(rawCurrentExpiry) : d.toLocaleDateString("vi-VN");
  }, [rawCurrentExpiry]);

  const newEndDateStr = useMemo(() => {
    const today = new Date();
    let baseDate = today;

    if (mode === "extend" && rawCurrentExpiry) {
      const d = new Date(rawCurrentExpiry);
      if (!isNaN(d.getTime()) && d >= today) {
        baseDate = d;
      }
    }

    const targetDate = new Date(baseDate);
    targetDate.setMonth(targetDate.getMonth() + durationMonths);
    return targetDate.toLocaleDateString("vi-VN");
  }, [mode, rawCurrentExpiry, durationMonths]);

  const [attemptCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());

  // Cú pháp chuyển khoản SePay
  const transferMemo = useMemo(() => {
    return `GIA HAN ${member?.memberCode || "MEM"} ${durationMonths}THANG ${attemptCode}`.toUpperCase();
  }, [member?.memberCode, durationMonths, attemptCode]);

  const bankConfig = useMemo(() => BankConfigService.getConfig(), []);
  const vietQrUrl = useMemo(() => {
    return BankConfigService.getVietQrUrl(currentPrice, transferMemo, bankConfig);
  }, [currentPrice, transferMemo, bankConfig]);

  // Hàm gọi API thực hiện gia hạn
  const executeRenewal = async () => {
    if (!member?.id) {
      toast.error("Không tìm thấy thông tin định danh hội viên.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/receptionist/members/${member.id}/renew-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          packageId: activePackage?.id || selectedPackageId || "yoga_pack",
          durationMonths,
          paymentMethod,
          amount: currentPrice,
          note: `Gia hạn tại quầy bởi Lễ tân (${durationMonths} tháng)`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || `Đã gia hạn gói tập thành công cho hội viên ${member.fullName}!`);
        onSuccess({
          newEndDate: data.newEndDate || newEndDateStr,
          packageName: data.packageName || activePackage?.name || member.packageName,
          totalAmount: currentPrice,
        });
        onClose();
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Không thể thực hiện gia hạn gói tập.");
      }
    } catch {
      toast.error("Lỗi kết nối khi gửi yêu cầu gia hạn gói tập.");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-polling biến động số dư khi mở tab VietQR
  useEffect(() => {
    if (!isOpen || paymentMethod !== "vietqr" || isPaid || submitting) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await WalletService.checkServicePayment(transferMemo, currentPrice);
        if (!isCancelled && res.received) {
          clearInterval(interval);
          setIsPaid(true);
          setCheckStatusText(null);
          toast.success("Đã phát hiện biến động số dư từ ngân hàng qua SePay!");
          setTimeout(() => {
            executeRenewal();
          }, 800);
        }
      } catch {}
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, paymentMethod, isPaid, submitting, transferMemo, currentPrice]);

  if (!isOpen) return null;

  // Xử lý khi nhấn nút xác nhận
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || isCheckingPayment) return;

    // 1. Tiền mặt: Lễ tân thu tiền trực tiếp tại quầy -> cho phép gia hạn ngay
    if (paymentMethod === "cash") {
      executeRenewal();
      return;
    }

    // 2. Quét VietQR: BẮT BUỘC kiểm tra biến động số dư trước khi báo thành công
    if (paymentMethod === "vietqr") {
      if (isPaid) {
        executeRenewal();
        return;
      }

      setIsCheckingPayment(true);
      setCheckStatusText("Đang kiểm tra biến động số dư từ ngân hàng qua SePay...");
      try {
        const res = await WalletService.checkServicePayment(transferMemo, currentPrice);
        if (res.received) {
          setIsPaid(true);
          setCheckStatusText(null);
          toast.success("Đã nhận được tiền chuyển khoản thành công từ ngân hàng!");
          setTimeout(() => {
            executeRenewal();
          }, 600);
        } else {
          setCheckStatusText(
            res.message ||
              `Chưa phát hiện giao dịch chuyển khoản ${Number(currentPrice).toLocaleString("vi-VN")} đ với nội dung "${transferMemo}". Vui lòng hoàn tất chuyển tiền trên App ngân hàng trước khi xác nhận!`
          );
          toast.error("Chưa phát hiện giao dịch chuyển khoản trên tài khoản ngân hàng!");
        }
      } catch {
        setCheckStatusText(
          "Chưa tìm thấy giao dịch chuyển khoản trên tài khoản ngân hàng. Vui lòng chuyển tiền trước khi bấm xác nhận!"
        );
        toast.error("Chưa phát hiện giao dịch chuyển khoản trên tài khoản ngân hàng!");
      } finally {
        setIsCheckingPayment(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-hidden"
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Gia hạn & Nâng cấp gói tập
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hội viên: <strong className="text-slate-800 dark:text-slate-200">{member?.fullName}</strong> (Mã: {member?.memberCode})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
          {/* Chọn hình thức */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setMode("extend")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "extend"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              🔄 Gia hạn gói hiện tại
            </button>
            <button
              type="button"
              onClick={() => setMode("upgrade")}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "upgrade"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              ✨ Đổi / Nâng cấp gói mới
            </button>
          </div>

          {/* Nếu chọn nâng cấp */}
          {mode === "upgrade" ? (
            <div className="space-y-1 shrink-0">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Chọn gói tập mới:
              </label>
              {loadingPackages ? (
                <div className="text-xs text-slate-500 py-1">Đang tải danh mục gói tập...</div>
              ) : (
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.sport} ({Number(pkg.prices?.[1] || 0).toLocaleString("vi-VN")} đ/tháng)
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gói tập đang dùng</span>
                <span className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                  {member?.packageName || "Gói tập Yoga"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hạn cũ hiện tại</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {currentExpiryFormatted}
                </span>
              </div>
            </div>
          )}

          {/* Chọn thời hạn */}
          <div className="shrink-0">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Chọn thời gian gia hạn:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { m: 1, label: "1 Tháng", discount: "" },
                  { m: 3, label: "3 Tháng", discount: "-5%" },
                  { m: 6, label: "6 Tháng", discount: "-10%" },
                  { m: 12, label: "12 Tháng", discount: "-15%" },
                ] as const
              ).map((p) => {
                const isSelected = durationMonths === p.m;
                return (
                  <button
                    key={p.m}
                    type="button"
                    onClick={() => setDurationMonths(p.m)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    <span className="block text-xs font-bold">{p.label}</span>
                    {p.discount ? (
                      <span className="text-[10px] font-semibold text-emerald-600 block mt-0.5">
                        {p.discount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 block mt-0.5">Chuẩn</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview ngày hết hạn mới */}
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs shrink-0">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Thời hạn mới sau khi thanh toán:
            </span>
            <span className="font-black text-emerald-700 dark:text-emerald-300 text-sm">
              {newEndDateStr}
            </span>
          </div>

          {/* Phương thức thanh toán */}
          <div className="shrink-0">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phương thức thu tiền tại quầy:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "cash"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs">Tiền mặt</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("vietqr")}
                className={`py-2 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === "vietqr"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs">Quét VietQR</span>
              </button>

            </div>
          </div>

          {/* 1. Panel nếu chọn VietQR */}
          {paymentMethod === "vietqr" && (
            <div className="space-y-2 shrink-0">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-4 shrink-0 shadow-xs">
                <div className="bg-white p-1.5 rounded-xl border-2 border-emerald-500/40 shadow-sm shrink-0">
                  <img
                    src={vietQrUrl}
                    alt="VietQR"
                    className="w-32 h-32 rounded-lg object-contain block"
                  />
                </div>
                <div className="flex-1 min-w-0 text-left space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Quét mã VietQR chuyển khoản
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
                    <div>Ngân hàng: <strong className="text-slate-800 dark:text-slate-100">MBBank (Quân Đội)</strong></div>
                    <div>Số tài khoản: <strong className="font-mono text-slate-800 dark:text-slate-100 text-xs">0335889765</strong></div>
                    <div>Chủ tài khoản: <strong className="text-slate-800 dark:text-slate-100">SPORT CENTER</strong></div>
                    <div>Số tiền: <strong className="text-emerald-600 dark:text-emerald-400 font-black text-sm">{Number(currentPrice).toLocaleString("vi-VN")} đ</strong></div>
                  </div>
                  <div className="p-1 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[10px] text-emerald-800 dark:text-emerald-300 font-mono font-bold truncate">
                    Nội dung: {transferMemo}
                  </div>
                </div>
              </div>

              {/* VIETQR LIVE STATUS BADGE */}
              <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      VietQR • Tự động khớp lệnh SePay
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      {isPaid ? "Đã nhận được tiền chuyển khoản thành công!" : "Hệ thống đang tự động lắng nghe biến động số dư từ ngân hàng..."}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs shrink-0">
                  Napas 24/7
                </span>
              </div>

              {/* Cảnh báo nếu chưa chuyển khoản */}
              {checkStatusText && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs text-left flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed text-[11px]">{checkStatusText}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer tổng tiền & Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Tổng cước phí thu:</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                {Number(currentPrice).toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || isCheckingPayment}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  isCheckingPayment
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kích hoạt gói...</span>
                  </>
                ) : isCheckingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra biến động số dư...</span>
                  </>
                ) : isPaid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã thanh toán • Xác nhận gia hạn</span>
                  </>
                ) : paymentMethod === "vietqr" ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kiểm tra giao dịch & Gia hạn</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Xác nhận gia hạn & Thu tiền</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
