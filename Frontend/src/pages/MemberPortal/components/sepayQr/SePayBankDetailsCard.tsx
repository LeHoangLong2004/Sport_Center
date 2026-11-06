import React from "react";
import { Building, Copy, Check } from "lucide-react";
import type { BankConfig } from "../../services/bankConfig";

interface Props {
  bankConfig: BankConfig;
  amount: number;
  transferMemo: string;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const SePayBankDetailsCard: React.FC<Props> = ({
  bankConfig,
  amount,
  transferMemo,
  copiedKey,
  onCopy,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-emerald-400">
          <Building className="w-4 h-4" />
          <span className="text-xs font-extrabold uppercase tracking-wide">
            {bankConfig.bankName}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          Napas 247
        </span>
      </div>

      {/* Account Number */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block">Số tài khoản:</span>
          <span className="text-lg font-mono font-black tracking-widest text-white">
            {bankConfig.accountNumber}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(bankConfig.accountNumber, "acc")}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {copiedKey === "acc" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* Account Name */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div>
          <span className="text-[10px] text-slate-400 block">Chủ tài khoản:</span>
          <span className="text-xs font-bold uppercase text-slate-200">
            {bankConfig.accountName}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        <div>
          <span className="text-[10px] text-slate-400 block">Số tiền thanh toán:</span>
          <span className="text-xl font-black text-emerald-400">
            {amount.toLocaleString("vi-VN")} đ
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(amount.toString(), "amount")}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          {copiedKey === "amount" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>

      {/* Transfer memo (CRITICAL FOR SEPAY MATCHING) */}
      <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-400">
              Nội dung chuyển khoản (Bắt buộc):
            </span>
          </div>
          <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">
            {transferMemo}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onCopy(transferMemo, "memo")}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          {copiedKey === "memo" ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
