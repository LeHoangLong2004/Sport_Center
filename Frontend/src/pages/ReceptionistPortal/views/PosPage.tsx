import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Banknote, CheckCircle2, Clock3, QrCode, RefreshCw, X } from "lucide-react";
import { PosProductGrid } from "./pos/PosProductGrid";
import { PosCart } from "./pos/PosCart";
import type { CartItem, PosProduct } from "./pos/PosTypes";

type PaymentMethod = "counter" | "qr";
type QrPaymentStatus = "waiting" | "confirming" | "error";
type QrOrder = {
  id: string;
  total: number;
  memo: string;
  qrUrl: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export function PosPage() {
  const [activeTab, setActiveTab] = useState("Tất cả sản phẩm");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paid, setPaid] = useState(false);
  const [allProducts, setAllProducts] = useState<PosProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("counter");
  const [qrOrder, setQrOrder] = useState<QrOrder | null>(null);
  const [qrPaymentStatus, setQrPaymentStatus] = useState<QrPaymentStatus>("waiting");
  const checkoutOverlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!checkoutOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const preventBackgroundScroll = (event: WheelEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !checkoutOverlayRef.current?.contains(target)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", preventBackgroundScroll, { capture: true, passive: false });
    window.addEventListener("touchmove", preventBackgroundScroll, { capture: true, passive: false });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      window.removeEventListener("wheel", preventBackgroundScroll, true);
      window.removeEventListener("touchmove", preventBackgroundScroll, true);
    };
  }, [checkoutOpen]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAllProducts(data);
      })
      .catch(console.error);
  }, []);

  const tabs = [
    "Tất cả sản phẩm",
    ...Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = (
    activeTab === "Tất cả sản phẩm"
      ? allProducts
      : allProducts.filter((p) => p.category === activeTab)
  ).filter((p) => {
    if (!searchQuery.trim()) return true;
    return p.name?.toLowerCase().includes(searchQuery.trim().toLowerCase());
  });

  const handleAddToCart = (product: PosProduct) => {
    if (qrOrder) {
      toast.error("Hãy xử lý đơn QR đang chờ trước khi thay đổi giỏ hàng.");
      return;
    }
    if (!product?.id || product.stockQuantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing)
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + 1, i.stockQuantity) }
            : i
        );
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          unitPrice: product.price,
          stockQuantity: product.stockQuantity,
          qty: 1,
        },
      ];
    });
    setPaid(false);
  };

  const handleChangeQty = (id: string, delta: number) => {
    if (qrOrder) {
      toast.error("Hãy xử lý đơn QR đang chờ trước khi thay đổi giỏ hàng.");
      return;
    }
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? { ...i, qty: Math.min(i.stockQuantity, Math.max(0, i.qty + delta)) }
            : i
        )
        .filter((i) => i.qty > 0)
    );
    setPaid(false);
  };

  const [processing, setProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const discount = subtotal > 0 ? Math.min(10000, subtotal) : 0;
  const total = Math.max(0, subtotal - discount);

  const completeOrder = async (orderId: string, token: string | null, orderTotal: number) => {
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    const confirmResponse = await fetch(`/api/product-orders/${orderId}/confirm`, {
      method: "PUT",
      headers: authHeaders,
    });
    if (!confirmResponse.ok) {
      const error = await confirmResponse.json().catch(() => null);
      throw new Error(error?.message || "Không thể xác nhận đơn hàng đã thanh toán.");
    }

    const fulfillmentResponse = await fetch(`/api/product-orders/${orderId}/fulfillment`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ status: "delivered" }),
    });
    if (!fulfillmentResponse.ok) {
      const error = await fulfillmentResponse.json().catch(() => null);
      throw new Error(error?.message || "Đã nhận thanh toán nhưng chưa cập nhật được trạng thái giao hàng.");
    }

    setPaid(true);
    setCheckoutOpen(false);
    setQrOrder(null);
    toast.success(`Đã thanh toán & xuất kho đơn hàng ${orderTotal.toLocaleString("vi-VN")}₫ thành công!`);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setAllProducts(data); })
      .catch(console.error);
    window.setTimeout(() => {
      setCart([]);
      setPaid(false);
      setPaymentMethod("counter");
    }, 1500);
  };

  const handleConfirmPayment = async () => {
    if (cart.length === 0 || processing) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
      // 1. Tạo đơn hàng POS tại quầy
      const res = await fetch("/api/product-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.id, quantity: i.qty })),
          paymentMethod,
          fulfillmentMethod: "counter_pickup",
          discountAmount: discount,
        }),
      });

      if (res.ok) {
        const orderData = await res.json();
        if (!orderData?.id) throw new Error("Máy chủ không trả về mã đơn hàng.");

        if (paymentMethod === "qr") {
          const orderTotal = Number(orderData.totalAmount ?? total);
          const qrResponse = await fetch(
            `/api/payments/sepay-qr?orderId=${encodeURIComponent(orderData.id)}&amount=${encodeURIComponent(orderTotal)}`
          );
          const qrData = await qrResponse.json().catch(() => null);
          if (!qrResponse.ok || !qrData?.qrUrl || !qrData?.transferContent) {
            throw new Error(qrData?.message || "Không thể tạo mã QR SePay cho đơn hàng.");
          }
          setQrOrder({
            id: orderData.id,
            total: orderTotal,
            memo: qrData.transferContent,
            qrUrl: qrData.qrUrl,
            bankName: qrData.bankCode || "Ngân hàng",
            accountNumber: qrData.accountNumber || "",
            accountName: qrData.accountName || "",
          });
          setQrPaymentStatus("waiting");
          toast.success("Đã tạo đơn chờ thanh toán. Mời khách quét mã QR.");
        } else {
          await completeOrder(orderData.id, token, Number(orderData.totalAmount ?? total));
        }
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.message || "Không thể tạo đơn hàng POS.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi kết nối khi thanh toán đơn POS.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!qrOrder) return;

    let cancelled = false;
    let timeoutId: number | undefined;
    let isChecking = false;

    const checkSePayPayment = async () => {
      if (isChecking || cancelled) return;
      isChecking = true;
      try {
        const response = await fetch(`/api/payments/sepay-check/${encodeURIComponent(qrOrder.id)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Không kiểm tra được trạng thái đơn SePay.");
        const payment = await response.json();
        if (cancelled) return;

        if (payment.isPaid) {
          setQrPaymentStatus("confirming");
          setProcessing(true);
          try {
            const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
            await completeOrder(qrOrder.id, token, qrOrder.total);
          } catch (error: any) {
            setQrPaymentStatus("error");
            toast.error(`SePay đã nhận tiền nhưng hệ thống chưa hoàn tất đơn: ${error?.message || "Lỗi xử lý đơn hàng."}`);
          } finally {
            setProcessing(false);
          }
          return;
        }
      } catch (error) {
        console.warn("SePay POS payment check failed:", error);
      } finally {
        isChecking = false;
      }

      if (!cancelled) timeoutId = window.setTimeout(checkSePayPayment, 2000);
    };

    void checkSePayPayment();
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [qrOrder]);

  return (
    <div className="flex flex-1 gap-[24px] items-start min-h-0 p-[24px] sm:p-[32px] w-full">
      <PosProductGrid
        products={filteredProducts}
        tabs={tabs}
        activeTab={activeTab}
        searchQuery={searchQuery}
        onSelectTab={setActiveTab}
        onSearchChange={setSearchQuery}
        onAddToCart={handleAddToCart}
      />
      <PosCart
        cart={cart}
        paid={paid}
        onChangeQty={handleChangeQty}
        onConfirmPayment={() => {
          if (!qrOrder) setPaymentMethod("counter");
          setCheckoutOpen(true);
        }}
      />
      {checkoutOpen && createPortal(
        <div ref={checkoutOverlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Thanh toán đơn hàng</h2>
                <p className="text-sm text-slate-500">Tổng cần thu: <strong className="text-emerald-700">{(qrOrder?.total ?? total).toLocaleString("vi-VN")}₫</strong></p>
              </div>
              {!qrOrder && <button type="button" onClick={() => setCheckoutOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Đóng"><X className="h-5 w-5" /></button>}
            </div>

            {!qrOrder ? (
              <>
                <div className="mb-5 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod("counter")} className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-bold ${paymentMethod === "counter" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}>
                    <Banknote className="h-5 w-5" /> Tiền mặt
                  </button>
                  <button type="button" onClick={() => setPaymentMethod("qr")} className={`flex items-center justify-center gap-2 rounded-xl border p-4 font-bold ${paymentMethod === "qr" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-600"}`}>
                    <QrCode className="h-5 w-5" /> Quét mã QR
                  </button>
                </div>
                <button type="button" disabled={processing} onClick={handleConfirmPayment} className="w-full rounded-xl bg-emerald-600 p-3 font-extrabold text-white disabled:opacity-60">
                  {processing ? "ĐANG TẠO ĐƠN..." : paymentMethod === "qr" ? "TẠO ĐƠN VÀ HIỂN THỊ QR" : "XÁC NHẬN ĐÃ THU TIỀN MẶT"}
                </button>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <img src={qrOrder.qrUrl} alt="Mã QR thanh toán đơn hàng" className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-2 object-contain" />
                  <div className="space-y-2 text-sm text-slate-700">
                    <p className="font-bold">Khách dùng ứng dụng ngân hàng trên điện thoại để quét mã.</p>
                    <p>Số tiền: <strong>{qrOrder.total.toLocaleString("vi-VN")}₫</strong></p>
                    <p>Ngân hàng: <strong>{qrOrder.bankName}</strong></p>
                    <p>Số tài khoản: <strong>{qrOrder.accountNumber}</strong></p>
                    <p>Chủ tài khoản: <strong>{qrOrder.accountName}</strong></p>
                    <p>Nội dung chuyển khoản: <strong className="font-mono">{qrOrder.memo}</strong></p>
                    <div className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-xs ${qrPaymentStatus === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : qrPaymentStatus === "confirming" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                      {qrPaymentStatus === "confirming" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : qrPaymentStatus === "error" ? <Clock3 className="mt-0.5 h-4 w-4 shrink-0" /> : <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />}
                      <span>
                        {qrPaymentStatus === "confirming"
                          ? "SePay đã xác nhận tiền vào. Đang hoàn tất đơn hàng…"
                          : qrPaymentStatus === "error"
                          ? "Tiền đã được SePay ghi nhận nhưng không thể tự hoàn tất đơn. Vui lòng báo quản lý để đối soát."
                          : "Đang tự động kiểm tra biến động số dư qua SePay mỗi 2 giây. Đơn chỉ hoàn tất sau khi nhận đủ tiền."}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setCheckoutOpen(false)} disabled={processing} className="rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 disabled:opacity-50">Thu nhỏ</button>
                  <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold ${qrPaymentStatus === "error" ? "bg-rose-100 text-rose-800" : "bg-emerald-50 text-emerald-800"}`}>
                    {qrPaymentStatus === "confirming" || processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : qrPaymentStatus === "error" ? <Clock3 className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
                    {qrPaymentStatus === "error" ? "CẦN ĐỐI SOÁT" : qrPaymentStatus === "confirming" || processing ? "ĐANG HOÀN TẤT ĐƠN" : "ĐANG CHỜ SEPAY"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
export default PosPage;
