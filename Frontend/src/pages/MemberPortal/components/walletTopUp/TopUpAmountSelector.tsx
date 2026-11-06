import React from "react";

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000, 2000000];

interface Props {
  selectedAmount: number;
  setSelectedAmount: (amt: number) => void;
  customAmount: string;
  setCustomAmount: (amt: string) => void;
}

export const TopUpAmountSelector: React.FC<Props> = ({
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Chọn số tiền nạp
      </label>
      <div className="grid grid-cols-3 gap-2">
        {PRESET_AMOUNTS.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => {
              setCustomAmount("");
              setSelectedAmount(amt);
            }}
            className={`py-2 px-2.5 rounded-xl font-bold text-xs border text-center transition-all ${
              !customAmount && selectedAmount === amt
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300"
            }`}
          >
            {amt.toLocaleString("vi-VN")} đ
          </button>
        ))}
      </div>
      <div className="relative mt-1.5">
        <input
          type="text"
          value={customAmount}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "");
            setCustomAmount(d ? Number(d).toLocaleString("vi-VN") : "");
          }}
          placeholder="Nhập số tiền khác..."
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500"
        />
        {customAmount && (
          <span className="absolute right-3 top-2 text-xs font-bold text-emerald-600">
            đ
          </span>
        )}
      </div>
    </div>
  );
};
