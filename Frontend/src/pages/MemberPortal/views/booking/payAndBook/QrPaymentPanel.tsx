import React from "react";
import { Check, Copy, AlertCircle } from "lucide-react";
import type { BankConfig } from "../../../services/bankConfig";

interface Props {
  bankConfig: BankConfig;
  classPrice: number;
  bookingMemo: string;
  vietQrUrl: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  checkStatusText: string | null;
}

export const QrPaymentPanel: React.FC<Props> = ({
  bankConfig,
  classPrice,
  bookingMemo,
  vietQrUrl,
  copiedKey,
  onCopy,
  checkStatusText,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {bankConfig.bankCode || "VCB"} • {bankConfig.accountNumber}
        </span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
          VietQR • Napas 247
        </span>
      </div>

      <div className="text-center space-y-1">
        <img
          src={vietQrUrl}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://api.vietqr.io/img/vietqr_net.png";
          }}
          alt={`Mã VietQR ${bankConfig.bankName}`}
          className="w-40 h-auto object-contain mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-xs"
        />
        <p className="text-[10px] text-slate-500">
          Mở App Ngân hàng (VCB Digibank, Techcom, MB,...) để quét mã tự động
        </p>
      </div>

      {/* Thông tin chuyển khoản chi tiết */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Ngân hàng:</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {bankConfig.bankName}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Số tài khoản:</span>
          <span className="font-mono font-bold flex items-center gap-1 text-slate-900 dark:text-white">
            {bankConfig.accountNumber}
            <button
              type="button"
              onClick={() => onCopy(bankConfig.accountNumber, "acc")}
              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "acc" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Chủ tài khoản:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">
            {bankConfig.accountName}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Số tiền:</span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            {classPrice.toLocaleString("vi-VN")} đ
            <button
              type="button"
              onClick={() => onCopy(classPrice.toString(), "amt")}
              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "amt" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-1.5">
          <span className="text-slate-500">Nội dung CK:</span>
          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            {bookingMemo}
            <button
              type="button"
              onClick={() => onCopy(bookingMemo, "memo")}
              className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
              title="Sao chép"
            >
              {copiedKey === "memo" ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </span>
        </div>
      </div>

      {/* VIETQR LIVE STATUS BADGE */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
              VietQR • {bankConfig.bankName}
            </div>
            <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
              Quét mã QR chuyển khoản trên App Ngân hàng hoặc MoMo, sau đó bấm Xác nhận đặt chỗ!
            </div>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
          Napas 24/7 ⚡
        </span>
      </div>

      {/* Thông báo nếu kiểm tra chưa thấy tiền */}
      {checkStatusText && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs text-left flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="font-semibold leading-relaxed">{checkStatusText}</span>
        </div>
      )}
    </div>
  );
};
