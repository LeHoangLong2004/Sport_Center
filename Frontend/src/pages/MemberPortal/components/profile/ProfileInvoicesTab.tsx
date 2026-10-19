import React, { useState } from "react";
import {
  Receipt,
  CheckCircle2,
  Clock,
  Printer,
  Building,
  Info,
} from "lucide-react";
import { WalletService, MEMBER_WALLET_UPDATED_EVENT } from "../../services/walletService";
import ProfileFinanceStats from "./invoices/ProfileFinanceStats";
import ProfileElectronicReceiptModal, { type InvoiceItem } from "./invoices/ProfileElectronicReceiptModal";
import ProfilePaymentReportModal from "./invoices/ProfilePaymentReportModal";

export type { InvoiceItem };

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
      <ProfileFinanceStats
        walletBalance={walletBalance}
        totalSpent={totalSpent}
        paidCount={paidCount}
        pendingCount={pendingCount}
        memberTier={profile?.memberTier}
        hasPaidInvoices={invoices.some((i) => i.status === "paid")}
      />

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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-200/60 dark:border-emerald-500/30 cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
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

      {/* Modals */}
      <ProfileElectronicReceiptModal
        receiptModal={receiptModal}
        profile={profile}
        fullName={fullName}
        phone={phone}
        email={email}
        storedUser={storedUser}
        onClose={() => setReceiptModal(null)}
        onCopySuccess={(id) => {
          setInvoiceFeedback("Đã sao chép mã phiếu thu: " + id);
          setTimeout(() => setInvoiceFeedback(null), 3000);
        }}
      />

      <ProfilePaymentReportModal
        activePaymentReportModal={activePaymentReportModal}
        profile={profile}
        phone={phone}
        storedUser={storedUser}
        reportBankMethod={reportBankMethod}
        onReportBankMethodChange={setReportBankMethod}
        reportRefCode={reportRefCode}
        onReportRefCodeChange={setReportRefCode}
        onClose={() => setActivePaymentReportModal(null)}
        onSubmit={handleConfirmPaymentReport}
      />
    </div>
  );
};
