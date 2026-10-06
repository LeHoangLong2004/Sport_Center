import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function BudgetPage() {
  const budgetItems: any[] = [];
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-[#2563eb] text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Quản lý ngân sách</p>
            <p className="text-[#64748b] text-sm mt-1">Theo dõi phân bổ và thực chi ngân sách theo từng hạng mục chi tiết tại SportCenter</p>
          </div>
          <button className="bg-[#2563eb] flex items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Tạo ngân sách mới</span>
          </button>
        </div>
      </div>
      {/* KPIs */}
      <div className="flex gap-5">
        {[
          {label:"Tổng ngân sách Q3/2026",value:"-- đ",sub:"Tổng phân bổ",      icon:"🗂",bg:"#f0f9ff"},
          {label:"Đã sử dụng",            value:"-- đ",sub:"--% Đã chi",       icon:"✓", bg:"#f0fdf4"},
          {label:"Còn lại khả dụng",       value:"-- đ",  sub:"An toàn",            icon:"⏱",bg:"#fffbeb"},
          {label:"Vượt ngân sách",         value:"-- Hạng mục",     sub:"Cảnh báo cao",       icon:"⚠",bg:"#fef2f2"},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[#64748b] text-sm flex-1 min-w-0">{k.label}</p>
              <div className="flex items-center justify-center rounded-lg size-9 text-lg" style={{background:k.bg}}>{k.icon}</div>
            </div>
            <p className="font-bold text-[#0f172a] text-[22px] leading-tight">{k.value}</p>
            <span className="text-[#64748b] text-[12px]">{k.sub}</span>
          </div>
        ))}
      </div>
      {/* Table + chart */}
      <div className="flex gap-5">
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col min-w-0 rounded-xl">
          <div className="border-b border-[#e2e8f0] px-6 py-5">
            <p className="font-extrabold text-[#0f172a] text-base">Chi tiết phân bổ ngân sách theo hạng mục</p>
          </div>
          <div className="bg-[#f1f5f9] flex font-bold px-6 py-3 text-[#475569] text-[12px]">
            <span className="w-[200px]">HẠNG MỤC</span>
            <span className="flex-1">NGÂN SÁCH</span>
            <span className="flex-1">THỰC CHI</span>
            <span className="flex-1">CHÊNH LỆCH</span>
            <span className="w-[140px]">TRẠNG THÁI</span>
          </div>
          {budgetItems.map(row=>(
            <div key={row.name} className="border-b border-[#e2e8f0] flex items-center px-6 py-4">
              <div className="w-[200px]"><p className="font-medium text-[#0f172a] text-sm">{row.name}</p></div>
              <div className="flex-1"><p className="text-[#0f172a] text-sm">{row.budget}</p></div>
              <div className="flex-1"><p className="text-[#0f172a] text-sm">{row.actual}</p></div>
              <div className="flex-1"><p className={`font-semibold text-sm ${row.green?"text-[#15803d]":"text-[#dc2626]"}`}>{row.diff}</p></div>
              <div className="w-[140px]">
                <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${row.green?"bg-[#dcfce7] text-[#15803d]":"bg-[#fee2e2] text-[#b91c1c]"}`}>{row.status}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Bar comparison chart */}
        <div className="bg-white border border-[#e2e8f0] flex flex-col gap-4 p-6 rounded-xl shrink-0 w-[320px]">
          <div>
            <p className="font-extrabold text-[#0f172a] text-base">Ngân sách vs Thực chi</p>
            <p className="text-[#64748b] text-[12px] mt-1">Biểu đồ so sánh lũy kế T7 – T9 (Triệu VNĐ)</p>
          </div>
          <div className="flex gap-4 items-end justify-around" style={{height:160}}>
            {[
              {planned:220,actual:195,month:"Tháng 7"},
              {planned:240,actual:220,month:"Tháng 8"},
              {planned:260,actual:280,month:"Tháng 9"},
            ].map(bar=>(
              <div key={bar.month} className="flex flex-col items-center gap-2 flex-1">
                <div className="flex gap-1 items-end" style={{height:120}}>
                  <div className="bg-[#e2e8f0] rounded-t-sm w-7" style={{height:`${(bar.planned/280)*100}%`}}/>
                  <div className={`rounded-t-sm w-7 ${bar.actual>bar.planned?"bg-[#ef4444]":"bg-[#2563eb]"}`} style={{height:`${(bar.actual/280)*100}%`}}/>
                </div>
                <span className="text-[#64748b] text-[11px] whitespace-nowrap">{bar.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex gap-1.5 items-center"><div className="bg-[#e2e8f0] rounded-full size-2.5"/><span className="text-[#64748b] text-[12px]">Ngân sách kế hoạch</span></div>
            <div className="flex gap-1.5 items-center"><div className="bg-[#2563eb] rounded-full size-2.5"/><span className="text-[#64748b] text-[12px]">Thực chi thực tế</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EXPENSES PAGE ────────────────────────────────────────────────────────────