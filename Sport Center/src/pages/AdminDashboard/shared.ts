import { useState } from "react"

export const A = "/assets"

// ─── asset refs ──────────────────────────────────────────────────────────────
// sidebar + topbar
export const avatarSidebar = `${A}/c37ff.png`
export const avatarTopbar  = `${A}/08d14.png`
// nav icons
export const iDashboard  = `${A}/18746.svg`
export const iUsers      = `${A}/17d50.svg`
export const iPackage    = `${A}/2585a.svg`
export const iCalendar   = `${A}/d225c.svg`
export const iReceipt    = `${A}/a7c08.svg`
export const iBarChart   = `${A}/2ff3e.svg`
export const iSettings   = `${A}/e149c.svg`
// payment page icons
export const iSearch     = `${A}/08fe6.svg`
export const iBell       = `${A}/0c06a.svg`
export const iSearch2    = `${A}/6eb8a.svg`
export const iDownload   = `${A}/68c34.svg`
export const iPlus       = `${A}/3c14a.svg`
export const iWallet     = `${A}/77019.svg`
export const iCheckCircle= `${A}/5fcad.svg`
export const iClock      = `${A}/86ecc.svg`
export const iRotateCcw  = `${A}/4af41.svg`
export const iChevron    = `${A}/e731e.svg`
export const iEye        = `${A}/08ba8.svg`
export const iPrinter    = `${A}/00d47.svg`
export const iMore       = `${A}/5e479.svg`
// member avatars
export const mAvatar0    = `${A}/9e490.png`
export const mAvatar1    = `${A}/845fd.png`
export const mAvatar2    = `${A}/f89f9.png`
export const mAvatar3    = `${A}/e9891.png`
export const mAvatar4    = `${A}/3119c.png`
// reports page icons
export const iBell2      = `${A}/06b99.svg`
export const iDownload2  = `${A}/10f65.svg`
export const iKpiRevenue = `${A}/001b3.svg`
export const iKpiMembers = `${A}/b7ed9.svg`
export const iKpiClasses = `${A}/0e2aa.svg`
export const iKpiRetain  = `${A}/e6b3e.svg`
// donut segments
export const iSeg1 = `${A}/f7a24.svg`
export const iSeg2 = `${A}/f6df2.svg`
export const iSeg3 = `${A}/5d4ce.svg`
export const iSeg4 = `${A}/8a7d6.svg`
// donut legend dots
export const iDotBlue   = `${A}/dd7f5.svg`
export const iDotTeal   = `${A}/681d0.svg`
export const iDotOrange = `${A}/8faa7.svg`
export const iDotPurple = `${A}/9a4eb.svg`
// activity timeline icons
export const iActivity0 = `${A}/b1522.svg`
export const iActivity1 = `${A}/0e711.svg`
export const iActivity2 = `${A}/61264.svg`
export const iActivity3 = `${A}/70a6f.svg`
// reports tab 2 - member analysis
export const iLineChart  = `${A}/e0f0a.svg`
// reports tab 3 - classes
export const iBarFill    = `${A}/8d624.svg`
// reports tab 3 - coach ratings
export const coachAvatar1 = `${A}/6691c.png`
export const coachAvatar2 = `${A}/ff399.png`
export const coachAvatar3 = `${A}/21c68.png`
export const coachAvatar4 = `${A}/3af4d.png`
// reports tab 4 - HR
export const hrAvatar1 = `${A}/afabf.png`
export const hrAvatar2 = `${A}/76979.png`
export const hrAvatar3 = `${A}/fe7e6.png`
export const hrAvatar4 = `${A}/37324.png`
// finance pages
export const iBudgetIcon    = `${A}/5b886.svg`
export const iExpenseIcon   = `${A}/ca4b1.svg`
export const iBudgetChevron = `${A}/249a0.svg`
export const iPLRevIcon     = `${A}/21971.svg`
// member edit
export const memberEditAvatar = `${A}/b49d6.png`

// ─── types ───────────────────────────────────────────────────────────────────
export type AdminPage =
  | "overview" | "packages" | "schedule"
  | "members" | "payment" | "reports" | "budget" | "expenses"
  | "payroll" | "pl-report" | "settings" | "member-edit" | "profile"

// ─── shared components ────────────────────────────────────────────────────────
// ─── PAYMENT PAGE ─────────────────────────────────────────────────────────────
export const transactions: any[] = []

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
export const reportBarData: number[] = []
export const reportMonths  = ["T10","T11","T12","T01","T02","T03","T04","T05","T06","T07","T08","T09"]

// ─── MEMBERS PAGE (existing adapted) ─────────────────────────────────────────
export const members: any[] = []
