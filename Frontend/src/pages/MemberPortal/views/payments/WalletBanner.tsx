import React from "react";
import { Wallet, PlusCircle } from "lucide-react";

interface Props {
  balance: number;
  onOpenTopUp: () => void;
}

export default function WalletBanner({ balance, onOpenTopUp }: Props) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/50 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ví tài khoản hội viên SportCenter</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Số dư khả dụng hiện tại
            </p>
            <div className="text-3xl font-black tracking-tight text-white mt-0.5">
              {balance.toLocaleString("vi-VN")}{" "}
              <span className="text-emerald-400 text-lg font-bold">đ</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            Sử dụng số dư ví để đăng ký nhanh các gói môn thể thao, mua vật phẩm thể thao hoặc dịch vụ tập luyện trực tiếp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenTopUp}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nạp tiền vào ví</span>
          </button>
        </div>
      </div>
    </div>
  );
}
