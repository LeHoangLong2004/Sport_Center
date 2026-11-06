import React, { useState } from 'react';
import { toast } from 'sonner';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState("Tất cả phiếu chi");
  const [pageNumber, setPageNumber] = useState(1);
  const expenses: any[] = [];

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <div>
        <p className="font-extrabold text-rose-600 text-[11px] tracking-wider uppercase">MÔ ĐUN TÀI CHÍNH TRUNG TÂM</p>
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-extrabold text-[#0f172a] text-[28px]">Chi phí vận hành</p>
            <p className="text-[#64748b] text-sm mt-1">Giám sát chi phí hàng ngày, phê duyệt đề xuất mua sắm và theo dõi hóa đơn nhà cung cấp</p>
          </div>
          <button
            onClick={() => toast.info("Tính năng tạo phiếu chi mới đang được đồng bộ với bộ phận Kế toán.")}
            className="bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all cursor-pointer flex items-center px-4 py-2.5 rounded-lg shadow-sm shadow-rose-600/20"
          >
            <span className="font-semibold text-white text-sm">+ Tạo phiếu chi mới</span>
          </button>
        </div>
      </div>
      {/* tabs */}
      <div className="border-b border-[#e2e8f0] flex gap-6">
        {["Tất cả phiếu chi","Chờ duyệt 5","Đã phê duyệt","Từ chối / Hoàn trả"].map((t)=>(
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm cursor-pointer transition-colors ${activeTab===t?"border-b-2 border-rose-600 font-bold text-rose-600":"font-medium text-[#64748b] hover:text-[#0f172a]"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {/* filters */}
      <div className="flex gap-3 items-center">
        {["Thời gian: Tháng này","Hạng mục: Tất cả","Người đề xuất"].map(f=>(
          <button
            key={f}
            onClick={() => toast.info(`Bộ lọc: ${f}`)}
            className="bg-white hover:bg-slate-50 border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg cursor-pointer transition-colors"
          >
            <span className="font-medium text-[#0f172a] text-sm whitespace-nowrap">{f}</span>
            <img src={iChevron} alt="" className="size-4" />
          </button>
        ))}
        <span className="ml-auto font-medium text-[#64748b] text-sm">Tổng số: {expenses.length} phiếu chi</span>
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
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 text-xl">
              🧾
            </div>
            <p className="font-semibold text-slate-800 text-base">Chưa có phiếu chi nào</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">Chưa có phiếu đề xuất chi phí trong danh mục "{activeTab}".</p>
          </div>
        ) : (
          expenses.map(e=>(
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
          ))
        )}
        <div className="flex h-14 items-center justify-between px-6 border-t border-[#f1f5f9]">
          <span className="text-[#64748b] text-sm">Hiển thị {expenses.length} trong tổng số {expenses.length} hóa đơn chi phí</span>
          <div className="flex gap-2">
            {["Trước","1","Sau"].map((p,i)=>(
              <button
                key={i}
                onClick={() => {
                  if (p === "1") setPageNumber(1);
                  else toast.info(`Chuyển trang: ${p}`);
                }}
                className={`flex items-center px-3 py-1.5 rounded-md text-[13px] cursor-pointer transition-colors ${p===String(pageNumber)?"bg-rose-600 font-semibold text-white shadow-xs shadow-rose-600/20":"bg-white border border-[#e2e8f0] text-[#0f172a] hover:bg-slate-50"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAYROLL PAGE ──────────────────────────────────────────────────────────────