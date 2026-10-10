import React, { useState, useEffect } from 'react';
import { A, AdminPage, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from './shared';
import { useUserProfile } from '../../hooks/useUserProfile';
import { toast } from 'sonner';
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
import { StaffPage } from './views/StaffPage';
import { FacilitiesPage } from './views/FacilitiesPage';
import { SettingsPage } from './views/SettingsPage';
import { ProfileSettings } from '../../components/ProfileSettings';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("overview")
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const { profile } = useUserProfile()
  const [error, setError] = useState<string>("");

  const handleSave = async (data: any) => {
    setError("");
    const phoneRegex = /^(0|84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      setError("Lỗi: Số điện thoại không đúng định dạng.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!profile?.id || !token) return;

      const res = await fetch(`/api/users/${profile.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: data.fullName,
          phoneNumber: data.phone,
          dateOfBirth: data.dob ? new Date(data.dob).toISOString() : null,
          gender: data.gender,
          avatarUrl: data.avatarUrl,
        }),
      });

      if (!res.ok) throw new Error("Cập nhật thất bại");

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.fullName = data.fullName;
        localStorage.setItem("user", JSON.stringify(userObj));
      }
      
      toast.success("Đã cập nhật hồ sơ thành công!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu.");
    }
  };

  const breadcrumbs: Record<AdminPage, [string, string]> = {
    overview:   ["Quản lý / Tổng quan", "Tổng quan hệ thống"],
    classes:    ["Quản lý / Lớp học", "Quản lý Lớp học"],
    packages:   ["Quản lý / Gói tập", "Quản lí gói"],
    schedule:   ["Quản lý / Lịch trình", "Lịch trình & Lớp học"],
    members:    ["Quản lý / Người dùng / Hội viên", "Quản lý người dùng"],
    staff:      ["Quản lý / Người dùng / Nhân sự", "Quản lý nhân sự"],
    facilities: ["Quản lý / Bộ môn & phòng tập", "Danh mục Bộ môn & Phòng tập"],
    payment:    ["Quản lý / Thanh toán & Hóa đơn",  "Thanh toán & Hóa đơn"],
    reports:    ["Quản lý / Báo cáo & Thống kê",    "Báo cáo & Thống kê"],
    budget:     ["Tài chính / Ngân sách",            "Quản lý ngân sách"],
    expenses:   ["Tài chính / Chi phí",              "Chi phí vận hành"],
    payroll:    ["Tài chính / Bảng lương",           "Bảng lương nhân viên"],
    "pl-report":["Tài chính / Lãi lỗ",              "Báo cáo lãi lỗ (P&L)"],
    settings:   ["Quản lý / Cài đặt",               "Cài đặt & Nhật ký"],
    "member-edit":["Quản lý / Người dùng / Hội viên / Chỉnh sửa", "Chỉnh sửa thông tin hội viên"],
    profile:    ["Quản lý / Hồ sơ cá nhân",         "Hồ sơ Quản trị viên"],
    permissions:["Quản lý / Người dùng / Phân quyền", "Phân quyền truy cập"],
    "audit-log": ["Quản lý / Nhật ký hệ thống",      "Nhật ký hoạt động"],
    "check-ins": ["Quản lý / Lịch sử Check-in",      "Lịch sử Check-in"],
    support:     ["Quản lý / Hỗ trợ",               "Hỗ trợ khách hàng"],
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
          {page === "staff"      && <StaffPage />}
          {page === "facilities" && <FacilitiesPage />}
          {page === "payment"    && <PaymentPage />}
          {page === "reports"    && <ReportsPage />}
          {page === "budget"     && <BudgetPage />}
          {page === "expenses"   && <ExpensesPage />}
          {page === "payroll"    && <PayrollPage />}
          {page === "pl-report"  && <PLReportPage />}
          {page === "settings"   && <SettingsPage />}
          {page === "member-edit"&& <MemberEditPage memberData={selectedMember} onBack={() => setPage("members")} />}
          {page === "profile"    && (
            <div className="flex flex-col gap-4">
              {error && (
                <div className="max-w-6xl mx-auto w-full p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                  {error}
                </div>
              )}
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
                onSave={handleSave}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
