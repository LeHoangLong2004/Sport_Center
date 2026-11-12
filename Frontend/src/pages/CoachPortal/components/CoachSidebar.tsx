import { useState } from "react";
import type { CoachScreen } from "../types";
import { navItems, A } from "../constants";
import { UserAvatar } from "../../../components/UserAvatar";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function CoachSidebar({
  screen,
  onNavigate,
  onLogout,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
  onLogout?: () => void
}) {
  const { profile } = useUserProfile('coach');
  const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  let storedUser: { avatarUrl?: string; fullName?: string; name?: string; email?: string; role?: string; roleName?: string } | null = null;
  let userName = profile?.fullName;
  let avatarUrl = profile?.avatarUrl;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      storedUser = user;
      if (!userName) {
        userName = user.fullName || user.name || user.email?.split("@")[0];
      }
      avatarUrl = (avatarUrl && avatarUrl.trim() !== "") ? avatarUrl : (user.avatarUrl || user.avatar);
    } catch (e) {}
  }
  userName = userName || "Huấn luyện viên";

  return (
    <aside className="bg-[#0f172a] w-[250px] min-w-[250px] max-w-[250px] h-full flex flex-col justify-between shrink-0 pb-5 pt-6 px-4 select-none z-30 border-r border-[#1e293b]/70 overflow-y-auto hidden-scrollbar">
      <div className="flex flex-col gap-4 items-start w-full min-h-0">
        {/* Brand */}
      <button
        type="button"
        className="group flex gap-[12px] items-center shrink-0 w-full cursor-pointer text-left focus:outline-none select-none"
        onClick={() => {
          window.location.hash = "home";
          window.dispatchEvent(new HashChangeEvent("hashchange"));
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        title="Quay lại Trang chủ SportCenter"
        aria-label="Quay lại Trang chủ"
      >
        <div className="bg-emerald-600 flex flex-col items-center justify-center rounded-xl shrink-0 size-10 shadow-sm transition-transform duration-200 group-hover:scale-105">
          <span className="font-extrabold text-white text-lg">SC</span>
        </div>
        <div className="flex flex-col gap-0.5 items-start shrink-0">
          <span className="font-bold text-[15px] text-white whitespace-nowrap tracking-wide group-hover:text-emerald-400 transition-colors">SPORTCENTER</span>
          <div className="bg-emerald-500/10 flex items-start px-2 py-0.5 rounded shrink-0 border border-emerald-500/20">
            <span className="font-semibold text-emerald-400 text-[10px] whitespace-nowrap tracking-wider">HUẤN LUYỆN VIÊN</span>
          </div>
        </div>
      </button>

      {/* Nav */}
      <div className="flex flex-col gap-[4px] items-start shrink-0 w-full">
        {navItems.map(({ key, label, Icon }) => {
          // class-detail và member-profile không xuất hiện trong nav — highlight parent
          const isActive =
            screen === key ||
            (key === "schedule" && screen === "class-detail") ||
            (key === "members" && screen === "member-profile");
          return (
            <button
              key={key}
              className={`sidebar-nav-btn btn-tactile group relative flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left cursor-pointer transition-colors ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold"
                  : "bg-transparent text-[#cbd5e1] hover:bg-white/5 hover:text-white font-medium"
              }`}
              onClick={() => onNavigate(key)}
              type="button"
            >
              <div className="shrink-0 size-5 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <Icon />
              </div>
              <span className="flex-1 text-[13px] leading-normal tracking-wide">
                {label}
              </span>
            </button>
          );
        })}
      </div>
      </div>

      {/* User profile */}
      <div className="pt-2 w-full border-t border-[#1e293b]">
        <div
          className="cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden"
          onClick={() => onNavigate("profile")}
        >
          <UserAvatar
            src={avatarUrl || storedUser?.avatarUrl || undefined}
            name={userName}
            className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-emerald-500 transition-colors"
          />
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <strong className="font-bold text-white text-[13px] truncate">{userName}</strong>
            <small className="text-[#94a3b8] text-[11px] truncate">Huấn luyện viên</small>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-[#0f172a]/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.location.hash = "home";
              }}
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              title="Trang chủ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("token");
                window.location.hash = "login";
                if (onLogout) {
                  onLogout();
                } else {
                  window.dispatchEvent(new Event("local-storage-update"));
                  window.dispatchEvent(new HashChangeEvent("hashchange"));
                }
              }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
