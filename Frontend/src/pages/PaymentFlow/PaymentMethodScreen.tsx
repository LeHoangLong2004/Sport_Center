import React, { useState, useEffect, useRef } from "react";
import { A, BillingPeriod, FlowPackage, getPaymentSummary, PaymentMethodId, Stepper } from "./shared";
import { PaymentMemberProfileCard } from "./paymentMethod/PaymentMemberProfileCard";
import { PaymentMethodDetailsPanel } from "./paymentMethod/PaymentMethodDetailsPanel";
import { PaymentOrderSummary } from "./paymentMethod/PaymentOrderSummary";

interface PaymentMethodScreenProps {
  pkg: FlowPackage;
  period: BillingPeriod;
  method: PaymentMethodId;
  setMethod: (m: PaymentMethodId) => void;
  formData: any;
  setFormData?: (fnOrVal: any) => void;
  onNext: () => void;
  onBack: () => void;
  availableMethods?: PaymentMethodId[];
}

export function PaymentMethodScreen({
  pkg,
  period,
  method,
  setMethod,
  formData,
  setFormData,
  onNext,
  onBack,
  availableMethods,
}: PaymentMethodScreenProps) {
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;
  const { listPrice, discount, total, periodLabel } = getPaymentSummary(pkg, period);
  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    resetScroll();
    const raf = requestAnimationFrame(resetScroll);
    const timer = setTimeout(resetScroll, 60);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, []);

  // Copy to clipboard helper
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldName ? null : curr));
    }, 2000);
  };

  // Promo code feature
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    if (code === "SPORT10" || code === "WELCOME") {
      const disc = Math.round(total * 0.1);
      setPromoDiscount(disc);
      setPromoMessage("✓ Giảm 10%");
    } else {
      setPromoDiscount(0);
      setPromoMessage("Mã không hợp lệ");
    }
  };

  const finalTotal = Math.max(0, total - promoDiscount);

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Terms agreement
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Bank transfer info
  const phoneDigits = formData?.phone ? formData.phone.replace(/\D/g, "").slice(-4) : "GYM";
  const pkgCode = (pkg.id || "PKG").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  const transferMemo = `SC ${phoneDigits} ${pkgCode}`.toUpperCase();

  // Auto-detection of SePay transfer for QR method
  const [autoPaid, setAutoPaid] = useState(false);
  const [autoPaidMessage, setAutoPaidMessage] = useState<string | null>(null);

  useEffect(() => {
    if (method !== "qr" || autoPaid) return;
    let isCancelled = false;

    const checkTransaction = async () => {
      try {
        const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
        
        // 1. Kiểm tra trực tiếp danh sách giao dịch SePay đã nhận trên backend
        const res = await fetch(`${API_BASE}/api/payments/sepay-transactions`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          const txs = data?.transactions || [];
          const cleanMemo = transferMemo.trim().toUpperCase();
          const cleanPhone = phoneDigits.toUpperCase();

          const matched = txs.find((t: any) => {
            const content = (t.content || "").toUpperCase();
            const amount = Number(t.amount || 0);
            // Bắt buộc số tiền phải khớp chính xác với đơn hàng hiện tại
            const amountMatches = Math.abs(amount - finalTotal) < 1;
            const memoMatches =
              content.includes(cleanMemo) ||
              content.replace(/\s+/g, "").includes(cleanMemo.replace(/\s+/g, "")) ||
              (cleanPhone.length >= 3 && content.includes(cleanPhone) && (pkgCode ? content.includes(pkgCode.toUpperCase()) : true));
            return amountMatches && memoMatches;
          });

          if (matched) {
            setAutoPaid(true);
            setAutoPaidMessage("🎉 Đã nhận được tiền chuyển khoản thành công từ MB Bank qua SePay!");
            setTimeout(() => {
              onNextRef.current?.();
            }, 600);
            return;
          }
        }

        // 2. Thử thêm endpoint check-memo
        const resMemo = await fetch(
          `${API_BASE}/api/payments/sepay-check-memo?memo=${encodeURIComponent(transferMemo)}&amount=${encodeURIComponent(finalTotal)}`,
          { cache: "no-store" }
        );
        if (resMemo.ok) {
          const dataMemo = await resMemo.json();
          if (dataMemo.received) {
            setAutoPaid(true);
            setAutoPaidMessage("🎉 Đã nhận được tiền chuyển khoản thành công từ MB Bank qua SePay!");
            setTimeout(() => {
              onNextRef.current?.();
            }, 600);
            return;
          }
        }
      } catch (err) {
        console.warn("SePay polling error:", err);
      }
    };

    // Kiểm tra ngay lập tức khi mở tab
    void checkTransaction();

    const interval = setInterval(() => {
      if (!autoPaid) {
        void checkTransaction();
      }
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [method, transferMemo, phoneDigits, finalTotal, autoPaid, onNext]);

  const methods: { id: PaymentMethodId; icon: string; label: string; sub?: string; badge?: string }[] = [
    {
      id: "qr",
      icon: `${A}/66769.svg`,
      label: "Mã QR MB Bank (Napas 247)",
      badge: "Chính thức ⚡",
    },
    {
      id: "card",
      icon: `${A}/b41b0.svg`,
      label: "Thẻ tín dụng / Ghi nợ / ATM",
      badge: "3D Secure",
    },
    {
      id: "wallet",
      icon: `${A}/d8a69.svg`,
      label: "Ví điện tử (MoMo / ZaloPay)",
      badge: "Hoàn 5%",
    },
    {
      id: "counter",
      icon: `${A}/a4eee.svg`,
      label: "Thanh toán trực tiếp tại quầy",
      badge: "Giữ chỗ 24h",
    },
  ];

  const isProduct = pkg.periodLabel === "Đơn hàng" || (!pkg.details && !pkg.terms);

  return (
    <div className="bg-[#f8fafc] flex flex-col items-center w-full">
      {/* Sleek Stepper */}
      <Stepper active={2} />

      {/* Compact Top Bar */}
      <div className="w-full max-w-[1240px] px-4 md:px-6 pb-2 pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <span className="text-sm group-hover:-translate-x-1 transition-transform">←</span>
              <span>Quay lại</span>
            </button>
            <div className="flex items-baseline gap-2 flex-wrap">
              <h1 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-base md:text-lg tracking-tight">
                Xác nhận thông tin & Thanh toán
              </h1>
              <span className="hidden md:inline text-xs text-slate-400 font-normal">
                Kiểm tra thông tin nhận gói và chọn hình thức thanh toán thuận tiện nhất
              </span>
            </div>
          </div>

          {/* Compact countdown indicator */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shrink-0">
            <span className="text-amber-600">⏳</span>
            <span className="hidden sm:inline text-[11px]">Ưu đãi giữ trong:</span>
            <span className="font-mono font-bold text-amber-700">{formattedCountdown}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="flex items-start justify-center pb-6 pt-0.5 px-4 md:px-6 w-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start w-full max-w-[1240px]">
          
          {/* LEFT COLUMN: Member Info + Payment Methods + Method Details */}
          <div className="flex flex-1 flex-col gap-3 items-start min-w-0 w-full">
            
            {/* 1. COMPACT MEMBER PROFILE CARD */}
            <PaymentMemberProfileCard
              formData={formData}
              setFormData={setFormData}
              isProduct={isProduct}
            />

            {/* 2. COMPACT PAYMENT METHODS SELECTOR */}
            <div className="bg-white border border-[#e2e8f0] rounded-xl p-3 px-4 w-full shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-['Inter:Bold'] font-bold text-[#0f172a] text-xs md:text-sm">
                  Chọn phương thức thanh toán
                </h3>
                <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  Miễn phí giao dịch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5">
                {methods
                  .filter((m) => !availableMethods || availableMethods.includes(m.id))
                  .map((m) => {
                    const isSelected = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2.5 p-2 px-3 rounded-lg text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-teal-50/70 border-2 border-teal-500 shadow-2xs"
                            : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Radio circle */}
                        <div
                          className={`size-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-teal-600 text-white" : "border-2 border-slate-300"
                          }`}
                        >
                          {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Icon */}
                        <img src={m.icon} className="size-6 shrink-0 object-contain" alt="" />

                        {/* Text */}
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="font-['Inter:Semi_Bold'] font-semibold text-slate-900 text-xs truncate">
                            {m.label}
                          </span>
                          {m.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                isSelected
                                  ? "bg-teal-600 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {m.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 3. DYNAMIC PAYMENT METHOD DETAILS */}
            <PaymentMethodDetailsPanel
              method={method}
              finalTotal={finalTotal}
              formData={formData}
              copiedField={copiedField}
              onCopy={handleCopy}
              transferMemo={transferMemo}
              fmt={fmt}
              autoPaid={autoPaid}
              autoPaidMessage={autoPaidMessage}
            />

            {/* Bottom Security Guarantee */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 w-full pt-0.5">
              <span className="flex items-center gap-1.5">
                <span className="text-teal-600">🛡️</span>
                <span>Bảo mật chuẩn quốc tế SSL 256-bit | Đảm bảo an toàn 100% cho mọi giao dịch</span>
              </span>
              <span className="hidden sm:inline text-[10px]">SportCenter SafeCheckout</span>
            </div>

          </div>

          {/* RIGHT COLUMN: Compact Sticky Order Summary Card */}
          <PaymentOrderSummary
            pkg={pkg}
            periodLabel={periodLabel}
            formData={formData}
            isProduct={isProduct}
            promoCode={promoCode}
            onPromoCodeChange={setPromoCode}
            onApplyPromo={handleApplyPromo}
            promoMessage={promoMessage}
            promoDiscount={promoDiscount}
            listPrice={listPrice}
            discount={discount}
            finalTotal={finalTotal}
            agreedTerms={agreedTerms}
            onAgreedTermsChange={setAgreedTerms}
            onNext={onNext}
            method={method}
            fmt={fmt}
            autoPaid={autoPaid}
          />
        </div>
      </div>
    </div>
  );
}

export default PaymentMethodScreen;
