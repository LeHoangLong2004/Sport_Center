import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members, AdminPage } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';

export function Sidebar({ page, setPage, onLogout }: { page: AdminPage; setPage: (p: AdminPage) => void; onLogout?: () => void }) {
  let userName = "Đang tải...";
  let role = "Quản trị viên";
  let avatarUrl = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      if (userObj.fullName) userName = userObj.fullName;
      if (userObj.avatarUrl) avatarUrl = userObj.avatarUrl;
      if (userObj.role) {
        if (userObj.role.toLowerCase() === "manager") role = "Quản lý trung tâm";
        else if (userObj.role.toLowerCase() === "admin") role = "Quản trị hệ thống";
        else role = userObj.role;
      }
    }
  } catch (e) {}

  const navItems: { label: string; icon: string; page: AdminPage }[] = [
    { label: "Tổng quan", icon: iDashboard, page: "overview" },
    { label: "Thành viên", icon: iUsers, page: "members" },
    { label: "Nhân sự", icon: iUsers, page: "staff" },
    { label: "Bộ môn & phòng tập", icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PHBhdGggZD0iTTkgM3YxOCIvPjxwYXRoIGQ9Ik0xNSAzdjE4Ii8+PC9zdmc+", page: "facilities" },
    { label: "Lớp học", icon: iCalendar, page: "schedule" },
    { label: "Quản lí gói", icon: iPackage, page: "packages" },
    { label: "Sản phẩm bán hàng", icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik02IDIgMyA2djE0YTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMlY2bC0zLTRaIi8+PHBhdGggZD0iTTMgNmgxOCIvPjxwYXRoIGQ9Ik0xNiAxMGE0IDQgMCAwIDEtOCAwIi8+PC9zdmc+", page: "products" },
    { label: "Thanh toán", icon: iReceipt, page: "payment" },
    { label: "Báo cáo", icon: iBarChart, page: "reports" },
  ]
  const isFinancePage = ["budget", "expenses", "payroll", "pl-report"].includes(page)

  return (
    <aside className="manager-sidebar bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[230px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar select-none z-30">
      {/* brand */}
      <button
        type="button"
        className="group flex gap-[12px] items-center shrink-0 w-full cursor-pointer text-left focus:outline-none select-none"
        onClick={() => {
          setPage("overview");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        title="Quay lại trang Tổng quan (Overview)"
        aria-label="Quay lại trang Tổng quan"
      >
        <div className="bg-[#f43f5e] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-rose-500/25 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-rose-500/40 group-active:scale-95">
          <span className="font-extrabold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide group-hover:text-rose-400 transition-colors">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0 border border-rose-500/20">
            <span className="font-bold text-[#f43f5e] text-[9px] whitespace-nowrap tracking-wider">CENTER MANAGER</span>
          </div>
        </div>
      </button>

      {/* nav */}
      <nav className="flex flex-col gap-[4px] items-start shrink-0 w-full">
        {navItems.map(item => {
          const active = page === item.page
          return (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className={`sidebar-nav-btn btn-tactile group relative flex gap-[12px] items-center px-[16px] py-[11px] rounded-[10px] shrink-0 w-full text-left cursor-pointer ${
                active 
                  ? "bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white shadow-lg shadow-rose-500/25 font-bold" 
                  : "bg-transparent hover:bg-white/5 text-[#cbd5e1] hover:text-white font-medium"
              }`}
            >
              {active && (
                <span className="absolute left-1 top-2 bottom-2 w-1 bg-white rounded-full shadow-sm" />
              )}
              <img 
                src={item.icon} 
                alt="" 
                className={`shrink-0 size-[18px] transition-transform duration-200 group-hover:scale-110 ${active ? "brightness-200" : "opacity-70 group-hover:opacity-100"}`} 
              />
              <span className="flex-1 text-[13.5px] leading-normal tracking-wide">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* support card */}
      <div className="bg-[#1e293b]/80 border border-[#334155]/60 flex flex-col gap-[8px] items-start p-[16px] rounded-[14px] shrink-0 w-full shadow-sm">
        <span className="font-bold text-[13px] text-white w-full">Cần hỗ trợ vận hành?</span>
        <span className="font-normal leading-[1.4] text-rose-400 text-[11px] w-full">
          Hotline kỹ thuật hoạt động từ 06:00 – 22:00 hàng ngày.
        </span>
      </div>

      {/* user */}
      <div className="pt-3 w-full mt-auto border-t border-[#1e293b]">
        <div className="cursor-pointer hover:bg-white/5 p-2.5 -mx-2 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => setPage("profile")}>
          <UserAvatar src={avatarUrl} name={userName} className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#f43f5e] transition-colors" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <strong className="font-bold text-white text-[13px] truncate" title={userName}>{userName}</strong>
            <small className="text-[#94a3b8] text-[11px] truncate" title={role}>{role}</small>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-2 bg-[#0f172a]/95 pl-2 py-1 shadow-md rounded-lg backdrop-blur-sm border border-slate-700/50">
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                window.location.hash = "home"; 
                window.dispatchEvent(new HashChangeEvent("hashchange"));
              }}
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors btn-tactile"
              title="Trang chủ"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { 
                e.stopPropagation(); 
                localStorage.removeItem("user"); 
                localStorage.removeItem("accessToken"); 
                localStorage.removeItem("token"); 
                if (onLogout) {
                  onLogout();
                } else {
                  window.location.hash = "login"; 
                  window.dispatchEvent(new HashChangeEvent("hashchange"));
                }
              }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors btn-tactile"
              title="Đăng xuất"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
