import React from "react";
import { QrCode, CreditCard, Building } from "lucide-react";

interface Props {
  method: "qr" | "card" | "counter";
  setMethod: (m: "qr" | "card" | "counter") => void;
}

export const TopUpMethodTabs: React.FC<Props> = ({ method, setMethod }) => {
  const options = [
    { id: "qr" as const, label: "Mã Vietcombank", icon: QrCode, color: "text-emerald-600" },
    { id: "card" as const, label: "Thẻ ATM / Visa", icon: CreditCard, color: "text-blue-600" },
    { id: "counter" as const, label: "Tại quầy", icon: Building, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Hình thức thanh toán
      </label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition-all ${
              method === m.id
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                : "bg-white dark:bg-slate-800 border-slate-200 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <m.icon className={`w-4 h-4 ${m.color}`} />
            <span className="text-[11px] font-bold">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
