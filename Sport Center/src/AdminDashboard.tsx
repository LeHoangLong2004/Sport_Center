import { useState } from "react"

const A = "/assets"

// ─── asset refs ──────────────────────────────────────────────────────────────
// sidebar + topbar
const avatarSidebar = `${A}/c37ff.png`
const avatarTopbar  = `${A}/08d14.png`
// nav icons
const iDashboard  = `${A}/18746.svg`
const iUsers      = `${A}/17d50.svg`
const iPackage    = `${A}/2585a.svg`
const iCalendar   = `${A}/d225c.svg`
const iReceipt    = `${A}/a7c08.svg`
const iBarChart   = `${A}/2ff3e.svg`
const iSettings   = `${A}/e149c.svg`
// payment page icons
const iSearch     = `${A}/08fe6.svg`
const iBell       = `${A}/0c06a.svg`
const iSearch2    = `${A}/6eb8a.svg`
const iDownload   = `${A}/68c34.svg`
const iPlus       = `${A}/3c14a.svg`
const iWallet     = `${A}/77019.svg`
const iCheckCircle= `${A}/5fcad.svg`
const iClock      = `${A}/86ecc.svg`
const iRotateCcw  = `${A}/4af41.svg`
const iChevron    = `${A}/e731e.svg`
const iEye        = `${A}/08ba8.svg`
const iPrinter    = `${A}/00d47.svg`
const iMore       = `${A}/5e479.svg`
// member avatars
const mAvatar0    = `${A}/9e490.png`
const mAvatar1    = `${A}/845fd.png`
const mAvatar2    = `${A}/f89f9.png`
const mAvatar3    = `${A}/e9891.png`
const mAvatar4    = `${A}/3119c.png`
// reports page icons
const iBell2      = `${A}/06b99.svg`
const iDownload2  = `${A}/10f65.svg`
const iKpiRevenue = `${A}/001b3.svg`
const iKpiMembers = `${A}/b7ed9.svg`
const iKpiClasses = `${A}/0e2aa.svg`
const iKpiRetain  = `${A}/e6b3e.svg`
// donut segments
const iSeg1 = `${A}/f7a24.svg`
const iSeg2 = `${A}/f6df2.svg`
const iSeg3 = `${A}/5d4ce.svg`
const iSeg4 = `${A}/8a7d6.svg`
// donut legend dots
const iDotBlue   = `${A}/dd7f5.svg`
const iDotTeal   = `${A}/681d0.svg`
const iDotOrange = `${A}/8faa7.svg`
const iDotPurple = `${A}/9a4eb.svg`
// activity timeline icons
const iActivity0 = `${A}/b1522.svg`
const iActivity1 = `${A}/0e711.svg`
const iActivity2 = `${A}/61264.svg`
const iActivity3 = `${A}/70a6f.svg`
// reports tab 2 - member analysis
const iLineChart  = `${A}/e0f0a.svg`
// reports tab 3 - classes
const iBarFill    = `${A}/8d624.svg`
// reports tab 3 - coach ratings
const coachAvatar1 = `${A}/6691c.png`
const coachAvatar2 = `${A}/ff399.png`
const coachAvatar3 = `${A}/21c68.png`
const coachAvatar4 = `${A}/3af4d.png`
// reports tab 4 - HR
const hrAvatar1 = `${A}/afabf.png`
const hrAvatar2 = `${A}/76979.png`
const hrAvatar3 = `${A}/fe7e6.png`
const hrAvatar4 = `${A}/37324.png`
// finance pages
const iBudgetIcon    = `${A}/5b886.svg`
const iExpenseIcon   = `${A}/ca4b1.svg`
const iBudgetChevron = `${A}/249a0.svg`
const iPLRevIcon     = `${A}/21971.svg`
// member edit
const memberEditAvatar = `${A}/b49d6.png`

// ─── types ───────────────────────────────────────────────────────────────────
type AdminPage =
  | "members" | "payment" | "reports" | "budget" | "expenses"
  | "payroll" | "pl-report" | "settings" | "member-edit"

// ─── shared components ────────────────────────────────────────────────────────
function Sidebar({ page, setPage }: { page: AdminPage; setPage: (p: AdminPage) => void }) {
  const [financeOpen, setFinanceOpen] = useState(
    ["budget","expenses","payroll","pl-report"].includes(page)
  )
  const navItems: { label: string; icon: string; page: AdminPage }[] = [
    { label: "Tổng quan",             icon: iDashboard, page: "members"  },
    { label: "Quản lý Người dùng",   icon: iUsers,     page: "members"  },
    { label: "Gói hội viên",          icon: iPackage,   page: "members"  },
    { label: "Lớp học & Lịch trình", icon: iCalendar,  page: "members"  },
    { label: "Thanh toán & Hóa đơn", icon: iReceipt,   page: "payment"  },
  ]
  const financeSubItems: { label: string; page: AdminPage }[] = [
    { label: "Quản lý ngân sách",    page: "budget"    },
    { label: "Chi phí vận hành",     page: "expenses"  },
    { label: "Bảng lương nhân viên", page: "payroll"   },
    { label: "Báo cáo lãi lỗ (P&L)",page: "pl-report" },
  ]
  const isFinancePage = ["budget","expenses","payroll","pl-report"].includes(page)

  return (
    <aside className="bg-[#0f172a] flex flex-col gap-7 h-full items-start pb-6 pt-7 px-[18px] shrink-0 w-[260px]">
      {/* brand */}
      <div className="flex gap-3 items-center w-full">
        <div className="bg-[#14b8a6] flex items-center justify-center rounded-[10px] size-10">
          <span className="font-extrabold text-[#0f172a] text-lg">SC</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-white text-[15px] tracking-wide">SPORTCENTER</span>
          <div className="bg-[#1e293b] px-1.5 py-px rounded-[4px]">
            <span className="font-bold text-[#14b8a6] text-[9px] tracking-wider">CENTER MANAGER</span>
          </div>
        </div>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1.5 w-full flex-1">
        {navItems.map(item => {
          const active = item.page === "payment"
            ? page === "payment"
            : item.label === "Quản lý Người dùng"
              ? page === "members" && !isFinancePage
              : false
          return (
            <button
              key={item.label}
              onClick={() => setPage(item.page)}
              className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left transition-colors ${
                active ? "bg-[#2563eb]" : "hover:bg-white/5"
              }`}
            >
              <img src={item.icon} alt="" className="size-[18px] shrink-0" />
              <span className={`text-sm flex-1 ${active ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
                {item.label}
              </span>
            </button>
          )
        })}

        {/* Finance section */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setFinanceOpen(v => !v)}
            className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left hover:bg-white/5 ${isFinancePage ? "bg-[#2563eb]" : ""}`}
          >
            <span className="size-[18px] shrink-0 text-[#cbd5e1] flex items-center justify-center text-base">₫</span>
            <span className={`text-sm flex-1 ${isFinancePage ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
              Tài chính {financeOpen ? "▾" : "▸"}
            </span>
          </button>
          {financeOpen && financeSubItems.map(sub => (
            <button
              key={sub.page}
              onClick={() => setPage(sub.page)}
              className={`flex gap-2 items-center pl-[46px] pr-4 py-2 rounded-md w-full text-left hover:bg-white/5 ${page === sub.page ? "bg-white/10" : ""}`}
            >
              <div className={`rounded-full size-[5px] shrink-0 ${page === sub.page ? "bg-white" : "bg-[#909dad]"}`} />
              <span className={`text-[12.5px] ${page === sub.page ? "font-semibold text-white" : "font-normal text-[#909dad]"}`}>
                {sub.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setPage("reports")}
          className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left transition-colors ${
            page === "reports" ? "bg-[#2563eb]" : "hover:bg-white/5"
          }`}
        >
          <img src={iBarChart} alt="" className="size-[18px] shrink-0" />
          <span className={`text-sm flex-1 ${page === "reports" ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
            Báo cáo & Thống kê
          </span>
        </button>
        <button
          onClick={() => setPage("settings")}
          className={`flex gap-3 items-center px-4 py-3 rounded-lg w-full text-left hover:bg-white/5 ${page === "settings" ? "bg-[#2563eb]" : ""}`}
        >
          <img src={iSettings} alt="" className="size-[18px] shrink-0" />
          <span className={`text-sm flex-1 ${page === "settings" ? "font-bold text-white" : "font-medium text-[#cbd5e1]"}`}>
            Cài đặt & Nhật ký
          </span>
        </button>
      </nav>

      {/* support card */}
      <div className="bg-[#1e293b] border border-[#334155] flex flex-col gap-2 p-4 rounded-xl w-full">
        <p className="font-bold text-white text-[13px]">Cần hỗ trợ vận hành?</p>
        <p className="font-normal leading-[1.4] text-[#94a3b8] text-[11px]">
          Hotline kỹ thuật hoạt động từ 06:00 – 22:00 hàng ngày.
        </p>
      </div>

      {/* user */}
      <div className="border-t border-[#1e293b] flex gap-3 items-center pt-4 w-full">
        <img src={avatarSidebar} alt="" className="rounded-full size-10 object-cover" />
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <p className="font-bold text-white text-[13px]">Minh Anh</p>
          <p className="text-[#94a3b8] text-[11px]">Quản lý trung tâm</p>
        </div>
      </div>
    </aside>
  )
}

function TopBar({ breadcrumb, title }: { breadcrumb: string; title: string }) {
  return (
    <header className="bg-white border-b border-[#e2e8f0] flex h-[78px] items-center justify-between px-8 shrink-0 w-full">
      <div className="flex flex-col gap-1">
        <p className="text-[#94a3b8] text-[11px]">{breadcrumb}</p>
        <p className="font-extrabold text-[#0f172a] text-xl">{title}</p>
      </div>
      <div className="flex gap-4 items-center">
        <div className="bg-[#f1f5f9] flex gap-2 items-center px-3 py-2 rounded-lg w-[240px]">
          <img src={iSearch} alt="" className="size-4 shrink-0" />
          <span className="text-[#94a3b8] text-[12px] flex-1">Tìm nhanh hội viên, lớp...</span>
        </div>
        <button className="border border-[#e2e8f0] flex items-center justify-center rounded-full size-10">
          <img src={iBell} alt="" className="size-[18px]" />
        </button>
        <img src={avatarTopbar} alt="" className="rounded-full size-[38px] object-cover" />
      </div>
    </header>
  )
}

function KpiCard({
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

// ─── PAYMENT PAGE ─────────────────────────────────────────────────────────────
const transactions = [
  { id: "#INV-2026-0891", date: "21/09/2026 14:30", name: "Nguyễn Lan Anh", memberId: "MB-2048", avatar: mAvatar0, service: "Gia hạn Premium 12 tháng",     amount: "12.000.000 đ", method: "Chuyển khoản QR", status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0890", date: "21/09/2026 11:15", name: "Trần Minh Khoa",  memberId: "MB-2017", avatar: mAvatar1, service: "Đăng ký mới Fitness Plus 6T", amount: "5.400.000 đ",  method: "Quẹt thẻ POS",      status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0889", date: "21/09/2026 09:20", name: "Lê Gia Hân",      memberId: "MB-1984", avatar: mAvatar2, service: "Gói Swim Focus 3 tháng",       amount: "2.400.000 đ",  method: "Chuyển khoản NH",    status: "Chờ đối soát",statusColor: "yellow" as const },
  { id: "#INV-2026-0888", date: "20/09/2026 16:45", name: "Phạm Đức Long",   memberId: "MB-1902", avatar: mAvatar3, service: "Mua thêm 10 buổi PT 1-kèm-1",  amount: "6.000.000 đ",  method: "Tiền mặt",           status: "Thành công",  statusColor: "green" as const },
  { id: "#INV-2026-0887", date: "19/09/2026 10:00", name: "Vũ Thu Trang",    memberId: "MB-1870", avatar: mAvatar4, service: "Hoàn phí hủy gói Yoga",        amount: "-2.100.000 đ", method: "Chuyển khoản lại",   status: "Đã hoàn tiền",statusColor: "red" as const },
]

function PaymentPage() {
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      {/* breadcrumb + secondary bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 items-center text-sm">
          <span className="text-[#64748b]">Quản lý</span>
          <span className="text-[#64748b]">/</span>
          <span className="font-medium text-[#0f172a]">Thanh toán & Hóa đơn</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-white border border-[#e2e8f0] flex gap-2 items-center px-3 py-2 rounded-lg w-[240px]">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <span className="text-[#64748b] text-sm flex-1">Tìm kiếm...</span>
          </div>
          <div className="bg-[#e2e8f0] flex items-center justify-center rounded-full size-9">
            <span className="font-bold text-[#0f172a] text-[13px]">MA</span>
          </div>
        </div>
      </div>

      {/* title row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Thanh toán & Hóa đơn</p>
          <p className="text-[#64748b] text-sm mt-1">Giám sát lịch sử dòng tiền, đối soát giao dịch và xuất hóa đơn dịch vụ toàn trung tâm.</p>
        </div>
        <div className="flex gap-3 items-center shrink-0">
          <button className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất báo cáo Excel</span>
          </button>
          <button className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iPlus} alt="" className="size-4" />
            <span className="font-semibold text-white text-sm">Tạo giao dịch thu tiền</span>
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="flex gap-5">
        <KpiCard label="Tổng thực thu (Tháng này)" value="1,28 tỷ đ"      sub="so với tháng trước" badge="▲ +14,2%" badgeColor="green"  icon={iWallet}     iconBg="bg-[rgba(37,99,235,0.08)]" />
        <KpiCard label="Giao dịch thành công"       value="418 giao dịch"  sub="98.5% tỷ lệ thành công"                                  icon={iCheckCircle} iconBg="bg-[rgba(21,128,61,0.08)]" />
        <KpiCard label="Chờ đối soát / Xử lý"       value="18.400.000 đ"   sub="3 giao dịch chuyển khoản chờ duyệt"                      icon={iClock}       iconBg="bg-[rgba(217,119,6,0.08)]" />
        <KpiCard label="Hoàn tiền (Tháng này)"      value="5.400.000 đ"    sub="1 yêu cầu hủy gói do lý do y tế"                         icon={iRotateCcw}   iconBg="bg-[rgba(220,38,38,0.08)]" />
      </div>

      {/* filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg w-[320px]">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <span className="text-[#64748b] text-sm flex-1">Tìm theo mã hóa đơn, tên hội viên, SĐT...</span>
          </div>
          {["Phương thức: Tất cả","Trạng thái: Tất cả","Thời gian: Tháng này"].map(f => (
            <button key={f} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg">
              <span className="font-medium text-[#0f172a] text-sm whitespace-nowrap">{f}</span>
              <img src={iChevron} alt="" className="size-4" />
            </button>
          ))}
        </div>
        <span className="font-medium text-[#64748b] text-sm whitespace-nowrap">Tổng số: 422 hóa đơn</span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[13px]">
          <div className="py-3 w-[140px]">MÃ HÓA ĐƠN</div>
          <div className="py-3 w-[195px]">HỘI VIÊN / KHÁCH HÀNG</div>
          <div className="py-3 w-[200px]">DỊCH VỤ / GÓI TẬP</div>
          <div className="py-3 w-[130px]">SỐ TIỀN THANH TOÁN</div>
          <div className="py-3 w-[140px]">PHƯƠNG THỨC</div>
          <div className="py-3 w-[115px]">TRẠNG THÁI</div>
          <div className="py-3 flex-1 text-right">THAO TÁC</div>
        </div>
        {transactions.map(tx => (
          <div key={tx.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="w-[140px]">
              <p className="font-bold text-[#0f172a] text-sm">{tx.id}</p>
              <p className="text-[#64748b] text-[12px]">{tx.date}</p>
            </div>
            <div className="flex gap-2.5 items-center w-[195px]">
              <img src={tx.avatar} alt="" className="rounded-full size-8 object-cover" />
              <div>
                <p className="font-semibold text-[#0f172a] text-sm">{tx.name}</p>
                <p className="text-[#64748b] text-[12px]">{tx.memberId}</p>
              </div>
            </div>
            <div className="w-[200px] overflow-hidden">
              <p className="text-[#0f172a] text-sm truncate">{tx.service}</p>
            </div>
            <div className="w-[130px]">
              <p className={`font-bold text-sm ${tx.statusColor === "red" ? "text-[#dc2626]" : "text-[#0f172a]"}`}>{tx.amount}</p>
            </div>
            <div className="w-[140px]">
              <span className="bg-[#f1f5f9] font-medium px-2 py-1 rounded-md text-[#334155] text-[12px]">{tx.method}</span>
            </div>
            <div className="w-[115px]">
              <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${
                tx.statusColor === "green" ? "bg-[#dcfce7] text-[#15803d]"
                : tx.statusColor === "yellow" ? "bg-[#fef3c7] text-[#b45309]"
                : "bg-[#fee2e2] text-[#b91c1c]"
              }`}>{tx.status}</span>
            </div>
            <div className="flex flex-1 gap-2 items-center justify-end">
              {tx.statusColor === "yellow" && (
                <button className="bg-[#2563eb] flex items-center px-3 py-1.5 rounded-md">
                  <span className="font-semibold text-white text-[12px]">Duyệt thu</span>
                </button>
              )}
              <button className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8">
                <img src={iEye} alt="" className="size-4" />
              </button>
              {tx.statusColor !== "yellow" && (
                <button className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8">
                  <img src={iPrinter} alt="" className="size-4" />
                </button>
              )}
              <button className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8">
                <img src={iMore} alt="" className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {/* pagination */}
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-[#64748b] text-sm">Hiển thị 1 - 5 trong tổng số 422 giao dịch</span>
          <div className="flex gap-2 items-center">
            {["Trước","1","2","3","...","85","Sau"].map((p, i) => (
              <button key={i} className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${
                p === "1" ? "bg-[#2563eb] font-semibold text-white" : p === "..." ? "text-[#64748b]" : "bg-white border border-[#e2e8f0] text-[#0f172a]"
              }`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
const reportBarData = [82, 96, 104, 102, 109, 117, 126, 123, 131, 138, 142, 146]
const reportMonths  = ["T10","T11","T12","T01","T02","T03","T04","T05","T06","T07","T08","T09"]

function ReportsPage() {
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
          <p className="font-extrabold text-[#0f172a] text-[28px]">1,28 tỷ đ</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">+14,2%</span>
            <span className="text-[#64748b] text-[13px]">so với tháng trước</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Hội viên hoạt động</p>
            <img src={iKpiMembers} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">2.486 người</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">+8,4%</span>
            <span className="text-[#64748b] text-[13px]">tăng trưởng</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Lớp học đã tổ chức</p>
            <img src={iKpiClasses} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">156 lớp</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#dcfce7] font-bold px-2 py-0.5 rounded-full text-[#15803d] text-[11px]">87%</span>
            <span className="text-[#64748b] text-[13px]">Tỷ lệ lấp đầy</span>
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-3 min-w-0 p-5 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-[#64748b] text-sm">Tỷ lệ giữ chân</p>
            <img src={iKpiRetain} alt="" className="size-5 shrink-0" />
          </div>
          <p className="font-extrabold text-[#0f172a] text-[28px]">92,3%</p>
          <div className="flex gap-2 items-center">
            <span className="bg-[#fef3c7] font-bold px-2 py-0.5 rounded-full text-[#b45309] text-[11px]">+3,1%</span>
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

function ReportsTabRevenue() {
  const maxH = Math.max(...reportBarData)
  return (
    <div className="flex gap-5">
      {/* bar chart */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[#0f172a] text-base">Biểu đồ doanh thu 12 tháng gần nhất</p>
            <p className="text-[#64748b] text-[12px] mt-1">Đơn vị: Triệu VNĐ</p>
          </div>
          <div className="flex gap-1.5 items-center">
            <img src={iDotBlue} alt="" className="size-2" />
            <span className="text-[#64748b] text-[12px]">Doanh thu gói dịch vụ</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 h-40 items-end px-4">
            {reportBarData.map((h, i) => (
              <div key={i} className="flex flex-col flex-1 h-full items-start justify-end min-w-0 relative">
                {i === 11 && (
                  <div className="absolute bg-[#0f172a] flex items-center px-2 py-1 rounded top-[-30px] left-0">
                    <span className="font-semibold text-white text-[10px] whitespace-nowrap">1,28 tỷ</span>
                  </div>
                )}
                <div
                  className="bg-[#2563eb] w-full rounded-t-md"
                  style={{ height: `${Math.round((h / maxH) * 100)}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-4">
            {reportMonths.map(m => (
              <span key={m} className="text-[#94a3b8] text-[11px] text-center">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* donut */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[380px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ nguồn doanh thu</p>
        <div className="flex h-40 items-center justify-center">
          <div className="relative size-[140px]">
            <div className="absolute inset-0">
              <svg viewBox="0 0 140 140" className="size-full">
                <circle cx="70" cy="70" r="55" fill="none" stroke="#e2e8f0" strokeWidth="18"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#2563eb" strokeWidth="18" strokeDasharray="209.5 153.3" strokeDashoffset="0" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#14b8a6" strokeWidth="18" strokeDasharray="79.3 283.5" strokeDashoffset="-209.5" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#f97316" strokeWidth="18" strokeDasharray="43.4 319.4" strokeDashoffset="-288.8" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#a855f7" strokeWidth="18" strokeDasharray="28.9 333.9" strokeDashoffset="-332.2" transform="rotate(-90 70 70)"/>
              </svg>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#64748b] text-[11px]">Doanh thu</span>
              <span className="font-extrabold text-[#0f172a] text-base">1,28 tỷ</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { dot: iDotBlue,   label: "Gói hội viên", pct: "58%" },
            { dot: iDotTeal,   label: "PT cá nhân",   pct: "22%" },
            { dot: iDotOrange, label: "Lớp nhóm",     pct: "12%" },
            { dot: iDotPurple, label: "Dịch vụ khác", pct: "8%"  },
          ].map(l => (
            <div key={l.label} className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <img src={l.dot} alt="" className="size-2" />
                <span className="text-[#0f172a] text-[12px]">{l.label}</span>
              </div>
              <span className="font-bold text-[#0f172a] text-[12px]">{l.pct}</span>
            </div>
          ))}
        </div>
      </div>

      {/* bottom row */}
    </div>
  )
}

function ReportsTabRevenueSub() {
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
function SimpleLineChart() {
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

function ReportsTabMembers() {
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Xu hướng tăng trưởng hội viên</p>
          <div className="flex gap-4">
            {[{c:"#2563eb",l:"Hội viên mới"},{c:"#ef4444",l:"Hội viên hủy"}].map(i=>(
              <div key={i.l} className="flex gap-1.5 items-center">
                <div className="rounded-full size-2" style={{background:i.c}}/>
                <span className="text-[#64748b] text-[12px]">{i.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 text-[11px] text-[#94a3b8] justify-between px-0">
            {["120","90","60","30","0"].map(v=><span key={v}>{v}</span>)}
          </div>
          <SimpleLineChart />
          <div className="flex items-center justify-between px-0">
            {reportMonths.map(m => <span key={m} className="text-[#94a3b8] text-[11px]">{m}</span>)}
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[350px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ theo loại gói</p>
        <div className="flex h-32 items-center justify-center">
          <div className="relative size-[130px]">
            <svg viewBox="0 0 130 130" className="size-full">
              <circle cx="65" cy="65" r="50" fill="none" stroke="#e2e8f0" strokeWidth="16"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray="131.9 202.6" strokeDashoffset="0" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#14b8a6" strokeWidth="16" strokeDasharray="88.1 246.4" strokeDashoffset="-131.9" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="47.1 287.4" strokeDashoffset="-220" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#f59e0b" strokeWidth="16" strokeDasharray="31.4 303.1" strokeDashoffset="-267.1" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="50" fill="none" stroke="#94a3b8" strokeWidth="16" strokeDasharray="15.7 318.8" strokeDashoffset="-298.5" transform="rotate(-90 65 65)"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[#64748b] text-[10px]">Hội viên</span>
              <span className="font-extrabold text-[#0f172a] text-[13px]">Q3 2026</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {[
            {dot:"#2563eb",label:"Premium",  pct:"42%"},
            {dot:"#14b8a6",label:"Fitness Plus",pct:"28%"},
            {dot:"#f97316",label:"Swim Focus",pct:"15%"},
            {dot:"#f59e0b",label:"Yoga",     pct:"10%"},
            {dot:"#94a3b8",label:"Khác",     pct:"5%"},
          ].map(l=>(
            <div key={l.label} className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="rounded-full size-2 shrink-0" style={{background:l.dot}}/>
                <span className="text-[#0f172a] text-[12px]">{l.label}</span>
              </div>
              <span className="font-bold text-[#0f172a] text-[12px]">{l.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportsTabClasses() {
  const classTypes = ["Yoga","HIIT","Pilates","Zumba","Boxing","Swimming"]
  const fills = [90,95,82,88,78,85]
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ lấp đầy theo loại lớp</p>
          <div className="flex gap-4">
            {[{c:"#94a3b8",l:"Sức chứa"},{c:"#14b8a6",l:"Đăng ký thực tế (>85%)"},{c:"#f97316",l:"Đăng ký thực tế (70-85%)"}].map(i=>(
              <div key={i.l} className="flex gap-1.5 items-center">
                <div className="rounded-full size-2 shrink-0" style={{background:i.c}}/>
                <span className="text-[#64748b] text-[10px]">{i.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 items-end justify-around h-36 px-4">
          {classTypes.map((t,i)=>(
            <div key={t} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex gap-1 items-end w-full" style={{height:120}}>
                <div className="bg-[#e2e8f0] rounded-t-sm flex-1" style={{height:"100%"}}/>
                <div className={`rounded-t-sm flex-1 ${fills[i]>=85?"bg-[#14b8a6]":"bg-[#f97316]"}`} style={{height:`${fills[i]}%`}}/>
              </div>
              <span className="text-[#64748b] text-[11px]">{t}</span>
              <span className="text-[#64748b] text-[10px]">{fills[i]}% fill</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl shrink-0 w-[300px]">
        <p className="font-extrabold text-[#0f172a] text-base">Lớp học phổ biến nhất</p>
        {[
          {rank:"1.",name:"Yoga Flow Morning",coach:"Coach Tuyết",pct:95,color:"#14b8a6"},
          {rank:"2.",name:"HIIT Extreme",      coach:"Coach Khoa", pct:93,color:"#14b8a6"},
          {rank:"3.",name:"Pilates Core",      coach:"Coach Linh", pct:88,color:"#14b8a6"},
          {rank:"4.",name:"Aqua Fitness",      coach:"Coach Hải",  pct:85,color:"#f97316"},
          {rank:"5.",name:"Boxing Cardio",     coach:"Coach Nam",  pct:82,color:"#f97316"},
        ].map(c=>(
          <div key={c.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#0f172a] text-[13px]">{c.rank} {c.name}</p>
                <p className="text-[#64748b] text-[11px]">{c.coach}</p>
              </div>
              <span className="font-bold text-[#0f172a] text-[13px]">{c.pct}%</span>
            </div>
            <div className="bg-[#f1f5f9] h-1.5 rounded-full w-full">
              <div className="h-1.5 rounded-full" style={{width:`${c.pct}%`,background:c.color}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportsTabHR() {
  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ nhân sự theo bộ phận</p>
        <div className="flex gap-8 items-center">
          <div className="relative size-[140px] shrink-0">
            <svg viewBox="0 0 140 140" className="size-full">
              <circle cx="70" cy="70" r="55" fill="none" stroke="#2563eb" strokeWidth="20" strokeDasharray="130.8 235" strokeDashoffset="0" transform="rotate(-90 70 70)"/>
              <circle cx="70" cy="70" r="55" fill="none" stroke="#14b8a6" strokeWidth="20" strokeDasharray="60 305.8" strokeDashoffset="-130.8" transform="rotate(-90 70 70)"/>
              <circle cx="70" cy="70" r="55" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="46 319.8" strokeDashoffset="-190.8" transform="rotate(-90 70 70)"/>
              <circle cx="70" cy="70" r="55" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="37.7 328.1" strokeDashoffset="-236.8" transform="rotate(-90 70 70)"/>
              <circle cx="70" cy="70" r="55" fill="none" stroke="#a855f7" strokeWidth="20" strokeDasharray="51.8 314" strokeDashoffset="-274.5" transform="rotate(-90 70 70)"/>
              <circle cx="70" cy="70" r="55" fill="none" stroke="#94a3b8" strokeWidth="20" strokeDasharray="29.9 335.9" strokeDashoffset="-326.3" transform="rotate(-90 70 70)"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-bold text-[#0f172a] text-xl">48</span>
              <span className="text-[#64748b] text-[10px]">Nhân viên</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {[
              {dot:"#2563eb",label:"HLV/PT",        count:"18 người (38%)"},
              {dot:"#14b8a6",label:"Lễ tân",         count:"8 người (17%)"},
              {dot:"#f97316",label:"Kỹ thuật",       count:"6 người (13%)"},
              {dot:"#f59e0b",label:"Chăm sóc KH",   count:"5 người (10%)"},
              {dot:"#a855f7",label:"Vệ sinh",        count:"7 người (15%)"},
              {dot:"#94a3b8",label:"Quản lý",        count:"4 người (8%)"},
            ].map(l=>(
              <div key={l.label} className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <div className="rounded-full size-2 shrink-0" style={{background:l.dot}}/>
                  <span className="text-[#0f172a] text-[12px]">{l.label}</span>
                </div>
                <span className="text-[#64748b] text-[12px]">{l.count}</span>
              </div>
            ))}
          </div>
        </div>
        {/* HLV ranking table */}
        <div className="flex flex-col mt-2">
          <p className="font-extrabold text-[#0f172a] text-base mb-3">Bảng xếp hạng HLV theo hiệu suất</p>
          <div className="bg-[#f1f5f9] flex gap-3 font-bold px-4 py-2.5 text-[#475569] text-[12px]">
            {["#","HLV","SỐ LỚP","HỌC VIÊN TB/LỚP","ĐÁNH GIÁ","DOANH THU PT"].map(h=>(
              <span key={h} className={h==="#"?"w-8":h==="HLV"?"flex-1":"w-[110px]"}>{h}</span>
            ))}
          </div>
          {[
            {rank:1,name:"Nguyễn Minh Tuyết",classes:"24 lớp",avg:"17.5 học viên/lớp",rating:"4.9",rev:"42.000.000 đ"},
            {rank:2,name:"Trần Đức Khoa",     classes:"20 lớp",avg:"19.2 học viên/lớp",rating:"4.7",rev:"38.000.000 đ"},
            {rank:3,name:"Lê Thu Linh",       classes:"18 lớp",avg:"15.8 học viên/lớp",rating:"4.6",rev:"28.000.000 đ"},
          ].map(r=>(
            <div key={r.rank} className="border-b border-[#e2e8f0] flex gap-3 items-center px-4 py-3">
              <span className="text-[#64748b] text-[13px] w-8">{r.rank}</span>
              <span className="font-semibold text-[#0f172a] text-sm flex-1">{r.name}</span>
              <span className="text-[#0f172a] text-sm w-[110px]">{r.classes}</span>
              <span className="text-[#0f172a] text-sm w-[110px]">{r.avg}</span>
              <span className="text-[#f59e0b] text-sm w-[110px]">★ {r.rating}</span>
              <span className="font-semibold text-[#0f172a] text-sm w-[110px]">{r.rev}</span>
            </div>
          ))}
        </div>
      </div>

      {/* attendance + leave */}
      <div className="flex flex-col gap-5 shrink-0 w-[300px]">
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ chấm công tháng này</p>
          <div className="flex flex-col items-center gap-2">
            <div className="relative size-[100px]">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12"/>
                <circle cx="50" cy="50" r="40" fill="none" stroke="#14b8a6" strokeWidth="12" strokeDasharray="242.7 14.1" strokeDashoffset="0"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold text-[#0f172a] text-lg">96.2%</span>
                <span className="text-[#64748b] text-[10px]">Chỉ số chấm công</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {[{c:"#14b8a6",l:"Đúng giờ",v:"94.1%"},{c:"#f59e0b",l:"Đi muộn",v:"3.8%"},{c:"#ef4444",l:"Vắng mặt",v:"2.1%"}].map(i=>(
              <div key={i.l} className="flex items-center justify-between">
                <div className="flex gap-2 items-center"><div className="rounded-full size-2" style={{background:i.c}}/><span className="text-[#0f172a] text-[12px]">{i.l}</span></div>
                <span className="font-semibold text-[12px]" style={{color:i.c}}>{i.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-4 p-6 rounded-xl">
          <p className="font-extrabold text-[#0f172a] text-base">Lịch nghỉ phép sắp tới</p>
          <div className="flex flex-col gap-3">
            {[
              {avatar:hrAvatar1,name:"Coach Tuyết",type:"Nghỉ phép",dates:"28/09 – 30/09",dot:"#2563eb"},
              {avatar:hrAvatar2,name:"NV Lễ tân Hoa",type:"Việc cá nhân",dates:"01/10 – 03/10",dot:"#94a3b8"},
              {avatar:hrAvatar3,name:"Coach Nam",type:"Nghỉ bù",dates:"05/10",dot:"#f59e0b"},
              {avatar:hrAvatar4,name:"KTV Minh",type:"Nghỉ ốm",dates:"07/10 – 08/10",dot:"#ef4444"},
            ].map(e=>(
              <div key={e.name} className="flex gap-3 items-center">
                <img src={e.avatar} alt="" className="rounded-full size-8 object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0f172a] text-[13px]">{e.name}</p>
                  <div className="flex gap-1 items-center">
                    <div className="rounded-full size-1.5" style={{background:e.dot}}/>
                    <span className="text-[#64748b] text-[11px]">{e.type} • {e.dates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── BUDGET PAGE ──────────────────────────────────────────────────────────────
function FinanceTopBar({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-normal text-[#94a3b8] text-[11px]">{label}</p>
    </div>
  )
}

function BudgetPage() {
  const budgetItems = [
    { name:"Nhân sự & Chế độ đãi ngộ",     budget:"1.200.000.000 đ", actual:"1.180.000.000 đ", diff:"+20.000.000 đ",  status:"Trong ngân sách", green:true  },
    { name:"Thiết bị & Bảo trì máy tập",   budget:"600.000.000 đ",   actual:"680.000.000 đ",   diff:"-80.000.000 đ",  status:"Vượt ngân sách",  green:false },
    { name:"Marketing & Quảng cáo",         budget:"400.000.000 đ",   actual:"390.000.000 đ",   diff:"+10.000.000 đ",  status:"Trong ngân sách", green:true  },
    { name:"Tiện ích (Điện, nước...)",      budget:"300.000.000 đ",   actual:"295.000.000 đ",   diff:"+5.000.000 đ",   status:"Trong ngân sách", green:true  },
  ]
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
          {label:"Tổng ngân sách Q3/2026",value:"2.800.000.000 đ",sub:"Tổng phân bổ",      icon:"🗂",bg:"#f0f9ff"},
          {label:"Đã sử dụng",            value:"1.950.000.000 đ",sub:"69.6% Đã chi",       icon:"✓", bg:"#f0fdf4"},
          {label:"Còn lại khả dụng",       value:"850.000.000 đ",  sub:"An toàn",            icon:"⏱",bg:"#fffbeb"},
          {label:"Vượt ngân sách",         value:"2 Hạng mục",     sub:"Cảnh báo cao",       icon:"⚠",bg:"#fef2f2"},
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
function ExpensesPage() {
  const expenses = [
    {id:"EXP-2026-005",date:"21/09/2026 10:15",cat:"Thiết bị & bảo trì",desc:"Sửa chữa khẩn cấp hệ thống mot...",amount:"12.500.000",requester:"Nguyễn Văn Hùng",status:"Chờ duyệt",  statusC:"yellow"},
    {id:"EXP-2026-004",date:"20/09/2026 16:40",cat:"Vật tư tiêu hao",   desc:"Mua bổ sung 100 khăn tập cotto...",amount:"4.800.000", requester:"Lê Ngọc Mai",    status:"Đã duyệt",   statusC:"green"},
    {id:"EXP-2026-003",date:"19/09/2026 09:30",cat:"Tiện ích & vận hành",desc:"Thanh toán hóa đơn tiền điện th...",amount:"42.150.000",requester:"Phùng Minh Anh", status:"Đã duyệt",   statusC:"green"},
    {id:"EXP-2026-002",date:"18/09/2026 11:15",cat:"Marketing & Ads",   desc:"Ngân sách chạy quảng cáo Face...",amount:"15.000.000",requester:"Đỗ Thùy Trang",  status:"Đã duyệt",   statusC:"green"},
    {id:"EXP-2026-001",date:"17/09/2026 14:00",cat:"Thiết bị & bảo trì",desc:"Thay thế bộ lọc cát & hóa chất di...",amount:"8.900.000", requester:"Nguyễn Văn Hùng",status:"Từ chối",    statusC:"red"},
  ]
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-[#2563eb] text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Chi phí vận hành</p>
            <p className="text-[#64748b] text-sm mt-1">Giám sát chi phí hàng ngày, phê duyệt đề xuất mua sắm và theo dõi hóa đơn nhà cung cấp</p>
          </div>
          <button className="bg-[#2563eb] flex items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Tạo phiếu chi mới</span>
          </button>
        </div>
      </div>
      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {["Tất cả phiếu chi","Chờ duyệt 5","Đã phê duyệt","Từ chối / Hoàn trả"].map((t,i)=>(
          <button key={t} className={`pb-3 text-sm ${i===0?"border-b-2 border-[#2563eb] font-bold text-[#2563eb]":"font-medium text-[#64748b]"}`}>{t}</button>
        ))}
      </div>
      {/* filters */}
      <div className="flex gap-3 items-center">
        {["Thời gian: Tháng này","Hạng mục: Tất cả","Người đề xuất"].map(f=>(
          <button key={f} className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg">
            <span className="font-medium text-[#0f172a] text-sm whitespace-nowrap">{f}</span>
            <img src={iChevron} alt="" className="size-4" />
          </button>
        ))}
        <span className="ml-auto font-medium text-[#64748b] text-sm">Tổng số: 124 phiếu chi</span>
      </div>
      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-bold px-6 py-3 text-[#475569] text-[12px]">
          <span className="w-[130px]">MÃ PHIẾU</span>
          <span className="w-[160px]">NGÀY YÊU CẦU</span>
          <span className="w-[160px]">HẠNG MỤC CHI</span>
          <span className="flex-1">MÔ TẢ CHI TIẾT</span>
          <span className="w-[130px]">SỐ TIỀN</span>
          <span className="w-[140px]">NGƯỜI ĐỀ XUẤT</span>
          <span className="w-[100px]">TRẠNG THÁI</span>
        </div>
        {expenses.map(e=>(
          <div key={e.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="w-[130px]"><p className="font-bold text-[#0f172a] text-sm">{e.id}</p></div>
            <div className="w-[160px]"><p className="text-[#0f172a] text-sm">{e.date}</p></div>
            <div className="w-[160px]"><p className="text-[#0f172a] text-sm">{e.cat}</p></div>
            <div className="flex-1 overflow-hidden"><p className="text-[#0f172a] text-sm truncate">{e.desc}</p></div>
            <div className="w-[130px]"><p className="font-semibold text-[#0f172a] text-sm">{e.amount} đ</p></div>
            <div className="w-[140px]"><p className="text-[#0f172a] text-sm">{e.requester}</p></div>
            <div className="w-[100px]">
              <span className={`font-semibold px-2 py-1 rounded-full text-[11px] ${
                e.statusC==="green"?"bg-[#dcfce7] text-[#15803d]":
                e.statusC==="yellow"?"bg-[#fef3c7] text-[#b45309]":
                "bg-[#fee2e2] text-[#b91c1c]"}`}>{e.status}</span>
            </div>
          </div>
        ))}
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-[#64748b] text-sm">Hiển thị 1 - 5 trong tổng số 124 hóa đơn chi phí</span>
          <div className="flex gap-2">
            {["Trước","1","2","Sau"].map((p,i)=>(
              <button key={i} className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${p==="1"?"bg-[#2563eb] font-semibold text-white":"bg-white border border-[#e2e8f0] text-[#0f172a]"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAYROLL PAGE ──────────────────────────────────────────────────────────────
function PayrollPage() {
  const rows = [
    {id:"NV-008",name:"Trần Minh Khoa",  role:"Huấn luyện viên cá nhân (Coach)",base:"12.000.000",allowance:"1.500.000",commission:"8.500.000",deduct:"-1.260.000",net:"20.740.000"},
    {id:"NV-012",name:"Lê Ngọc Mai",     role:"Nhân viên lễ tân",               base:"7.000.000", allowance:"500.000",  commission:"1.200.000",deduct:"-785.000",  net:"7.915.000"},
    {id:"NV-015",name:"Nguyễn Văn Hùng",role:"Kỹ thuật viên phòng máy",        base:"9.500.000", allowance:"800.000",  commission:"1.500.000",deduct:"-1.025.000",net:"10.775.000"},
    {id:"NV-001",name:"Phùng Minh Anh",  role:"Quản lý trung tâm (Manager)",    base:"25.000.000",allowance:"2.500.000",commission:"10.000.000",deduct:"-2.625.000",net:"34.875.000"},
    {id:"NV-009",name:"Trịnh Mai Phương",role:"Huấn luyện viên Yoga (Coach)",   base:"12.500.000",allowance:"1.500.000",commission:"6.200.000",deduct:"-1.320.000",net:"18.880.000"},
  ]
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
          {label:"Tổng quỹ lương đã duyệt",value:"485.000.000 đ",sub:"Thực nhận nhân viên",icon:"📋",bg:"#f0f9ff"},
          {label:"Số nhân viên áp dụng",    value:"48 Nhân sự",   sub:"Đã tính 100%",      icon:"✓", bg:"#f0fdf4"},
          {label:"Lương trung bình / người",value:"10.104.000 đ", sub:"Bình ổn",            icon:"⏱",bg:"#fffbeb"},
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
function PLReportPage() {
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
function MemberEditPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="text-[#64748b] text-sm">Cập nhật thông tin cá nhân và chỉ số của hội viên Nguyễn Lan Anh (MB-2048)</p>
      </div>
      <div className="flex gap-6">
        {/* main form */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          {/* personal info */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Thông tin cá nhân</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {label:"Họ và tên *",       value:"Nguyễn Lan Anh",     type:"text"},
                {label:"Ngày sinh *",        value:"15/08/1998",          type:"text"},
                {label:"Giới tính *",        value:"Nữ",                  type:"select"},
                {label:"Số điện thoại *",    value:"0903 456 789",        type:"text"},
                {label:"Email *",            value:"lananh@email.com",    type:"email", fullWidth:true},
                {label:"Địa chỉ",            value:"Số 15 Ngõ 102, Chúa Bộc, Đống Đa, Hà Nội",type:"text"},
                {label:"Liên hệ khẩn cấp (Tên)",value:"Nguyễn Văn A (Bố)",type:"text"},
                {label:"Liên hệ khẩn cấp (SĐT)",value:"0912 345 678",    type:"text"},
              ].map((f,i)=>(
                <label key={i} className={f.fullWidth ? "col-span-2 flex flex-col gap-1" : "flex flex-col gap-1"}>
                  <span className="font-semibold text-[#0f172a] text-sm">{f.label}</span>
                  {f.type === "select" ? (
                    <div className="relative">
                      <select className="appearance-none bg-white border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm w-full">
                        <option>{f.value}</option>
                      </select>
                      <img src={iChevron} alt="" className="absolute right-3 top-1/2 -translate-y-1/2 size-4 pointer-events-none"/>
                    </div>
                  ) : (
                    <input defaultValue={f.value} type={f.type} className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
                  )}
                </label>
              ))}
            </div>
          </div>
          {/* body metrics */}
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Chỉ số hình thể & Mục tiêu</p>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">Chiều cao (cm) *</span>
                <input defaultValue="165" className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">Cân nặng (kg) *</span>
                <input defaultValue="52" className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-[#0f172a] text-sm">BMI (Tự động tính)</span>
                <input defaultValue="19.1" readOnly className="border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5 rounded-lg text-sm text-[#94a3b8]" />
              </label>
            </div>
            <label className="flex flex-col gap-1 mt-4">
              <span className="font-semibold text-[#0f172a] text-sm">Mục tiêu tập luyện</span>
              <textarea defaultValue="Tăng cường dẻo dai & săn chắc cơ bụng" rows={3} className="border border-[#e2e8f0] px-3 py-2.5 rounded-lg text-sm resize-none" />
            </label>
          </div>
        </div>

        {/* sidebar card */}
        <div className="flex flex-col gap-5 shrink-0 w-[280px]">
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#0f172a] text-base mb-5">Ảnh đại diện hội viên</p>
            <div className="flex flex-col items-center gap-4">
              <img src={memberEditAvatar} alt="" className="rounded-full size-24 object-cover" />
              <button className="border border-[#e2e8f0] flex gap-2 items-center px-4 py-2 rounded-lg">
                <span className="text-[#0f172a] text-sm">✏ Thay đổi hình ảnh</span>
              </button>
              <p className="text-[#94a3b8] text-[11px] text-center">Hỗ trợ file PNG, JPG tối đa 5MB</p>
            </div>
          </div>
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-xl">
            <p className="font-extrabold text-[#475569] text-[11px] tracking-wider uppercase mb-3">Trạng thái hiện tại</p>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-[#dcfce7] font-semibold px-3 py-1 rounded-full text-[#15803d] text-[12px]">Đang hoạt động</span>
              <span className="bg-[#dbeafe] font-semibold px-3 py-1 rounded-full text-[#1d4ed8] text-[12px]">Hội Viên VIP</span>
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-3 justify-end">
        <button onClick={onBack} className="bg-white border border-[#e2e8f0] px-6 py-2.5 rounded-lg">
          <span className="font-semibold text-[#0f172a] text-sm">Hủy bỏ</span>
        </button>
        <button className="bg-[#2563eb] px-6 py-2.5 rounded-lg">
          <span className="font-semibold text-white text-sm">Lưu thay đổi</span>
        </button>
      </div>
    </div>
  )
}

// ─── MEMBERS PAGE (existing adapted) ─────────────────────────────────────────
const members = [
  { name:"Nguyễn Lan Anh", id:"MB-2048", avatar:mAvatar0, pkg:"Premium 12 tháng",  phone:"0903 456 789", email:"lananh@email.com",    status:"Đang hoạt động", expiry:"18/12/2026", vip:true  },
  { name:"Trần Minh Khoa",  id:"MB-2017", avatar:mAvatar1, pkg:"Fitness 6 tháng",   phone:"0918 224 560", email:"khoa.tran@email.com",  status:"Đang hoạt động", expiry:"02/10/2026"           },
  { name:"Lê Gia Hân",      id:"MB-1984", avatar:mAvatar2, pkg:"Swim 3 tháng",      phone:"0987 322 104", email:"giahan.le@email.com",  status:"Sắp hết hạn",    expiry:"25/09/2026"           },
  { name:"Phạm Đức Long",   id:"MB-1902", avatar:mAvatar3, pkg:"Premium 12 tháng",  phone:"0908 914 777", email:"long.pham@email.com",  status:"Tạm khóa",       expiry:"08/05/2027"           },
  { name:"Vũ Thu Trang",    id:"MB-1870", avatar:mAvatar4, pkg:"Yoga 6 tháng",      phone:"0932 662 198", email:"thutrang.vu@email.com",status:"Đang hoạt động", expiry:"14/01/2027"           },
]

function MembersPage({ onEditMember }: { onEditMember: () => void }) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Tất cả")
  const filtered = members.filter(m => {
    const q = query.toLowerCase()
    return (`${m.name} ${m.id} ${m.phone}`).toLowerCase().includes(q)
      && (statusFilter === "Tất cả" || m.status === statusFilter)
  })

  const statusStyle: Record<string, string> = {
    "Đang hoạt động": "bg-[#dcfce7] text-[#15803d]",
    "Sắp hết hạn":    "bg-[#fef3c7] text-[#b45309]",
    "Tạm khóa":       "bg-[#fee2e2] text-[#b91c1c]",
  }

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-[#0f172a] text-[28px]">Quản lý người dùng</p>
          <p className="text-[#64748b] text-sm mt-1">2.486 hồ sơ đang được quản lý tập trung trên toàn hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <img src={iDownload} alt="" className="size-4" />
            <span className="font-semibold text-[#0f172a] text-sm">Xuất dữ liệu Excel</span>
          </button>
          <button className="bg-[#2563eb] flex gap-2 items-center px-4 py-2.5 rounded-lg">
            <span className="font-semibold text-white text-sm">+ Thêm hội viên mới</span>
          </button>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {[["Thành viên","2.214"],["Huấn luyện viên","48"],["Nhân viên","224"]].map(([t,c],i)=>(
          <button key={t} className={`pb-3 text-sm ${i===0?"border-b-2 border-[#2563eb] font-bold text-[#2563eb]":"font-medium text-[#64748b]"}`}>{t} ({c})</button>
        ))}
      </div>

      {/* filters */}
      <div className="flex gap-3 items-center">
        <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg flex-1 max-w-[320px]">
          <img src={iSearch2} alt="" className="size-4 shrink-0" />
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm theo tên, mã hội viên, số điện thoại..." className="flex-1 text-sm outline-none" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option value="Tất cả">Trạng thái: Tất cả</option>
          <option>Đang hoạt động</option>
          <option>Sắp hết hạn</option>
          <option>Tạm khóa</option>
        </select>
        <select className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-sm">
          <option>Gói tập: Tất cả</option>
          <option>Premium 12 tháng</option>
          <option>Fitness 6 tháng</option>
        </select>
        <span className="ml-auto text-[#64748b] text-sm">Đã chọn 0 mục</span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[12px]">
          <div className="py-3 w-8"><input type="checkbox" /></div>
          <div className="py-3 flex-1">HỘI VIÊN</div>
          <div className="py-3 w-[170px]">GÓI HIỆN TẠI</div>
          <div className="py-3 w-[180px]">LIÊN HỆ</div>
          <div className="py-3 w-[140px]">TRẠNG THÁI</div>
          <div className="py-3 w-[120px]">NGÀY HẾT HẠN</div>
          <div className="py-3 w-[120px] text-right">THAO TÁC</div>
        </div>
        {filtered.map(m=>(
          <div key={m.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="w-8"><input type="checkbox" /></div>
            <div className="flex gap-2.5 items-center flex-1">
              <img src={m.avatar} alt="" className="rounded-full size-9 object-cover" />
              <div>
                <p className="font-semibold text-[#0f172a] text-sm">{m.name}</p>
                <p className="text-[#64748b] text-[12px]">{m.id}</p>
              </div>
            </div>
            <div className="w-[170px]">
              <span className="text-[#0f172a] text-sm">{m.pkg}</span>
              {m.vip && <span className="bg-[#fef3c7] font-bold ml-1.5 px-1.5 py-0.5 rounded text-[#b45309] text-[10px]">VIP</span>}
            </div>
            <div className="w-[180px]">
              <p className="text-[#0f172a] text-sm">{m.phone}</p>
              <p className="text-[#64748b] text-[12px]">{m.email}</p>
            </div>
            <div className="w-[140px]">
              <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${statusStyle[m.status]}`}>{m.status}</span>
            </div>
            <div className="w-[120px]"><p className="text-[#0f172a] text-sm">{m.expiry}</p></div>
            <div className="flex gap-2 items-center justify-end w-[120px]">
              {m.status === "Sắp hết hạn" ? (
                <button className="bg-[#2563eb] font-semibold px-3 py-1.5 rounded-md text-white text-[12px]">Gia hạn</button>
              ) : (
                <>
                  <button className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8">
                    <img src={iEye} alt="" className="size-4" />
                  </button>
                  <button onClick={onEditMember} className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8">
                    <img src={iMore} alt="" className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex h-20 items-center justify-center">
            <p className="text-[#64748b] text-sm">Không tìm thấy hội viên phù hợp.</p>
          </div>
        )}
        <div className="flex h-14 items-center justify-between px-6">
          <span className="text-[#64748b] text-sm">Hiển thị 1-{filtered.length} trong tổng số 2.214 hội viên</span>
          <div className="flex gap-2">
            {["‹ Trước","1","2","3","...","222","Sau ›"].map((p,i)=>(
              <button key={i} className={`flex items-center px-3 py-1.5 rounded-md text-[13px] ${p==="1"?"bg-[#2563eb] font-semibold text-white":"bg-white border border-[#e2e8f0] text-[#0f172a]"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <p className="font-bold text-[#0f172a] text-[28px]">Cài đặt & Nhật ký</p>
      <div className="bg-white border border-[#e2e8f0] p-8 rounded-xl flex items-center justify-center h-48">
        <p className="text-[#94a3b8]">Trang cài đặt đang được phát triển.</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("members")

  const breadcrumbs: Record<AdminPage, [string, string]> = {
    members:    ["Quản lý / Người dùng / Hội viên", "Quản lý người dùng"],
    payment:    ["Quản lý / Thanh toán & Hóa đơn",  "Thanh toán & Hóa đơn"],
    reports:    ["Quản lý / Báo cáo & Thống kê",    "Báo cáo & Thống kê"],
    budget:     ["Tài chính / Ngân sách",            "Quản lý ngân sách"],
    expenses:   ["Tài chính / Chi phí",              "Chi phí vận hành"],
    payroll:    ["Tài chính / Bảng lương",           "Bảng lương nhân viên"],
    "pl-report":["Tài chính / Lãi lỗ",              "Báo cáo lãi lỗ (P&L)"],
    settings:   ["Quản lý / Cài đặt",               "Cài đặt & Nhật ký"],
    "member-edit":["Quản lý / Người dùng / Hội viên / Chỉnh sửa", "Chỉnh sửa thông tin hội viên"],
  }

  const [bc, title] = breadcrumbs[page]

  return (
    <div className="bg-[#f8fafc] flex h-screen w-full overflow-hidden">
      <Sidebar page={page} setPage={setPage} />
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <TopBar breadcrumb={bc} title={title} />
        {page === "members"    && <MembersPage onEditMember={() => setPage("member-edit")} />}
        {page === "payment"    && <PaymentPage />}
        {page === "reports"    && <ReportsPage />}
        {page === "budget"     && <BudgetPage />}
        {page === "expenses"   && <ExpensesPage />}
        {page === "payroll"    && <PayrollPage />}
        {page === "pl-report"  && <PLReportPage />}
        {page === "settings"   && <SettingsPage />}
        {page === "member-edit"&& <MemberEditPage onBack={() => setPage("members")} />}
      </div>
    </div>
  )
}
