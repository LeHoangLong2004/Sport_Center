import React, { useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar, transactions, reportBarData, reportMonths, members } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';

export function PaymentPage() {
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
