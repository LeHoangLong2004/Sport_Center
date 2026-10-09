import SimpleLineChart from '../components/SimpleLineChart';
import { DataState } from '../components/DataState';
import { useApiResource } from '../../../hooks/useApiResource';
import { type ExpiringMemberResponse, type MemberRetentionResponse, type RevenueByPackageResponse } from '../../../hooks/flow3Api';
import { formatDate } from '../../../hooks/apiClient';

const DONUT_COLORS = ['#2563eb', '#14b8a6', '#f97316', '#f59e0b', '#94a3b8'];
const CIRCUMFERENCE = 2 * Math.PI * 50;

export default function ReportsTabMembers() {
  const retention = useApiResource<MemberRetentionResponse>("/api/reports/members/retention");
  const expiring = useApiResource<ExpiringMemberResponse[]>("/api/reports/members/expiring");
  const byPackage = useApiResource<RevenueByPackageResponse[]>("/api/reports/revenue/by-package");

  const packages = (byPackage.data ?? []).slice(0, 5);
  const packageTotal = packages.reduce((sum, p) => sum + p.subscriptions, 0);

  let offset = 0;
  const donutSegments = packages.map((p, index) => {
    const share = packageTotal === 0 ? 0 : p.subscriptions / packageTotal;
    const length = share * CIRCUMFERENCE;
    const segment = { ...p, length, offset, color: DONUT_COLORS[index % DONUT_COLORS.length] };
    offset += length;
    return segment;
  });

  return (
    <div className="flex gap-5">
      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-1 flex-col gap-5 min-w-0 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <p className="font-extrabold text-[#0f172a] text-base">Tỷ lệ gia hạn hội viên (90 ngày gần nhất)</p>
        </div>

        <DataState
          loading={retention.loading}
          error={retention.error}
          forbidden={retention.forbidden}
          count={retention.data ? 1 : 0}
          onRetry={retention.reload}
        />

        {retention.data && (
          <div className="flex gap-6">
            <div className="bg-[#f8fafc] flex flex-col gap-1 p-5 rounded-xl">
              <span className="text-[#64748b] text-[12px]">Tỷ lệ giữ chân</span>
              <span className="font-extrabold text-[#0f172a] text-[32px]">{retention.data.retentionRate}</span>
              <span className="text-[#64748b] text-[12px]">
                {retention.data.periodStart} → {retention.data.periodEnd}
              </span>
            </div>
            <div className="bg-[#f8fafc] flex flex-col gap-1 p-5 rounded-xl">
              <span className="text-[#64748b] text-[12px]">Hội viên hết hạn</span>
              <span className="font-extrabold text-[#0f172a] text-[32px]">{retention.data.expiringMembers}</span>
              <span className="text-[#64748b] text-[12px]">trong kỳ báo cáo</span>
            </div>
            <div className="bg-[#f8fafc] flex flex-col gap-1 p-5 rounded-xl">
              <span className="text-[#64748b] text-[12px]">Đã gia hạn</span>
              <span className="font-extrabold text-[#15803d] text-[32px]">{retention.data.renewedMembers}</span>
              <span className="text-[#64748b] text-[12px]">mua kỳ tiếp theo</span>
            </div>
          </div>
        )}

        <div className="flex flex-col">
          <p className="font-extrabold text-[#0f172a] text-base mb-3">Hội viên sắp hết hạn (7 ngày tới)</p>
          <div className="bg-[#f1f5f9] flex font-bold px-4 py-2.5 text-[#475569] text-[12px]">
            <span className="flex-1">HỘI VIÊN</span>
            <span className="w-[150px]">GÓI TẬP</span>
            <span className="w-[120px]">HẾT HẠN</span>
            <span className="w-[90px]">CÒN LẠI</span>
          </div>
          <DataState
            loading={expiring.loading}
            error={expiring.error}
            forbidden={expiring.forbidden}
            count={(expiring.data ?? []).length}
            emptyText="Không có hội viên nào sắp hết hạn."
            onRetry={expiring.reload}
          />
          {(expiring.data ?? []).map(m => (
            <div key={m.subscriptionId} className="border-b border-[#e2e8f0] flex items-center px-4 py-3">
              <span className="font-semibold text-[#0f172a] text-sm flex-1 truncate">{m.memberName ?? "Chưa xác định"}</span>
              <span className="text-[#0f172a] text-sm w-[150px] truncate">{m.packageName ?? "--"}</span>
              <span className="text-[#64748b] text-[13px] w-[120px]">{formatDate(m.expireDate)}</span>
              <span className="text-[#b45309] text-[13px] w-[90px]">{m.daysLeft} ngày</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] drop-shadow-[0_8px_12px_rgba(24,33,58,0.06)] flex flex-col gap-5 p-6 rounded-xl shrink-0 w-[350px]">
        <p className="font-extrabold text-[#0f172a] text-base">Phân bổ theo loại gói</p>

        <DataState
          loading={byPackage.loading}
          error={byPackage.error}
          forbidden={byPackage.forbidden}
          count={packages.length}
          emptyText="Chưa có gói tập nào được bán."
          onRetry={byPackage.reload}
        />

        {packages.length > 0 && (
          <>
            <div className="flex h-32 items-center justify-center">
              <div className="relative size-[130px]">
                <svg viewBox="0 0 130 130" className="size-full">
                  <circle cx="65" cy="65" r="50" fill="none" stroke="#e2e8f0" strokeWidth="16" />
                  {donutSegments.map(segment => (
                    <circle
                      key={segment.packageId}
                      cx="65"
                      cy="65"
                      r="50"
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="16"
                      strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                      strokeDashoffset={-segment.offset}
                      transform="rotate(-90 65 65)"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[#64748b] text-[10px]">Lượt mua</span>
                  <span className="font-extrabold text-[#0f172a] text-[13px]">{packageTotal}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {donutSegments.map(segment => (
                <div key={segment.packageId} className="flex items-center justify-between">
                  <div className="flex gap-2 items-center min-w-0">
                    <div className="rounded-full size-2 shrink-0" style={{ background: segment.color }} />
                    <span className="text-[#0f172a] text-[12px] truncate">{segment.packageName}</span>
                  </div>
                  <span className="font-bold text-[#0f172a] text-[12px]">
                    {packageTotal === 0 ? "0%" : `${Math.round((segment.subscriptions / packageTotal) * 100)}%`}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="border-t border-[#e2e8f0] flex flex-col gap-3 pt-4">
          <p className="font-extrabold text-[#0f172a] text-sm">Xu hướng tăng trưởng</p>
          <SimpleLineChart />
        </div>
      </div>
    </div>
  )
}
