import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

import ReportsTabRevenue from './ReportsTabRevenue';
import ReportsTabMembers from './ReportsTabMembers';
import ReportsTabClasses from './ReportsTabClasses';
import ReportsTabHR from './ReportsTabHR';

export function ReportsPage() {
  const [tab, setTab] = useState(0)
  const tabs = ["Tổng quan doanh thu","Phân tích hội viên","Hiệu suất lớp học","Báo cáo nhân sự"]

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      {/* header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-extrabold text-[#2563eb] text-[11px] tracking-[1.5px] uppercase">Thứ hai, 21 tháng 9</p>
          <p className="font-extrabold text-[#0f172a] text-[28px] mt-1">Báo cáo & Thống kê</p>
          <p className="text-[#64748b] text-sm mt-1">Phân tích hiệu suất vận hành, doanh thu và xu hướng tăng trưởng hội viên toàn trung tâm.</p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          <button className="bg-white border border-[#e2e8f0] flex gap-2 items-center px-[18px] py-3 rounded-lg">
            <img src={iDownload2} alt="" className="size-4" />
            <span className="font-bold text-[#64748b] text-sm">Xuất báo cáo PDF</span>
          </button>
          <button className="bg-[#2563eb] flex items-center px-[18px] py-3 rounded-lg">
            <span className="font-bold text-white text-sm">Tạo báo cáo tùy chỉnh</span>
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="flex gap-4">
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Doanh thu tháng 09/2026</p>
            <img src={iKpiRevenue} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">-- đ</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">--%</span>
            <span className="text-[#64748b] text-[13px]">so với tháng trước</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Hội viên hoạt động</p>
            <img src={iKpiMembers} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">-- người</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">--%</span>
            <span className="text-[#64748b] text-[13px]">tăng trưởng</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Lớp học đã tổ chức</p>
            <img src={iKpiClasses} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">-- lớp</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">--%</span>
            <span className="text-[#64748b] text-[13px]">Tỷ lệ lấp đầy</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Tỷ lệ giữ chân</p>
            <img src={iKpiRetain} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">--%</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#fef3c7] font-bold px-2 py-0.5 rounded-full text-[#b45309] text-[11px]">--%</span>
            <span className="text-[#64748b] text-[13px]">so với quý trước</span>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className={`pb-3 text-sm transition-colors ${
            tab === i
              ? "border-b-2 border-[#2563eb] font-bold text-[#2563eb]"
              : "font-medium text-[#64748b]"
          }`}>{t}</button>
        ))}
      </div>

      {/* tab content */}
      {tab === 0 && <ReportsTabRevenue />}
      {tab === 1 && <ReportsTabMembers />}
      {tab === 2 && <ReportsTabClasses />}
      {tab === 3 && <ReportsTabHR />}
    </div>
  )
}
