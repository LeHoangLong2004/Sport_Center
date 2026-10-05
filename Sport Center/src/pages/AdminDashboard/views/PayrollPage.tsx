import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function PayrollPage() {
  const rows: any[] = [];
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-[#2563eb] text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Bảng lương nhân viên</p>
            <p className="text-[#64748b] text-sm mt-1">Tính toán tiền lương hàng tháng, thưởng KPI, hoa hồng dịch vụ & trích nộp bảo hiểm bắt buộc</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#e2e8f0] flex gap-2 items-center px-4 py-2.5 rounded-lg">
              <span className="font-medium text-[#0f172a] text-sm">Tháng 9/2026 ▾</span>
            </button>
            <button className="bg-white border border-[#e2e8f0] flex items-center px-4 py-2.5 rounded-lg">
              <span className="font-medium text-[#0f172a] text-sm">Xuất File Excel</span>
            </button>
            <button className="bg-[#2563eb] flex items-center px-4 py-2.5 rounded-lg">
              <span className="font-semibold text-white text-sm">Chốt lương T9</span>
            </button>
          </div>
        </div>
      </div>
      {/* KPIs */}
      <div className="flex gap-5">
        {[
          {label:"Tổng quỹ lương đã duyệt",value:"-- đ",sub:"Thực nhận nhân viên",icon:"📋",bg:"#f0f9ff"},
          {label:"Số nhân viên áp dụng",    value:"-- Nhân sự",   sub:"--% tính",      icon:"✓", bg:"#f0fdf4"},
          {label:"Lương trung bình / người",value:"-- đ", sub:"Bình ổn",            icon:"⏱",bg:"#fffbeb"},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[#64748b] text-sm flex-1">{k.label}</p>
              <div className="flex items-center justify-center rounded-lg size-9 text-lg" style={{background:k.bg}}>{k.icon}</div>
            </div>
            <p className="font-bold text-[#0f172a] text-[22px]">{k.value}</p>
            <span className="text-[#64748b] text-[12px]">{k.sub}</span>
          </div>
        ))}
      </div>
      {/* table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        <div className="border-b border-[#e2e8f0] px-6 py-4">
          <p className="font-extrabold text-[#0f172a] text-base">Chi tiết bảng tính lương Tháng 09/2026</p>
        </div>
        <div className="bg-[#f1f5f9] flex font-bold px-6 py-3 text-[#475569] text-[12px]">
          <span className="w-20">MÃ NV</span>
          <span className="flex-1">HỌ VÀ TÊN</span>
          <span className="w-[160px]">CHỨC VỤ / VỊ TRÍ</span>
          <span className="w-[130px]">LƯƠNG CƠ BẢN</span>
          <span className="w-[90px]">PHỤ CẤP</span>
          <span className="w-[130px]">HOA HỒNG / THƯỞNG</span>
          <span className="w-[100px]">KHẤU TRỪ (BH)</span>
          <span className="w-[120px] text-right">THỰC NHẬN</span>
        </div>
        {rows.map(r=>(
          <div key={r.id} className="border-b border-[#f1f5f9] flex items-center px-6 py-4">
            <div className="w-20"><p className="text-[#64748b] text-sm">{r.id}</p></div>
            <div className="flex-1"><p className="font-semibold text-[#0f172a] text-sm">{r.name}</p></div>
            <div className="w-[160px]"><p className="text-[#64748b] text-[12px]">{r.role}</p></div>
            <div className="w-[130px]"><p className="text-[#0f172a] text-sm">{r.base} đ</p></div>
            <div className="w-[90px]"><p className="text-[#0f172a] text-sm">{r.allowance} đ</p></div>
            <div className="w-[130px]"><p className="font-semibold text-[#14b8a6] text-sm">{r.commission} đ</p></div>
            <div className="w-[100px]"><p className="font-semibold text-[#dc2626] text-sm">{r.deduct} đ</p></div>
            <div className="w-[120px] text-right"><p className="font-bold text-[#2563eb] text-sm">{r.net} đ</p></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── P&L PAGE ─────────────────────────────────────────────────────────────────