import React from "react";

export const CounterPaymentPanel: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1">
      <p className="font-bold text-xs">Thanh toán trực tiếp khi đến trung tâm:</p>
      <p className="text-[11px] leading-relaxed">
        Chỗ học của bạn sẽ được giữ trước. Bạn vui lòng có mặt tại quầy lễ tân trước giờ bắt đầu lớp 10 phút để thanh toán giá gốc và nhận thẻ vào phòng tập.
      </p>
    </div>
  );
};
