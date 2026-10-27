import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Building,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { BankConfigService } from "../services/bankConfig";

interface SePayQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderTitle: string;
  amount: number;
  onPaymentSuccess?: () => void;
}

export default function SePayQrModal({
  isOpen,
  onClose,
  orderId,
  orderTitle,
  amount,
  onPaymentSuccess,
}: SePayQrModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const bankConfig = BankConfigService.getConfig();

  // Normalize order ID for transfer memo: "GYM" + Clean Order ID
  const cleanId = orderId.replace(/[^a-zA-Z0-9-]/g, "");
  const transferMemo = `GYM${cleanId}`;

  // SePay QR URL with fallback to VietQR CDN
  const sepayQrUrl = `https://qr.sepay.vn/img?acc=${encodeURIComponent(
    bankConfig.accountNumber
  )}&bank=MBBank&amount=${amount}&des=${encodeURIComponent(
    transferMemo
  )}&template=compact`;

  const vietQrFallbackUrl = `https://img.vietqr.io/image/${bankConfig.bankBin}-${bankConfig.accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(
    transferMemo
  )}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

  const [currentQrUrl, setCurrentQrUrl] = useState(sepayQrUrl);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      console.warn("Failed to copy:", e);
    }
  };

  // Check order payment status against backend
  const checkPaymentStatus = useCallback(async () => {
    if (!orderId || isPaid) return;
    try {
      setIsChecking(true);

      const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
      const res = await fetch(`${API_BASE}/api/payments/sepay-check/${cleanId}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isPaid || data.status === "completed" || data.status === "paid") {
          setIsPaid(true);
          onPaymentSuccess?.();
          return;
        }
      }
    } catch (err: any) {
      console.warn("Status check failed:", err);
    } finally {
      setIsChecking(false);
    }
  }, [cleanId, orderId, isPaid, onPaymentSuccess]);

  // Polling loop every 3 seconds while modal is open and not yet paid
  useEffect(() => {
    if (!isOpen || isPaid) return;

    // Reset state on open
    setIsPaid(false);
    setCurrentQrUrl(sepayQrUrl);

    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isPaid, checkPaymentStatus, sepayQrUrl]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Thanh Toán VietQR SePay
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-white">
                  MBBank 24/7
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                {orderTitle}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isPaid ? (
            /* Success State */
            <div className="py-8 text-center flex flex-col items-center space-y-4 animate-scaleUp">
              <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                  <Sparkles className="w-3.5 h-3.5" /> Giao dịch thành công
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                  Đã nhận thanh toán!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
                  Hệ thống SePay đã đối soát tự động thành công đơn hàng{" "}
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">
                    {transferMemo}
                  </strong>
                  . Quyền lợi gói tập của bạn đã được kích hoạt ngay lập tức!
                </p>
              </div>

              <div className="w-full p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                <div className="flex justify-between">
                  <span>Mã đơn hàng:</span>
                  <span className="font-mono font-bold">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số tiền đã thanh toán:</span>
                  <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    {amount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cổng thanh toán:</span>
                  <span className="font-semibold">MBBank • SePay Webhook Auto</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer mt-2"
              >
                Hoàn tất & Quay lại
              </button>
            </div>
          ) : (
            /* QR & Bank details */
            <>
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs relative">
                <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center group">
                  <img
                    src={currentQrUrl}
                    alt="VietQR MBBank"
                    onError={() => setCurrentQrUrl(vietQrFallbackUrl)}
                    className="w-56 h-56 object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 rounded-2xl transition-colors pointer-events-none" />
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Mở app ngân hàng bất kỳ để quét mã VietQR</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Số tiền và nội dung sẽ được điền tự động chính xác
                </span>
              </div>

              {/* Bank Account Details with Copy */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Building className="w-4 h-4" />
                    <span className="text-xs font-extrabold uppercase tracking-wide">
                      {bankConfig.bankName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Napas 247
                  </span>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
                    <span className="text-lg font-mono font-black tracking-widest text-white">
                      {bankConfig.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.accountNumber, "acc")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "acc" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Chủ tài khoản:</span>
                    <span className="text-xs font-bold uppercase text-slate-200">
                      {bankConfig.accountName}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Số tiền thanh toán:</span>
                    <span className="text-xl font-black text-emerald-400">
                      {amount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(amount.toString(), "amount")}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "amount" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Transfer memo (CRITICAL FOR SEPAY MATCHING) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase text-amber-400">
                        Nội dung chuyển khoản (Bắt buộc):
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">
                      {transferMemo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferMemo, "memo")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedKey === "memo" ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Note */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Vui lòng <strong>giữ nguyên nội dung chuyển khoản</strong> để hệ thống SePay tự động
                  kích hoạt dịch vụ trong vòng 1-3 giây. Sau khi chuyển xong, hệ thống sẽ tự cập nhật
                  trạng thái mà bạn không cần tải lại trang.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isPaid && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bảo mật qua MBBank & SePay</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={isChecking}
                onClick={checkPaymentStatus}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Đang đối soát..." : "Tôi đã chuyển khoản"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
