import React from "react";
import { Building, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  userName: string;
  phone: string;
  onClose: () => void;
}

export const TopUpCounterSection: React.FC<Props> = ({
  userName,
  phone,
  onClose,
}) => {
  return (
    <>
      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3 text-xs animate-in fade-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs uppercase tracking-wide">
              Nạp tiền tại quầy Lễ tân
            </h4>
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Quầy Thu ngân SportCenter • Tầng 1 (06:00 - 22:00)
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-amber-200/60 space-y-3 text-slate-700 dark:text-slate-300 text-xs">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px]">Hội viên</span>
              <strong className="text-slate-900 dark:text-white font-bold text-xs">
                {userName}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Số điện thoại</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                {phone}
              </strong>
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <p>
                <strong>Đến quầy Thu ngân (Tầng 1):</strong> Đọc số điện thoại của bạn cho nhân viên.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <p>
                <strong>Thanh toán linh hoạt:</strong> Hỗ trợ tiền mặt hoặc quẹt thẻ POS theo số tiền bạn muốn nạp.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <p>
                <strong>Cộng ví tức thì:</strong> Tiền sẽ được nạp trực tiếp vào ví hội viên ngay khi thanh toán.
              </p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span>Không cần thao tác gì thêm, thu ngân tại quầy sẽ hỗ trợ bạn trực tiếp!</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Tôi đã hiểu & Đóng</span>
      </button>
    </>
  );
};
