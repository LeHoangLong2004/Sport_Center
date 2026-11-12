import React from "react";
import { QrCode, CreditCard, Building } from "lucide-react";

interface Props {
  paymentMethod: "qr" | "counter";
  setPaymentMethod: (method: "qr" | "counter") => void;
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
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setPaymentMethod("qr")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            paymentMethod === "qr"
              ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 shadow-sm ring-2 ring-emerald-500/20"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          }`}
        >
          <QrCode className="w-5 h-5 shrink-0" />
          <span className="text-[11px] font-bold">Mã VietQR / SePay</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("counter")}
          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
            paymentMethod === "counter"
              ? "border-slate-600 bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 shadow-sm ring-2 ring-slate-500/20"
              : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          }`}
        >
          <Building className="w-5 h-5 text-slate-600 shrink-0" />
          <span className="text-[11px] font-bold">Tại quầy lễ tân</span>
        </button>
      </div>
    </div>
  );
};
