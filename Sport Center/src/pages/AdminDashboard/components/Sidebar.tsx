import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members, AdminPage } from '../shared';
import { UserAvatar } from '../../../components/UserAvatar';

export function Sidebar({ page, setPage }: { page: AdminPage; setPage: (p: AdminPage) => void }) {
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
    { label: "Lớp học", icon: iCalendar, page: "classes" },
    { label: "Gói thành viên", icon: iPackage, page: "packages" },
    { label: "Thanh toán", icon: iReceipt, page: "payment" },
    { label: "Báo cáo", icon: iBarChart, page: "reports" },
  ]
  const isFinancePage = ["budget", "expenses", "payroll", "pl-report"].includes(page)

  return (
    <aside className="bg-[#0f172a] flex flex-col gap-[28px] items-start pb-[24px] pt-[28px] px-[18px] shrink-0 w-[230px] sticky top-0 h-screen overflow-y-auto hidden-scrollbar">
      {/* brand */}
      <div className="flex gap-[12px] items-center shrink-0 w-full">
        <div className="bg-[#f43f5e] flex flex-col items-center justify-center rounded-[10px] shrink-0 size-[40px] shadow-lg shadow-rose-500/20">
          <span className="font-extrabold text-white text-[18px]">SC</span>
        </div>
        <div className="flex flex-col gap-[2px] items-start shrink-0">
          <span className="font-extrabold text-[15px] text-white whitespace-nowrap tracking-wide">SPORTCENTER</span>
          <div className="bg-[#1e293b] flex items-start px-[6px] py-px rounded-[4px] shrink-0">
            <span className="font-bold text-[#f43f5e] text-[9px] whitespace-nowrap tracking-wider">CENTER MANAGER</span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-[6px] items-start shrink-0 w-full">
        {navItems.map(item => {
          const active = page === item.page
          return (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${active ? "bg-[#f43f5e] shadow-md shadow-rose-500/20" : "bg-transparent hover:bg-white/5"}`}
            >
              <img src={item.icon} alt="" className={`shrink-0 size-[18px] ${active ? "brightness-200" : "opacity-70"}`} />
              <span className={`flex-1 font-${active ? "bold" : "medium"} ${active ? "text-white" : "text-[#cbd5e1]"} text-[14px] leading-normal`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* support card */}
      <div className="bg-[#1e293b] border border-[#334155] border-solid flex flex-col gap-[8px] items-start p-[16px] rounded-[12px] shrink-0 w-full">
        <span className="font-bold text-[13px] text-white w-full">Cần hỗ trợ vận hành?</span>
        <span className="font-normal leading-[1.4] text-rose-400 text-[11px] w-full">
          Hotline kỹ thuật hoạt động từ 06:00 – 22:00 hàng ngày.
        </span>
      </div>

      {/* user */}
      <div className="pt-4 w-full mt-auto">
        <div className="cursor-pointer hover:bg-white/5 p-3 -mx-3 -mb-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => setPage("profile")}>
          <UserAvatar src={avatarUrl} name={userName} className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#f43f5e] transition-colors" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <strong className="font-bold text-white text-[13px] truncate" title={userName}>{userName}</strong>
            <small className="text-[#94a3b8] text-[11px] truncate" title={role}>{role}</small>
          </div>
          <div className="flex items-center gap-1 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 absolute right-3 bg-[#0f172a]/90 pl-2 py-1 shadow-sm rounded-lg backdrop-blur-sm">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; }}
              className="p-1.5 text-[#94a3b8] hover:text-white hover:bg-white/10 rounded-md transition-colors"
              title="Trang chủ"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); window.location.hash = "home"; window.location.reload(); }}
              className="p-1.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
              title="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
