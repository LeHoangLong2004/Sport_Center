import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  QrCode,
  CreditCard,
  Building,
  ShieldCheck,
  LoaderCircle,
  Check,
  Copy,
  Sparkles,
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";
import { BankConfigService } from "../../services/bankConfig";
import { WalletService } from "../../services/walletService";

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
  const [showTokenConfig, setShowTokenConfig] = useState(false);
  const [inputToken, setInputToken] = useState(() => bankConfig.sepayApiToken || "");

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

  const handleSaveToken = () => {
    const updated = { ...bankConfig, sepayApiToken: inputToken.trim() };
    BankConfigService.saveConfig(updated);
    setShowTokenConfig(false);
    setCheckStatusText(
      inputToken.trim()
        ? "Đã lưu SePay API Token thành công! Bạn có thể quét QR chuyển khoản thật để kiểm tra."
        : "Đã xóa SePay API Token."
    );
    setTimeout(() => setCheckStatusText(null), 4000);
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

          {/* Lớp & Coach info box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CoachAvatar
                src={classToBook.coachAvatar}
                name={classToBook.coachName}
                className="w-12 h-12 rounded-full border-2 border-teal-500 shrink-0"
              />
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {classToBook.name}
                </p>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
                  HLV phụ trách: {classToBook.coachName}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {classToBook.startTime} - {classToBook.endTime} • {classToBook.room}
                </p>
              </div>
            </div>
          </div>

          {/* BẢNG CHI TIẾT THANH TOÁN GIÁ GỐC */}
          <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700 space-y-2.5">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Chi tiết hóa đơn đăng ký
            </h4>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Hạng thành viên của bạn:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">🥉 Cơ bản (Basic Member)</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Giá gốc niêm yết buổi học:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {classPrice.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Ưu đãi thành viên:</span>
              <span className="font-bold text-slate-500">0 đ (Áp dụng 100% giá gốc)</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-teal-200 dark:border-slate-700 text-sm">
              <span className="font-extrabold text-slate-900 dark:text-white">Tổng tiền thanh toán:</span>
              <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {classPrice.toLocaleString("vi-VN")} đ
              </strong>
            </div>
          </div>

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
                <span className="text-[11px] font-bold">Mã Vietcombank</span>
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
                  {bankConfig.bankCode || "VCB"} • {bankConfig.accountNumber}
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
                <p className="text-[10px] text-slate-500">Mở App Ngân hàng (VCB Digibank, Techcom, MB,...) để quét mã tự động</p>
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

              {/* VIETQR LIVE STATUS BADGE */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      VietQR • {bankConfig.bankName}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Quét mã QR chuyển khoản trên App Ngân hàng hoặc MoMo, sau đó bấm Xác nhận đặt chỗ!
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
                  Napas 24/7 ⚡
                </span>
              </div>

              {/* Thông báo nếu kiểm tra chưa thấy tiền */}
              {checkStatusText && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs text-left flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{checkStatusText}</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === "card" && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cổng thanh toán thẻ bảo mật 256-bit
              </div>
              <input
                placeholder="Số thẻ (VD: 9704 0000 ....)"
                defaultValue="9704 1988 2026 8888"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="MM/YY"
                  defaultValue="12/28"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                />
                <input
                  placeholder="CVV"
                  defaultValue="888"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
                />
              </div>
            </div>
          )}

          {paymentMethod === "counter" && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold text-xs">Thanh toán trực tiếp khi đến trung tâm:</p>
              <p className="text-[11px] leading-relaxed">
                Chỗ học của bạn sẽ được giữ trước. Bạn vui lòng có mặt tại quầy lễ tân trước giờ bắt đầu lớp 10 phút để thanh toán giá gốc và nhận thẻ vào phòng tập.
              </p>
            </div>
          )}
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
