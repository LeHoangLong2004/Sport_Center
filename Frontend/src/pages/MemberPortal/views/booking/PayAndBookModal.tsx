import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  ShieldCheck,
  LoaderCircle,
  Check,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  QrCode,
  CreditCard,
  Building,
  Copy,
} from "lucide-react";
import { BankConfigService } from "../../services/bankConfig";
import { WalletService } from "../../services/walletService";
import { BookingClassHeader } from "./payAndBook/BookingClassHeader";
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
  const [isPaid, setIsPaid] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Reset status on open or payment method switch
  useEffect(() => {
    setCheckStatusText(null);
    setIsPaid(false);
  }, [paymentMethod, classToBook]);

  // Auto-polling biến động số dư khi mở tab QR
  useEffect(() => {
    if (!classToBook || paymentMethod !== "qr" || isProcessingPayment || isPaid) return;
    let isCancelled = false;

    const interval = setInterval(async () => {
      try {
        const res = await WalletService.checkTransfer(bookingMemo, classPrice);
        if (!isCancelled && res.received) {
          clearInterval(interval);
          setIsPaid(true);
          setCheckStatusText(null);
          setTimeout(() => {
            onConfirmPayment();
          }, 1000);
        }
      } catch {}
    }, 2000);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [classToBook, paymentMethod, bookingMemo, classPrice, isProcessingPayment, isPaid, onConfirmPayment]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCheckPayment = async () => {
    if (isPaid) {
      onConfirmPayment();
      return;
    }

    setIsCheckingPayment(true);
    setCheckStatusText("Đang kiểm tra biến động số dư từ ngân hàng qua SePay...");
    try {
      const res = await WalletService.checkTransfer(bookingMemo, classPrice, undefined, false);
      if (res.received) {
        setIsPaid(true);
        setCheckStatusText(null);
        setTimeout(() => {
          onConfirmPayment();
        }, 1000);
        return;
      } else {
        // CHƯA NHẬN ĐƯỢC TIỀN -> BÁO LỖI RÕ RÀNG VÀ KHÔNG CHO HOÀN TẤT
        setCheckStatusText(
          res.message ||
            `Chưa phát hiện giao dịch chuyển khoản ${classPrice.toLocaleString("vi-VN")} đ với nội dung "${bookingMemo}". Vui lòng hoàn tất chuyển tiền trên App ngân hàng trước khi xác nhận!`
        );
      }
    } catch {
      setCheckStatusText("Chưa tìm thấy giao dịch chuyển khoản trên tài khoản ngân hàng. Vui lòng chuyển tiền trước khi bấm xác nhận!");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const isBusy = isProcessingPayment || isCheckingPayment;

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
          <div>
            <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mb-2 block">
              Chọn phương thức thanh toán:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("qr")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "qr"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold">Mã VietQR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm ring-2 ring-teal-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <CreditCard className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-[11px] font-bold">Thẻ ATM / Visa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("counter")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  paymentMethod === "counter"
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Building className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-[11px] font-bold">Tại quầy lễ tân</span>
              </button>
            </div>
          </div>

          {/* NỘI DUNG THANH TOÁN TƯƠNG ỨNG */}
          {paymentMethod === "qr" && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {bankConfig.bankCode || "STB"} • {bankConfig.accountNumber}
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
                  className="w-40 h-auto object-contain mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-xs"
                />
                <p className="text-[10px] text-slate-500">Mở App Ngân hàng bất kỳ (Sacombank, MBBank, VCB, MoMo,...) để quét mã tự động</p>
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{bankConfig.bankName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-mono font-bold flex items-center gap-1 text-slate-900 dark:text-white">
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
                    {classPrice.toLocaleString("vi-VN")} đ
                    <button
                      type="button"
                      onClick={() => handleCopy(classPrice.toString(), "amt")}
                      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedKey === "amt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-1.5">
                  <span className="text-slate-500">Nội dung CK:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    {bookingMemo}
                    <button
                      type="button"
                      onClick={() => handleCopy(bookingMemo, "memo")}
                      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                      title="Sao chép"
                    >
                      {copiedKey === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </span>
                </div>
              </div>

              {/* VIETQR LIVE STATUS BADGE: TRƯỚC VÀ SAU KHI CHUYỂN KHOẢN */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  isPaid
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white border-emerald-400 shadow-md animate-in fade-in"
                    : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isPaid ? (
                      <div className="size-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <span className="relative flex h-3.5 w-3.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
                      </span>
                    )}
                    <div className="text-left">
                      <div
                        className={`text-xs font-black flex items-center gap-1.5 ${
                          isPaid ? "text-white" : "text-amber-950 dark:text-amber-200"
                        }`}
                      >
                        {isPaid
                          ? "🎉 ĐÃ NHẬN THANH TOÁN THÀNH CÔNG!"
                          : "⏳ Trạng thái: Chưa thanh toán (Chờ quét mã)"}
                      </div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isPaid ? "text-emerald-100" : "text-amber-800 dark:text-amber-300"
                        }`}
                      >
                        {isPaid
                          ? `Tài khoản Sacombank đã ghi nhận ${classPrice.toLocaleString("vi-VN")} đ. Hệ thống đang tự động kích hoạt đặt chỗ...`
                          : "Hệ thống tự động quét biến động số dư Sacombank liên tục mỗi 2 giây. Bạn chỉ cần quét mã chuyển tiền, hệ thống sẽ tự cập nhật!"}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border shadow-2xs shrink-0 ${
                      isPaid
                        ? "bg-white text-emerald-700 border-white font-bold"
                        : "bg-amber-100 dark:bg-slate-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                    }`}
                  >
                    {isPaid ? "Đã thanh toán ✓" : "Chờ chuyển tiền ⏳"}
                  </span>
                </div>
              </div>

              {/* Cảnh báo rõ ràng nếu bấm kiểm tra mà chưa thấy tiền */}
              {!isPaid && checkStatusText && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs text-left flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-rose-700 dark:text-rose-300">Chưa nhận được tiền thanh toán!</p>
                    <p className="text-[11px] leading-relaxed">{checkStatusText}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {paymentMethod === "card" && <CardPaymentPanel />}

          {paymentMethod === "counter" && <CounterPaymentPanel />}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          {paymentMethod === "qr" ? (
            <div className="flex items-center justify-end gap-3 w-full">
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
                disabled={isBusy || isPaid}
                onClick={handleCheckPayment}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                  isPaid
                    ? "bg-emerald-600 text-white shadow-emerald-600/30 cursor-wait"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                }`}
              >
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Đã nhận thanh toán • Đang đặt chỗ...</span>
                  </>
                ) : isCheckingPayment || isProcessingPayment ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span>Đang kiểm tra biến động số dư...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Tôi đã chuyển tiền - Kiểm tra ngay</span>
                  </>
                )}
              </button>
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
