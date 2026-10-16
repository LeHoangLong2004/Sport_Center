import React from "react";
import { formatDateTime, formatVnd } from "../../../hooks/apiClient";
import { UserAvatar } from "../../../components/UserAvatar";
import { iPrinter } from "../shared";
import type { InvoiceResponse } from "../../../hooks/flow3Api";

const STATUS_STYLE: Record<string, { badge: string; text: string }> = {
  completed: { badge: "bg-[#dcfce7] text-[#15803d]", text: "Đã thanh toán thành công" },
  pending: { badge: "bg-[#fef3c7] text-[#b45309]", text: "Đang chờ thanh toán" },
  failed: { badge: "bg-[#fee2e2] text-[#b91c1c]", text: "Thanh toán thất bại" },
  refunded: { badge: "bg-[#e0e7ff] text-[#4338ca]", text: "Đã hoàn tiền" },
  expired: { badge: "bg-[#f1f5f9] text-[#475569]", text: "Hóa đơn đã hết hạn" },
};

interface InvoiceDetailModalProps {
  invoice: InvoiceResponse | null;
  onClose: () => void;
  onRecordCash: (id: string) => void;
  onPrintPdf: (id: string) => void;
}

export function InvoiceDetailModal({
  invoice,
  onClose,
  onRecordCash,
  onPrintPdf,
}: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const statusInfo = STATUS_STYLE[invoice.status] || {
    badge: "bg-[#f1f5f9] text-[#475569]",
    text: invoice.statusName,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
              Chi tiết hóa đơn
            </span>
            <h3 className="text-xl font-black text-[#0f172a] mt-0.5">
              {invoice.invoiceNumber}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Status banner */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border border-transparent ${
              invoice.status === "completed"
                ? "bg-green-50/80 border-green-200 text-green-900"
                : invoice.status === "pending"
                ? "bg-amber-50/80 border-amber-200 text-amber-900"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500">Trạng thái giao dịch</span>
              <span className="font-bold text-sm mt-0.5">{statusInfo.text}</span>
            </div>
            <span
              className={`font-semibold px-3 py-1 rounded-full text-xs ${statusInfo.badge}`}
            >
              {invoice.statusName}
            </span>
          </div>

          {/* Member Card */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5">
            <UserAvatar
              src={null}
              name={invoice.memberName ?? "Khách vãng lai"}
              className="rounded-full size-12 object-cover text-base shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#64748b]">Khách hàng / Hội viên</p>
              <p className="font-bold text-base text-[#0f172a] truncate">
                {invoice.memberName ?? "Khách vãng lai"}
              </p>
              <p className="text-xs text-[#64748b] truncate mt-0.5">
                Mã định danh: <span className="font-mono font-medium">{invoice.userId.substring(0, 8).toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Breakdown Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-[#64748b] block mb-1">Phương thức thanh toán</span>
              <span className="font-semibold text-sm text-[#0f172a]">
                {invoice.paymentMethodName}
              </span>
            </div>
            <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-[#64748b] block mb-1">Thời gian tạo đơn</span>
              <span className="font-semibold text-sm text-[#0f172a]">
                {formatDateTime(invoice.createdAt)}
              </span>
            </div>
            <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-[#64748b] block mb-1">Thời gian thanh toán</span>
              <span className="font-semibold text-sm text-[#0f172a]">
                {invoice.paidAt ? formatDateTime(invoice.paidAt) : "--"}
              </span>
            </div>
            <div className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-[#64748b] block mb-1">Mã tham chiếu CSDL</span>
              <span className="font-mono text-xs text-[#64748b] truncate block" title={invoice.id}>
                {invoice.id}
              </span>
            </div>
          </div>

          {/* Total Amount Box */}
          <div className="border-t border-dashed border-slate-200 pt-4 flex items-center justify-between">
            <span className="font-bold text-base text-[#0f172a]">Tổng thanh toán:</span>
            <span className="font-black text-2xl text-blue-600">
              {formatVnd(invoice.totalAmount)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {invoice.status === "pending" && (
              <button
                onClick={() => {
                  onRecordCash(invoice.id);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Duyệt thu tiền mặt
              </button>
            )}
            <button
              onClick={() => onPrintPdf(invoice.id)}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <img src={iPrinter} alt="" className="size-4" />
              <span>In PDF</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-700 px-5 py-2.5 rounded-lg transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
