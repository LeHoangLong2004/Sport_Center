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
    <aside className="bg-[#0f172a] flex flex-col gap-7 h-full items-start pb-6 pt-7 px-[18px] shrink-0 w-[260px]">
      {/* brand */}
      <div className="flex gap-3 items-center w-full">
        <div className="bg-[#14b8a6] flex items-center justify-center rounded-[10px] size-10">
          <span className="font-extrabold text-[#0f172a] text-lg">SC</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-white text-[15px] tracking-wide">SPORTCENTER</span>
          <div className="bg-[#1e293b] px-1.5 py-px rounded-[4px]">
            <span className="font-bold text-[#14b8a6] text-[9px] tracking-wider">CENTER MANAGER</span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1.5 w-full flex-1">
        {navItems.map(item => {
          const active = item.page === "payment"
            ? page === "payment"
            : item.label === "Quản lý Người dùng"
              ? page === "members" && !isFinancePage
              : false
          return (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left transition-colors ${active ? "bg-[#2563eb]" : "hover:bg-white/5"
                }`}
            >
              <img src={item.icon} alt="" className="size-[18px] shrink-0" />
              <span className={`text-sm flex-1 ${active ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Finance section */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setFinanceOpen(v => !v)}
            className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left hover:bg-white/5 ${isFinancePage ? "bg-[#2563eb]" : ""}`}
          >
            <span className="size-[18px] shrink-0 text-[#cbd5e1] flex items-center justify-center text-base">₫</span>
            <span className={`text-sm flex-1 ${isFinancePage ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
              Tài chính {financeOpen ? "▾" : "▸"}
            </span>
          </button>
          {financeOpen && financeSubItems.map(sub => (
            <button
              key={sub.page}
              onClick={() => setPage(sub.page)}
              className={`flex gap-2 items-center pl-[46px] pr-4 py-2 rounded-md w-full text-left hover:bg-white/5 ${page === sub.page ? "bg-white/10" : ""}`}
            >
              <div className={`rounded-full size-[5px] shrink-0 ${page === sub.page ? "bg-white" : "bg-[#909dad]"}`} />
              <span className={`text-[12.5px] ${page === sub.page ? "font-semibold text-white" : "font-normal text-[#909dad]"}`}>
                {sub.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage("reports")}
          className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left transition-colors ${page === "reports" ? "bg-[#2563eb]" : "hover:bg-white/5"
            }`}
        >
          <img src={iBarChart} alt="" className="size-[18px] shrink-0" />
          <span className={`text-sm flex-1 ${page === "reports" ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
            Báo cáo & Thống kê
          </span>
        </button>
        <button
          onClick={() => setPage("settings")}
          className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left hover:bg-white/5 ${page === "settings" ? "bg-[#2563eb]" : ""}`}
        >
          <img src={iSettings} alt="" className="size-[18px] shrink-0" />
          <span className={`text-sm flex-1 ${page === "settings" ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
            Cài đặt & Nhật ký
          </span>
        </button>
      </nav>

      {/* support card */}
      <div className="bg-[#1e293b] border border-[#334155] flex flex-col gap-2 p-4 rounded-xl w-full">
        <p className="font-bold text-white text-[13px]">Cần hỗ trợ vận hành?</p>
        <p className="font-normal leading-[1.4] text-[#94a3b8] text-[11px]">
          Hotline kỹ thuật hoạt động từ 06:00 – 22:00 hàng ngày.
        </p>
      </div>

      {/* user */}
      <div className="border-[#1e293b] pt-4 w-full border-t mt-auto">
        <div className="cursor-pointer hover:bg-white/5 p-3 -mx-3 -mb-3 rounded-xl transition-all group relative flex items-center gap-3 overflow-hidden" onClick={() => setPage("profile")}>
          <img src={avatarSidebar} alt="" className="rounded-full size-10 shrink-0 object-cover" />
          <div className="flex flex-col flex-1 min-w-0 transition-transform duration-200 group-hover:-translate-x-1 justify-center">
            <p className="font-bold text-white text-[13px] truncate">Minh Anh</p>
            <p className="text-[#94a3b8] text-[11px] truncate">Quản lý trung tâm</p>
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
