import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  LoaderCircle,
  Check,
  CheckCircle2,
  RefreshCw,
  QrCode,
  CreditCard,
  Building,
  Copy,
  Wallet,
  ArrowRight,
  PlusCircle,
  Sparkles,
  Clock,
} from "lucide-react";
import { BankConfigService } from "../services/bankConfig";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../services/walletService";
import { PackageAPI, getMembershipStatus, type MembershipStatus } from "../../../services/packageApi";
import WalletTopUpModal from "./WalletTopUpModal";

export interface UniversalPaymentItem {
  id: string;
  categoryTitle: string; // VD: "ĐĂNG KÝ GÓI THÀNH VIÊN", "ĐĂNG KÝ GÓI MÔN TẬP", "THANH TOÁN ĐƠN HÀNG CỬA HÀNG"
  title: string;          // VD: "Gói Premium Member", "Cầu Lông Tiêu Chuẩn"
  subtitle?: string;       // VD: "1 Tháng", "Studio 3"
  description?: string;
  originalPrice: number;
  discountPct?: number;
  discountAmount?: number;
  finalPrice: number;
  memoPrefix: string;     // VD: "MEMBER", "SPORT", "SHOP"
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

  // Reset status on open or payment method change
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
            
            {/* 1. Tóm tắt thông tin gói / dịch vụ */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-emerald-50/20 dark:from-emerald-950/30 dark:to-slate-850 border border-emerald-200/80 dark:border-emerald-800/80">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {item.subtitle || "Dịch vụ"}
                </span>
                {item.discountPct ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Ưu đãi -{item.discountPct}%
                  </span>
                ) : null}
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white mt-2">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            {/* Renewal Extension Box */}
            {item.isRenewal && item.renewalPreview && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Cộng dồn thời hạn nối tiếp</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Hạn dùng hiện tại:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      đến {item.renewalPreview.currentEndDate}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold">Hạn mới sau gia hạn:</span>
                    <span className="font-black text-emerald-700 dark:text-emerald-300">
                      đến {item.renewalPreview.newEndDate}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-700/90 dark:text-emerald-300/80 leading-relaxed italic">
                  ✓ Toàn bộ ngày chưa dùng được bảo lưu nguyên vẹn. Thời hạn mới tự động cộng thêm {item.renewalPreview.addedMonths} tháng ngay sau ngày hết hạn hiện tại.
                </p>
              </div>
            )}

            {/* 2. Chi tiết hóa đơn */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                {item.isRenewal ? "Chi tiết hóa đơn gia hạn" : "Chi tiết hóa đơn đăng ký"}
              </span>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Hạng thành viên của bạn:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  {membership?.name || "Hội viên tiêu chuẩn"}
                  {membership?.tier === "premium" && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 font-black">
                      VIP
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Giá gốc niêm yết:</span>
                <span className={`font-semibold ${discountAmount > 0 ? "line-through text-slate-400" : ""}`}>
                  {originalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Ưu đãi thành viên:</span>
                  <span>- {discountAmount.toLocaleString("vi-VN")} đ ({discountPct}%)</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  Tổng tiền thanh toán:
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl font-mono">
                  {finalPrice.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            {/* 3. CHỌN PHƯƠNG THỨC THANH TOÁN (4 TABS) */}
            <div>
              <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mb-2 block">
                Chọn phương thức thanh toán:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Ví */}
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

                {/* 2. QR */}
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

                {/* 3. Tại quầy */}
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

            {/* 4. PANEL NỘI DUNG TƯƠNG ỨNG VỚI PHƯƠNG THỨC */}
            {paymentMethod === "wallet" && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-800/60 border border-indigo-100 dark:border-indigo-900/40 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Ví thành viên SmartGym</h4>
                      <span className="text-[10px] text-slate-500">Khấu trừ tự động từ số dư tài khoản</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Thanh toán 1-chạm ⚡
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số dư ví hiện tại:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                      {walletBalance.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <span className="text-slate-500">Phí dịch vụ khấu trừ:</span>
                    <span className="font-bold font-mono">
                      - {finalPrice.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isSufficient ? "Số dư còn lại sau khi thanh toán:" : "Số tiền còn thiếu:"}
                    </span>
                    <span
                      className={`font-black font-mono text-xs ${
                        isSufficient
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isSufficient
                        ? `${remainingAfter.toLocaleString("vi-VN")} đ`
                        : `Thiếu ${missingAmount.toLocaleString("vi-VN")} đ`}
                    </span>
                  </div>
                </div>

                {isSufficient ? (
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-[11px]">Số dư ví đủ để thanh toán ngay!</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        Hệ thống sẽ trừ trực tiếp từ ví và kích hoạt dịch vụ thành công ngay lập tức.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-extrabold text-[11px]">Số dư ví không đủ!</p>
                        <p className="text-[10px] text-rose-700 dark:text-rose-300 leading-relaxed">
                          Bạn cần nạp thêm tối thiểu <strong>{missingAmount.toLocaleString("vi-VN")} đ</strong> để hoàn tất thanh toán.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTopUpModal(true)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Nạp thêm vào ví ngay</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === "qr" && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {bankConfig.bankCode || "Sacombank"} • {bankConfig.accountNumber}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    VietQR • Napas 247
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <img
                    src={vietQrUrl}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://api.vietqr.io/img/vietqr_net.png";
                    }}
                    alt={`Mã VietQR ${bankConfig.bankName}`}
                    className="w-44 h-auto object-contain mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-xs"
                  />
                  <p className="text-[10px] text-slate-500">
                    Mở App Ngân hàng bất kỳ (Sacombank, MBBank, VCB, MoMo,...) để quét mã tự động
                  </p>
                </div>

                {/* Thông tin chuyển khoản */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Ngân hàng:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{bankConfig.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tài khoản:</span>
                    <span className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                      {bankConfig.accountNumber}
                      <button
                        type="button"
                        onClick={() => handleCopy(bankConfig.accountNumber, "acc")}
                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Chủ tài khoản:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{bankConfig.accountName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số tiền:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      {finalPrice.toLocaleString("vi-VN")} đ
                      <button
                        type="button"
                        onClick={() => handleCopy(finalPrice.toString(), "amt")}
                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedKey === "amt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-1.5">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {paymentMemo}
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentMemo, "memo")}
                        className="p-0.5 text-amber-700 hover:text-amber-900 cursor-pointer"
                        title="Sao chép"
                      >
                        {copiedKey === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </span>
                  </div>
                </div>

                {/* Status Box */}
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-amber-900 dark:text-amber-200 block">
                      ⏳ Trạng thái: Chưa thanh toán (Chờ quét mã)
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">
                      Hệ thống tự động quét biến động số dư liên tục mỗi 2 giây. Bạn chỉ cần quét mã chuyển tiền!
                    </span>
                  </div>
                  <span className="px-2 py-1 bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-lg font-bold text-[10px] shrink-0">
                    CHỜ CHUYỂN TIỀN ⌛
                  </span>
                </div>

                {checkStatusText && (
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{checkStatusText}</span>
                  </div>
                )}
              </div>
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

