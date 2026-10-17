import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Receipt,
  CheckCircle2,
  Clock,
  Award,
  Printer,
  Building,
  Info,
  X,
  FileCheck,
  Copy,
  Wallet,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../../services/walletService";

interface InvoiceItem {
  id: string;
  packageName: string;
  amount: number | string;
  date: string;
  method: string;
  status: "paid" | "pending";
  referenceCode?: string;
  startDate?: string;
  endDate?: string;
}

interface ProfileInvoicesTabProps {
  invoices: InvoiceItem[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceItem[]>>;
  profile: any;
  storedUser: any;
  phone: string;
  email: string;
  fullName: string;
}

export const ProfileInvoicesTab: React.FC<ProfileInvoicesTabProps> = ({
  invoices,
  setInvoices,
  profile,
  storedUser,
  phone,
  email,
  fullName,
}) => {
  const [receiptModal, setReceiptModal] = useState<InvoiceItem | null>(null);
  const [activePaymentReportModal, setActivePaymentReportModal] = useState<InvoiceItem | null>(null);
  const [reportBankMethod, setReportBankMethod] = useState<string>("Chuyển khoản QR");
  const [reportRefCode, setReportRefCode] = useState<string>("");
  const [invoiceFeedback, setInvoiceFeedback] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(() => WalletService.getLocalWallet().balance);

  React.useEffect(() => {
    let cancelled = false;
    WalletService.getWallet().then((w) => {
      if (!cancelled && typeof w.balance === "number") setWalletBalance(w.balance);
    });
    const handleUpdate = (e: any) => {
      if (e?.detail?.balance !== undefined) setWalletBalance(e.detail.balance);
      else setWalletBalance(WalletService.getLocalWallet().balance);
    };
    window.addEventListener(MEMBER_WALLET_UPDATED_EVENT, handleUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(MEMBER_WALLET_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const totalSpent = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === "paid").length;
  const pendingCount = invoices.filter((inv) => inv.status === "pending").length;

  const handleConfirmPaymentReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentReportModal) return;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === activePaymentReportModal.id
          ? {
              ...inv,
              status: "paid",
              method: reportBankMethod,
              referenceCode: reportRefCode || `MB-${Date.now().toString().slice(-6)}`,
            }
          : inv
      )
    );
    setActivePaymentReportModal(null);
    setReportRefCode("");
    setInvoiceFeedback("Đã gửi thông báo thanh toán thành công! Kế toán sẽ phê duyệt đối soát trong ít phút.");
    setTimeout(() => setInvoiceFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {invoiceFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-sm font-medium shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{invoiceFeedback}</span>
        </div>
      )}

      {/* 5 Financial Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Số dư ví khả dụng */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 p-5 shadow-xs bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Số dư ví
            </span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {walletBalance.toLocaleString("vi-VN")} đ
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Khả dụng
              </span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-wallet-modal"))}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                + Nạp ví
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng chi tiêu
            </span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalSpent.toLocaleString("vi-VN")} đ
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Đã hoàn tất thanh toán
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Giao dịch hoàn tất
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {paidCount} đơn
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
              Phiếu thu hợp lệ
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Chờ thanh toán
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingCount} đơn
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {pendingCount > 0 ? "Cần hoàn tất đối soát" : "Không có công nợ"}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hạng hội viên
            </span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile?.memberTier || (invoices.some((i) => i.status === "paid") ? "Hội viên Hoạt động" : "Thành viên mới")}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
              {invoices.some((i) => i.status === "paid") ? "Gói tập đang kích hoạt" : "Chưa đăng ký gói tập"}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions & Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-500" />
              Danh sách Hóa đơn & Lịch sử Giao dịch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Chứng từ điện tử và lịch sử thanh toán các gói dịch vụ tại SmartGym Center
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              Hiển thị {invoices.length} bản ghi
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã hóa đơn</th>
                <th className="py-3 px-4">Gói dịch vụ</th>
                <th className="py-3 px-4">Số tiền</th>
                <th className="py-3 px-4">Hình thức thanh toán</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Chưa có lịch sử giao dịch nào. Các hóa đơn sẽ xuất hiện tại đây khi bạn đăng ký gói tập.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {inv.id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{inv.date}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {inv.packageName}
                      </div>
                      {inv.startDate && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Thời hạn: {inv.startDate} - {inv.endDate}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {(Number(inv.amount) || 0).toLocaleString("vi-VN")} đ
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {inv.method}
                      </div>
                      {inv.referenceCode ? (
                        <div className="text-[11px] text-slate-400 font-mono">
                          Ref: {inv.referenceCode}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">Chưa đối soát</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === "paid" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Chờ thanh toán
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {inv.status === "paid" ? (
                        <button
                          type="button"
                          onClick={() => setReceiptModal(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-500/30"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Xem phiếu thu
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActivePaymentReportModal(inv);
                            setReportBankMethod("Chuyển khoản QR");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                        >
                          <Building className="w-3.5 h-3.5" />
                          Báo thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Note & Policy Footer */}
        <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Lưu ý về phiếu thu & đối soát:
            </span>{" "}
            Tất cả hóa đơn điện tử có hiệu lực đối soát và kích hoạt quyền lợi phòng tập ngay khi giao dịch được xác nhận. Nếu bạn cần xuất hóa đơn tài chính VAT cho cơ quan / công ty, vui lòng thông báo cho quầy lễ tân hoặc gọi Hotline 1900 6868 trong vòng 72 giờ kể từ khi thanh toán.
          </div>
        </div>
      </div>

      {/* ELECTRONIC RECEIPT / PHIẾU THU MODAL */}
      {receiptModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
              {/* Receipt Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-wide">
                      PHIẾU THU ĐIỆN TỬ
                    </h3>
                    <p className="text-xs text-slate-300">
                      SmartGym Center · Hệ thống quản lý tập luyện
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Mã số phiếu thu:</span>
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {receiptModal.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block mb-0.5">Ngày lập chứng từ:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {receiptModal.date}
                    </span>
                  </div>
                </div>

                {/* Customer & Center Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Khách hàng / Hội viên
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                      {profile?.fullName || fullName || storedUser?.fullName || storedUser?.name || "Hội viên"}
                    </p>
                    <p className="text-slate-500">
                      {profile?.phone || phone || storedUser?.phoneNumber || storedUser?.phone || "Chưa cập nhật"}
                    </p>
                    <p className="text-slate-500">
                      {profile?.email || email || storedUser?.email || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Đơn vị thụ hưởng
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      SmartGym Sports Complex
                    </p>
                    <p className="text-slate-500">MST: 0316889922</p>
                    <p className="text-slate-500">Hotline: 1900 6868</p>
                  </div>
                </div>

                {/* Items Breakdown Table */}
                <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Khoản thu dịch vụ</th>
                        <th className="py-2.5 px-3 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {receiptModal.packageName}
                          </p>
                          {receiptModal.startDate && (
                            <p className="text-[11px] text-slate-400">
                              Thời hạn hiệu lực: {receiptModal.startDate} - {receiptModal.endDate}
                            </p>
                          )}
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Hình thức: {receiptModal.method}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                          {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-50/80 dark:bg-slate-850 font-bold border-t border-slate-200 dark:border-slate-700">
                      <tr>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          TỔNG CỘNG THANH TOÁN (ĐÃ VAT):
                        </td>
                        <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400 text-base font-black">
                          {(Number(receiptModal.amount) || 0).toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Electronic Stamp */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                        XÁC NHẬN ĐÃ THU TIỀN THÀNH CÔNG
                      </p>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                        Ký số điện tử bởi Ban Tài chính SmartGym
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              {/* Receipt Footer Actions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(receiptModal.id);
                    setInvoiceFeedback("Đã sao chép mã phiếu thu: " + receiptModal.id);
                    setTimeout(() => setInvoiceFeedback(null), 3000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép mã
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  In phiếu thu
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* REPORT PAYMENT / CHUYỂN KHOẢN MODAL */}
      {activePaymentReportModal &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Thông tin chuyển khoản & Báo thanh toán
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hóa đơn: {activePaymentReportModal.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePaymentReportModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleConfirmPaymentReport} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 text-xs">
                  {/* Bank info box */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Ngân hàng thụ hưởng:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        MB Bank (Ngân hàng Quân Đội)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          0903 8888 6868
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText("090388886868")}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Tên tài khoản:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        SMART GYM SPORTS CENTER
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>Số tiền thanh toán:</span>
                      <span className="font-extrabold text-base text-rose-600 dark:text-rose-400">
                        {(Number(activePaymentReportModal.amount) || 0).toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Nội dung chuyển khoản (bắt buộc):</span>
                      <span className="font-mono font-bold bg-white dark:bg-slate-700 px-2 py-0.5 rounded text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600">
                        {activePaymentReportModal.id} {profile?.phone || phone || storedUser?.phoneNumber || storedUser?.phone || ""}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Phương thức thực hiện:
                    </label>
                    <select
                      value={reportBankMethod}
                      onChange={(e) => setReportBankMethod(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    >
                      <option value="Chuyển khoản QR">Chuyển khoản QR (MB Bank / VietQR)</option>
                      <option value="Thanh toán trực tiếp">Nộp tiền mặt tại Quầy Lễ tân</option>
                      <option value="Thẻ tín dụng / POS">Quẹt thẻ POS tại quầy</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Mã giao dịch ngân hàng / Ghi chú đối soát:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: MB-889922 hoặc mã giao dịch trên biên lai..."
                      value={reportRefCode}
                      onChange={(e) => setReportRefCode(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nhập mã giao dịch để kế toán đối soát và kích hoạt gói nhanh nhất.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5 shrink-0 bg-slate-50/50 dark:bg-slate-850">
                  <button
                    type="button"
                    onClick={() => setActivePaymentReportModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                  >
                    Xác nhận đã thanh toán
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
