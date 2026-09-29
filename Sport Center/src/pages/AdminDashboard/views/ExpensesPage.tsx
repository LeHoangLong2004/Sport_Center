import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function ExpensesPage() {
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