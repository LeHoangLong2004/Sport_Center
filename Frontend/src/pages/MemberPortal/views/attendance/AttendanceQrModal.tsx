import React from "react";

interface AttendanceQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  memberId: string;
}

export default function AttendanceQrModal({
  isOpen,
  onClose,
  memberName,
  memberId,
}: AttendanceQrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Mã QR Check-in Quầy Lễ Tân
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
            <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="24" height="24" fill="#0f172a" rx="4" />
              <rect x="14" y="14" width="16" height="16" fill="white" rx="2" />
              <rect x="18" y="18" width="8" height="8" fill="#14b8a6" rx="1" />
              <rect x="66" y="10" width="24" height="24" fill="#0f172a" rx="4" />
              <rect x="70" y="14" width="16" height="16" fill="white" rx="2" />
              <rect x="74" y="18" width="8" height="8" fill="#14b8a6" rx="1" />
              <rect x="10" y="66" width="24" height="24" fill="#0f172a" rx="4" />
              <rect x="14" y="70" width="16" height="16" fill="white" rx="2" />
              <rect x="18" y="74" width="8" height="8" fill="#14b8a6" rx="1" />
              <rect x="42" y="12" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="12" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="24" width="6" height="6" fill="#14b8a6" />
              <rect x="12" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="24" y="42" width="6" height="6" fill="#14b8a6" />
              <rect x="36" y="36" width="6" height="6" fill="#0f172a" />
              <rect x="48" y="36" width="6" height="6" fill="#0f172a" />
              <rect x="60" y="36" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="42" width="6" height="6" fill="#14b8a6" />
              <rect x="84" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="36" y="48" width="8" height="8" fill="#10b981" rx="2" />
              <rect x="48" y="48" width="6" height="6" fill="#0f172a" />
              <rect x="58" y="48" width="8" height="8" fill="#14b8a6" rx="2" />
              <rect x="12" y="54" width="6" height="6" fill="#0f172a" />
              <rect x="24" y="54" width="6" height="6" fill="#0f172a" />
              <rect x="72" y="54" width="6" height="6" fill="#0f172a" />
              <rect x="84" y="54" width="6" height="6" fill="#14b8a6" />
              <rect x="42" y="66" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="66" width="6" height="6" fill="#14b8a6" />
              <rect x="66" y="66" width="6" height="6" fill="#0f172a" />
              <rect x="76" y="66" width="6" height="6" fill="#0f172a" />
            </svg>
          </div>

          <p className="mt-3 text-xs font-bold text-slate-800 dark:text-slate-200">
            {memberName}
          </p>
          <p className="text-[11px] font-mono text-slate-400">
            {memberId.slice(0, 8).toUpperCase()}-MEMBER
          </p>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đưa mã này trước đầu đọc camera tại quầy lễ tân để ghi nhận lượt check-in mở cổng tự động.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors"
        >
          Hoàn tất
        </button>
      </div>
    </div>
  );
}
