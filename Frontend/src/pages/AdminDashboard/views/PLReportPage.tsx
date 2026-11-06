import React, { useState } from 'react';
import { toast } from 'sonner';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function PLReportPage() {
  const [quarter, setQuarter] = useState("Quý 3/2026");
  const [comparing, setComparing] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-rose-600 text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Báo cáo lãi lỗ (P&L)</p>
            <p className="text-[#64748b] text-sm mt-1">Tổng hợp đầy đủ dòng doanh thu, cơ cấu chi phí vận hành và lợi nhuận ròng toàn trung tâm</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const next = quarter === "Quý 3/2026" ? "Quý 4/2026" : "Quý 3/2026";
                setQuarter(next);
                toast.info(`Đã đổi kỳ báo cáo sang: ${next}`);
              }}
              className="bg-white hover:bg-slate-50 border border-[#e2e8f0] flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
            >
              <span className="font-medium text-[#0f172a] text-sm">{quarter} ▾</span>
            </button>
            <button
              onClick={() => {
                setComparing(!comparing);
                toast.info(comparing ? "Đã tắt chế độ so sánh" : "Đã kích hoạt chế độ so sánh với Quý trước");
              }}
              className={`border border-[#e2e8f0] flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${comparing ? "bg-rose-50 text-rose-700 font-semibold" : "bg-white hover:bg-slate-50 text-[#0f172a]"}`}
            >
              <span className="font-medium text-sm">So sánh với Q2/2026</span>
            </button>
            <button
              onClick={() => toast.success("Đang tổng hợp báo cáo P&L và chuẩn bị tải xuống file PDF...")}
              className="bg-rose-600 hover:bg-rose-700 active:scale-95 flex items-center px-4 py-2.5 rounded-lg cursor-pointer transition-all shadow-sm shadow-rose-600/20"
            >
              <span className="font-semibold text-white text-sm">Xuất File PDF</span>
            </button>
          </div>
        </div>
      </div>
      {/* KPIs */}
      <div className="flex gap-5">
        {[
          {label: `Tổng doanh thu (${quarter})`, value: "-- đ", badge: "+--% vs Q2", green: true},
          {label: `Tổng chi phí (${quarter})`, value: "-- đ", badge: "--% an toàn", green: true},
          {label: "Lợi nhuận gộp", value: "-- đ", badge: "--% biên lợi nhuận", green: true},
          {label: "Lợi nhuận ròng (EBITDA)", value: "-- đ", badge: "--% kế hoạch", green: true},
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
            <p className="font-extrabold text-rose-600 text-sm tracking-wider uppercase">Cơ cấu doanh thu (Revenue)</p>
          </div>
          <div className="bg-[#f1f5f9] flex font-bold gap-4 px-6 py-3 text-[#475569] text-[12px]">
            <span className="flex-1">PHÂN LOẠI</span>
            <span className="w-[140px]">{quarter}</span>
            <span className="w-[140px]">Q2/2026</span>
            <span className="w-[90px]">% TĂNG</span>
          </div>
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="font-semibold text-slate-700 text-sm">Chưa có số liệu phân loại doanh thu</p>
            <p className="text-slate-400 text-xs mt-1">Dữ liệu thanh toán của hội viên sẽ được tổng hợp tự động vào cuối quý.</p>
          </div>
        </div>
        {/* Expenses */}
        <div className="bg-white border border-[#e2e8f0] flex flex-1 flex-col min-w-0 rounded-xl">
          <div className="border-b border-[#e2e8f0] px-6 py-4">
            <p className="font-extrabold text-[#dc2626] text-sm tracking-wider uppercase">Cơ cấu chi phí (Expenses)</p>
          </div>
          <div className="bg-[#f1f5f9] flex font-bold gap-4 px-6 py-3 text-[#475569] text-[12px]">
            <span className="flex-1">PHÂN LOẠI</span>
            <span className="w-[140px]">{quarter}</span>
            <span className="w-[140px]">Q2/2026</span>
            <span className="w-[90px]">% TĂNG</span>
          </div>
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="font-semibold text-slate-700 text-sm">Chưa có số liệu phân loại chi phí</p>
            <p className="text-slate-400 text-xs mt-1">Các khoản chi vận hành và vật tư sẽ được tổng hợp khi phê duyệt hoàn tất.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MEMBER EDIT PAGE ─────────────────────────────────────────────────────────