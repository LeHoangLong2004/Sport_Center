import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function PLReportPage() {
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-[#2563eb] text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Báo cáo lãi lỗ (P&L)</p>
            <p className="text-[#64748b] text-sm mt-1">Tổng hợp đầy đủ dòng doanh thu, cơ cấu chi phí vận hành và lợi nhuận ròng toàn trung tâm</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-[#e2e8f0] flex items-center px-4 py-2.5 rounded-lg">
              <span className="font-medium text-[#0f172a] text-sm">Quý 3/2026 ▾</span>
            </button>
            <button className="bg-white border border-[#e2e8f0] flex items-center px-4 py-2.5 rounded-lg">
              <span className="font-medium text-[#0f172a] text-sm">So sánh với Q2/2026</span>
            </button>
            <button className="bg-[#2563eb] flex items-center px-4 py-2.5 rounded-lg">
              <span className="font-semibold text-white text-sm">Xuất File PDF</span>
            </button>
          </div>
        </div>
      </div>
      {/* KPIs */}
      <div className="flex gap-5">
        {[
          {label:"Tổng Doanh Thu Q3",  value:"3.840.000.000 đ",badge:"▲ +12% so với Q2",green:true},
          {label:"Tổng Chi Phí Q3",    value:"2.760.000.000 đ",badge:"▲ +8% so với Q2", green:false},
          {label:"Lợi Nhuận Ròng",     value:"1.080.000.000 đ",badge:"▲ +22% so với Q2",green:true},
        ].map(k=>(
          <div key={k.label} className="bg-white border border-[#e2e8f0] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
            <p className="font-medium text-[#64748b] text-sm">{k.label}</p>
            <p className="font-bold text-[#0f172a] text-[22px]">{k.value}</p>
            <span className={`text-[12px] font-semibold ${k.green?"text-[#15803d]":"text-[#dc2626]"}`}>{k.badge}</span>
          </div>
        ))}
      </div>
      {/* Revenue + expenses tables side by side */}
      <div className="flex gap-5">
        {/* Revenue */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col min-w-0 rounded-xl">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <p className="font-extrabold text-[#2563eb] text-sm tracking-wider uppercase">Cơ cấu doanh thu (Revenue)</p>
          </div>
          <div className="bg-[#f1f5f9] flex font-bold gap-4 px-6 py-3 text-[#475569] text-[12px]">
            <span className="flex-1">PHÂN LOẠI</span>
            <span className="w-[140px]">Q3/2026</span>
            <span className="w-[140px]">Q2/2026</span>
            <span className="w-[90px]">% TĂNG</span>
          </div>
          {[
            {cat:"Doanh thu Gói thành viên",           q3:"2.227.000.000 đ",q2:"1.980.000.000 đ",pct:"▲ +12.5%",green:true},
            {cat:"Dịch vụ Huấn luyện viên cá nhân (PT)",q3:"844.000.000 đ",  q2:"760.000.000 đ", pct:"▲ +11.0%",green:true},
            {cat:"Doanh thu Lớp học nhóm (Group Class)",q3:"460.000.000 đ",  q2:"410.000.000 đ", pct:"▲ +12.1%",green:true},
            {cat:"Dịch vụ Giá trị gia tăng khác",      q3:"309.000.000 đ",  q2:"290.000.000 đ", pct:"▲ +6.5%", green:true},
          ].map(r=>(
            <div key={r.cat} className="border-b border-[#e2e8f0] flex gap-4 items-center px-6 py-3.5">
              <div className="flex-1"><p className="font-medium text-[#0f172a] text-sm">{r.cat}</p></div>
              <div className="w-[140px]"><p className="text-[#0f172a] text-sm">{r.q3}</p></div>
              <div className="w-[140px]"><p className="text-[#64748b] text-sm">{r.q2}</p></div>
              <div className="w-[90px]"><p className={`font-semibold text-[12px] ${r.green?"text-[#15803d]":"text-[#dc2626]"}`}>{r.pct}</p></div>
            </div>
          ))}
        </div>
        {/* Expenses */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col min-w-0 rounded-xl">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <p className="font-extrabold text-[#dc2626] text-sm tracking-wider uppercase">Cơ cấu chi phí (Expenses)</p>
          </div>
          <div className="bg-[#f1f5f9] flex font-bold gap-4 px-6 py-3 text-[#475569] text-[12px]">
            <span className="flex-1">PHÂN LOẠI</span>
            <span className="w-[140px]">Q3/2026</span>
            <span className="w-[140px]">Q2/2026</span>
            <span className="w-[90px]">% TĂNG</span>
          </div>
          {[
            {cat:"Chi phí nhân sự",              q3:"1.280.000.000 đ",q2:"1.200.000.000 đ",pct:"▼ +6.6%", red:true},
            {cat:"Chi phí mặt bằng & quản lý tòa nhà",q3:"450.000.000 đ",  q2:"450.000.000 đ", pct:"— 0.0%",  red:false},
            {cat:"Khấu hao thiết bị & sửa chữa máy",  q3:"380.000.000 đ",  q2:"300.000.000 đ", pct:"▼ +26.6%",red:true},
            {cat:"Chi phí tiếp thị & quảng cáo",      q3:"350.000.000 đ",  q2:"310.000.000 đ", pct:"▼ +12.9%",red:true},
            {cat:"Chi phí điện nước & vận hành cơ sở", q3:"300.000.000 đ",  q2:"295.000.000 đ", pct:"▼ +1.6%", red:true},
          ].map(r=>(
            <div key={r.cat} className="border-b border-[#e2e8f0] flex gap-4 items-center px-6 py-3.5">
              <div className="flex-1"><p className="font-medium text-[#0f172a] text-sm">{r.cat}</p></div>
              <div className="w-[140px]"><p className="text-[#0f172a] text-sm">{r.q3}</p></div>
              <div className="w-[140px]"><p className="text-[#64748b] text-sm">{r.q2}</p></div>
              <div className="w-[90px]"><p className={`font-semibold text-[12px] ${r.red?"text-[#dc2626]":"text-[#64748b]"}`}>{r.pct}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MEMBER EDIT PAGE ─────────────────────────────────────────────────────────