import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

interface Props {
  orderId: string;
  orderTitle: string;
  amount: number;
  transferMemo: string;
  onClose: () => void;
}

export const SePaySuccessView: React.FC<Props> = ({
  orderId,
  amount,
  transferMemo,
  onClose,
}) => {
  return (
    <div className="py-8 text-center flex flex-col items-center space-y-4 animate-scaleUp">
      <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xl ring-8 ring-emerald-50 dark:ring-emerald-950/30">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
          <Sparkles className="w-3.5 h-3.5" /> Giao dịch thành công
        </span>
        <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
          Đã nhận thanh toán!
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
          Hệ thống SePay đã đối soát tự động thành công đơn hàng{" "}
          <strong className="text-slate-800 dark:text-slate-200 font-mono">
            {transferMemo}
          </strong>
          . Quyền lợi gói tập của bạn đã được kích hoạt ngay lập tức!
        </p>
      </div>

      <div className="w-full p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
        <div className="flex justify-between">
          <span>Mã đơn hàng:</span>
          <span className="font-mono font-bold">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span>Số tiền đã thanh toán:</span>
          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
            {amount.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex justify-between">
          <span>Cổng thanh toán:</span>
          <span className="font-semibold">MBBank • SePay Webhook Auto</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer mt-2"
      >
        Hoàn tất & Quay lại
      </button>
    </div>
  );
};
