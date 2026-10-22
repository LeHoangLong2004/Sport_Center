import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  AlertCircle,
  QrCode,
  CreditCard,
  Building,
  ShieldCheck,
  LoaderCircle,
  Check
} from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";

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
  onConfirmPayment
}) => {
  if (!classToBook) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isProcessingPayment) onClose();
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
            disabled={isProcessingPayment}
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
                {(classToBook.price || 150000).toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Ưu đãi thành viên:</span>
              <span className="font-bold text-slate-500">0 đ (Áp dụng 100% giá gốc)</span>
            </div>
            <div className="flex justify-between items-center pt-2.5 border-t border-teal-200 dark:border-slate-700 text-sm">
              <span className="font-extrabold text-slate-900 dark:text-white">Tổng tiền thanh toán:</span>
              <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {(classToBook.price || 150000).toLocaleString("vi-VN")} đ
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
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "qr"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <QrCode className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-[11px] font-bold">Mã VNPAY</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "card"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <CreditCard className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-[11px] font-bold">Thẻ ATM / Visa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("counter")}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === "counter"
                    ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Building className="w-5 h-5 text-teal-600 shrink-0" />
                <span className="text-[11px] font-bold">Tại quầy lễ tân</span>
              </button>
            </div>
          </div>

          {/* NỘI DUNG THANH TOÁN TƯƠNG ỨNG */}
          {paymentMethod === "qr" && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2">
              <p className="text-[11px] text-slate-500">Mở App VNPAY hoặc bất kỳ ứng dụng ngân hàng nào để quét mã:</p>
              <div className="w-36 h-auto mx-auto bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                <img
                  src="/vnpay_qr.png"
                  alt="Mã QR VNPAY chính thức"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <span>Ví/TK VNPAY: <strong>0815353732</strong> • Chủ TK: <strong>Khách hàng 0815353732</strong></span>
                <br />
                <span>Số tiền: <strong className="text-emerald-600">{(classToBook.price || 150000).toLocaleString("vi-VN")} đ</strong></span>
              </div>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            disabled={isProcessingPayment}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isProcessingPayment}
            onClick={onConfirmPayment}
            className="px-6 py-2.5 font-bold text-xs rounded-xl shadow-lg shadow-teal-600/20 text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
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
                    : `Thanh toán ${(classToBook.price || 150000).toLocaleString("vi-VN")} đ & Đặt chỗ`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
