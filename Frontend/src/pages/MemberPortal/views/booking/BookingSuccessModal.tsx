import React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ShieldCheck, Star, Phone, MessageCircle } from "lucide-react";
import { CoachAvatar } from "../../utils/coachAvatar";

interface BookingSuccessModalProps {
  bookingSuccessInfo: any | null;
  onClose: () => void;
  onViewMyClasses: () => void;
  onStartChatWithCoach: (coachName: string, coachId?: string, coachAvatar?: string) => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  bookingSuccessInfo,
  onClose,
  onViewMyClasses,
  onStartChatWithCoach
}) => {
  if (!bookingSuccessInfo) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Success / Pending Banner */}
        {bookingSuccessInfo.paymentMethod === "counter" ? (
          <div className="p-6 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-center relative overflow-hidden shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg text-3xl">
              🎫
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 inline-block mb-1">
              Đặt giữ chỗ thành công · Chờ thanh toán tại quầy
            </span>
            <h3 className="text-xl font-black">Đặt giữ chỗ lớp thành công!</h3>
            <p className="text-xs text-amber-100 mt-1 max-w-xs mx-auto">
              Chỗ học của bạn đã được giữ trước. Vui lòng thanh toán trực tiếp tại quầy lễ tân trước giờ học.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center relative overflow-hidden shrink-0">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 inline-block mb-1">
              Giao dịch thành công
            </span>
            <h3 className="text-xl font-black">Đặt lớp & Thanh toán thành công!</h3>
            <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
              Đơn đặt lớp của bạn đã được xác nhận. Dưới đây là thông tin lớp học và Huấn luyện viên phụ trách.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Tóm tắt lớp học */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between items-center font-extrabold text-sm text-slate-900 dark:text-white">
              <span>{bookingSuccessInfo.classItem.name}</span>
              <span className={bookingSuccessInfo.paymentMethod === "counter" ? "text-amber-600 dark:text-amber-400 font-black" : "text-emerald-600 dark:text-emerald-400 font-black"}>
                {bookingSuccessInfo.paidAmount?.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>{bookingSuccessInfo.paymentMethod === "counter" ? "Mã phiếu hẹn:" : "Mã hóa đơn:"}</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {bookingSuccessInfo.invoiceId}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Hình thức thanh toán:</span>
              <span className={`font-bold ${bookingSuccessInfo.paymentMethod === "counter" ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-300"}`}>
                {bookingSuccessInfo.paymentMethod === "counter" ? "Thanh toán tại quầy lễ tân" : "Thanh toán trực tuyến"}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 items-center">
              <span>Trạng thái:</span>
              <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${bookingSuccessInfo.paymentMethod === "counter" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"}`}>
                {bookingSuccessInfo.paymentMethod === "counter" ? "⏳ Chờ thanh toán tại quầy" : "✓ Đã thanh toán"}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Thời gian học:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {bookingSuccessInfo.classItem.startTime} - {bookingSuccessInfo.classItem.endTime} (Ngày {bookingSuccessInfo.classItem.dateStr || "Hôm nay"})
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Phòng tập:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {bookingSuccessInfo.classItem.room}
              </span>
            </div>
          </div>

          {bookingSuccessInfo.paymentMethod === "counter" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-xs">
                <span>📍</span> Hướng dẫn nhận vé vào lớp tại quầy:
              </p>
              <p>
                • Vui lòng có mặt tại quầy lễ tân chi nhánh trước giờ học <strong>10 phút</strong>.
              </p>
              <p>
                • Đọc <strong>Số điện thoại</strong> hoặc xuất trình mã phiếu <strong className="font-mono text-amber-950 dark:text-amber-100 font-bold">{bookingSuccessInfo.invoiceId}</strong> để Lễ tân thu tiền ({bookingSuccessInfo.paidAmount?.toLocaleString("vi-VN")} đ) bằng tiền mặt / thẻ POS và kích hoạt thẻ vào phòng.
              </p>
            </div>
          )}

          {/* CARD HUẤN LUYỆN VIÊN PHỤ TRÁCH ĐẦY ĐỦ */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-850 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> Huấn luyện viên phụ trách lớp của bạn
              </span>
              <span className="flex items-center gap-1 text-xs font-black text-amber-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-100">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {bookingSuccessInfo.classItem.coachRating ?? "—"}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <CoachAvatar
                src={bookingSuccessInfo.classItem.coachAvatar}
                name={bookingSuccessInfo.classItem.coachName}
                className="w-14 h-14 rounded-full border-2 border-teal-500 shadow-md shrink-0"
              />
              <div>
                <h4 className="font-black text-base text-slate-900 dark:text-white">
                  {bookingSuccessInfo.classItem.coachName}
                </h4>
                <p className="text-xs font-bold text-teal-700 dark:text-teal-400">
                  {bookingSuccessInfo.classItem.coachSpecialty}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" /> {bookingSuccessInfo.classItem.coachPhone}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-teal-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{bookingSuccessInfo.classItem.coachBio || "Chào mừng bạn tham gia lớp học! Huấn luyện viên rất mong chờ được đồng hành cùng bạn trong buổi tập sắp tới."}"
            </div>

            <button
              type="button"
              onClick={() =>
                onStartChatWithCoach(
                  bookingSuccessInfo.classItem.coachName,
                  bookingSuccessInfo.classItem.coachId,
                  bookingSuccessInfo.classItem.coachAvatar
                )
              }
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhắn tin trò chuyện với HLV {bookingSuccessInfo.classItem.coachName}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={onViewMyClasses}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-colors shadow-sm text-white ${
              bookingSuccessInfo.paymentMethod === "counter"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {bookingSuccessInfo.paymentMethod === "counter" ? "Xem lớp đang giữ chỗ →" : "Xem lớp đã đăng ký →"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
