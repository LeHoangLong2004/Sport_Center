import { DataState } from "./DataState";
import { formatDateTime, formatVnd } from "../../../hooks/apiClient";
import { iPrinter, iEye } from "../shared";
import { UserAvatar } from "../../../components/UserAvatar";
import type { InvoiceResponse } from "../../../hooks/flow3Api";

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-[#dcfce7] text-[#15803d]",
  pending: "bg-[#fef3c7] text-[#b45309]",
  failed: "bg-[#fee2e2] text-[#b91c1c]",
  refunded: "bg-[#e0e7ff] text-[#4338ca]",
  expired: "bg-[#f1f5f9] text-[#475569]",
};

const PAGE_SIZE = 8;

interface InvoiceTableProps {
  loading: boolean;
  error: string | null;
  forbidden: boolean;
  pageRows: InvoiceResponse[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  onRecordCash: (id: string) => void;
  onPrintPdf: (id: string) => void;
  onViewDetail: (invoice: InvoiceResponse) => void;
}

export function InvoiceTable({
  loading,
  error,
  forbidden,
  pageRows,
  filteredCount,
  currentPage,
  totalPages,
  onRetry,
  onPageChange,
  onRecordCash,
  onPrintPdf,
  onViewDetail,
}: InvoiceTableProps) {
  return (
    <>
      {/* table */}
      <div className="bg-white border border-[#e2e8f0] overflow-hidden rounded-xl shadow-sm">
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
          loading={loading}
          error={error}
          forbidden={forbidden}
          count={pageRows.length}
          emptyText="Không tìm thấy hóa đơn phù hợp bộ lọc."
          onRetry={onRetry}
        />

        {pageRows.map((tx) => (
          <div
            key={tx.id}
            className="border-b border-[#f1f5f9] flex h-16 items-center px-6 hover:bg-slate-50/60 transition-colors"
          >
            <div className="w-[160px] cursor-pointer" onClick={() => onViewDetail(tx)}>
              <p className="font-bold text-[#0f172a] text-sm hover:text-blue-600 transition-colors">
                {tx.invoiceNumber}
              </p>
              <p className="text-[#64748b] text-[12px]">
                {formatDateTime(tx.createdAt)}
              </p>
            </div>
            <div
              className="flex gap-2.5 items-center w-[195px] cursor-pointer"
              onClick={() => onViewDetail(tx)}
            >
              <UserAvatar
                src={null}
                name={tx.memberName ?? "Khách vãng lai"}
                className="rounded-full size-8 object-cover text-xs"
              />
              <div className="min-w-0">
                <p className="font-semibold text-[#0f172a] text-sm truncate hover:text-blue-600 transition-colors">
                  {tx.memberName ?? "Khách vãng lai"}
                </p>
                <p className="text-[#64748b] text-[12px] truncate">
                  {tx.userId.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
            <div className="w-[130px]">
              <p
                className={`font-bold text-sm ${
                  tx.status === "refunded" || tx.status === "failed"
                    ? "text-[#dc2626]"
                    : "text-[#0f172a]"
                }`}
              >
                {formatVnd(tx.totalAmount)}
              </p>
            </div>
            <div className="w-[150px]">
              <span className="bg-[#f1f5f9] font-medium px-2 py-1 rounded-md text-[#334155] text-[12px]">
                {tx.paymentMethodName}
              </span>
            </div>
            <div className="w-[140px]">
              <span
                className={`font-semibold px-2.5 py-1 rounded-full text-[12px] ${
                  STATUS_STYLE[tx.status] ?? "bg-[#f1f5f9] text-[#475569]"
                }`}
              >
                {tx.statusName}
              </span>
            </div>
            <div className="w-[150px]">
              <p className="text-[#0f172a] text-[13px]">
                {formatDateTime(tx.paidAt)}
              </p>
            </div>
            <div className="flex flex-1 gap-2 items-center justify-end">
              {tx.status === "pending" && (
                <button
                  onClick={() => onRecordCash(tx.id)}
                  title="Xác nhận thu tiền mặt"
                  className="bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center px-2.5 py-1.5 rounded-md shadow-sm"
                >
                  <span className="font-semibold text-white text-[12px]">
                    Duyệt thu
                  </span>
                </button>
              )}
              <button
                onClick={() => onViewDetail(tx)}
                title="Xem chi tiết hóa đơn"
                className="bg-white border border-[#e2e8f0] hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center rounded-md size-8 text-slate-600 transition-colors"
              >
                <img src={iEye} alt="Xem" className="size-4" />
              </button>
              <button
                onClick={() => onPrintPdf(tx.id)}
                title="In hóa đơn PDF"
                className="bg-white border border-[#e2e8f0] hover:bg-slate-50 flex items-center justify-center rounded-md size-8 transition-colors"
              >
                <img src={iPrinter} alt="In" className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {/* pagination */}
        {!loading && !error && filteredCount > 0 && (
          <div className="flex h-14 items-center justify-between px-6 bg-slate-50/50">
            <span className="text-[#64748b] text-sm">
              Hiển thị {currentPage * PAGE_SIZE + 1} -{" "}
              {Math.min((currentPage + 1) * PAGE_SIZE, filteredCount)} trong
              tổng số {filteredCount} giao dịch
            </span>
            <div className="flex gap-2 items-center">
              <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="bg-white border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 rounded-md text-[#0f172a] text-[13px] transition-colors"
              >
                Trước
              </button>
              <span className="text-[#64748b] text-[13px]">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
                className="bg-white border border-[#e2e8f0] hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 rounded-md text-[#0f172a] text-[13px] transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
