import { useMemo, useState } from 'react';
import { A, avatarSidebar, avatarTopbar, iDashboard, iUsers, iPackage, iCalendar, iReceipt, iBarChart, iSettings, iSearch, iBell, iSearch2, iDownload, iPlus, iWallet, iCheckCircle, iClock, iRotateCcw, iChevron, iEye, iPrinter, iMore, mAvatar0, mAvatar1, mAvatar2, mAvatar3, mAvatar4, iBell2, iDownload2, iKpiRevenue, iKpiMembers, iKpiClasses, iKpiRetain, iSeg1, iSeg2, iSeg3, iSeg4, iDotBlue, iDotTeal, iDotOrange, iDotPurple, iActivity0, iActivity1, iActivity2, iActivity3, iLineChart, iBarFill, coachAvatar1, coachAvatar2, coachAvatar3, coachAvatar4, hrAvatar1, hrAvatar2, hrAvatar3, hrAvatar4, iBudgetIcon, iExpenseIcon, iBudgetChevron, iPLRevIcon, memberEditAvatar } from '../shared';
import KpiCard from '../components/KpiCard';
import SimpleLineChart from '../components/SimpleLineChart';
import { FinanceTopBar } from '../components/FinanceTopBar';
import { DataState } from '../components/DataState';
import { useApiResource } from '../../../hooks/useApiResource';
import { paymentApi, reportApi, type InvoiceResponse } from '../../../hooks/flow3Api';
import { formatDateTime, formatVnd, apiPost } from '../../../hooks/apiClient';

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-[#dcfce7] text-[#15803d]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  failed: "bg-[#fee2e2] text-[#b91c1c]",
  refunded: "bg-[#e0e7ff] text-[#4338ca]",
  expired: "bg-[#f1f5f9] text-[#475569]",
};

const PAGE_SIZE = 8;

export function PaymentPage() {
  const invoices = useApiResource<InvoiceResponse[]>("/api/payments");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [methodFilter, setMethodFilter] = useState("Tất cả");
  const [page, setPage] = useState(0);

  const list = invoices.data ?? [];

  const methods = useMemo(
    () => ["Tất cả", ...Array.from(new Set(list.map((i) => i.paymentMethodName)))],
    [list]
  );

  const statuses = useMemo(
    () => ["Tất cả", ...Array.from(new Set(list.map((i) => i.statusName)))],
    [list]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((i) => {
      const matchesQuery =
        !q ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.memberName ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "Tất cả" || i.statusName === statusFilter;
      const matchesMethod = methodFilter === "Tất cả" || i.paymentMethodName === methodFilter;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [list, query, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  // KPI tính trực tiếp trên dữ liệu hóa đơn thật, không dùng số liệu tĩnh.
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const thisMonth = list.filter((i) => new Date(i.createdAt) >= monthStart);
  const completed = thisMonth.filter((i) => i.status === "completed");
  const pending = thisMonth.filter((i) => i.status === "pending");
  const refunded = thisMonth.filter((i) => i.status === "refunded");
  const totalThisMonth = completed.reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingAmount = pending.reduce((sum, i) => sum + i.totalAmount, 0);
  const refundedAmount = refunded.reduce((sum, i) => sum + i.totalAmount, 0);
  const successRate = thisMonth.length === 0 ? 0 : Math.round((completed.length / thisMonth.length) * 100);

  const exportUrl = reportApi.revenueExportUrl();

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
          <button
            onClick={() => window.open(exportUrl, '_blank')}
            className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-4 py-2.5 rounded-lg"
          >
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
        <KpiCard
          label="Tổng thực thu (Tháng này)"
          value={invoices.loading || invoices.error ? "-- đ" : formatVnd(totalThisMonth)}
          sub={`${completed.length} giao dịch đã thanh toán`}
          badge={invoices.error ? "--" : `${successRate}%`}
          badgeColor="green"
          icon={iWallet}
          iconBg="bg-[rgba(37,99,235,0.08)]"
        />
        <KpiCard
          label="Giao dịch thành công"
          value={invoices.error ? "-- giao dịch" : `${completed.length} giao dịch`}
          sub={`${thisMonth.length} hóa đơn trong tháng`}
          icon={iCheckCircle}
          iconBg="bg-[rgba(21,128,61,0.08)]"
        />
        <KpiCard
          label="Chờ đối soát / Xử lý"
          value={invoices.error ? "-- đ" : formatVnd(pendingAmount)}
          sub={`${pending.length} hóa đơn chưa thanh toán`}
          icon={iClock}
          iconBg="bg-[rgba(217,119,6,0.08)]"
        />
        <KpiCard
          label="Hoàn tiền (Tháng này)"
          value={invoices.error ? "-- đ" : formatVnd(refundedAmount)}
          sub={`${refunded.length} yêu cầu hoàn tiền`}
          icon={iRotateCcw}
          iconBg="bg-[rgba(220,38,38,0.08)]"
        />
      </div>

      {/* filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="bg-white border border-[#cbd5e1] flex gap-2 items-center px-3 py-2 rounded-lg w-[320px]">
            <img src={iSearch2} alt="" className="size-4 shrink-0" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="Tìm theo mã hóa đơn, tên hội viên..."
              className="text-sm flex-1 outline-none placeholder:text-[#64748b]"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(0); }}
            className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
          >
            {methods.map((m) => <option key={m} value={m}>{m === "Tất cả" ? "Phương thức: Tất cả" : m}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
          >
            {statuses.map((s) => <option key={s} value={s}>{s === "Tất cả" ? "Trạng thái: Tất cả" : s}</option>)}
          </select>
          <button
            onClick={invoices.reload}
            className="bg-white border border-[#cbd5e1] font-medium px-3 py-2 rounded-lg text-[#0f172a] text-sm"
          >
            Làm mới
          </button>
        </div>
        <span className="font-medium text-[#64748b] text-sm whitespace-nowrap">
          Tổng số: {filtered.length} hóa đơn
        </span>
      </div>

      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl">
        <div className="bg-[#f1f5f9] flex font-semibold items-center px-6 text-[#475569] text-[13px]">
          <div className="py-3 w-[160px]">MÃ HÓA ĐƠN</div>
          <div className="py-3 w-[195px]">HỘI VIÊN / KHÁCH HÀNG</div>
          <div className="py-3 w-[130px]">SỐ TIỀN THANH TOÁN</div>
          <div className="py-3 w-[150px]">PHƯƠNG THỨC</div>
          <div className="py-3 w-[140px]">TRẠNG THÁI</div>
          <div className="py-3 w-[150px]">NGÀY THANH TOÁN</div>
          <div className="py-3 flex-1 text-right">THAO TÁC</div>
        </div>

        <DataState
          loading={invoices.loading}
          error={invoices.error}
          forbidden={invoices.forbidden}
          count={pageRows.length}
          emptyText="Không tìm thấy hóa đơn phù hợp bộ lọc."
          onRetry={invoices.reload}
        />

        {pageRows.map((tx) => (
          <div key={tx.id} className="border-b border-[#f1f5f9] flex h-16 items-center px-6">
            <div className="w-[160px]">
              <p className="font-bold text-[#0f172a] text-sm">{tx.invoiceNumber}</p>
              <p className="text-[#64748b] text-[12px]">{formatDateTime(tx.createdAt)}</p>
            </div>
            <div className="flex gap-2.5 items-center w-[195px]">
              <img src={mAvatar0} alt="" className="rounded-full size-8 object-cover" />
              <div className="min-w-0">
                <p className="font-semibold text-[#0f172a] text-sm truncate">{tx.memberName ?? "Khách vãng lai"}</p>
                <p className="text-[#64748b] text-[12px] truncate">{tx.userId.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
            <div className="w-[130px]">
              <p className={`font-bold text-sm ${tx.status === "refunded" || tx.status === "failed" ? "text-[#dc2626]" : "text-[#0f172a]"}`}>
                {formatVnd(tx.totalAmount)}
              </p>
            </div>
            <div className="w-[150px]">
              <span className="bg-[#f1f5f9] font-medium px-2 py-1 rounded-md text-[#334155] text-[12px]">{tx.paymentMethodName}</span>
            </div>
            <div className="w-[140px]">
              <span className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${STATUS_STYLE[tx.status] ?? "bg-[#f1f5f9] text-[#475569]"}`}>
                {tx.statusName}
              </span>
            </div>
            <div className="w-[150px]">
              <p className="text-[#0f172a] text-[13px]">{formatDateTime(tx.paidAt)}</p>
            </div>
            <div className="flex flex-1 gap-2 items-center justify-end">
              {tx.status === "pending" && (
                <button
                  onClick={async () => {
                    try {
                      await apiPost(`/api/payments/${tx.id}/record-cash`);
                      invoices.reload();
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Không thu được tiền.");
                    }
                  }}
                  className="bg-[#2563eb] flex items-center px-3 py-1.5 rounded-md"
                >
                  <span className="font-semibold text-white text-[12px]">Duyệt thu</span>
                </button>
              )}
              <button
                onClick={() => window.open(`/api/payments/${tx.id}/export-pdf`, '_blank')}
                title="In hóa đơn PDF"
                className="bg-white border border-[#e2e8f0] flex items-center justify-center rounded-md size-8"
              >
                <img src={iPrinter} alt="" className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {/* pagination */}
        {!invoices.loading && !invoices.error && filtered.length > 0 && (
          <div className="flex h-14 items-center justify-between px-6">
            <span className="text-[#64748b] text-sm">
              Hiển thị {currentPage * PAGE_SIZE + 1} - {Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)} trong tổng số {filtered.length} giao dịch
            </span>
            <div className="flex gap-2 items-center">
              <button
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
                className="bg-white border border-[#e2e8f0] disabled:opacity-50 px-3 py-1.5 rounded-md text-[#0f172a] text-[13px]"
              >
                Trước
              </button>
              <span className="text-[#64748b] text-[13px]">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPage(currentPage + 1)}
                className="bg-white border border-[#e2e8f0] disabled:opacity-50 px-3 py-1.5 rounded-md text-[#0f172a] text-[13px]"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
