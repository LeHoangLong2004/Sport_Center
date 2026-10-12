import KpiCard from "./KpiCard";
import { formatVnd } from "../../../hooks/apiClient";
import { iWallet, iCheckCircle, iClock, iRotateCcw } from "../shared";

interface PaymentSummaryProps {
  loading: boolean;
  error: string | null;
  totalThisMonth: number;
  completedCount: number;
  monthCount: number;
  pendingAmount: number;
  pendingCount: number;
  refundedAmount: number;
  refundedCount: number;
  successRate: number;
}

export function PaymentSummary({
  loading,
  error,
  totalThisMonth,
  completedCount,
  monthCount,
  pendingAmount,
  pendingCount,
  refundedAmount,
  refundedCount,
  successRate,
}: PaymentSummaryProps) {
  return (
    <div className="flex gap-5">
      <KpiCard
        label="Tổng thực thu (Tháng này)"
        value={loading || error ? "-- đ" : formatVnd(totalThisMonth)}
        sub={`${completedCount} giao dịch đã thanh toán`}
        badge={error ? "--" : `${successRate}%`}
        badgeColor="green"
        icon={iWallet}
        iconBg="bg-[rgba(37,99,235,0.08)]"
      />
      <KpiCard
        label="Giao dịch thành công"
        value={error ? "-- giao dịch" : `${completedCount} giao dịch`}
        sub={`${monthCount} hóa đơn trong tháng`}
        icon={iCheckCircle}
        iconBg="bg-[rgba(21,128,61,0.08)]"
      />
      <KpiCard
        label="Chờ đối soát / Xử lý"
        value={error ? "-- đ" : formatVnd(pendingAmount)}
        sub={`${pendingCount} hóa đơn chưa thanh toán`}
        icon={iClock}
        iconBg="bg-[rgba(217,119,6,0.08)]"
      />
      <KpiCard
        label="Hoàn tiền (Tháng này)"
        value={error ? "-- đ" : formatVnd(refundedAmount)}
        sub={`${refundedCount} yêu cầu hoàn tiền`}
        icon={iRotateCcw}
        iconBg="bg-[rgba(220,38,38,0.08)]"
      />
    </div>
  );
}
