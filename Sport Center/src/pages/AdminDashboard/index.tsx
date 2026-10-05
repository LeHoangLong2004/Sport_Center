import React, { useState, useEffect } from 'react';
import { A, AdminPage, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from './shared';
import { useUserProfile } from '../../hooks/useUserProfile';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewPage } from './views/OverviewPage';
import { PackagesPage } from './views/PackagesPage';
import { SchedulePage } from './views/SchedulePage';
import { PaymentPage } from './views/PaymentPage';
import { ReportsPage } from './views/ReportsPage';
import { BudgetPage } from './views/BudgetPage';
import { ExpensesPage } from './views/ExpensesPage';
import { PayrollPage } from './views/PayrollPage';
import { PLReportPage } from './views/PLReportPage';
import { MemberEditPage } from './views/MemberEditPage';
import { MembersPage } from './views/MembersPage';
import { SettingsPage } from './views/SettingsPage';
import { ProfileSettings } from '../../components/ProfileSettings';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("overview")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const { profile } = useUserProfile()

  const breadcrumbs: Record<AdminPage, [string, string]> = {
    overview:   ["Quản lý / Tổng quan", "Tổng quan hệ thống"],
    packages:   ["Quản lý / Gói hội viên", "Danh sách Gói hội viên"],
    schedule:   ["Quản lý / Lịch trình", "Lịch trình & Lớp học"],
    members:    ["Quản lý / Người dùng / Hội viên", "Quản lý người dùng"],
    payment:    ["Quản lý / Thanh toán & Hóa đơn",  "Thanh toán & Hóa đơn"],
    reports:    ["Quản lý / Báo cáo & Thống kê",    "Báo cáo & Thống kê"],
    budget:     ["Tài chính / Ngân sách",            "Quản lý ngân sách"],
    expenses:   ["Tài chính / Chi phí",              "Chi phí vận hành"],
    payroll:    ["Tài chính / Bảng lương",           "Bảng lương nhân viên"],
    "pl-report":["Tài chính / Lãi lỗ",              "Báo cáo lãi lỗ (P&L)"],
    settings:   ["Quản lý / Cài đặt",               "Cài đặt & Nhật ký"],
    "member-edit":["Quản lý / Người dùng / Hội viên / Chỉnh sửa", "Chỉnh sửa thông tin hội viên"],
    profile:    ["Quản lý / Hồ sơ cá nhân",         "Hồ sơ Quản trị viên"],
  }

  const [bc, title] = breadcrumbs[page] || ["", ""]

  return (
    <div className="flex w-full h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-300 font-sans text-slate-900 dark:text-white selection:bg-rose-500 selection:text-white overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar breadcrumb={bc} title={title} onProfileClick={() => setPage("profile")} />
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {page === "overview"   && <OverviewPage />}
          {page === "packages"   && <PackagesPage />}
          {page === "schedule"   && <SchedulePage />}
          {page === "members"    && <MembersPage onEditMember={(member) => { setSelectedMember(member); setPage("member-edit"); }} />}
          {page === "payment"    && <PaymentPage />}
          {page === "reports"    && <ReportsPage />}
          {page === "budget"     && <BudgetPage />}
          {page === "expenses"   && <ExpensesPage />}
          {page === "payroll"    && <PayrollPage />}
          {page === "pl-report"  && <PLReportPage />}
          {page === "settings"   && <SettingsPage />}
          {page === "member-edit"&& <MemberEditPage memberData={selectedMember} onBack={() => setPage("members")} />}
          {page === "profile"    && (
            <ProfileSettings 
              roleLabel={profile?.roleName || "Quản trị viên hệ thống"} 
              initialData={profile ? {
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                dob: profile.dob,
                gender: profile.gender,
                avatarUrl: profile.avatarUrl,
              } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  )
}
