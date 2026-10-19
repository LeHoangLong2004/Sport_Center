import { useState, useEffect } from "react";
import type { MemberScreen, MemberPaymentItem } from "../types";
import { PackageAPI } from "../../../services/packageApi";
import { Receipt, CheckCircle2, X, Wallet } from "lucide-react";
import {
  WalletService,
  MEMBER_WALLET_UPDATED_EVENT,
  type WalletTransaction,
} from "../services/walletService";
import WalletTopUpModal from "../components/WalletTopUpModal";
import WalletBanner from "./payments/WalletBanner";
import WalletTransactionsTab from "./payments/WalletTransactionsTab";
import InvoicesTab from "./payments/InvoicesTab";
import ReportPaymentModal from "./payments/ReportPaymentModal";
import ReceiptModal from "./payments/ReceiptModal";
import PendingTicketModal from "./payments/PendingTicketModal";

interface Props {
  onNavigate: (screen: MemberScreen) => void;
}

export default function MemberPayments({ onNavigate }: Props) {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userName = user?.fullName || user?.name || "Hội viên";

  const [payments, setPayments] = useState<MemberPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentModal, setActivePaymentModal] = useState<MemberPaymentItem | null>(null);
  const [receiptModal, setReceiptModal] = useState<MemberPaymentItem | null>(null);
  const [refCode, setRefCode] = useState("");
  const [bankMethod, setBankMethod] = useState<"Chuyển khoản" | "Tiền mặt tại quầy">("Chuyển khoản");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"invoices" | "wallet">("invoices");
  const [balance, setBalance] = useState<number>(() => WalletService.getLocalWallet(user?.id).balance);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => WalletService.getLocalWallet(user?.id).transactions);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [pendingTicketModal, setPendingTicketModal] = useState<WalletTransaction | null>(null);
  const [confirmingPending, setConfirmingPending] = useState(false);

  const handleConfirmPendingTicket = async (txId: string) => {
    setConfirmingPending(true);
    try {
      const res = await WalletService.confirmPendingTopUp(txId, user?.id);
      if (res.success) {
        setBalance(res.newBalance);
        setPendingTicketModal(null);
        setFeedback("Lễ tân đã xác nhận thu tiền thành công! Số dư ví đã được cộng.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmingPending(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    WalletService.getWallet(user?.id).then((w) => {
      if (!cancelled) {
        setBalance(w.balance);
        setTransactions(w.transactions);
      }
    });

    const handleWalletUpdate = (e: any) => {
      if (e?.detail?.balance !== undefined) {
        setBalance(e.detail.balance);
        if (Array.isArray(e.detail.transactions)) {
          setTransactions(e.detail.transactions);
        }
      } else {
        const local = WalletService.getLocalWallet(user?.id);
        setBalance(local.balance);
        setTransactions(local.transactions);
      }
    };

    window.addEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(MEMBER_WALLET_UPDATED_EVENT, handleWalletUpdate);
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    PackageAPI.getMyOrders()
      .then((orders) => {
        if (cancelled) return;
        if (Array.isArray(orders) && orders.length > 0) {
          const mapped: MemberPaymentItem[] = orders.map((o) => ({
            id: `INV-${o.id.substring(0, 8).toUpperCase()}`,
            packageName: o.packageSnapshot?.name || "Gói tập hội viên",
            amount: o.total || 0,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "Hôm nay",
            method: "Chuyển khoản",
            status: o.status === "paid" ? "paid" : "pending",
            referenceCode: o.id.substring(0, 8).toUpperCase(),
          }));
          setPayments(mapped);
        } else {
          setPayments([]);
        }
      })
      .catch(() => {
        if (!cancelled) setPayments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleReportPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentModal) return;

    const updated = payments.map((p) =>
      p.id === activePaymentModal.id
        ? {
            ...p,
            method: bankMethod,
            status: "paid" as const,
            referenceCode: refCode.trim() || `MB-${Date.now().toString().slice(-6)}`,
          }
        : p
    );

    setPayments(updated);
    setActivePaymentModal(null);
    setRefCode("");
    setFeedback("Đã gửi thông tin thanh toán cho nhân viên lễ tân xác nhận đối soát!");
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Wallet Hero Banner */}
      <WalletBanner balance={balance} onOpenTopUp={() => setShowWalletModal(true)} />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "invoices"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Hóa đơn gói tập ({payments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("wallet")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "wallet"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Biến động số dư ví ({transactions.length})</span>
        </button>
      </div>

      {/* Main Content */}
      {activeTab === "wallet" ? (
        <WalletTransactionsTab
          balance={balance}
          transactions={transactions}
          onOpenTopUp={() => setShowWalletModal(true)}
          onOpenPendingTicket={(tx) => setPendingTicketModal(tx)}
        />
      ) : (
        <InvoicesTab
          loading={loading}
          payments={payments}
          onNavigate={onNavigate}
          onOpenReportPayment={(p) => {
            setActivePaymentModal(p);
            setRefCode(p.referenceCode || "");
          }}
          onOpenReceipt={(p) => setReceiptModal(p)}
        />
      )}

      {/* Modals */}
      <ReportPaymentModal
        activePaymentModal={activePaymentModal}
        bankMethod={bankMethod}
        onBankMethodChange={setBankMethod}
        refCode={refCode}
        onRefCodeChange={setRefCode}
        onClose={() => setActivePaymentModal(null)}
        onSubmit={handleReportPayment}
      />

      <ReceiptModal
        receiptModal={receiptModal}
        userName={userName}
        onClose={() => setReceiptModal(null)}
      />

      <PendingTicketModal
        pendingTicketModal={pendingTicketModal}
        confirmingPending={confirmingPending}
        onClose={() => setPendingTicketModal(null)}
        onConfirmPendingTicket={handleConfirmPendingTicket}
      />

      <WalletTopUpModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        currentBalance={balance}
        userName={userName}
        phone={user?.phoneNumber}
        onSuccess={(newBal) => {
          setBalance(newBal);
        }}
      />
    </div>
  );
}
