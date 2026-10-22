import React from 'react';
import { Page, navItems, avatarByPage } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';

export function Sidebar({ page, onNavigate, onLogout }: { page: Page; onNavigate: (p: Page) => void; onLogout: () => void }) {
  const userStr = localStorage.getItem("user")
  let userName = "Lễ Tân"
  let avatarUrl = null;
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      userName = user.fullName || user.name || user.email?.split('@')[0] || "Lễ Tân"
      avatarUrl = user.avatarUrl;
    } catch(e) {}
  }

  return (
    <div className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[230px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar">
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
        <div className="bg-[#a855f7] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-purple-500/20 transition-all duration-200 group-hover:scale-105 group-hover:shadow-purple-500/40 group-active:scale-95">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-['Manrope:ExtraBold'] font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide group-hover:text-purple-300 transition-colors">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0">
            <span className="font-['Manrope:Bold'] font-bold text-[#a855f7] text-[9px] whitespace-nowrap tracking-wider">RECEPTIONIST</span>
          </div>
        </div>
      </button>

      {/* Nav */}
      <div className="flex flex-col gap-[6px] items-start shrink-0 w-full">
        {navItems.map((item) => {
          const active = page === item.id || (page === "detail" && item.id === "lookup")
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`sidebar-nav-btn btn-tactile group relative flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left cursor-pointer ${
                active 
                  ? "bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white shadow-lg shadow-purple-500/25 font-bold" 
                  : "bg-transparent hover:bg-white/5 text-[#cbd5e1] hover:text-white font-medium"
              }`}
            >
              {active && (
                <span className="absolute left-1 top-2 bottom-2 w-1 bg-white rounded-full shadow-sm" />
              )}
              <img src={item.icon} alt="" className={`shrink-0 size-[18px] transition-transform duration-200 group-hover:scale-110 ${active ? "brightness-200" : "opacity-70 group-hover:opacity-100"}`} />
              <span className={`flex-1 font-['Manrope:${active ? "Bold" : "Medium"}'] ${active ? "font-bold text-white" : "font-medium text-[#cbd5e1]"} text-[13.5px] leading-normal`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Support card */}
      <div className="bg-[#1e293b] border border-[#334155] border-solid flex flex-col gap-[8px] items-start p-[16px] rounded-[12px] shrink-0 w-full">
        <span className="font-['Manrope:Bold'] font-bold text-[13px] text-white w-full">Hỗ trợ Lễ Tân</span>
        <span className="font-['Manrope:Regular'] font-normal leading-[1.4] text-purple-400 text-[11px] w-full">
          Ấn nút F2 để mở nhanh ô quét mã check-in tức thì.
        </span>
      </div>

      {/* User profile */}
      <div className="pt-4 w-full mt-auto">
        <div className="cursor-pointer hover:bg-white/5 p-3 -mx-3 -mb-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => onNavigate("profile")}>
          <UserAvatar src={avatarUrl} name={userName} className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#a855f7] transition-colors" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <p className="font-bold text-white text-[13px] truncate">{userName}</p>
            <p className="text-[#94a3b8] text-[11px] truncate">Bộ phận Lễ tân</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-[#0f172a]/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; }}
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              title="Trang chủ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
