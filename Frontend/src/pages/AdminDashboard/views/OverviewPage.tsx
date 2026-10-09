import React from 'react';
import { iKpiRevenue, iKpiMembers, iKpiClasses, iActivity0, iActivity1, iActivity2 } from '../shared';
import KpiCard from '../components/KpiCard';
import { useApiResource } from '../../../hooks/useApiResource';
import { type DashboardMetricsResponse, type MonthlyRevenueResponse } from '../../../hooks/flow3Api';
import { formatVnd } from '../../../hooks/apiClient';

export function OverviewPage() {
  const activities: any[] = [];

  const dashboard = useApiResource<DashboardMetricsResponse>("/api/reports/dashboard");
  const monthly = useApiResource<MonthlyRevenueResponse[]>("/api/reports/revenue/monthly?months=12");

  const months = monthly.data ?? [];
  const maxRevenue = Math.max(1, ...months.map((m) => m.revenue));

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <p className="font-bold text-slate-900 dark:text-white text-3xl">Tổng quan hệ thống</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Cập nhật nhanh tình hình kinh doanh và vận hành hôm nay.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          label="Tổng doanh thu tháng"
          value={dashboard.error ? "-- đ" : formatVnd(dashboard.data?.monthRevenue)}
          sub={`${formatVnd(dashboard.data?.todayRevenue)} hôm nay`}
          badge={dashboard.data ? `${dashboard.data.pendingInvoiceCount} chờ thu` : "--"}
          badgeColor="green"
          icon={iKpiRevenue}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard
          label="Hội viên đang hoạt động"
          value={dashboard.data ? `${dashboard.data.totalMembers}` : "--"}
          sub={`${dashboard.data?.newMembersThisMonth ?? "--"} hội viên mới trong tháng`}
          badge={dashboard.data ? `${dashboard.data.activeSubscriptions} gói active` : "--"}
          badgeColor="green"
          icon={iKpiMembers}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          label="Lớp học sắp diễn ra"
          value={dashboard.data ? `${dashboard.data.upcomingClasses}` : "--"}
          sub={`Tỷ lệ lấp đầy trung bình ${dashboard.data?.classOccupancyRate ?? "--"}`}
          badge={dashboard.data ? `${dashboard.data.pendingAmount > 0 ? formatVnd(dashboard.data.pendingAmount) : "0 đ"} công nợ` : "--"}
          badgeColor="yellow"
          icon={iKpiClasses}
          iconBg="bg-orange-50 dark:bg-orange-500/10"
        />
      </div>

      {/* Main Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl flex flex-col hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">Biểu đồ doanh thu</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Doanh thu 12 tháng gần nhất — tổng {formatVnd(months.reduce((sum, m) => sum + m.revenue, 0))}
              </p>
            </div>
            <button
              onClick={() => { dashboard.reload(); monthly.reload(); }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium px-3 py-1.5 rounded-lg text-sm text-slate-900 dark:text-white"
            >
              Làm mới
            </button>
          </div>
          <div className="flex-1 flex items-end w-full h-[240px]">
            {monthly.loading && <span className="text-slate-400 text-sm">Đang tải dữ liệu doanh thu...</span>}
            {!monthly.loading && monthly.forbidden && (
              <span className="text-[#b45309] text-sm">Tài khoản không có quyền xem báo cáo doanh thu.</span>
            )}
            {!monthly.loading && !monthly.forbidden && monthly.error && (
              <span className="text-[#b91c1c] text-sm">{monthly.error}</span>
            )}
            {!monthly.loading && !monthly.error && months.length === 0 && (
              <span className="text-slate-400 text-sm">Chưa có giao dịch nào được thanh toán.</span>
            )}
            {months.length > 0 && (
              <div className="flex gap-2 items-end w-full h-full">
                {months.map((m) => (
                  <div key={m.month} className="flex flex-col flex-1 h-full items-stretch justify-end min-w-0">
                    <div
                      className="bg-rose-500/80 dark:bg-rose-400 rounded-t-md w-full"
                      title={`${m.month}: ${formatVnd(m.revenue)} (${m.invoices} hóa đơn)`}
                      style={{ height: `${Math.max(2, Math.round((m.revenue / maxRevenue) * 100))}%` }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          {months.length > 0 && (
            <div className="flex items-center justify-between mt-3">
              {months.map(m => (
                <span key={m.month} className="text-slate-400 text-[10px]">{m.month.slice(5)}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-2xl hover:shadow-xl transition-shadow flex flex-col">
          <p className="font-bold text-slate-900 dark:text-white text-lg mb-6">Hoạt động gần đây</p>
          <div className="flex flex-col gap-6 flex-1">
            {activities.length === 0 && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Nhật ký hoạt động chưa được ghi nhận trong hệ thống.
              </p>
            )}
            {activities.map((act) => (
              <div key={act.id} className="flex gap-4 items-start group">
                <div className={`shrink-0 flex items-center justify-center size-10 rounded-xl ${act.color} group-hover:scale-110 transition-transform`}>
                  <img src={act.icon} alt="" className="size-5 brightness-0 dark:invert opacity-70" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-slate-200 text-sm font-semibold leading-tight group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors">{act.text}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[12px] mt-1.5 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white transition-colors">
            Xem toàn bộ nhật ký
          </button>
        </div>
      </div>
    </div>
  );
}
