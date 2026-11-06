import React from "react";
import { ShieldCheck } from "lucide-react";

export const CardPaymentPanel: React.FC = () => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs mb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Cổng thanh toán thẻ bảo mật 256-bit
      </div>
      <input
        placeholder="Số thẻ (VD: 9704 0000 ....)"
        defaultValue="9704 1988 2026 8888"
        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="MM/YY"
          defaultValue="12/28"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
        />
        <input
          placeholder="CVV"
          defaultValue="888"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
        />
      </div>
    </div>
  );
};
