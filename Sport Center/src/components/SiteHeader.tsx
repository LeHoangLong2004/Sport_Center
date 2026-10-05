import React, { useEffect, useState } from 'react';
import { SiteRoute } from '../SiteApp';

const navItems = [
  "Trang chủ",
  "Bộ môn",
  "Lớp học",
  "Huấn luyện viên",
  "Gói tập",
  "Về chúng tôi",
];

export function SiteHeader({ currentRoute }: { currentRoute: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getIsActive = (label: string) => {
    const map: Record<string, string> = {
      "Trang chủ": "home",
      "Bộ môn": "bomon",
      "Lớp học": "lophoc",
      "Huấn luyện viên": "coach",
      "Gói tập": "pricing",
      "Về chúng tôi": "about",
    };
    return map[label] === currentRoute;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 h-[72px] flex items-center justify-between px-6 lg:px-[80px] z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex gap-[10px] items-center shrink-0 cursor-pointer" data-name="logo-group">
        <div className="bg-teal-500 flex items-center justify-center rounded-[8px] size-[36px] shadow-lg shadow-teal-500/30">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <p className={`font-extrabold text-[18px] leading-none tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'}`}>SPORTCENTER</p>
          <p className="font-semibold text-teal-500 text-[9px] uppercase leading-none tracking-widest">Energy Platform</p>
        </div>
      </div>

      <div className="hidden lg:flex gap-[4px] h-full items-center">
        {navItems.map((label) => {
          const active = getIsActive(label);
          return (
            <div
              key={label}
              className="flex flex-col h-full items-center justify-center px-[16px] py-[24px] relative cursor-pointer group"
              data-name={`menu-item-${label}`}
            >
              <p
                className={`text-[15px] whitespace-nowrap transition-colors ${
                  active 
                    ? "font-bold text-teal-600" 
                    : `font-medium ${scrolled ? 'text-slate-600 hover:text-teal-500' : 'text-slate-700 lg:text-slate-200 lg:hover:text-white'}`
                }`}
              >
                {label}
              </p>
              <div 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] rounded-t-md w-[24px] transition-all duration-300 ${
                  active ? "bg-teal-500 opacity-100" : "bg-teal-500 opacity-0 group-hover:opacity-50"
                }`} 
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-[12px] items-center shrink-0">
        {localStorage.getItem("user") ? (() => {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          return (
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-2 group"
                onClick={(e) => {
                  e.stopPropagation();
                  const roleStr = user?.role?.toLowerCase() || "";
                  if (roleStr === "admin" || roleStr === "manager") {
                    window.location.hash = "dashboard";
                  } else if (roleStr === "coach") {
                    window.location.hash = "coach-portal";
                  } else if (roleStr === "receptionist") {
                    window.location.hash = "receptionist";
                  } else {
                    window.location.hash = "member";
                  }
                }}
                title="Vào Bảng điều khiển"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-md text-white font-bold text-[15px] border-2 border-white/20">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className={`text-sm font-bold ${scrolled ? 'text-slate-700' : 'text-slate-800 lg:text-white'}`}>{user?.fullName || 'Người dùng'}</span>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${scrolled ? 'text-teal-600' : 'text-teal-600 lg:text-teal-300'}`}>Bảng điều khiển</span>
                </div>
              </button>
              <button 
                className={`px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-colors ${
                  scrolled 
                    ? 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-red-500' 
                    : 'border-transparent lg:border-white/20 text-slate-800 lg:text-white/80 lg:hover:bg-white/10 lg:hover:text-white'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.reload();
                }}
              >
                Đăng xuất
              </button>
            </div>
          );
        })() : (
          <>
            <button 
              className={`px-5 py-2.5 rounded-xl font-semibold text-[14px] transition-all ${
                scrolled 
                  ? 'text-slate-700 hover:bg-slate-100' 
                  : 'text-slate-800 lg:text-white hover:bg-white/10'
              }`}
              data-name="btn-login"
            >
              Đăng nhập
            </button>
            <button 
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 transition-transform hover:-translate-y-0.5 active:translate-y-0"
              data-name="btn-register"
            >
              Đăng ký ngay
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
