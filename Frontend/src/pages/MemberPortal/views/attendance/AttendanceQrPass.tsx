import React from "react";

interface AttendanceQrPassProps {
  memberId: string;
  memberName: string;
  memberEmail: string;
}

export default function AttendanceQrPass({
  memberId,
  memberName,
  memberEmail,
}: AttendanceQrPassProps) {
  return (
    <div className="max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 shadow-2xl p-8 text-white">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg">
              SC
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide">SPORT CENTER</h3>
              <p className="text-[11px] text-teal-300 font-medium">Digital Member Pass</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            ACTIVE
          </span>
        </div>

        {/* QR Code Graphic */}
        <div className="relative z-10 my-8 flex flex-col items-center">
          <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-teal-500/30">
            <svg className="w-48 h-48" viewBox="0 0 100 100" fill="none">
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
              <rect x="42" y="78" width="6" height="6" fill="#14b8a6" />
              <rect x="52" y="78" width="6" height="6" fill="#0f172a" />
              <rect x="66" y="78" width="6" height="6" fill="#14b8a6" />
              <rect x="76" y="78" width="6" height="6" fill="#0f172a" />
            </svg>
          </div>

          <p className="mt-4 text-xs text-slate-300 font-mono tracking-wider">
            ID: {memberId.slice(0, 8).toUpperCase()}-MEMBER
          </p>
        </div>

        {/* Member Details */}
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Họ và tên:</span>
            <span className="font-bold text-white">{memberName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Email:</span>
            <span className="font-mono text-slate-300 text-[11px]">{memberEmail || "member@smartgym.com"}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Thời gian tạo mã:</span>
            <span className="text-teal-300 font-mono text-[11px]">{new Date().toLocaleTimeString("vi-VN")}</span>
          </div>
        </div>

        <p className="relative z-10 mt-6 text-center text-[11px] text-slate-400">
          Xuất trình mã này tại quầy lễ tân để check-in mở cổng tự động.
        </p>
      </div>
    </div>
  );
}
