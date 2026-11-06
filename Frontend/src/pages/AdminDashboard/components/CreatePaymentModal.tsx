import React, { useState, useEffect } from "react";
import { apiPost } from "../../../hooks/apiClient";
import { PaymentFormFields } from "./createPayment/PaymentFormFields";

interface CreatePaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePaymentModal({ onClose, onSuccess }: CreatePaymentModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<"Cash" | "QRCode">("Cash");
  const [recordCashNow, setRecordCashNow] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load members & packages
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
          if (data.length > 0) setSelectedUserId(data[0].id);
        }
      })
      .catch(() => {});

    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPackages(data);
          if (data.length > 0) {
            setSelectedPackageId(data[0].id);
            setAmount(data[0].monthlyPrice || data[0].price || 500000);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  // Update amount when package or period changes
  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const found = packages.find((p) => p.id === pkgId);
    if (found) {
      const price = billingPeriod === "yearly" ? (found.yearlyPrice || found.monthlyPrice * 10) : found.monthlyPrice;
      setAmount(price || 0);
    }
  };

  const handlePeriodChange = (period: "monthly" | "yearly") => {
    setBillingPeriod(period);
    const found = packages.find((p) => p.id === selectedPackageId);
    if (found) {
      const price = period === "yearly" ? (found.yearlyPrice || found.monthlyPrice * 10) : found.monthlyPrice;
      setAmount(price || 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedUserId) {
      setError("Vui lòng chọn hội viên.");
      return;
    }
    if (amount <= 0) {
      setError("Số tiền phải lớn hơn 0.");
      return;
    }

    setLoading(true);
    try {
      const res: any = await apiPost("/api/payments/create", {
        userId: selectedUserId,
        packageId: selectedPackageId,
        amount: Number(amount),
        method: method,
        billingPeriod: billingPeriod,
        autoRenew: false,
      });

      const invoiceId = res?.invoiceId;

      // If user chose Cash and wanted to record immediately
      if (recordCashNow && method === "Cash" && invoiceId) {
        await apiPost(`/api/payments/${invoiceId}/record-cash`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Không thể tạo hóa đơn thu tiền.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-[#0f172a]">
              Tạo giao dịch thu tiền tại quầy
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Ghi nhận thanh toán tiền mặt hoặc chuyển khoản QR cho hội viên
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 size-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <PaymentFormFields
            members={members}
            packages={packages}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            selectedPackageId={selectedPackageId}
            onPackageChange={handlePackageChange}
            billingPeriod={billingPeriod}
            onPeriodChange={handlePeriodChange}
            method={method}
            setMethod={setMethod}
            amount={amount}
            setAmount={setAmount}
            recordCashNow={recordCashNow}
            setRecordCashNow={setRecordCashNow}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-rose-600 text-white font-semibold py-2.5 rounded-xl hover:bg-rose-700 transition-colors text-sm shadow-md shadow-rose-600/20 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Đang xử lý..." : "Xác nhận tạo đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
