import { formatVnd } from "../../../../hooks/apiClient";

interface PaymentFormFieldsProps {
  members: any[];
  packages: any[];
  selectedUserId: string;
  setSelectedUserId: (val: string) => void;
  selectedPackageId: string;
  onPackageChange: (val: string) => void;
  billingPeriod: "monthly" | "yearly";
  onPeriodChange: (val: "monthly" | "yearly") => void;
  method: "Cash" | "QRCode";
  setMethod: (val: "Cash" | "QRCode") => void;
  amount: number;
  setAmount: (val: number) => void;
  recordCashNow: boolean;
  setRecordCashNow: (val: boolean) => void;
}

export function PaymentFormFields({
  members,
  packages,
  selectedUserId,
  setSelectedUserId,
  selectedPackageId,
  onPackageChange,
  billingPeriod,
  onPeriodChange,
  method,
  setMethod,
  amount,
  setAmount,
  recordCashNow,
  setRecordCashNow,
}: PaymentFormFieldsProps) {
  return (
    <>
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
          onChange={(e) => onPackageChange(e.target.value)}
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
            onChange={(e) => onPeriodChange(e.target.value as any)}
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
    </>
  );
}
