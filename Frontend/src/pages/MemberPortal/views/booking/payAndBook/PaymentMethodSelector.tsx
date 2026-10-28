import React from "react";
import { QrCode, CreditCard, Building } from "lucide-react";

interface Props {
  paymentMethod: "qr" | "card" | "counter";
  setPaymentMethod: (method: "qr" | "card" | "counter") => void;
}

export const PaymentMethodSelector: React.FC<Props> = ({
  paymentMethod,
  setPaymentMethod,
}) => {
  return (
    <div>
      <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mb-2 block">
        Chọn phương thức thanh toán:
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => setPaymentMethod("qr")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            paymentMethod === "qr"
              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          }`}
        >
          <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-bold">Mã Vietcombank</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            paymentMethod === "card"
              ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 shadow-sm ring-2 ring-teal-500/20"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          }`}
        >
          <CreditCard className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-[11px] font-bold">Thẻ ATM / Visa</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("counter")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            paymentMethod === "counter"
              ? "border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 shadow-sm ring-2 ring-amber-500/20"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          }`}
        >
          <Building className="w-5 h-5 text-amber-600 shrink-0" />
          <span className="text-[11px] font-bold">Tại quầy lễ tân</span>
        </button>
      </div>
    </div>
  );
};
