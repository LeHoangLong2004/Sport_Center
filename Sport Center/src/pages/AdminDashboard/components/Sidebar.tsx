import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members, AdminPage } from '../shared';

export function Sidebar({ page, setPage }: { page: AdminPage; setPage: (p: AdminPage) => void }) {
  const [financeOpen, setFinanceOpen] = useState(
    ["budget", "expenses", "payroll", "pl-report"].includes(page)
  )
  const navItems: { label: string; icon: string; page: AdminPage }[] = [
    { label: "Tổng quan", icon: iDashboard, page: "overview" },
    { label: "Quản lý Người dùng", icon: iUsers, page: "members" },
    { label: "Gói hội viên", icon: iPackage, page: "packages" },
    { label: "Lớp học & Lịch trình", icon: iCalendar, page: "schedule" },
    { label: "Thanh toán & Hóa đơn", icon: iReceipt, page: "payment" },
  ]
  const financeSubItems: { label: string; page: AdminPage }[] = [
    { label: "Quản lý ngân sách", page: "budget" },
    { label: "Chi phí vận hành", page: "expenses" },
    { label: "Bảng lương nhân viên", page: "payroll" },
    { label: "Báo cáo lãi lỗ (P&L)", page: "pl-report" },
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
          const active = item.page === "payment"
            ? page === "payment"
            : item.label === "Quản lý Người dùng"
              ? page === "members" && !isFinancePage
              : page === item.page
          return (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${active ? "bg-[#f43f5e] shadow-md shadow-rose-500/20" : "bg-transparent hover:bg-white/5"}`}
            >
              <img src={item.icon} alt="" className={`shrink-0 size-[18px] ${active ? "brightness-200" : ""}`} />
              <span className={`flex-1 font-${active ? "bold" : "medium"} ${active ? "text-white" : "text-[#cbd5e1]"} text-[14px] leading-normal`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Finance section */}
        <div className="flex flex-col gap-0.5 w-full">
          <button
            onClick={() => setFinanceOpen(v => !v)}
            className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${isFinancePage ? "bg-[#f43f5e] shadow-md shadow-rose-500/20" : "bg-transparent hover:bg-white/5"}`}
          >
            <span className={`size-[18px] shrink-0 flex items-center justify-center text-base ${isFinancePage ? "text-white font-bold" : "text-[#cbd5e1]"}`}>₫</span>
            <span className={`flex-1 font-${isFinancePage ? "bold" : "medium"} ${isFinancePage ? "text-white" : "text-[#cbd5e1]"} text-[14px] leading-normal`}>
              Tài chính {financeOpen ? "▾" : "▸"}
            </span>
          </button>
          {financeOpen && (
            <div className="flex flex-col gap-1 mt-1 pl-[42px] pr-2 w-full">
              {financeSubItems.map(sub => (
                <button
                  key={sub.page}
                  onClick={() => setPage(sub.page)}
                  className={`flex gap-2 items-center px-2 py-1.5 rounded-md w-full text-left transition-colors ${page === sub.page ? "bg-white/10" : "hover:bg-white/5"}`}
                >
                  <div className={`rounded-full size-[5px] shrink-0 ${page === sub.page ? "bg-[#f43f5e]" : "bg-[#94a3b8]"}`} />
                  <span className={`text-[12px] leading-normal ${page === sub.page ? "font-bold text-white" : "font-medium text-[#94a3b8]"}`}>
                    {sub.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setPage("reports")}
          className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${page === "reports" ? "bg-[#f43f5e] shadow-md shadow-rose-500/20" : "bg-transparent hover:bg-white/5"}`}
        >
          <img src={iBarChart} alt="" className={`shrink-0 size-[18px] ${page === "reports" ? "brightness-200" : ""}`} />
          <span className={`flex-1 font-${page === "reports" ? "bold" : "medium"} ${page === "reports" ? "text-white" : "text-[#cbd5e1]"} text-[14px] leading-normal`}>
            Báo cáo & Thống kê
          </span>
        </button>
        
        <button
          onClick={() => setPage("settings")}
          className={`flex gap-[12px] items-center px-[16px] py-[12px] rounded-[8px] shrink-0 w-full text-left transition-colors duration-200 ${page === "settings" ? "bg-[#f43f5e] shadow-md shadow-rose-500/20" : "bg-transparent hover:bg-white/5"}`}
        >
          <img src={iSettings} alt="" className={`shrink-0 size-[18px] ${page === "settings" ? "brightness-200" : ""}`} />
          <span className={`flex-1 font-${page === "settings" ? "bold" : "medium"} ${page === "settings" ? "text-white" : "text-[#cbd5e1]"} text-[14px] leading-normal`}>
            Cài đặt & Nhật ký
          </span>
        </button>
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
          <img src={avatarSidebar} alt="" className="rounded-full size-10 shrink-0 object-cover border-2 border-[#1e293b] group-hover:border-[#f43f5e] transition-colors" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <strong className="font-bold text-white text-[13px] truncate">Minh Anh</strong>
            <small className="text-[#94a3b8] text-[11px] truncate">Quản lý trung tâm</small>
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
