import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Wallet,
  X,
  CheckCircle2,
  QrCode,
  CreditCard,
  Building,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { WalletService } from "../services/walletService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  userName?: string;
  phone?: string;
  onSuccess?: (newBalance: number) => void;
}

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

export default function WalletTopUpModal({
  isOpen,
  onClose,
  currentBalance,
  userName = "Hội viên",
  phone = "0901234567",
  onSuccess,
}: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number>(500000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"qr" | "card" | "counter">("qr");
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    amount: number;
    newBalance: number;
  } | null>(null);

  if (!isOpen) return null;

  const actualAmount = customAmount
    ? Number(customAmount.replace(/\D/g, ""))
    : selectedAmount;

  const phoneDigits = phone ? phone.replace(/\D/g, "").slice(-4) : "8888";
  const transferMemo = `NAPVI ${phoneDigits}`.toUpperCase();
  const vietQrUrl = `https://api.vietqr.io/image/970436-1234567890123-compact2.jpg?amount=${actualAmount}&addInfo=${encodeURIComponent(
    transferMemo
  )}&accountName=SPORTCENTER%20VIET%20NAM`;

  const handleConfirmTopUp = async () => {
    if (actualAmount <= 0) return;
    setLoading(true);

    const methodName =
      method === "qr"
        ? "Chuyển khoản VietQR"
        : method === "card"
        ? "Thẻ ATM / Thẻ tín dụng"
        : "Tiền mặt tại quầy";

    try {
      const result = await WalletService.topUp(
        actualAmount,
        methodName,
        `Nạp tiền tài khoản hội viên (${transferMemo})`
      );

      if (result.success) {
        setSuccessResult({
          amount: actualAmount,
          newBalance: result.newBalance,
        });
        if (onSuccess) {
          onSuccess(result.newBalance);
        }
      }
    } catch (e) {
      console.error("Lỗi nạp ví:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Ví & Số dư tài khoản
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kiểm tra số dư hiện tại và nạp thêm tiền vào ví hội viên
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successResult ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Nạp tiền vào tài khoản thành công!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Đã ghi nhận giao dịch nạp{" "}
                  <strong className="text-emerald-600 font-bold">
                    {successResult.amount.toLocaleString("vi-VN")} đ
                  </strong>
                </p>
              </div>

              {/* Updated Balance Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-1">
                <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
                  Số dư tài khoản mới của bạn
                </span>
                <div className="text-2xl font-black">
                  {successResult.newBalance.toLocaleString("vi-VN")} đ
                </div>
                <div className="text-[11px] text-emerald-100/90 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sẵn sàng sử dụng thanh toán gói tập & tiện ích</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md hover:opacity-90 transition-opacity cursor-pointer"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          ) : (
            <>
              {/* CURRENT BALANCE BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md relative overflow-hidden border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                      Số dư khả dụng hiện tại
                    </span>
                    <div className="text-2xl font-black text-white tracking-tight">
                      {currentBalance.toLocaleString("vi-VN")}{" "}
                      <span className="text-sm font-semibold text-emerald-400">đ</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Hội viên: {userName}</span>
                  </div>
                </div>
              </div>

              {/* CHOOSE AMOUNT */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Chọn số tiền muốn nạp
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => {
                    const isSelected = !customAmount && selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setCustomAmount("");
                          setSelectedAmount(amt);
                        }}
                        className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer text-center ${
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs ring-2 ring-emerald-500/20"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {amt.toLocaleString("vi-VN")} đ
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="relative mt-2">
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      setCustomAmount(digits ? Number(digits).toLocaleString("vi-VN") : "");
                    }}
                    placeholder="Hoặc tự nhập số tiền khác..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {customAmount && (
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-emerald-600">
                      đ
                    </span>
                  )}
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Hình thức thanh toán nạp tiền
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod("qr")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      method === "qr"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-bold">VietQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      method === "card"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="text-[11px] font-bold">Thẻ ATM / Visa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod("counter")}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      method === "counter"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Building className="w-5 h-5 text-amber-600" />
                    <span className="text-[11px] font-bold">Tại quầy</span>
                  </button>
                </div>
              </div>

              {/* QR Preview if method === 'qr' */}
              {method === "qr" && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 inline-block shadow-xs">
                    <img
                      src={vietQrUrl}
                      alt="Mã QR nạp tiền"
                      className="w-44 h-44 object-contain mx-auto rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Quét mã trên app Ngân hàng để nạp tiền tự động
                  </p>
                  <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono font-bold text-xs rounded-lg">
                    Cú pháp: {transferMemo}
                  </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <button
                type="button"
                disabled={loading || actualAmount <= 0}
                onClick={handleConfirmTopUp}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Đang xử lý nạp tiền...</span>
                ) : (
                  <>
                    <span>
                      Xác nhận nạp {actualAmount.toLocaleString("vi-VN")} đ vào ví
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
