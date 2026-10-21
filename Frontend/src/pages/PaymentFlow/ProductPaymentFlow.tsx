import { useMemo, useState } from "react";
import { CheckoutHeader, CheckoutFooter } from "./CheckoutHeader";
import { PaymentMethodScreen } from "./PaymentMethodScreen";
import { FlowPackage, PaymentMethodId, Stepper } from "./shared";

type ProductPaymentOrder = {
  id: string;
  totalAmount: number;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  fulfillmentMethod?: string;
  deliveryLocation?: string | null;
};

type Props = {
  order: ProductPaymentOrder;
  onBack: () => void;
  onCompleted: () => void;
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(response: Response): Promise<string> {
  const raw = await response.text();
  try {
    const body = raw ? JSON.parse(raw) : {};
    return body.message || body.title || body.detail || raw || `Thanh toán thất bại (${response.status}).`;
  } catch {
    return raw || `Thanh toán thất bại (${response.status}).`;
  }
}

export function ProductPaymentFlow({ order, onBack, onCompleted }: Props) {
  const [method, setMethod] = useState<PaymentMethodId>("qr");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const productPackage = useMemo<FlowPackage>(() => ({
    id: order.id,
    name: "Đơn hàng sản phẩm",
    tagline: "Sản phẩm & đồ tập SportCenter",
    description: "Kiểm tra thông tin và hoàn tất thanh toán đơn hàng của bạn.",
    monthly: order.totalAmount,
    yearly: order.totalAmount,
    checkoutTotal: order.totalAmount,
    checkoutListPrice: order.totalAmount,
    checkoutDiscount: 0,
    periodLabel: "Đơn hàng",
    features: order.items.map((item) => `${item.name} × ${item.quantity}`),
    details: [
      { label: "Số mặt hàng", value: `${order.items.reduce((sum, item) => sum + item.quantity, 0)} món` },
      { label: "Nhận hàng", value: order.fulfillmentMethod === "in_center_delivery" ? `Giao tại ${order.deliveryLocation || "vị trí đã chọn"}` : "Nhận tại quầy lễ tân" },
    ],
  }), [order]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const formData = useMemo(() => ({
    fullName: user.fullName || user.name || "Hội viên",
    phone: user.phoneNumber || user.phone || "",
    email: user.email || "",
    branch: "SportCenter",
    startDate: new Date().toISOString().slice(0, 10),
  }), [user]);

  async function confirmPayment() {
    if (processing) return;
    setProcessing(true);
    setError("");
    try {
      const response = await fetch(`/api/payments/${order.id}/process`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(await readError(response));
      setCompleted(true);
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Không thể hoàn tất thanh toán.");
    } finally {
      setProcessing(false);
    }
  }

  if (completed) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8fafc]">
        <CheckoutHeader onExit={onCompleted} />
        <div className="flex-1">
          <Stepper active={4} />
          <div className="mx-auto flex max-w-3xl justify-center px-6 pb-20 pt-8">
            <div className="w-full rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">✓</div>
              <h1 className="mt-5 text-3xl font-black text-[#0f172a]">Thanh toán thành công!</h1>
              <p className="mt-2 text-sm text-[#64748b]">Đơn hàng sản phẩm đã được ghi nhận và gửi tới lễ tân.</p>
              <div className="mx-auto mt-6 max-w-md rounded-xl bg-slate-50 p-4 text-left text-sm">
                <div className="flex justify-between gap-4"><span className="text-slate-500">Mã đơn hàng</span><strong className="text-slate-800">{order.id.slice(0, 8).toUpperCase()}</strong></div>
                <div className="mt-3 flex justify-between gap-4"><span className="text-slate-500">Tổng thanh toán</span><strong className="text-teal-600">{order.totalAmount.toLocaleString("vi-VN")} đ</strong></div>
              </div>
              <button type="button" onClick={onCompleted} className="mt-7 rounded-xl bg-teal-500 px-6 py-3 text-sm font-bold text-white hover:bg-teal-600">Quay lại cửa hàng</button>
            </div>
          </div>
        </div>
        <CheckoutFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <CheckoutHeader onExit={onBack} />
      <div className="flex-1">
        {error && <div className="mx-auto mt-4 max-w-[1280px] rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <PaymentMethodScreen
          pkg={productPackage}
          period="monthly"
          method={method}
          setMethod={setMethod}
          formData={formData}
          availableMethods={["qr", "card", "wallet"]}
          onNext={() => void confirmPayment()}
          onBack={onBack}
        />
        {processing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30"><div className="rounded-xl bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-xl">Đang xác nhận thanh toán...</div></div>}
      </div>
      <CheckoutFooter />
    </div>
  );
}
