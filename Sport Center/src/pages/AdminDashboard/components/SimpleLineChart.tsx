import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';

export default function SimpleLineChart() {
  const newPoints = [60,65,62,68,72,70,75,78,80,85,88,90]
  const cancelPoints = [25,22,28,20,25,23,26,22,24,21,25,22]
  const w = 460; const h = 130
  const toX = (i: number) => (i/(newPoints.length-1)) * w
  const toY = (v: number, max: number) => h - (v/max)*h

  const path = (pts: number[], max: number) =>
    pts.map((v, i) => `${i===0?"M":"L"}${toX(i).toFixed(1)},${toY(v,max).toFixed(1)}`).join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }}>
      <path d={path(newPoints, 120)} stroke="#2563eb" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={path(cancelPoints, 120)} stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
