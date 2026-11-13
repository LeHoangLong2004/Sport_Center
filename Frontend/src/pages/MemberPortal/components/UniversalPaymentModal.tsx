import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  LoaderCircle,
  Check,
  CheckCircle2,
  RefreshCw,
  QrCode,
  Building,
  Wallet,
} from "lucide-react";
import { BankConfigService } from "../services/bankConfig";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";
import { PackageAPI, getMembershipStatus, type MembershipStatus } from "../../../services/packageApi";
import WalletTopUpModal from "./WalletTopUpModal";
import UniversalPaymentInvoiceSummary from "./payment/UniversalPaymentInvoiceSummary";
import UniversalPaymentWalletSection from "./payment/UniversalPaymentWalletSection";
import UniversalPaymentQrSection from "./payment/UniversalPaymentQrSection";

export interface UniversalPaymentItem {
  id: string;
  categoryTitle: string;
  title: string;
  subtitle?: string;
  description?: string;
  originalPrice: number;
  discountPct?: number;
  discountAmount?: number;
  finalPrice: number;
  memoPrefix: string;
  isRenewal?: boolean;
  renewalPreview?: {
    currentEndDate: string;
    newEndDate: string;
    addedMonths: number;
  };
}

interface UniversalPaymentModalProps {
  isOpen: boolean;
  item: UniversalPaymentItem | null;
  onClose: () => void;
  onSuccess: (method: "qr" | "wallet" | "card" | "counter") => Promise<void> | void;
}

export const UniversalPaymentModal: React.FC<UniversalPaymentModalProps> = ({
  isOpen,
  item,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !item) return null;

  const [paymentMethod, setPaymentMethod] = useState<"qr" | "counter" | "wallet">("wallet");
  const [membership, setMembership] = useState<MembershipStatus | null>(null);

  // Load membership status
  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      PackageAPI.getMyOrders().catch(() => []),
      PackageAPI.getPackages().catch(() => []),
    ]).then(([orders, catalog]) => {
      if (!isCancelled) {
        setMembership(getMembershipStatus(orders, catalog));
      }
    });
    return () => { isCancelled = true; };
  }, []);

  const originalPrice = item.originalPrice;
  const finalPrice = Math.max(0, item.finalPrice);
  const discountAmount = item.discountAmount ?? Math.max(0, originalPrice - finalPrice);
  const discountPct = item.discountPct ?? (originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0);

  // Generate transfer memo
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const phoneDigits = user?.phoneNumber || user?.phone ? String(user.phoneNumber || user.phone).replace(/\D/g, "").slice(-4) : "8888";
  const rawCode = (item.id || item.memoPrefix || "SC").replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase();
  const paymentMemo = `SC ${phoneDigits} ${rawCode}`;

  const bankConfig = BankConfigService.getConfig();
  const vietQrUrl = BankConfigService.getVietQrUrl(finalPrice, paymentMemo, bankConfig);

  const [checkStatusText, setCheckStatusText] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return WalletService.getLocalWallet().balance;
  });

  useEffect(() => {
    let cancelled = false;
    WalletService.getWallet().then((w) => {
      if (!cancelled) setWalletBalance(w.balance);
    });

    const handleWalletUpdated = (e: any) => {
      if (typeof e?.detail?.balance === "number") {
        setWalletBalance(e.detail.balance);
      } else {
        setWalletBalance(WalletService.getLocalWallet().balance);
      }
    };

    window.addEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdated);
    };
  }, []);

  useEffect(() => {
    setCheckStatusText(null);
    setIsPaid(false);
  }, [paymentMethod, item]);

  // Realtime Polling for VietQR SePay transactions
  useEffect(() => {
    if (!item || paymentMethod !== "qr" || isProcessing || isPaid) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await WalletService.checkServicePayment(paymentMemo, finalPrice);
        if (!isCancelled && res.received) {
          clearInterval(interval);
          setIsPaid(true);
          setCheckStatusText(null);
          setTimeout(async () => {
            setIsProcessing(true);
            try {
              await onSuccess("qr");
            } finally {
              setIsProcessing(false);
            }
          }, 800);
        }
      } catch {}
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [item, paymentMethod, paymentMemo, finalPrice, isProcessing, isPaid, onSuccess]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckPayment = async () => {
    if (isPaid) {
      await onSuccess("qr");
      return;
    }

    setIsCheckingPayment(true);
    setCheckStatusText("Đang kiểm tra biến động số dư từ ngân hàng Sacombank qua SePay...");
    try {
      const res = await WalletService.checkServicePayment(paymentMemo, finalPrice);
      if (res.received) {
        setIsPaid(true);
        setCheckStatusText(null);
        setTimeout(async () => {
          setIsProcessing(true);
          try {
            await onSuccess("qr");
          } finally {
            setIsProcessing(false);
          }
        }, 800);
      } else {
        setCheckStatusText(
          res.message ||
            `Chưa phát hiện giao dịch chuyển khoản ${finalPrice.toLocaleString("vi-VN")} đ với nội dung "${paymentMemo}". Vui lòng hoàn tất chuyển tiền trên App ngân hàng trước khi bấm kiểm tra!`
        );
      }
    } catch {
      setCheckStatusText("Chưa tìm thấy giao dịch chuyển khoản trên tài khoản ngân hàng. Vui lòng chuyển tiền trước khi bấm xác nhận!");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handlePayWithWallet = async () => {
    if (walletBalance < finalPrice) {
      setShowTopUpModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      await WalletService.pay(finalPrice, `Thanh toán ${item.title}`, "Ví hội viên");
      await onSuccess("wallet");
    } catch (e: any) {
      setCheckStatusText(e?.message || "Thanh toán bằng ví thất bại. Vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isProcessing || isCheckingPayment;
  const isSufficient = walletBalance >= finalPrice;
  const remainingAfter = walletBalance - finalPrice;
  const missingAmount = Math.max(0, finalPrice - walletBalance);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isBusy) onClose();
        }}
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400">
                {item.categoryTitle || "Xác nhận thanh toán"}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {item.title}
              </h3>
            </div>
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            {/* Tóm tắt thông tin gói & Chi tiết hóa đơn */}
            <UniversalPaymentInvoiceSummary
              item={item}
              membership={membership}
              originalPrice={originalPrice}
              finalPrice={finalPrice}
              discountAmount={discountAmount}
              discountPct={discountPct}
            />

            {/* CHỌN PHƯƠNG THỨC THANH TOÁN (3 TABS) */}
            <div>
              <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mb-2 block">
                Chọn phương thức thanh toán:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "wallet"
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-bold">Ví hội viên</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {walletBalance >= 1000000 ? `${(walletBalance / 1000000).toFixed(1)}M đ` : `${Math.floor(walletBalance / 1000)}k đ`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("qr")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "qr"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold">Mã VietQR</span>
                  <span className="text-[9px] text-emerald-600 font-semibold">Tự động ⚡</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("counter")}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "counter"
                      ? "border-slate-600 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 shadow-sm ring-2 ring-slate-500/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Building className="w-5 h-5 text-slate-600 shrink-0" />
                  <span className="text-[11px] font-bold">Tại quầy</span>
                  <span className="text-[9px] text-slate-400">Giữ chỗ trước</span>
                </button>
              </div>
            </div>

            {/* NỘI DUNG TƯƠNG ỨNG VỚI PHƯƠNG THỨC */}
            {paymentMethod === "wallet" && (
              <UniversalPaymentWalletSection
                walletBalance={walletBalance}
                finalPrice={finalPrice}
                isSufficient={isSufficient}
                remainingAfter={remainingAfter}
                missingAmount={missingAmount}
                onOpenTopUp={() => setShowTopUpModal(true)}
              />
            )}

            {paymentMethod === "qr" && (
              <UniversalPaymentQrSection
                bankConfig={bankConfig}
                vietQrUrl={vietQrUrl}
                finalPrice={finalPrice}
                paymentMemo={paymentMemo}
                copiedKey={copiedKey}
                checkStatusText={checkStatusText}
                onCopy={handleCopy}
              />
            )}

            {paymentMethod === "counter" && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
                  <Building className="w-4 h-4 text-slate-600" />
                  <span>Thanh toán trực tiếp tại quầy lễ tân</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hệ thống sẽ tạo phiếu đăng ký giữ chỗ trước. Bạn vui lòng tới quầy lễ tân chi nhánh để thanh toán tiền mặt và kích hoạt dịch vụ trong vòng 24 giờ.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
            <button
              type="button"
              disabled={isBusy}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>

            {paymentMethod === "wallet" && (
              <button
                type="button"
                disabled={isBusy || !isSufficient}
                onClick={handlePayWithWallet}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{item.isRenewal ? `Trừ ${finalPrice.toLocaleString("vi-VN")} đ & Gia hạn` : `Trừ ${finalPrice.toLocaleString("vi-VN")} đ & Kích hoạt`}</span>
                  </>
                )}
              </button>
            )}

            {paymentMethod === "qr" && (
              <button
                type="button"
                disabled={isBusy}
                onClick={handleCheckPayment}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCheckingPayment ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra SePay...</span>
                  </>
                ) : isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã nhận tiền - Hoàn tất ngay</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Tôi đã chuyển tiền - Kiểm tra ngay</span>
                  </>
                )}
              </button>
            )}

            {paymentMethod === "counter" && (
              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    await onSuccess("counter");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Đang tạo phiếu...</span>
                  </>
                ) : (
                  <>
                    <Building className="w-4 h-4" />
                    <span>Tạo phiếu giữ chỗ tại quầy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {showTopUpModal && (
        <WalletTopUpModal
          isOpen={showTopUpModal}
          currentBalance={walletBalance}
          onClose={() => setShowTopUpModal(false)}
          onSuccess={() => {
            setShowTopUpModal(false);
            setWalletBalance(WalletService.getLocalWallet().balance);
          }}
        />
      )}
    </>,
    document.body
  );
};

export default UniversalPaymentModal;
