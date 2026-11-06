import React from "react";
import { CreditCard, ShieldCheck, ArrowRight } from "lucide-react";

interface Props {
  card: { number: string; name: string; exp: string; cvv: string };
  setCard: React.Dispatch<React.SetStateAction<{ number: string; name: string; exp: string; cvv: string }>>;
  loading: boolean;
  actualAmount: number;
  onConfirmCard: () => void;
}

export const TopUpCardSection: React.FC<Props> = ({
  card,
  setCard,
  loading,
  actualAmount,
  onConfirmCard,
}) => {
  return (
    <>
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-blue-600" /> Thẻ ATM / Visa / Master
        </span>
        <input
          type="text"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: e.target.value })}
          placeholder="9704 •••• •••• ••••"
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
        />
        <input
          type="text"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
          placeholder="TEN CHU THE (IN HOA)"
          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={card.exp}
            onChange={(e) => setCard({ ...card, exp: e.target.value })}
            placeholder="MM/YY"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
          />
          <input
            type="password"
            maxLength={4}
            value={card.cvv}
            onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            placeholder="CVV"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
          />
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Bảo mật 3D Secure 256-bit SSL
        </div>
      </div>

      <button
        type="button"
        disabled={loading || actualAmount <= 0}
        onClick={onConfirmCard}
        className="w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-500"
      >
        {loading ? (
          <span>Đang xử lý thẻ...</span>
        ) : (
          <>
            <span>Thanh toán thẻ {actualAmount.toLocaleString("vi-VN")} đ</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </>
  );
};
