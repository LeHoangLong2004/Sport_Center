import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';

export default function KpiCard({
  label, value, sub, badge, badgeColor, icon, iconBg
}: {
  label: string; value: string; sub: string; badge?: string
  badgeColor?: "green" | "yellow" | "red"; icon: string; iconBg: string
}) {
  const badgeStyle = badgeColor === "green" ? "bg-[#dcfce7] text-[#15803d]"
    : badgeColor === "yellow" ? "bg-[#fef3c7] text-[#b45309]"
    : "bg-[#fee2e2] text-[#b91c1c]"
  return (
    <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_2px_2px_rgba(0,0,0,0.02)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
      <div className="flex items-center justify-between">
        <p className="font-medium text-[#64748b] text-sm flex-1 min-w-0">{label}</p>
        <div className={`flex items-center justify-center rounded-lg size-9 ${iconBg}`}>
          <img src={icon} alt="" className="size-5" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="font-bold text-[#0f172a] text-[28px]">{value}</p>
        <div className="flex gap-1.5 items-center">
          {badge && (
            <span className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${badgeStyle}`}>{badge}</span>
          )}
          <span className="text-[#64748b] text-[12px]">{sub}</span>
        </div>
      </div>
    </div>
  )
}
