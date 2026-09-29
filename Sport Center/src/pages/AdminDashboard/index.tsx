import React, { useState } from 'react';
import { A, AdminPage, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from './shared';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PaymentPage } from './views/PaymentPage';
import { ReportsPage } from './views/ReportsPage';
import { BudgetPage } from './views/BudgetPage';
import { ExpensesPage } from './views/ExpensesPage';
import { PayrollPage } from './views/PayrollPage';
import { PLReportPage } from './views/PLReportPage';
import { MemberEditPage } from './views/MemberEditPage';
import { MembersPage } from './views/MembersPage';
import { SettingsPage } from './views/SettingsPage';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("members")

  const breadcrumbs: Record<AdminPage, [string, string]> = {
    members:    ["Quản lý / Người dùng / Hội viên", "Quản lý người dùng"],
    payment:    ["Quản lý / Thanh toán & Hóa đơn",  "Thanh toán & Hóa đơn"],
    reports:    ["Quản lý / Báo cáo & Thống kê",    "Báo cáo & Thống kê"],
    budget:     ["Tài chính / Ngân sách",            "Quản lý ngân sách"],
    expenses:   ["Tài chính / Chi phí",              "Chi phí vận hành"],
    payroll:    ["Tài chính / Bảng lương",           "Bảng lương nhân viên"],
    "pl-report":["Tài chính / Lãi lỗ",              "Báo cáo lãi lỗ (P&L)"],
    settings:   ["Quản lý / Cài đặt",               "Cài đặt & Nhật ký"],
    "member-edit":["Quản lý / Người dùng / Hội viên / Chỉnh sửa", "Chỉnh sửa thông tin hội viên"],
  }

  const [bc, title] = breadcrumbs[page]

  return (
    <div className="theme-admin bg-[#f8fafc] flex h-screen w-full overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar breadcrumb={bc} title={title} />
        {page === "members"    && <MembersPage onEditMember={() => setPage("member-edit")} />}
        {page === "payment"    && <PaymentPage />}
        {page === "reports"    && <ReportsPage />}
        {page === "budget"     && <BudgetPage />}
        {page === "expenses"   && <ExpensesPage />}
        {page === "payroll"    && <PayrollPage />}
        {page === "pl-report"  && <PLReportPage />}
        {page === "settings"   && <SettingsPage />}
        {page === "member-edit"&& <MemberEditPage onBack={() => setPage("members")} />}
      </div>
    </div>
  )
}
