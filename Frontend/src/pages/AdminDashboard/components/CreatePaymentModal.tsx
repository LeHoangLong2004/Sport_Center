import React, { useState, useEffect } from "react";
import { formatVnd, apiPost } from "../../../hooks/apiClient";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

          {/* Chọn hội viên */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Hội viên / Khách hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
              required
            >
              <option value="">-- Chọn hội viên --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.phoneNumber || m.email || m.id.substring(0, 8)})
                </option>
              ))}
            </select>
          </div>

          {/* Chọn gói dịch vụ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Gói tập / Dịch vụ
            </label>
            <select
              value={selectedPackageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">-- Thu dịch vụ tự do (nhập số tiền) --</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {formatVnd(p.monthlyPrice)} / tháng
                </option>
              ))}
            </select>
          </div>

          {/* Chu kỳ & Phương thức */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chu kỳ thanh toán
              </label>
              <select
                value={billingPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="monthly">Theo tháng (1 Tháng)</option>
                <option value="yearly">Theo năm (12 Tháng)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phương thức thu
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Cash">Tiền mặt tại quầy</option>
                <option value="QRCode">Quét mã QR / Chuyển khoản</option>
              </select>
            </div>
          </div>

          {/* Số tiền */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Số tiền thu (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1000}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-base font-bold text-blue-600 bg-slate-50/50 focus:bg-white outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Checkbox duyệt ngay */}
          {method === "Cash" && (
            <label className="flex items-center gap-2 cursor-pointer bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
              <input
                type="checkbox"
                checked={recordCashNow}
                onChange={(e) => setRecordCashNow(e.target.checked)}
                className="size-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-semibold text-emerald-900">
                Đã nhận đủ tiền mặt — Xác nhận hoàn tất thu tiền ngay lập tức
              </span>
            </label>
          )}

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
              className="flex-1 bg-[#2563eb] text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm shadow-md shadow-blue-500/20 disabled:opacity-60"
            >
              {loading ? "Đang xử lý..." : "Xác nhận tạo đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
