import React from "react";
import { Wallet, AlertCircle, CheckCircle2, ArrowRight, PlusCircle, Sparkles } from "lucide-react";

interface WalletPaymentPanelProps {
  currentBalance: number;
  classPrice: number;
  onOpenTopUp: () => void;
  isPaid?: boolean;
}

export const WalletPaymentPanel: React.FC<WalletPaymentPanelProps> = ({
  currentBalance,
  classPrice,
  onOpenTopUp,
  isPaid = false,
}) => {
  const isSufficient = currentBalance >= classPrice;
  const remainingAfter = currentBalance - classPrice;
  const missingAmount = Math.max(0, classPrice - currentBalance);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-800/60 border border-indigo-100 dark:border-indigo-900/40 space-y-3.5">
      {/* Header Panel */}
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">Ví thành viên SmartGym</h4>
            <span className="text-[10px] text-slate-500">Khấu trừ tự động từ số dư tài khoản</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
          Thanh toán 1-chạm ⚡
        </span>
      </div>

      {/* Bảng kê chi tiết số dư & khấu trừ */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Số dư ví hiện tại:</span>
          <span className="font-bold text-slate-900 dark:text-white font-mono text-xs">
            {currentBalance.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
          <span className="text-slate-500">Phí đặt lớp khấu trừ:</span>
          <span className="font-bold font-mono">
            - {classPrice.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isSufficient ? "Số dư còn lại sau khi đặt:" : "Số tiền còn thiếu:"}
          </span>
          <span
            className={`font-black font-mono text-xs ${
              isSufficient
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isSufficient
              ? `${remainingAfter.toLocaleString("vi-VN")} đ`
              : `Thiếu ${missingAmount.toLocaleString("vi-VN")} đ`}
          </span>
        </div>
      </div>

      {/* Thông báo trạng thái: Đủ hay Thiếu tiền */}
      {isPaid ? (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-[11px]">
            Đã trừ {classPrice.toLocaleString("vi-VN")} đ từ ví thành công!
          </span>
        </div>
      ) : isSufficient ? (
        <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">Số dư khả dụng đủ để đặt lớp ngay!</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
              Hệ thống sẽ trừ trực tiếp từ ví và kích hoạt đặt chỗ thành công ngay lập tức.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-[11px]">Số dư ví không đủ!</p>
              <p className="text-[10px] text-rose-700 dark:text-rose-300 leading-relaxed">
                Bạn cần nạp thêm tối thiểu <strong>{missingAmount.toLocaleString("vi-VN")} đ</strong> để hoàn tất thanh toán cho lớp học này.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenTopUp}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Nạp thêm tiền vào ví ngay</span>
          </button>
        </div>
      )}
    </div>
  );
};

