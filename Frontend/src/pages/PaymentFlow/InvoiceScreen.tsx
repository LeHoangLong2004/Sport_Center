import React from "react";
import { A } from "./shared";
import { useApiResource } from "../../hooks/useApiResource";
import { type InvoiceResponse } from "../../hooks/flow3Api";
import { apiPost, formatDateTime, formatVnd } from "../../hooks/apiClient";

export function InvoiceScreen({ onBack }: { onBack: () => void }) {
  const invoiceId = typeof window !== "undefined" ? window.localStorage.getItem("latestInvoiceId") : null;
  const invoice = useApiResource<InvoiceResponse>(invoiceId ? `/api/payments/${invoiceId}` : null);

  const data = invoice.data;
  const total = data?.totalAmount ?? 0;

  const handleSendEmail = async () => {
    if (!invoiceId) return;
    try {
      await apiPost(`/api/payments/${invoiceId}/send-email`);
      alert("Đã gửi hóa đơn qua email.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không gửi được email hóa đơn.");
    }
  };

  return (
    <div className="bg-[#f8fafc] flex flex-col items-start w-full min-h-screen">
      <div className="flex flex-col gap-6 items-center pb-20 pt-10 px-20 w-full">
        <div className="flex items-center justify-between w-[800px]">
          <button
            type="button"
            onClick={onBack}
            className="font-['Inter'] font-semibold text-[#64748b] text-sm hover:text-[#0f172a] transition-colors"
          >
            ← Quay lại trang chủ
          </button>
          <div className="flex gap-3 items-start">
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={!invoiceId || !data}
              className="border border-[#64748b] disabled:opacity-50 flex gap-2 items-center px-4 py-[10px] rounded-[6px] font-['Inter'] font-semibold text-[#64748b] text-[13px] hover:bg-[#f8fafc] transition-colors"
            >
              <img src={`${A}/025b2.svg`} className="size-[14px]" alt="" />
              Gửi qua Email
            </button>
            <button 
              type="button" 
              disabled={!invoiceId}
              onClick={() => {
                if (invoiceId) {
                  window.open(`/api/payments/${invoiceId}/export-pdf`, '_blank');
                } else {
                  alert("Không tìm thấy mã hóa đơn!");
                }
              }}
              className="bg-teal-500 disabled:opacity-50 flex gap-2 items-center px-4 py-[10px] rounded-[6px] font-['Inter'] font-semibold text-white text-[13px] hover:bg-teal-600 transition-colors">
              <img src={`${A}/b30d5.svg`} className="size-[14px]" alt="" />
              Tải PDF
            </button>
          </div>
        </div>

        {!invoiceId && (
          <div className="bg-white border border-[#fef3c7] p-6 rounded-[16px] text-[#b45309] text-sm w-[800px]">
            Không tìm thấy hóa đơn nào vừa thanh toán. Hãy hoàn tất thanh toán trước khi xem hóa đơn.
          </div>
        )}

        {invoiceId && invoice.loading && (
          <div className="bg-white border border-[#e2e8f0] p-6 rounded-[16px] text-[#64748b] text-sm w-[800px]">
            Đang tải hóa đơn...
          </div>
        )}

        {invoiceId && invoice.error && (
          <div className="bg-white border border-[#fee2e2] p-6 rounded-[16px] text-[#b91c1c] text-sm w-[800px]">
            {invoice.error}
          </div>
        )}

        {data && (
        <div className="bg-white border border-[#e2e8f0] shadow-[0px_12px_12px_rgba(15,23,42,0.03)] flex flex-col gap-8 items-start p-12 rounded-[16px] w-[800px]">
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-2 items-start">
              <div className="flex gap-2 items-center">
                <div className="bg-[#10b981] flex items-center justify-center rounded-[6px] size-7">
                  <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SC</span>
                </div>
                <span className="font-['Manrope'] font-extrabold text-[#0b1f3a] text-[14px]">SPORTCENTER</span>
              </div>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[12px] w-[280px]">
                Chi nhánh Q.1: Flagship Center, 123 Lê Lợi, Phường Bến Thành, Quận 1, Tp. Hồ Chí Minh
              </p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">MST: 0312345678</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <p className="font-['Inter'] font-extrabold text-[#0b1f3a] text-xl">HÓA ĐƠN ĐIỆN TỬ</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Số hóa đơn: {data.invoiceNumber}</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Ngày lập: {formatDateTime(data.createdAt)}</p>
            </div>
          </div>

          <div className="h-0 w-full relative">
            <div className="absolute inset-[-1px_0_0_0]">
              <img src={`${A}/e3ff5.svg`} className="block w-full" alt="" />
            </div>
          </div>

          <div className="flex gap-10 items-start w-full">
            <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
              <p className="font-['Inter'] font-bold text-[#64748b] text-[12px] uppercase">KHÁCH HÀNG / HỘI VIÊN</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-[15px]">{data.memberName ?? "Khách vãng lai"}</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">
                Mã hội viên: {data.userId.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-2 items-start min-w-0">
              <p className="font-['Inter'] font-bold text-[#64748b] text-[12px] uppercase">PHƯƠNG THỨC THANH TOÁN</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-[15px]">{data.paymentMethodName}</p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">
                Mã giao dịch: {data.id.substring(0, 8).toUpperCase()}
              </p>
              <p className="font-['Inter'] font-normal text-[#64748b] text-[13px]">Trạng thái: {data.statusName}</p>
            </div>
          </div>

          <div className="flex flex-col items-start w-full">
            <div className="bg-[#f8fafc] border-t border-b border-[#e2e8f0] flex font-['Inter'] font-bold items-start py-3 w-full text-[#0f172a] text-[13px]">
              <p className="flex-1 min-w-0">Chi tiết dịch vụ</p>
              <p className="text-right w-[120px]">Đơn giá</p>
              <p className="text-center w-[80px]">SL</p>
              <p className="text-right w-[140px]">Thành tiền</p>
            </div>
            <div className="border-b border-[#e2e8f0] flex items-start py-4 w-full">
              <div className="flex flex-1 flex-col gap-1 items-start min-w-0">
                <p className="font-['Inter'] font-bold text-[#0f172a] text-sm">Đăng ký / Gia hạn gói tập</p>
                <p className="font-['Inter'] font-normal text-[#64748b] text-[12px]">
                  Thanh toán qua {data.paymentMethodName}
                </p>
              </div>
              <p className="font-['Inter'] font-normal text-[#0f172a] text-sm text-right w-[120px]">{formatVnd(total)}</p>
              <p className="font-['Inter'] font-normal text-[#0f172a] text-sm text-center w-[80px]">1</p>
              <p className="font-['Inter'] font-bold text-[#0f172a] text-sm text-right w-[140px]">{formatVnd(total)}</p>
            </div>
          </div>

          <div className="flex items-start justify-end w-full">
            <div className="flex flex-col gap-3 items-start w-[340px]">
              {[
                { label: "Tạm tính:", val: formatVnd(total), cls: "font-semibold text-[#0f172a]" },
                { label: "Ưu đãi:", val: formatVnd(0), cls: "font-bold text-[#16a34a]" },
                { label: "Thuế GTGT (0%):", val: formatVnd(0), cls: "text-[#0f172a]" },
              ].map(({ label, val, cls }) => (
                <div key={label} className="flex items-start justify-between w-full">
                  <span className="font-['Inter'] font-normal text-[#64748b] text-[13px]">{label}</span>
                  <span className={`font-['Inter'] text-sm ${cls}`}>{val}</span>
                </div>
              ))}
              <div className="h-0 w-full relative">
                <div className="absolute inset-[-1px_0_0_0]">
                  <img src={`${A}/a47bf.svg`} className="block w-full" alt="" />
                </div>
              </div>
              <div className="flex items-center justify-between w-full">
                <span className="font-['Inter'] font-bold text-[#0f172a] text-sm">Tổng cộng thanh toán:</span>
                <span className="font-['Inter'] font-extrabold text-teal-600 text-lg">{formatVnd(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-6 w-full">
            <div className="flex flex-col gap-1 items-start font-['Inter'] font-normal text-[#64748b] text-[11px]">
              <p>Hóa đơn này được khởi tạo trực tuyến và có giá trị pháp lý.</p>
              <p>Cảm ơn bạn đã lựa chọn SportCenter!</p>
            </div>
            <div className="flex flex-col gap-1 items-center w-40">
              <p className="font-['Inter'] font-normal text-[#64748b] text-[11px]">Đại diện SportCenter</p>
              <p className="font-['Inter'] font-bold text-[#16a34a] text-[12px]">{data.status === "completed" ? "ĐÃ THANH TOÁN" : "CHỜ THANH TOÁN"}</p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}