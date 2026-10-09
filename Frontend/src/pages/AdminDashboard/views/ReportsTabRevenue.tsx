import { iDotBlue, iDotTeal, iDotOrange, iDotPurple } from '../shared';
import { DataState } from '../components/DataState';
import { useApiResource } from '../../../hooks/useApiResource';
import { type MonthlyRevenueResponse, type RevenueByPaymentMethodResponse, type RevenueByPackageResponse } from '../../../hooks/flow3Api';
import { formatVnd } from '../../../hooks/apiClient';

const DONUT_COLORS = ['#2563eb', '#14b8a6', '#f97316', '#a855f7', '#94a3b8'];
const CIRCUMFERENCE = 2 * Math.PI * 55;

export default function ReportsTabRevenue() {
  const monthly = useApiResource<MonthlyRevenueResponse[]>("/api/reports/revenue/monthly?months=12");
  const byMethod = useApiResource<RevenueByPaymentMethodResponse[]>("/api/reports/revenue/by-payment-method");
  const byPackage = useApiResource<RevenueByPackageResponse[]>("/api/reports/revenue/by-package");

  const months = monthly.data ?? [];
  const maxRevenue = Math.max(1, ...months.map((m) => m.revenue));
  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);

  const methods = byMethod.data ?? [];
  const methodTotal = methods.reduce((sum, m) => sum + m.revenue, 0);

  let offset = 0;
  const donutSegments = methods.map((m, index) => {
    const share = methodTotal === 0 ? 0 : m.revenue / methodTotal;
    const length = share * CIRCUMFERENCE;
    const segment = { ...m, length, offset, color: DONUT_COLORS[index % DONUT_COLORS.length] };
    offset += length;
    return segment;
  });

  return (
    <div className="flex gap-5">
      {/* bar chart */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-extrabold text-[#0f172a] text-base">Biểu đồ doanh thu 12 tháng gần nhất</p>
            <p className="text-[#64748b] text-[12px] mt-1">Tổng: {formatVnd(totalRevenue)}</p>
          </div>
          <div className="flex gap-1.5 items-center">
            <img src={iDotBlue} alt="" className="size-2" />
            <span className="text-[#64748b] text-[12px]">Doanh thu gói dịch vụ</span>
          </div>
        </div>

        <DataState
          loading={monthly.loading}
          error={monthly.error}
          forbidden={monthly.forbidden}
          count={months.length}
          emptyText="Chưa có giao dịch nào được thanh toán."
          onRetry={monthly.reload}
        />

        {months.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3 h-40 items-end px-4">
              {months.map((m, i) => (
                <div key={m.month} className="flex flex-col flex-1 h-full items-start justify-end min-w-0 relative">
                  {i === months.length - 1 && (
                    <div className="absolute bg-[#0f172a] flex items-center px-2 py-1 rounded top-[-30px] left-0">
                      <span className="font-semibold text-white text-[10px] whitespace-nowrap">{formatVnd(m.revenue)}</span>
                    </div>
                  )}
                  <div
                    className="bg-[#2563eb] w-full rounded-t-md"
                    title={`${m.month}: ${formatVnd(m.revenue)} (${m.invoices} hóa đơn)`}
                    style={{ height: `${Math.round((m.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4">
              {months.map(m => (
                <span key={m.month} className="text-[#94a3b8] text-[11px] text-center">{m.month.slice(5)}/{m.month.slice(2, 4)}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* donut */}
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[380px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ nguồn doanh thu</p>

        <DataState
          loading={byMethod.loading}
          error={byMethod.error}
          forbidden={byMethod.forbidden}
          count={methods.length}
          emptyText="Chưa có doanh thu theo hình thức thanh toán."
          onRetry={byMethod.reload}
        />

        {methods.length > 0 && (
          <>
            <div className="flex h-40 items-center justify-center">
              <div className="relative size-[140px]">
                <div className="absolute inset-0">
                  <svg viewBox="0 0 140 140" className="size-full">
                    <circle cx="70" cy="70" r="55" fill="none" stroke="#e2e8f0" strokeWidth="18" />
                    {donutSegments.map(segment => (
                      <circle
                        key={segment.method}
                        cx="70"
                        cy="70"
                        r="55"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="18"
                        strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                        strokeDashoffset={-segment.offset}
                        transform="rotate(-90 70 70)"
                      />
                    ))}
                  </svg>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[#64748b] text-[11px]">Doanh thu</span>
                  <span className="font-extrabold text-[#0f172a] text-base">{formatVnd(methodTotal)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {donutSegments.map(segment => (
                <div key={segment.method} className="flex items-center justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="rounded-full size-2 shrink-0" style={{ background: segment.color }} />
                    <span className="text-[#0f172a] text-[12px]">{segment.methodName}</span>
                  </div>
                  <span className="font-bold text-[#0f172a] text-[12px]">
                    {methodTotal === 0 ? "0%" : `${Math.round((segment.revenue / methodTotal) * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* doanh thu theo gói tập */}
        <div className="border-t border-[#e2e8f0] flex flex-col gap-2 pt-4">
          <p className="font-extrabold text-[#0f172a] text-sm">Doanh thu theo gói tập</p>
          {byPackage.loading && <span className="text-[#94a3b8] text-[12px]">Đang tải...</span>}
          {!byPackage.loading && (byPackage.data ?? []).length === 0 && (
            <span className="text-[#64748b] text-[12px]">Chưa có dữ liệu gói tập.</span>
          )}
          {(byPackage.data ?? []).slice(0, 5).map(p => (
            <div key={p.packageId} className="flex items-center justify-between">
              <span className="text-[#0f172a] text-[12px] truncate">{p.packageName}</span>
              <span className="font-bold text-[#0f172a] text-[12px] whitespace-nowrap">{formatVnd(p.revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
