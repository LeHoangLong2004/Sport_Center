import React from "react";
import { CheckCircle2 } from "lucide-react";

interface BookingSuccessBannerProps {
  paymentMethod?: string;
}

export const BookingSuccessBanner: React.FC<BookingSuccessBannerProps> = ({ paymentMethod }) => {
  if (paymentMethod === "counter") {
    return (
      <div className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center relative overflow-hidden shrink-0">
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
    );
  }

  return (
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
  );
};
