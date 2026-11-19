import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  X,
  Wallet,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../../services/walletService";
import { BankConfigService } from "../../services/bankConfig";
import WalletTopUpModal from "../../components/WalletTopUpModal";
import { findConflictingSession } from "./bookingTypes";

interface PtBookingModalProps {
  bookingPtSlot: any | null;
  onClose: () => void;
  ptGoal: string;
  setPtGoal: (goal: string) => void;
  ptNote: string;
  setPtNote: (note: string) => void;
  membership?: any | null;
  activeOrders?: any[];
  mySessions?: any[];
  ptBookingError?: string | null;
  isProcessingPtBooking?: boolean;
  onConfirmPtBooking: (
    e: React.FormEvent,
    paymentData?: { paymentMethod?: "qr" | "counter" | "wallet" | "package"; amount?: number }
  ) => void;
}

export const PtBookingModal: React.FC<PtBookingModalProps> = ({
  bookingPtSlot,
  onClose,
  ptGoal,
  setPtGoal,
  ptNote,
  setPtNote,
  membership,
  activeOrders = [],
  mySessions = [],
  ptBookingError,
  isProcessingPtBooking = false,
  onConfirmPtBooking,
}) => {
  if (!bookingPtSlot) return null;

  // 0. Kiểm tra xung đột lịch ngay trên UI
  const conflictingSession = useMemo(() => {
    return findConflictingSession(bookingPtSlot, mySessions);
  }, [bookingPtSlot, mySessions]);

  // 1. Phân tích gói PT và mức ưu đãi hạng thành viên
  const basePrice = 300000;
  const isPremium = membership?.tier === "premium";
  const isPlus = membership?.tier === "plus";
  // Hạng Plus: giảm 5% PT 1-1 | Hạng Premium: giảm 8% PT 1-1
  const discountPct = isPremium ? 8 : isPlus ? 5 : 0;
  const tierName = isPremium ? "Hạng Premium (-8%)" : isPlus ? "Hạng Plus (-5%)" : "";

  const coveringPkg = useMemo(() => {
    if (!bookingPtSlot || !activeOrders || activeOrders.length === 0) return null;
    const nowStr = new Date().toISOString().slice(0, 10);
    const sSport = (bookingPtSlot.sport || "").toLowerCase();
    return activeOrders.find((o) => {
      if (o.status !== "paid") return false;
      if (o.endDate && o.endDate.slice(0, 10) < nowStr) return false;
      const pName = (o.packageSnapshot?.name || "").toLowerCase();
      const pSport = (o.packageSnapshot?.sport || "").toLowerCase();
      const isPtPkg =
        pName.includes("1-1") ||
        pName.includes("pt") ||
        pName.includes("coach") ||
        pName.includes("kèm");
      return (
        isPtPkg &&
        (sSport.includes(pSport) ||
          pSport.includes(sSport) ||
          pName.includes(sSport))
      );
    });
  }, [bookingPtSlot, activeOrders]);

  const isCovered = Boolean(coveringPkg);
  const discountAmount = isCovered
    ? basePrice
    : Math.round(basePrice * (discountPct / 100));
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // 2. Phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "qr" | "counter">("wallet");
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    return WalletService.getLocalWallet().balance;
  });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const hasEnoughWallet = walletBalance >= finalPrice;

  // VietQR Config
  const bankConfig = BankConfigService.getConfig();
  const slotCode = bookingPtSlot.id ? String(bookingPtSlot.id).slice(0, 8).toUpperCase() : "PT";
  const bookingMemo = `DATPT ${slotCode}`;
  const vietQrUrl = BankConfigService.getVietQrUrl(finalPrice, bookingMemo, bankConfig);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [conflictAlert, setConflictAlert] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (conflictingSession) {
      const msg = `Phát hiện xung đột lịch tập! Bạn đã có lịch "${conflictingSession.name}" vào khung giờ ${conflictingSession.startTime} - ${conflictingSession.endTime} (Ngày ${conflictingSession.date}).`;
      setConflictAlert(msg);
      toast.error(msg);
      return;
    }

    const effectiveMethod = isCovered ? "package" : paymentMethod;
    onConfirmPtBooking(e, {
      paymentMethod: effectiveMethod,
      amount: finalPrice,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Đặt lịch kèm riêng 1-1 (Personal Trainer)
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Buổi tập với {bookingPtSlot.coachName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* 1. Thông tin ca tập */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Khung giờ:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {bookingPtSlot.startTime} - {bookingPtSlot.endTime} • Ngày {bookingPtSlot.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bộ môn & Phòng tập:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {bookingPtSlot.sport} • {bookingPtSlot.room || "Khu PT chuyên biệt"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời lượng:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  60 phút (Kèm 1-1)
                </span>
              </div>
            </div>

            {/* CẢNH BÁO XUNG ĐỘT LỊCH NGAY TRÊN MODAL */}
            {conflictingSession && (
              <div className="p-4 rounded-2xl bg-rose-50/95 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5">
                <div className="flex items-center gap-2 font-black text-rose-700 dark:text-rose-300 text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                  <span>Phát hiện xung đột lịch tập (Trùng giờ)</span>
                </div>
                <p className="text-[11px] leading-relaxed font-semibold text-rose-800 dark:text-rose-300">
                  Bạn đã có lịch <strong>"{conflictingSession.name}"</strong> vào khung giờ{" "}
                  <strong>{conflictingSession.startTime} - {conflictingSession.endTime}</strong> (Ngày {conflictingSession.date}).
                </p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium italic">
                  Hệ thống không thể đặt trùng 2 ca cùng thời điểm. Vui lòng chọn ca khác hoặc hủy lịch cũ trước khi đặt ca này.
                </p>
              </div>
            )}

            {ptBookingError && !conflictingSession && (
              <div className="p-3.5 rounded-2xl bg-rose-50/95 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-150 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-rose-700 dark:text-rose-300">Không thể hoàn tất đặt lịch</div>
                  <p className="text-[11px] mt-0.5 leading-relaxed font-medium">{ptBookingError}</p>
                </div>
              </div>
            )}

            {/* 2. Chi tiết chi phí & Ưu đãi thành viên */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-slate-50 dark:from-emerald-950/20 dark:to-slate-850 border border-emerald-200/70 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between font-medium text-slate-600 dark:text-slate-400">
                <span>Giá niêm yết ca kèm 1-1:</span>
                <span className={finalPrice < basePrice ? "line-through text-slate-400" : "font-bold text-slate-800 dark:text-slate-200"}>
                  {basePrice.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {isCovered ? (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Quyền lợi gói ({coveringPkg?.packageSnapshot?.name}):</span>
                  <span>-300.000 đ (Miễn phí 100%)</span>
                </div>
              ) : discountPct > 0 ? (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Ưu đãi {tierName}:</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")} đ</span>
                </div>
              ) : null}

              <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  Tổng thanh toán:
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {finalPrice === 0 ? "0 đ (Miễn phí)" : `${finalPrice.toLocaleString("vi-VN")} đ`}
                </span>
              </div>
            </div>

            {/* 3. Lựa chọn phương thức thanh toán nếu có phí */}
            {finalPrice > 0 ? (
              <div className="space-y-2.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Chọn phương thức thanh toán:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === "wallet"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-[11px]">Ví hội viên</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qr")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === "qr"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="text-[11px]">VietQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("counter")}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === "counter"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-[11px]">Tại quầy</span>
                  </button>
                </div>

                {/* Panel Ví */}
                {paymentMethod === "wallet" && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Số dư ví hiện tại:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {walletBalance.toLocaleString("vi-VN")} đ
                      </span>
                    </div>

                    {hasEnoughWallet ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Đủ số dư. Tiền sẽ được trừ tự động và kích hoạt ca tập ngay.</span>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Số dư ví không đủ (thiếu {(finalPrice - walletBalance).toLocaleString("vi-VN")} đ).</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowTopUpModal(true)}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                        >
                          + Nạp tiền vào ví ngay
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Panel VietQR */}
                {paymentMethod === "qr" && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      className="w-32 h-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1 shrink-0"
                    />
                    <div className="space-y-1.5 flex-1 w-full text-[11px]">
                      <div>
                        <span className="text-slate-400">Ngân hàng: </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{bankConfig.bankId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Số tài khoản: </span>
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{bankConfig.accountNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankConfig.accountNumber, "acc")}
                          className="text-emerald-600 hover:text-emerald-500 p-1"
                        >
                          {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Nội dung CK: </span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{bookingMemo}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(bookingMemo, "memo")}
                          className="text-emerald-600 hover:text-emerald-500 p-1"
                        >
                          {copiedKey === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Tại quầy */}
                {paymentMethod === "counter" && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <Building className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Hệ thống sẽ giữ chỗ ca tập với HLV trước. Bạn vui lòng thanh toán số tiền{" "}
                      <strong>{finalPrice.toLocaleString("vi-VN")} đ</strong> tại quầy lễ tân trước khi bắt đầu buổi tập.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Buổi tập kèm riêng này được bao trọn trong gói tập của bạn. Miễn phí đặt lịch (0 đ).
                </span>
              </div>
            )}

            {/* 4. Nhập mục tiêu tập luyện */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Mục tiêu trọng tâm buổi tập: *
              </label>
              <input
                type="text"
                value={ptGoal}
                onChange={(e) => setPtGoal(e.target.value)}
                placeholder="Nhập mục tiêu tập luyện (VD: Tăng cơ, Giảm mỡ, Kỹ thuật chuẩn...)"
                list="pt-goal-suggestions"
                required
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none font-medium focus:border-emerald-500 transition-colors"
              />
              <datalist id="pt-goal-suggestions">
                <option value="Tăng cơ & Siết nét (Hypertrophy)" />
                <option value="Giảm mỡ & Đốt calo cường độ cao" />
                <option value="Cải thiện kỹ thuật động tác chuẩn" />
                <option value="Giãn cơ sâu & Phục hồi thể lực" />
                <option value="Tập sức mạnh tối đa (Strength)" />
              </datalist>
            </div>

            {/* 5. Ghi chú cho HLV */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                Ghi chú / Nhắn gửi Huấn luyện viên:
              </label>
              <textarea
                rows={2}
                value={ptNote}
                onChange={(e) => setPtNote(e.target.value)}
                placeholder="VD: Em cần tập trung cải thiện kỹ thuật Squat và Bench Press..."
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isProcessingPtBooking || (finalPrice > 0 && paymentMethod === "wallet" && !hasEnoughWallet)}
              className={`px-5 py-2 font-semibold text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                finalPrice > 0 && paymentMethod === "wallet" && !hasEnoughWallet
                  ? "bg-slate-400 cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98]"
              }`}
            >
              {isProcessingPtBooking ? (
                <span>Đang xử lý đặt lịch...</span>
              ) : finalPrice === 0 ? (
                <span>Xác nhận đặt lịch (Miễn phí 0 đ)</span>
              ) : paymentMethod === "wallet" ? (
                <span>Trừ {finalPrice.toLocaleString("vi-VN")} đ từ ví & Đặt lịch</span>
              ) : paymentMethod === "counter" ? (
                <span>Giữ chỗ & Thanh toán tại quầy</span>
              ) : (
                <span>Xác nhận & Mở mã VietQR</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {showTopUpModal && (
        <WalletTopUpModal
          isOpen={showTopUpModal}
          onClose={() => setShowTopUpModal(false)}
          defaultAmount={finalPrice > walletBalance ? finalPrice - walletBalance : 200000}
        />
      )}
    </div>,
    document.body
  );
};
