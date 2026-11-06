import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { PackageAPI, PackageOrder } from "../../../services/packageApi";
import { toast } from "sonner";
import CounterStatsCards from "./counterPayments/CounterStatsCards";
import CounterOrderCard from "./counterPayments/CounterOrderCard";
import CounterConfirmModal, { type PaymentOption } from "./counterPayments/CounterConfirmModal";
import CounterReceiptModal from "./counterPayments/CounterReceiptModal";
import { CounterFilterBar } from "./counterPayments/CounterFilterBar";
import { CancelOrderModal } from "./counterPayments/CancelOrderModal";

const money = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export function CounterPaymentsPage() {
  const [orders, setOrders] = useState<PackageOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"pending" | "paid" | "all">("pending");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "membership" | "sport" | "class">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<PackageOrder | null>(null);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<PackageOrder | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<PaymentOption>("counter");
  const [receiptOrder, setReceiptOrder] = useState<PackageOrder | null>(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await PackageAPI.getOrders();
      setOrders(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      console.error(err);
      if (!silent) setError(err?.message || "Không thể tải danh sách đơn hàng.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadOrders(true);
      }
    }, 5000);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("smartgym_orders_sync");
      channel.onmessage = (event) => {
        if (event.data?.type === "ORDER_CREATED") {
          void loadOrders(true);
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "smartgym_order_event") {
        void loadOrders(true);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      clearInterval(interval);
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadOrders]);

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "pending"), [orders]);
  const pendingAmount = useMemo(() => pendingOrders.reduce((acc, o) => acc + o.total, 0), [pendingOrders]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPaidOrders = useMemo(
    () => orders.filter((o) => o.status === "paid" && o.paidAt && o.paidAt.slice(0, 10) === todayStr),
    [orders, todayStr]
  );
  const todayPaidAmount = useMemo(() => todayPaidOrders.reduce((acc, o) => acc + o.total, 0), [todayPaidOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (categoryFilter !== "all" && order.packageSnapshot?.category !== categoryFilter) return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = order.userName?.toLowerCase().includes(q);
        const matchEmail = order.userEmail?.toLowerCase().includes(q);
        const matchPhone = order.userPhone?.toLowerCase().includes(q);
        const matchId = order.id?.toLowerCase().includes(q);
        const matchPkg = order.packageSnapshot?.name?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchId && !matchPkg) return false;
      }

      return true;
    });
  }, [orders, statusFilter, categoryFilter, search]);

  const handleConfirmPayment = async () => {
    if (!confirmOrder) return;
    setProcessingId(confirmOrder.id);
    try {
      await PackageAPI.confirmPayment(confirmOrder.id, selectedPayMethod);
      toast.success(`Đã thu tiền & kích hoạt gói cho khách hàng ${confirmOrder.userName}!`);
      setConfirmOrder(null);
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.message || "Không thể xác nhận thanh toán.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelOrder = (order: PackageOrder) => {
    setCancelTargetOrder(order);
  };

  const executeCancelOrder = async () => {
    if (!cancelTargetOrder) return;
    const orderToCancel = cancelTargetOrder;
    setProcessingId(orderToCancel.id);
    try {
      await PackageAPI.cancelOrder(orderToCancel.id);
      toast.success(`Đã hủy đơn ${orderToCancel.id.slice(0, 8).toUpperCase()}`);
      setCancelTargetOrder(null);
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.message || "Không thể hủy đơn hàng.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-16">
      {/* Top Banner / Stats */}
      <CounterStatsCards
        pendingCount={pendingOrders.length}
        pendingAmount={pendingAmount}
        todayPaidCount={todayPaidOrders.length}
        todayPaidAmount={todayPaidAmount}
        loading={loading}
        onRefresh={() => void loadOrders()}
        formatMoney={money}
      />

      {/* Filter and Search Bar */}
      <CounterFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        pendingCount={pendingOrders.length}
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Đang tải danh sách đơn thanh toán...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-3xl mb-3">
            📭
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy đơn hàng nào
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {search
              ? `Không có kết quả khớp với "${search}". Hãy thử tìm bằng SĐT hoặc mã đơn khác.`
              : "Hiện tại không có đơn nào trong mục đã chọn."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <CounterOrderCard
              key={order.id}
              order={order}
              processingId={processingId}
              onOpenConfirm={(o) => {
                setConfirmOrder(o);
                setSelectedPayMethod("counter");
              }}
              onOpenReceipt={(o) => setReceiptOrder(o)}
              onCancelOrder={handleCancelOrder}
              formatMoney={money}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CounterConfirmModal
        confirmOrder={confirmOrder}
        selectedPayMethod={selectedPayMethod}
        processingId={processingId}
        onSelectPayMethod={setSelectedPayMethod}
        onClose={() => setConfirmOrder(null)}
        onConfirm={handleConfirmPayment}
        formatMoney={money}
      />

      <CounterReceiptModal
        receiptOrder={receiptOrder}
        onClose={() => setReceiptOrder(null)}
        formatMoney={money}
      />

      {/* Cancel Confirmation Modal */}
      <CancelOrderModal
        order={cancelTargetOrder}
        processingId={processingId}
        onClose={() => setCancelTargetOrder(null)}
        onConfirm={executeCancelOrder}
      />
    </div>
  );
}
export default CounterPaymentsPage;
