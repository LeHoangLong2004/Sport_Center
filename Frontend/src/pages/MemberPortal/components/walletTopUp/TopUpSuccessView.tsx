import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface Props {
  successResult: { amount: number; newBalance: number };
  onClose: () => void;
}

export const TopUpSuccessView: React.FC<Props> = ({ successResult, onClose }) => {
  return (
    <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-9 h-9" />
      </div>
      <div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white">
          Nạp tiền vào tài khoản thành công!
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Đã nạp{" "}
          <strong className="text-emerald-600 font-bold">
            {successResult.amount.toLocaleString("vi-VN")} đ
          </strong>{" "}
          vào ví
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg space-y-1">
        <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
          Số dư tài khoản mới
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
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-md cursor-pointer"
      >
        Hoàn tất & Đóng
      </button>
    </div>
  );
};
