import React from "react";
import { createPortal } from "react-dom";
import { X, Crown } from "lucide-react";

interface Props {
  isOpen: boolean;
  userName: string;
  memberCode: string;
  userTier: string;
  onClose: () => void;
}

export default function MemberCheckInModal({
  isOpen,
  userName,
  memberCode,
  userTier,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 flex flex-col items-center text-center animate-scaleUp">
        <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            SPORTCENTER PASS
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Container */}
        <div className="my-6 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/40 flex flex-col items-center shadow-inner relative">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            {/* Clean SVG QR mockup */}
            <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white" />
              {/* Top-left corner box */}
              <rect x="10" y="10" width="24" height="24" rx="4" fill="#0f172a" />
              <rect x="14" y="14" width="16" height="16" rx="2" fill="white" />
              <rect x="18" y="18" width="8" height="8" rx="1" fill="#10b981" />
              {/* Top-right corner box */}
              <rect x="66" y="10" width="24" height="24" rx="4" fill="#0f172a" />
              <rect x="70" y="14" width="16" height="16" rx="2" fill="white" />
              <rect x="74" y="18" width="8" height="8" rx="1" fill="#10b981" />
              {/* Bottom-left corner box */}
              <rect x="10" y="66" width="24" height="24" rx="4" fill="#0f172a" />
              <rect x="14" y="70" width="16" height="16" rx="2" fill="white" />
              <rect x="18" y="74" width="8" height="8" rx="1" fill="#10b981" />
              {/* Data dots */}
              <rect x="40" y="12" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="50" y="18" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="42" y="26" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="52" y="32" width="6" height="6" rx="1" fill="#10b981" />
              <rect x="20" y="42" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="30" y="48" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="68" y="42" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="78" y="50" width="6" height="6" rx="1" fill="#10b981" />
              <rect x="40" y="66" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="50" y="72" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="42" y="80" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="68" y="70" width="6" height="6" rx="1" fill="#0f172a" />
              <rect x="76" y="82" width="6" height="6" rx="1" fill="#0f172a" />
            </svg>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Sẵn sàng quét vào cổng</span>
          </div>
        </div>

        <h4 className="text-base font-black text-slate-900 dark:text-white">{userName}</h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Mã số:{" "}
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
            {memberCode}
          </span>
        </p>
        <div className="mt-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-extrabold text-[11px] flex items-center gap-1">
          <Crown className="w-3.5 h-3.5" />
          <span>{userTier}</span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
          Đưa mã này vào máy quét tại cửa vào hoặc xuất trình cho Lễ tân để check-in ca tập.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
        >
          Đóng thẻ
        </button>
      </div>
    </div>,
    document.body
  );
}
