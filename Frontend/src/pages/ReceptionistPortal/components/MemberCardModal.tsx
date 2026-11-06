import React, { useEffect } from "react";
import { X, Printer, ShieldCheck, CreditCard } from "lucide-react";
import { MemberAvatar } from "../views/LookupPage";

interface MemberCardModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MemberCardModal({ member, isOpen, onClose }: MemberCardModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    member.memberCode || member.id || "SPORTCENTER"
  )}`;

  const handlePrint = () => {
    window.print();
  };

  const isExpired = member.status === "Hết hạn";
  const isLocked = member.status === "Tạm khóa";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Print-specific style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-member-card-container, #printable-member-card-container * {
            visibility: visible !important;
          }
          #printable-member-card-container {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-purple-600">
            <CreditCard className="w-5 h-5" />
            <span className="text-sm font-extrabold uppercase tracking-wider font-['Manrope:ExtraBold']">
              Thẻ Hội Viên SportCenter
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Area */}
        <div className="flex justify-center w-full py-2">
          <div
            id="printable-member-card-container"
            className="relative w-full max-w-[420px] aspect-[1.62] rounded-2xl p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-white select-none border border-white/20 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#431407]"
          >
            {/* Background luxury watermarks */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            {/* Top row */}
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                  SC
                </div>
                <div>
                  <h3 className="font-extrabold tracking-widest text-sm leading-none font-['Manrope:ExtraBold']">
                    SPORTCENTER
                  </h3>
                  <p className="text-[9px] tracking-wider text-purple-300 font-medium">
                    PREMIUM ATHLETIC CLUB
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm ${
                  isLocked
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : isExpired
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{member.status || "Hoạt động"}</span>
              </div>
            </div>

            {/* Middle row: Avatar + Name + Code */}
            <div className="flex items-center gap-4 my-auto relative z-10">
              <MemberAvatar
                url={member.avatarUrl}
                name={member.fullName}
                size={64}
                className="size-16 rounded-xl object-cover border-2 border-white/40 shadow-lg shrink-0 text-[20px]"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-[18px] tracking-wide text-white uppercase truncate font-['Manrope:ExtraBold']">
                  {member.fullName}
                </span>
                <span className="font-mono text-amber-400 font-bold tracking-widest text-[13px]">
                  {member.memberCode}
                </span>
                <span className="text-[12px] text-slate-300 font-semibold truncate mt-0.5">
                  {member.packageName || "Hội viên SportCenter"}
                </span>
              </div>
            </div>

            {/* Bottom row: Expiry + QR Code */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10 relative z-10 text-[11px]">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400">
                  Hạn sử dụng
                </p>
                <p className="font-bold text-slate-200">
                  {member.expiryDate
                    ? new Date(member.expiryDate).toLocaleDateString("vi-VN")
                    : "Không thời hạn"}
                </p>
                <p className="text-[9px] text-slate-400 mt-1">
                  SĐT: {member.phoneNumber || "N/A"}
                </p>
              </div>

              {/* QR Code */}
              <div className="bg-white p-1 rounded-lg shadow-md shrink-0">
                <img
                  src={qrUrl}
                  alt="QR Thẻ"
                  className="size-12 rounded object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 flex items-center gap-2 cursor-pointer transition"
          >
            <Printer className="w-4 h-4" />
            <span>In thẻ thành viên (Máy in / PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

