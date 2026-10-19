import React from "react";
import { LogOut } from "lucide-react";
import type { MemberScreen } from "../../types";
import { UserAvatar } from "../../../../components/UserAvatar";
import { MENU_ITEMS } from "./shellConstants";

interface Props {
  currentScreen: MemberScreen;
  userName: string;
  userTier: string;
  avatarUrl?: string;
  onNavigate: (screen: MemberScreen) => void;
  onLogout: () => void;
}

export default function MemberSidebar({
  currentScreen,
  userName,
  userTier,
  avatarUrl,
  onNavigate,
  onLogout,
}: Props) {
  return (
    <aside className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[250px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar z-30 select-none">
      {/* Brand */}
      <div
        className="flex gap-[12px] items-center shrink-0 w-full cursor-pointer"
        onClick={() => onNavigate("dashboard")}
      >
        <div className="bg-[#10b981] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-emerald-500/20">
          <span className="font-bold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide">
            SPORTCENTER
          </span>
          <span className="font-bold text-[#10b981] text-[10px] whitespace-nowrap uppercase tracking-widest">
            MEMBER PORTAL
          </span>
        </div>
      </div>

      {/* Navigation Items (10 items) */}
      <div className="flex flex-col gap-[4px] items-start shrink-0 w-full">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#10b981] text-white shadow-md shadow-emerald-500/25 font-bold"
                  : "bg-transparent text-[#94a3b8] hover:bg-white/5 hover:text-white font-medium"
              }`}
            >
              <div className="shrink-0 size-5 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.2 : 1.8} />
              </div>
              <span className="flex-1 text-[13px] leading-normal tracking-wide whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto"></div>

      {/* User profile widget at bottom of sidebar */}
      <div className="pt-2 w-full border-t border-[#1e293b]">
        <div
          className="cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden"
          onClick={() => onNavigate("profile")}
        >
          <UserAvatar
            src={avatarUrl}
            name={userName}
            className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#10b981] transition-colors"
          />
          <div className="flex flex-col flex-1 min-w-0 justify-center">
            <strong className="font-bold text-white text-[13px] truncate">{userName}</strong>
            <small className="text-[#94a3b8] text-[11px] truncate">{userTier}</small>
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
