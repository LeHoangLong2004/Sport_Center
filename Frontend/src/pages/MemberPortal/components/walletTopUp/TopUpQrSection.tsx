import React from "react";
import { Check, Copy, ShieldCheck, Sparkles } from "lucide-react";
import type { BankConfig } from "../../services/bankConfig";
import { BankConfigService } from "../../services/bankConfig";

interface Props {
  bankConfig: BankConfig;
  actualAmount: number;
  transferMemo: string;
  copiedKey: string | null;
  onCopy: (text: string, id: string) => void;
  checkStatusText: string | null;
  loading: boolean;
  onCheckTransfer: () => void;
  isSimulating: boolean;
  onSimulateWebhook: () => void;
}

export const TopUpQrSection: React.FC<Props> = ({
  bankConfig,
  actualAmount,
  transferMemo,
  copiedKey,
  onCopy,
  checkStatusText,
  loading,
  onCheckTransfer,
  isSimulating,
  onSimulateWebhook,
}) => {
  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      type="button"
      onClick={() => onCopy(text, id)}
      className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
      title="Sao chép"
    >
      {copiedKey === id ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );

  return (
    <>
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
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
            src={BankConfigService.getVietQrUrl(actualAmount, transferMemo, bankConfig)}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://api.vietqr.io/img/vietqr_net.png";
            }}
            alt={`Mã QR ${bankConfig.bankCode} VietQR`}
            className="w-44 h-auto object-contain mx-auto rounded-xl bg-white p-2 border border-slate-200 shadow-xs"
          />
          <p className="text-[10px] text-slate-500">
            Mở App Ngân hàng (VCB Digibank, Techcombank, MB,...) để quét mã
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Ngân hàng:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {bankConfig.bankName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Số tài khoản:</span>
            <span className="font-mono font-bold flex items-center gap-1">
              {bankConfig.accountNumber}{" "}
              <CopyBtn text={bankConfig.accountNumber} id="acc" />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Chủ tài khoản:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100 uppercase">
              {bankConfig.accountName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Số tiền nạp:</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              {actualAmount.toLocaleString("vi-VN")} đ{" "}
              <CopyBtn text={actualAmount.toString()} id="amt" />
            </span>
          </div>
          <div className="flex justify-between border-t pt-1">
            <span className="text-slate-500">Nội dung:</span>
            <span className="font-mono font-bold text-emerald-700 flex items-center gap-1">
              {transferMemo} <CopyBtn text={transferMemo} id="memo" />
            </span>
          </div>
        </div>

        {/* VIETQR STATUS BADGE */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="text-left">
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                VietQR • {bankConfig.bankName}
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400">
                Mở App Ngân hàng hoặc MoMo quét mã QR, sau đó bấm Xác nhận nạp ví để hoàn tất.
              </div>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
            Napas 24/7 ⚡
          </span>
        </div>

        {checkStatusText && (
          <div className="text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-center animate-in fade-in">
            {checkStatusText}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={loading || actualAmount <= 0}
          onClick={onCheckTransfer}
          className="w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-white bg-emerald-600 hover:bg-emerald-500"
        >
          {loading ? (
            <span>Đang kiểm tra biến động số dư Vietcombank...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Tôi đã chuyển tiền • Xác nhận nạp ví</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};
