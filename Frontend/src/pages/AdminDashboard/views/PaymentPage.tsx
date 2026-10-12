import { useMemo, useState } from "react";
import {
  A,
  avatarSidebar,
  avatarTopbar,
  iDashboard,
  iUsers,
  iPackage,
  iCalendar,
  iReceipt,
  iBarChart,
  iSettings,
  iSearch,
  iBell,
  iSearch2,
  iDownload,
  iPlus,
  iWallet,
  iCheckCircle,
  iClock,
  iRotateCcw,
  iChevron,
  iEye,
  iPrinter,
  iMore,
  mAvatar0,
  mAvatar1,
  mAvatar2,
  mAvatar3,
  mAvatar4,
  iBell2,
  iDownload2,
  iKpiRevenue,
  iKpiMembers,
  iKpiClasses,
  iKpiRetain,
  iSeg1,
  iSeg2,
  iSeg3,
  iSeg4,
  iDotBlue,
  iDotTeal,
  iDotOrange,
  iDotPurple,
  iActivity0,
  iActivity1,
  iActivity2,
  iActivity3,
  iLineChart,
  iBarFill,
  coachAvatar1,
  coachAvatar2,
  coachAvatar3,
  coachAvatar4,
  hrAvatar1,
  hrAvatar2,
  hrAvatar3,
  hrAvatar4,
  iBudgetIcon,
  iExpenseIcon,
  iBudgetChevron,
  iPLRevIcon,
  memberEditAvatar,
} from "../shared";
import { InvoiceTable } from "../components/InvoiceTable";
import { PaymentHeader } from "../components/PaymentHeader";
import { PaymentSummary } from "../components/PaymentSummary";
import { PaymentFilters } from "../components/PaymentFilters";
import KpiCard from "../components/KpiCard";
import SimpleLineChart from "../components/SimpleLineChart";
import { FinanceTopBar } from "../components/FinanceTopBar";
import { DataState } from "../components/DataState";
import { useApiResource } from "../../../hooks/useApiResource";
import {
  paymentApi,
  reportApi,
  type InvoiceResponse,
} from "../../../hooks/flow3Api";
import { formatVnd, apiPost } from "../../../hooks/apiClient";

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
    () => [
      "Tất cả",
      ...Array.from(new Set(list.map((i) => i.paymentMethodName))),
    ],
    [list],
  );

  const statuses = useMemo(
    () => ["Tất cả", ...Array.from(new Set(list.map((i) => i.statusName)))],
    [list],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((i) => {
      const matchesQuery =
        !q ||
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.memberName ?? "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "Tất cả" || i.statusName === statusFilter;
      const matchesMethod =
        methodFilter === "Tất cả" || i.paymentMethodName === methodFilter;
      return matchesQuery && matchesStatus && matchesMethod;
    });
  }, [list, query, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRows = filtered.slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE,
  );

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
  const successRate =
    thisMonth.length === 0
      ? 0
      : Math.round((completed.length / thisMonth.length) * 100);

  const exportUrl = reportApi.revenueExportUrl();

  const handleRecordCash = async (id: string) => {
    try {
      await apiPost(`/api/payments/${id}/record-cash`);
      invoices.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thu được tiền.");
    }
  };

  const handlePrintPdf = async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/payments/${id}/export-pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      alert("Không thể tải hóa đơn PDF.");
      return;
    }
    const url = URL.createObjectURL(await res.blob());
    window.open(url, "_blank");
  };

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto">
      <PaymentHeader exportUrl={exportUrl} />
      <PaymentSummary
        loading={invoices.loading}
        error={invoices.error}
        totalThisMonth={totalThisMonth}
        completedCount={completed.length}
        monthCount={thisMonth.length}
        pendingAmount={pendingAmount}
        pendingCount={pending.length}
        refundedAmount={refundedAmount}
        refundedCount={refunded.length}
        successRate={successRate}
      />
      <PaymentFilters
        query={query}
        methods={methods}
        statuses={statuses}
        methodFilter={methodFilter}
        statusFilter={statusFilter}
        count={filtered.length}
        onQueryChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        onMethodChange={(value) => {
          setMethodFilter(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
        onReload={invoices.reload}
      />

      <InvoiceTable
        loading={invoices.loading}
        error={invoices.error}
        forbidden={invoices.forbidden}
        pageRows={pageRows}
        filteredCount={filtered.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onRetry={invoices.reload}
        onPageChange={setPage}
        onRecordCash={handleRecordCash}
        onPrintPdf={handlePrintPdf}
      />
    </div>
  );
}
