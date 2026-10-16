import { useMemo, useState } from "react";
import { InvoiceTable } from "../components/InvoiceTable";
import { PaymentHeader } from "../components/PaymentHeader";
import { PaymentSummary } from "../components/PaymentSummary";
import { PaymentFilters } from "../components/PaymentFilters";
import { InvoiceDetailModal } from "../components/InvoiceDetailModal";
import { CreatePaymentModal } from "../components/CreatePaymentModal";
import { useApiResource } from "../../../hooks/useApiResource";
import {
  paymentApi,
  reportApi,
  type InvoiceResponse,
} from "../../../hooks/flow3Api";
import { apiDownloadFile, formatVnd, apiPost, formatDateTime } from "../../../hooks/apiClient";

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
  const [isExporting, setIsExporting] = useState(false);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await apiDownloadFile(exportUrl, "bao-cao-doanh-thu.xlsx");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xuất báo cáo.");
    } finally {
      setIsExporting(false);
    }
  };

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

  const handleExportCsv = () => {
    if (filtered.length === 0) {
      alert("Không có dữ liệu giao dịch để xuất!");
      return;
    }

    const headers = [
      "Mã hóa đơn",
      "Khách hàng / Hội viên",
      "Mã hội viên",
      "Số tiền (VNĐ)",
      "Phương thức thanh toán",
      "Trạng thái",
      "Ngày tạo",
      "Ngày thanh toán",
    ];

    const rows = filtered.map((i) => [
      i.invoiceNumber,
      i.memberName ?? "Khách vãng lai",
      i.userId.substring(0, 8).toUpperCase(),
      i.totalAmount,
      i.paymentMethodName,
      i.statusName,
      formatDateTime(i.createdAt),
      i.paidAt ? formatDateTime(i.paidAt) : "",
    ]);

    const csvContent =
      "\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `danh_sach_hoa_don_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-8 flex-1 min-h-0 overflow-y-auto relative">
      <PaymentHeader
        onExport={handleExport}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
        onOpenCreate={() => setShowCreateModal(true)}
      />

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
        onViewDetail={(invoice) => setSelectedInvoice(invoice)}
      />

      {/* Modal chi tiết hóa đơn */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onRecordCash={handleRecordCash}
        onPrintPdf={handlePrintPdf}
      />

      {/* Modal tạo giao dịch thu tiền tại quầy */}
      {showCreateModal && (
        <CreatePaymentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => invoices.reload()}
        />
      )}
    </div>
  );
}
