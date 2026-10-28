import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, QrCode, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import { BankConfigService } from "../services/bankConfig";
import { SePaySuccessView } from "./sepayQr/SePaySuccessView";
import { SePayQrBox } from "./sepayQr/SePayQrBox";
import { SePayBankDetailsCard } from "./sepayQr/SePayBankDetailsCard";

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
  )}&bank=${encodeURIComponent(bankConfig.bankCode || "Sacombank")}&amount=${amount}&des=${encodeURIComponent(
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
            <SePaySuccessView
              orderId={orderId}
              orderTitle={orderTitle}
              amount={amount}
              transferMemo={transferMemo}
              onClose={onClose}
            />
          ) : (
            <>
              {/* QR Image Box */}
              <SePayQrBox
                currentQrUrl={currentQrUrl}
                vietQrFallbackUrl={vietQrFallbackUrl}
                onQrError={() => setCurrentQrUrl(vietQrFallbackUrl)}
              />

              {/* Bank Account Details with Copy */}
              <SePayBankDetailsCard
                bankConfig={bankConfig}
                amount={amount}
                transferMemo={transferMemo}
                copiedKey={copiedKey}
                onCopy={handleCopy}
              />

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
                <span>{isChecking ? "Đang đối soát..." : "Xác nhận thanh toán"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
