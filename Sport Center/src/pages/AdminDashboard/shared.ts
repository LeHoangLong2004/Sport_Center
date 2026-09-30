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
export const transactions = [
  { id: "#INV-2026-0891", date: "21/09/2026 14:30", name: "Nguyễn Lan Anh", memberId: "MB-2048", avatar: mAvatar0, service: "Gia hạn Premium 12 tháng",     amount: "12.000.000 đ", method: "Chuyển khoản QR", status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0890", date: "21/09/2026 11:15", name: "Trần Minh Khoa",  memberId: "MB-2017", avatar: mAvatar1, service: "Đăng ký mới Fitness Plus 6T", amount: "5.400.000 đ",  method: "Quẹt thẻ POS",      status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0889", date: "21/09/2026 09:20", name: "Lê Gia Hân",      memberId: "MB-1984", avatar: mAvatar2, service: "Gói Swim Focus 3 tháng",       amount: "2.400.000 đ",  method: "Chuyển khoản NH",    status: "Chờ đối soát",statusColor: "yellow" as const },
  { id: "#INV-2026-0888", date: "20/09/2026 16:45", name: "Phạm Đức Long",   memberId: "MB-1902", avatar: mAvatar3, service: "Mua thêm 10 buổi PT 1-kèm-1",  amount: "6.000.000 đ",  method: "Tiền mặt",           status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0887", date: "19/09/2026 10:00", name: "Vũ Thu Trang",    memberId: "MB-1870", avatar: mAvatar4, service: "Hoàn phí hủy gói Yoga",        amount: "-2.100.000 đ", method: "Chuyển khoản lại",   status: "Đã hoàn tiền",statusColor: "red" as const },
]

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
export const reportBarData = [82, 96, 104, 102, 109, 117, 126, 123, 131, 138, 142, 146]
export const reportMonths  = ["T10","T11","T12","T01","T02","T03","T04","T05","T06","T07","T08","T09"]

// ─── MEMBERS PAGE (existing adapted) ─────────────────────────────────────────
export const members = [
  { name:"Nguyễn Lan Anh", id:"MB-2048", avatar:mAvatar0, pkg:"Premium 12 tháng",  phone:"0903 456 789", email:"lananh@email.com",    status:"Đang hoạt động", expiry:"18/12/2026", vip:true  },
  { name:"Trần Minh Khoa",  id:"MB-2017", avatar:mAvatar1, pkg:"Fitness 6 tháng",   phone:"0918 224 560", email:"khoa.tran@email.com",  status:"Đang hoạt động", expiry:"02/10/2026"           },
  { name:"Lê Gia Hân",      id:"MB-1984", avatar:mAvatar2, pkg:"Swim 3 tháng",      phone:"0987 322 104", email:"giahan.le@email.com",  status:"Sắp hết hạn",    expiry:"25/09/2026"           },
  { name:"Phạm Đức Long",   id:"MB-1902", avatar:mAvatar3, pkg:"Premium 12 tháng",  phone:"0908 914 777", email:"long.pham@email.com",  status:"Tạm khóa",       expiry:"08/05/2027"           },
  { name:"Vũ Thu Trang",    id:"MB-1870", avatar:mAvatar4, pkg:"Yoga 6 tháng",      phone:"0932 662 198", email:"thutrang.vu@email.com",status:"Đang hoạt động", expiry:"14/01/2027"           },
]
