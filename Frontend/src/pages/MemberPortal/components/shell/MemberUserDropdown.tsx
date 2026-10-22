import React from "react";
import {
  Crown,
  CreditCard,
  Receipt,
  Ticket,
  FileText,
  Activity,
  QrCode,
  Sun,
  Moon,
  Globe,
  Lock,
  Bot,
  LogOut,
  Home,
} from "lucide-react";
import type { MemberScreen } from "../../types";
import { UserAvatar } from "../../../../components/UserAvatar";

interface Props {
  userName: string;
  userEmail: string;
  userTier: string;
  avatarUrl?: string;
  isDark: boolean;
  currentLang: "vi" | "en";
  onNavigate: (screen: MemberScreen) => void;
  onClose: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onOpenCheckIn: () => void;
  onSwitchToInvoices: () => void;
  onSwitchToSecurity: () => void;
  onLogout: () => void;
}

export default function MemberUserDropdown({
  userName,
  userEmail,
  userTier,
  avatarUrl,
  isDark,
  currentLang,
  onNavigate,
  onClose,
  onToggleTheme,
  onToggleLang,
  onOpenCheckIn,
  onSwitchToInvoices,
  onSwitchToSecurity,
  onLogout,
}: Props) {
  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-2 z-50 text-slate-800 dark:text-slate-200 animate-scaleUp divide-y divide-slate-100 dark:divide-slate-800">
      {/* HEADER: USER IDENTITY */}
      <div className="p-3 pb-3.5">
        <div className="flex items-center gap-3">
          <UserAvatar
            src={avatarUrl}
            name={userName}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {userName}
            </h4>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
              <Crown className="w-3 h-3 text-amber-500" />
              {userTier}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("profile");
          }}
          className="mt-3 w-full py-1.5 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
        >
          Xem & chỉnh sửa hồ sơ cá nhân →
        </button>
      </div>

      {/* GROUP 1: TÀI CHÍNH & GÓI TẬP */}
      <div className="py-1.5 space-y-0.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("packages");
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <CreditCard className="w-4 h-4 text-emerald-500" />
          <span className="flex-1">Gói dịch vụ & Nâng cấp hạng</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToInvoices}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Receipt className="w-4 h-4 text-blue-500" />
          <span className="flex-1">Lịch sử giao dịch & Hóa đơn</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-md">
            Mới
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("packages");
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Ticket className="w-4 h-4 text-purple-500" />
          <span className="flex-1">Ví đặc quyền (2 vé mời bạn)</span>
        </button>
      </div>

      {/* GROUP 2: TẬP LUYỆN & CHECK-IN */}
      <div className="py-1.5 space-y-0.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("workouts");
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-orange-500" />
          <span className="flex-1">Giáo án & Bài tập HLV giao</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("profile");
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Activity className="w-4 h-4 text-pink-500" />
          <span className="flex-1">Chỉ số cơ thể & InBody</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenCheckIn();
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-teal-500" />
          <span className="flex-1">Mã QR cá nhân Check-in</span>
        </button>
      </div>

      {/* GROUP 3: CÀI ĐẶT & TIỆN ÍCH */}
      <div className="py-1.5 space-y-0.5">
        <button
          type="button"
          onClick={onToggleTheme}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500" />
            )}
            <span>Giao diện: {isDark ? "Tối (Dark)" : "Sáng (Light)"}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase">
            Đổi
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleLang}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Ngôn ngữ:</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            {currentLang === "vi" ? "Tiếng Việt 🇻🇳" : "English 🇬🇧"}
          </span>
        </button>

        <button
          type="button"
          onClick={onSwitchToSecurity}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Lock className="w-4 h-4 text-slate-400" />
          <span className="flex-1">Đổi mật khẩu & Bảo mật</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onNavigate("support");
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          <span className="flex-1">Trợ lý AI & Hỗ trợ kỹ thuật</span>
        </button>
      </div>

      {/* GROUP 4: TRANG CHỦ & ĐĂNG XUẤT */}
      <div className="pt-1.5 space-y-0.5">
        <button
          type="button"
          onClick={() => {
            onClose();
            window.location.hash = "home";
            window.dispatchEvent(new HashChangeEvent("hashchange"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
        >
          <Home className="w-4 h-4 text-emerald-500" />
          <span className="flex-1">Về Trang chủ website</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất tài khoản</span>
        </button>
      </div>
    </div>
  );
}
