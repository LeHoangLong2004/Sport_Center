import React from 'react';
import { useApiResource } from '../../../hooks/useApiResource';
import { type RevenueByPackageResponse, type InvoiceResponse } from '../../../hooks/flow3Api';
import { formatVnd } from '../../../hooks/apiClient';
import { iActivity0, iActivity1 } from '../shared';

export function ReportsTabRevenueSub() {
  const byPackage = useApiResource<RevenueByPackageResponse[]>("/api/reports/revenue/by-package");
  const payments = useApiResource<InvoiceResponse[]>("/api/payments");

  const packages = (byPackage.data ?? []).slice(0, 5);
  const recentActivities = (payments.data ?? []).slice(0, 5);

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
          </div>
          {packages.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">Chưa có dữ liệu gói dịch vụ.</div>
          ) : (
            packages.map((pkg, index) => (
              <div key={pkg.packageId} className="border-b border-[#e2e8f0] flex gap-3 items-center px-6 py-3.5">
                <span className="font-semibold text-[#64748b] text-[13px] w-10">{index + 1}</span>
                <span className="font-semibold text-[#0f172a] text-sm flex-1">{pkg.packageName}</span>
                <span className="text-[#0f172a] text-sm text-right w-28">{pkg.subscriptions} gói</span>
                <span className="font-semibold text-[#0f172a] text-sm text-right w-40">{formatVnd(pkg.revenue)}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* activity */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[380px]">
        <p className="font-extrabold text-[#0f172a] text-base">Hoạt động gần đây</p>
        <div className="flex flex-col gap-4">
          {recentActivities.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có hoạt động giao dịch gần đây.</p>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-[#0f172a] text-[13px]">{act.memberName || "Hội viên"} thanh toán {formatVnd(act.totalAmount)}</p>
                  <p className="text-[#64748b] text-[11px]">{new Date(act.paidAt || act.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Line chart approximation using SVG