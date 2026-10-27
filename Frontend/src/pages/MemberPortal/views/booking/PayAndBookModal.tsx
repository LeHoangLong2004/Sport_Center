import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  ShieldCheck,
  LoaderCircle,
  Check,
  Sparkles,
} from "lucide-react";
import { BankConfigService } from "../../services/bankConfig";
import { WalletService } from "../../services/walletService";
import { BookingClassHeader } from "./payAndBook/BookingClassHeader";
import { PaymentMethodSelector } from "./payAndBook/PaymentMethodSelector";
import { QrPaymentPanel } from "./payAndBook/QrPaymentPanel";
import { CardPaymentPanel } from "./payAndBook/CardPaymentPanel";
import { CounterPaymentPanel } from "./payAndBook/CounterPaymentPanel";

interface PayAndBookModalProps {
  classToBook: any | null;
  onClose: () => void;
  paymentMethod: "qr" | "card" | "counter";
  setPaymentMethod: (method: "qr" | "card" | "counter") => void;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onConfirmPayment: () => void;
}

export const PayAndBookModal: React.FC<PayAndBookModalProps> = ({
  classToBook,
  onClose,
  paymentMethod,
  setPaymentMethod,
  isProcessingPayment,
  paymentError,
  onConfirmPayment,
}) => {
  if (!classToBook) return null;

  const bankConfig = BankConfigService.getConfig();
  const classPrice = classToBook.price || 150000;
  const bookingMemo = `DATLOP ${classToBook.id ? String(classToBook.id).slice(0, 8).toUpperCase() : "CLASS"}`;
  const vietQrUrl = BankConfigService.getVietQrUrl(classPrice, bookingMemo, bankConfig);

  const [checkStatusText, setCheckStatusText] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reset status on open or payment method switch
  useEffect(() => {
    setCheckStatusText(null);
  }, [paymentMethod, classToBook]);

  // Auto-polling biến động số dư Vietcombank khi mở tab QR
  useEffect(() => {
    if (!classToBook || paymentMethod !== "qr" || isProcessingPayment) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await WalletService.checkTransfer(bookingMemo, classPrice);
        if (!isCancelled && res.received) {
          clearInterval(interval);
          onConfirmPayment();
        }
      } catch {}
    }, 2500);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [classToBook, paymentMethod, bookingMemo, classPrice, isProcessingPayment, onConfirmPayment]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setCheckStatusText("Đang kiểm tra biến động số dư Vietcombank...");
    try {
      const res = await WalletService.checkTransfer(bookingMemo, classPrice, undefined, false);
      if (res.received) {
        setCheckStatusText(null);
        onConfirmPayment();
      } else {
        setCheckStatusText(
          res.message ||
            `Chưa phát hiện giao dịch ${classPrice.toLocaleString("vi-VN")} đ với nội dung "${bookingMemo}" trên Vietcombank. Vui lòng hoàn tất chuyển khoản trước khi bấm kiểm tra!`
        );
      }
    } catch {
      setCheckStatusText("Chưa tìm thấy giao dịch chuyển khoản trên tài khoản Vietcombank.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    try {
      const res = await WalletService.simulateWebhook(classPrice, bookingMemo);
      if (res.success) {
        onConfirmPayment();
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const isBusy = isProcessingPayment || isCheckingPayment || isSimulating;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
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
              Xác nhận thanh toán & Đặt chỗ
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {classToBook.name}
            </h3>
          </div>
          <button
            type="button"
            disabled={isBusy}
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {paymentError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-extrabold">Không thể đặt lớp</p>
                <p className="mt-0.5 leading-relaxed">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Lớp & Chi tiết hóa đơn */}
          <BookingClassHeader classToBook={classToBook} classPrice={classPrice} />

          {/* CHỌN PHƯƠNG THỨC THANH TOÁN */}
          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />

          {/* NỘI DUNG THANH TOÁN TƯƠNG ỨNG */}
          {paymentMethod === "qr" && (
            <QrPaymentPanel
              bankConfig={bankConfig}
              classPrice={classPrice}
              bookingMemo={bookingMemo}
              vietQrUrl={vietQrUrl}
              copiedKey={copiedKey}
              onCopy={handleCopy}
              checkStatusText={checkStatusText}
            />
          )}

          {paymentMethod === "card" && <CardPaymentPanel />}

          {paymentMethod === "counter" && <CounterPaymentPanel />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          {paymentMethod === "qr" ? (
            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleSimulateWebhook}
                className="w-full sm:w-auto px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                title="Bấm nút này để mô phỏng Vietcombank vừa gửi tin nhắn tiền về (dành cho demo / kiểm thử)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{isSimulating ? "Đang gửi tín hiệu Webhook..." : "Mô phỏng Webhook tiền về (Demo Test ⚡)"}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleCheckPayment}
                  className="px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingPayment || isProcessingPayment ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra biến động số dư...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Tôi đã chuyển tiền • Xác nhận đặt chỗ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-3 w-full">
              <button
                type="button"
                disabled={isBusy}
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={onConfirmPayment}
                className="px-6 py-2.5 font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>{paymentMethod === "counter" ? "Đang xác nhận đặt chỗ..." : "Đang xử lý thanh toán..."}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {paymentMethod === "counter"
                        ? "Xác nhận giữ chỗ & Thanh toán tại quầy"
                        : `Thanh toán ${classPrice.toLocaleString("vi-VN")} đ & Đặt chỗ`}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
