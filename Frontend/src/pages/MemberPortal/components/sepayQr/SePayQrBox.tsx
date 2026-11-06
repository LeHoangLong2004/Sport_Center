import React from "react";

interface Props {
  currentQrUrl: string;
  vietQrFallbackUrl: string;
  onQrError: () => void;
}

export const SePayQrBox: React.FC<Props> = ({
  currentQrUrl,
  onQrError,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs relative">
      <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center group">
        <img
          src={currentQrUrl}
          alt="VietQR MBBank"
          onError={onQrError}
          className="w-56 h-56 object-contain rounded-xl"
        />
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 rounded-2xl transition-colors pointer-events-none" />
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
        <span className="size-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span>Mở app ngân hàng bất kỳ để quét mã VietQR</span>
      </div>
      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
        Số tiền và nội dung sẽ được điền tự động chính xác
      </span>
    </div>
  );
};
