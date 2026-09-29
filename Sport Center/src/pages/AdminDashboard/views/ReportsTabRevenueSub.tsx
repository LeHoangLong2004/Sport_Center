import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function ReportsTabRevenueSub() {
  return (
    <div className="flex gap-5">
      {/* top packages */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col min-w-0 rounded-xl">
        <div className="border-b border-[#e2e8f0] px-6 py-5">
          <p className="font-extrabold text-[#0f172a] text-base">Top 5 gói dịch vụ bán chạy nhất</p>
        </div>
        <div className="flex flex-col">
          <div className="bg-[#f1f5f9] flex gap-3 font-bold px-6 py-3 text-[#475569] text-[12px]">
            <span className="w-10">#</span>
            <span className="flex-1">TÊN GÓI DỊCH VỤ</span>
            <span className="text-right w-28">SỐ LƯỢNG BÁN</span>
            <span className="text-right w-40">DOANH THU</span>
            <span className="text-right w-24">XU HƯỚNG</span>
          </div>
          {[
            { rank:1, name:"Premium 12 tháng",  qty:"89 gói", rev:"1.068.000.000 đ", trend:"+12%", green:true },
            { rank:2, name:"Fitness Plus 6T",   qty:"67 gói", rev:"361.800.000 đ",   trend:"+8%",  green:true },
            { rank:3, name:"Swim Focus 3T",     qty:"45 gói", rev:"108.000.000 đ",   trend:"+5%",  green:true },
            { rank:4, name:"Yoga Unlimited",    qty:"38 gói", rev:"91.200.000 đ",    trend:"-3%",  green:false },
            { rank:5, name:"PT Pack 10 buổi",   qty:"34 gói", rev:"204.000.000 đ",   trend:"+15%", green:true },
          ].map(r => (
            <div key={r.rank} className="border-b border-[#e2e8f0] flex gap-3 items-center px-6 py-3.5">
              <span className="font-semibold text-[#64748b] text-[13px] w-10">{r.rank}</span>
              <span className="font-semibold text-[#0f172a] text-sm flex-1">{r.name}</span>
              <span className="text-[#0f172a] text-sm text-right w-28">{r.qty}</span>
              <span className="font-semibold text-[#0f172a] text-sm text-right w-40">{r.rev}</span>
              <div className="flex justify-end w-24">
                <span className={`font-bold px-2 py-0.5 rounded text-[12px] ${r.green ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>{r.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* activity */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[380px]">
        <p className="font-extrabold text-[#0f172a] text-base">Hoạt động gần đây</p>
        <div className="flex flex-col gap-4">
          {[
            { icon: iActivity0, text: "Báo cáo doanh thu T09 đã sẵn sàng", time: "2 giờ trước" },
            { icon: iActivity1, text: "Đạt mục tiêu 2.400 hội viên",        time: "1 ngày trước" },
            { icon: iActivity2, text: "Cảnh báo: Tỷ lệ hủy gói tăng 2%",   time: "2 ngày trước" },
            { icon: iActivity0, text: "Xuất báo cáo nhân sự Q3 thành công", time: "3 ngày trước" },
            { icon: iActivity3, text: "Lớp Yoga đạt 95% lấp đầy",          time: "5 ngày trước" },
          ].map((a, i) => (
            <div key={i} className="flex gap-3 items-start">
              <img src={a.icon} alt="" className="w-4 shrink-0 mt-0.5" style={{ height: i === 4 ? 8 : 44 }} />
              <div>
                <p className="font-medium text-[#0f172a] text-[13px]">{a.text}</p>
                <p className="text-[#64748b] text-[11px]">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Line chart approximation using SVG