import { useState } from "react";
import type { CoachScreen } from "../types";
import { navItems, A } from "../constants";
import { UserAvatar } from "../../../components/UserAvatar";
import { useUserProfile } from "../../../hooks/useUserProfile";

export default function CoachSidebar({
  screen,
  onNavigate,
}: {
  screen: CoachScreen
  onNavigate: (s: CoachScreen) => void
}) {
  const { profile } = useUserProfile('coach');
  const userStr = localStorage.getItem("user");
  let userName = profile?.fullName;
  let avatarUrl = profile?.avatarUrl;
  if (!userName && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.role?.toLowerCase() === 'coach' || user.roleName?.toLowerCase() === 'coach') {
        userName = user.fullName || user.name || user.email?.split("@")[0];
        avatarUrl = avatarUrl || user.avatarUrl;
      }
    } catch (e) {}
  }
  userName = userName || "Huấn luyện viên";

  return (
    <div className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[240px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar">
      {/* Brand */}
      <div className="flex gap-[12px] items-center shrink-0 w-full">
        <div className="bg-[#f97316] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-orange-500/20">
          <span className="font-bold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide">SPORTCENTER</span>
          <span className="font-bold text-[#f97316] text-[10px] whitespace-nowrap uppercase tracking-widest">COACH PORTAL</span>
        </div>
      </div>

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
              className={`flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left transition-all duration-200 ${
                isActive
                  ? "bg-[#f97316] text-white shadow-md shadow-orange-500/25 font-bold"
                  : "bg-transparent text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium"
              }`}
              onClick={() => onNavigate(key)}
              type="button"
            >
              <div className="shrink-0 size-5 flex items-center justify-center">
                <Icon />
              </div>
              <span className="flex-1 text-[13px] leading-normal tracking-wide">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto"></div>

      {/* User profile */}
      <div className="pt-2 w-full border-t border-[#1e293b]">
        <div
          className="cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden"
          onClick={() => onNavigate("profile")}
        >
          <UserAvatar
            src={avatarUrl || undefined}
            name={userName}
            className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#f97316] transition-colors"
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
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors"
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
                window.location.reload();
              }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}