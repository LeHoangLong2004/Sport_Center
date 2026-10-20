import React from "react";
import { ShieldCheck, X } from "lucide-react";

interface Props {
  onExit?: () => void;
}

export function CheckoutHeader({ onExit }: Props) {
  const user = (() => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  })();

  const userName = user?.fullName || user?.name || "Hội viên";
  const userAvatar = user?.avatarUrl || user?.avatar;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 h-12 flex items-center justify-between">
        {/* Brand & Security Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-[#10b981] flex items-center justify-center rounded-xl size-9 shadow-md shadow-emerald-500/20 text-white font-extrabold text-sm">
            SC
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-900 text-sm tracking-wide leading-tight">
              SPORTCENTER
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
              SECURE CHECKOUT
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-slate-600 text-[11px]">Bảo mật SSL 256-bit</span>
          </div>
        </div>

        {/* User Info & Exit */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/70">
              <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center overflow-hidden">
                {userAvatar ? (
                  <img src={userAvatar} alt="" className="size-full object-cover" />
                ) : (
                  userName.charAt(0).toUpperCase()
                )}
              </div>
              <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">
                Hội viên
              </span>
            </div>
          )}

          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-bold transition-all cursor-pointer"
              title="Thoát thanh toán về Member Portal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function CheckoutFooter() {
  return (
    <footer className="w-full py-2.5 border-t border-slate-200/80 bg-slate-50 text-center text-[11px] text-slate-400">
      <div className="max-w-[1240px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
        <p>© 2026 SportCenter Việt Nam. Bảo lưu mọi quyền.</p>
        <p className="flex items-center gap-2">
          <span>Giao dịch an toàn & bảo mật</span>
          <span>•</span>
          <span>Hotline hỗ trợ: <strong>1900 8888</strong></span>
        </p>
      </div>
    </footer>
  );
}
