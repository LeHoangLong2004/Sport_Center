import React from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import type { BankConfig } from "../../services/bankConfig";

interface UniversalPaymentQrSectionProps {
  bankConfig: BankConfig;
  vietQrUrl: string;
  finalPrice: number;
  paymentMemo: string;
  copiedKey: string | null;
  checkStatusText: string | null;
  onCopy: (text: string, key: string) => void;
}

export const UniversalPaymentQrSection: React.FC<UniversalPaymentQrSectionProps> = ({
  bankConfig,
  vietQrUrl,
  finalPrice,
  paymentMemo,
  copiedKey,
  checkStatusText,
  onCopy,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {bankConfig.bankCode || "Sacombank"} • {bankConfig.accountNumber}
        </span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          VietQR • Napas 247
        </span>
      </div>

      <div className="text-center space-y-1">
        <img
          src={vietQrUrl}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://api.vietqr.io/img/vietqr_net.png";
          }}
          alt={`Mã VietQR ${bankConfig.bankName}`}
          className="w-44 h-auto object-contain mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-xs"
        />
        <p className="text-[10px] text-slate-500">
          Mở App Ngân hàng bất kỳ (Sacombank, MBBank, VCB, MoMo,...) để quét mã tự động
        </p>
      </div>

      {/* Thông tin chuyển khoản */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Ngân hàng:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{bankConfig.bankName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Số tài khoản:</span>
          <span className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
            {bankConfig.accountNumber}
            <button
              type="button"
              onClick={() => onCopy(bankConfig.accountNumber, "acc")}
              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Chủ tài khoản:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">{bankConfig.accountName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Số tiền:</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            {finalPrice.toLocaleString("vi-VN")} đ
            <button
              type="button"
              onClick={() => onCopy(finalPrice.toString(), "amt")}
              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "amt" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-1.5">
          <span className="text-slate-500">Nội dung CK:</span>
          <span className="font-mono font-black text-slate-900 dark:text-white flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            {paymentMemo}
            <button
              type="button"
              onClick={() => onCopy(paymentMemo, "memo")}
              className="p-0.5 text-amber-700 hover:text-amber-900 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "memo" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </span>
        </div>
      </div>

      {/* Status Box */}
      <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-[11px]">
        <div>
          <span className="font-bold text-amber-900 dark:text-amber-200 block">
            ⏳ Trạng thái: Chưa thanh toán (Chờ quét mã)
          </span>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">
            Hệ thống tự động quét biến động số dư liên tục mỗi 2 giây. Bạn chỉ cần quét mã chuyển tiền!
          </span>
        </div>
        <span className="px-2 py-1 bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-lg font-bold text-[10px] shrink-0">
          CHỜ CHUYỂN TIỀN ⌛
        </span>
      </div>

      {checkStatusText && (
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{checkStatusText}</span>
        </div>
      )}
    </div>
  );
};

export default UniversalPaymentQrSection;

