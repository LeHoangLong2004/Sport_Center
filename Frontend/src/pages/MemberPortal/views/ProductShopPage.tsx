import { useEffect, useMemo, useState } from "react"
import { MemberPage } from "../shared"
import MemberShell from "../components/MemberShell"

type Product = {
  id: string
  name: string
  category?: string
  price: number
  stockQuantity: number
  imageUrl?: string | null
}

type CartItem = Product & { quantity: number }
type CheckoutPaymentMethod = "counter" | "online"
type FulfillmentStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled"

export type ProductOrder = {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  fulfillmentMethod: "counter_pickup" | "in_center_delivery"
  fulfillmentStatus: FulfillmentStatus
  deliveryLocation?: string | null
  messageCount: number
  items: Array<{ name: string; quantity: number; unitPrice: number }>
}

type OrderMessage = {
  id: string
  senderName: string
  message: string
  createdAt: string
}

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`
const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  pending: "Chờ lễ tân tiếp nhận",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng nhận tại quầy",
  delivering: "Đang giao trong trung tâm",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readResponse(response: Response) {
  const raw = await response.text()
  let body: any = {}
  try { body = raw ? JSON.parse(raw) : {} } catch { /* middleware may return plain text */ }
  if (!response.ok) throw new Error(body.message || body.title || raw.trim() || `Yêu cầu thất bại (${response.status}).`)
  return body
}

export function ProductShopPage({ onNavigate, onOnlinePayment, embedded = false }: { onNavigate: (page: MemberPage) => void; onOnlinePayment?: (order: ProductOrder) => void; embedded?: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState("Tất cả")
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"counter_pickup" | "in_center_delivery">("counter_pickup")
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("counter")
  const [deliveryLocation, setDeliveryLocation] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, OrderMessage[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function loadData() {
    setLoading(true)
    try {
      const headers = authHeaders()
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/product-orders/my", { headers }),
      ])
      if (!productsResponse.ok) throw new Error("Không thể tải danh sách sản phẩm.")
      const nextProducts = await productsResponse.json()
      setProducts(Array.isArray(nextProducts) ? nextProducts : [])
      if (ordersResponse.ok) {
        const nextOrders = await ordersResponse.json()
        setOrders(Array.isArray(nextOrders) ? nextOrders : [])
      }
      setError("")
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu cửa hàng.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadData() }, [])

  async function loadMessages(orderId: string) {
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, { headers: authHeaders() }))
      setMessages((current) => ({ ...current, [orderId]: Array.isArray(body) ? body : [] }))
      setError("")
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể tải tin nhắn.")
    }
  }

  useEffect(() => {
    if (!openChatId) return
    void loadMessages(openChatId)
    const refreshTimer = window.setInterval(() => void loadMessages(openChatId), 10000)
    return () => window.clearInterval(refreshTimer)
  }, [openChatId])

  const categories = useMemo(() => ["Tất cả", ...new Set(products.map((product) => product.category).filter(Boolean) as string[])], [products])
  const visibleProducts = products.filter((product) => category === "Tất cả" || product.category === category)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  function addToCart(product: Product) {
    if (product.stockQuantity <= 0) return
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (!existing) return [...current, { ...product, quantity: 1 }]
      return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) } : item)
    })
    setMessage("")
    setError("")
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((current) => current.map((item) => item.id === productId ? { ...item, quantity: Math.min(item.stockQuantity, Math.max(0, item.quantity + delta)) } : item).filter((item) => item.quantity > 0))
  }

  async function submitOrder() {
    if (cart.length === 0 || submitting) return
    if (fulfillmentMethod === "in_center_delivery" && !deliveryLocation.trim()) {
      setError("Vui lòng nhập vị trí để nhân viên giao hàng trong trung tâm.")
      return
    }
    setSubmitting(true)
    setMessage("")
    setError("")
    try {
      const order = await readResponse(await fetch("/api/product-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          paymentMethod: paymentMethod === "online" ? "qr" : "counter",
          fulfillmentMethod,
          deliveryLocation: fulfillmentMethod === "in_center_delivery" ? deliveryLocation.trim() : null,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      }))
      if (paymentMethod === "online") {
        setCart([])
        onOnlinePayment?.(order)
        return
      }
      setCart([])
      setPaymentMethod("counter")
      setFulfillmentMethod("counter_pickup")
      setDeliveryLocation("")
      setMessage("Đã gửi đơn hàng. Vui lòng thanh toán và nhận hàng theo phương thức đã chọn.")
      await loadData()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể tạo đơn hàng.")
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleChat(orderId: string) {
    if (openChatId === orderId) {
      setOpenChatId(null)
      return
    }
    setOpenChatId(orderId)
  }

  async function sendMessage(orderId: string) {
    const text = drafts[orderId]?.trim()
    if (!text) return
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message: text }),
      }))
      setMessages((current) => ({ ...current, [orderId]: [...(current[orderId] || []), body] }))
      setDrafts((current) => ({ ...current, [orderId]: "" }))
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể gửi tin nhắn.")
    }
  }

  const content = (
      <div className="flex flex-col gap-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f9f94]">Mua sắm tại SportCenter</p><h1 className="mt-2 text-2xl font-extrabold text-[#0f172a]">Cửa hàng sản phẩm</h1><p className="mt-1 text-sm text-[#64748b]">Đặt trước sản phẩm, thanh toán và nhận hàng tại trung tâm.</p></div>
          <div className="rounded-xl bg-[#ecfdf5] px-4 py-3 text-sm font-semibold text-[#047857]">{itemCount} món trong giỏ</div>
        </div>

        {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap gap-2">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${category === item ? "border-[#0f9f94] bg-[#ecfdf5] text-[#0f9f94]" : "border-[#e2e8f0] text-[#64748b] hover:border-[#94a3b8]"}`}>{item}</button>)}</div>
            {loading ? <p className="py-12 text-center text-sm text-[#94a3b8]">Đang tải sản phẩm...</p> : visibleProducts.length === 0 ? <p className="py-12 text-center text-sm text-[#94a3b8]">Chưa có sản phẩm phù hợp.</p> : <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{visibleProducts.map((product) => <button key={product.id} type="button" disabled={product.stockQuantity <= 0} onClick={() => addToCart(product)} className="overflow-hidden rounded-xl border border-[#e2e8f0] text-left transition hover:-translate-y-0.5 hover:border-[#0f9f94] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"><div className="flex h-36 items-center justify-center bg-[#f8fafc]">{product.imageUrl ? <img src={product.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="text-xs text-[#94a3b8]">Không có ảnh</span>}</div><div className="p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-[#0f9f94]">{product.category || "Sản phẩm"}</p><h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold text-[#0f172a]">{product.name}</h2><div className="mt-3 flex items-center justify-between gap-2"><span className="text-base font-extrabold text-[#2563eb]">{money(product.price)}</span><span className="text-xs text-[#64748b]">{product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : "Hết hàng"}</span></div></div></button>)}</div>}
          </section>

          <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-extrabold text-[#0f172a]">Giỏ hàng</h2><span className="rounded-full bg-[#eef2ff] px-2 py-1 text-xs font-bold text-[#4f46e5]">{itemCount} món</span></div>
            <div className="max-h-64 overflow-y-auto">{cart.length === 0 ? <p className="py-8 text-center text-sm text-[#94a3b8]">Chưa có sản phẩm trong giỏ.</p> : cart.map((item) => <div key={item.id} className="flex items-center gap-3 border-b border-[#e2e8f0] py-3 last:border-b-0"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#0f172a]">{item.name}</p><p className="text-xs text-[#64748b]">{money(item.price)}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => changeQuantity(item.id, -1)} className="h-7 w-7 rounded border border-[#e2e8f0] text-[#64748b]">−</button><span className="w-5 text-center text-sm font-bold text-[#0f172a]">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)} className="h-7 w-7 rounded border border-[#e2e8f0] text-[#64748b]">+</button></div></div>)}</div>
            {cart.length > 0 && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-sm font-bold text-slate-800">Cách nhận hàng</p><label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-600"><input type="radio" checked={fulfillmentMethod === "counter_pickup"} onChange={() => setFulfillmentMethod("counter_pickup")} className="mt-1" />Nhận tại quầy lễ tân</label><label className="mt-2 flex cursor-pointer items-start gap-2 text-sm text-slate-600"><input type="radio" checked={fulfillmentMethod === "in_center_delivery"} onChange={() => setFulfillmentMethod("in_center_delivery")} className="mt-1" />Giao đến vị trí trong trung tâm</label>{fulfillmentMethod === "in_center_delivery" && <input value={deliveryLocation} onChange={(event) => setDeliveryLocation(event.target.value)} placeholder="Ví dụ: Gym Area, Studio 1..." className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#0f9f94]" />}</div>}
            {cart.length > 0 && <div className="rounded-xl border border-teal-100 bg-teal-50 p-3"><p className="text-sm font-bold text-slate-800">Phương thức thanh toán</p><label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-slate-600"><input type="radio" checked={paymentMethod === "counter"} onChange={() => setPaymentMethod("counter")} className="mt-1" />Thanh toán tại quầy</label><label className="mt-2 flex cursor-pointer items-start gap-2 text-sm text-slate-600"><input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-1" />Thanh toán online</label></div>}
            <div className="border-t border-[#e2e8f0] pt-4"><div className="flex items-center justify-between text-sm text-[#64748b]"><span>Tạm tính</span><strong className="text-[#0f172a]">{money(total)}</strong></div><button type="button" disabled={cart.length === 0 || submitting} onClick={() => void submitOrder()} className="mt-4 w-full rounded-xl bg-[#0f9f94] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#0d8b82] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Đang gửi đơn..." : paymentMethod === "online" ? "Tiếp tục thanh toán" : "Đặt hàng, thanh toán tại quầy"}</button></div>
          </aside>
        </div>

        <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-extrabold text-[#0f172a]">Đơn hàng của tôi</h2><p className="mt-1 text-xs text-[#64748b]">Tin nhắn với lễ tân nằm trong từng đơn hàng. Bấm <strong>Xem tin nhắn</strong> để mở trao đổi.</p></div><span className="text-xs text-[#64748b]">{orders.length} đơn</span></div>{orders.length === 0 ? <p className="text-sm text-[#94a3b8]">Bạn chưa có đơn mua sản phẩm nào.</p> : <div className="grid gap-3 md:grid-cols-2">{orders.map((order) => <div key={order.id} className="rounded-xl border border-[#e2e8f0] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-[#0f172a]">#{order.id.slice(0, 8).toUpperCase()}</p><span className={`rounded-full px-2 py-1 text-xs font-bold ${order.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{order.status === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}</span></div><p className="mt-2 text-xs font-semibold text-[#64748b]">{fulfillmentLabels[order.fulfillmentStatus]} · {order.fulfillmentMethod === "in_center_delivery" ? `Giao tại ${order.deliveryLocation || "vị trí đã chọn"}` : "Nhận tại quầy"}</p><p className="mt-2 text-xs text-[#64748b]">{new Date(order.createdAt).toLocaleString("vi-VN")} · {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p><div className="mt-3 flex items-center justify-between"><p className="font-extrabold text-[#0f9f94]">{money(order.totalAmount)}</p><button type="button" onClick={() => void toggleChat(order.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#0f9f94] hover:text-[#0f9f94]">{openChatId === order.id ? "Đóng trao đổi" : order.messageCount > 0 ? `Xem tin nhắn (${order.messageCount})` : "Nhắn lễ tân"}</button></div>{openChatId === order.id && <div className="mt-3 rounded-xl bg-slate-50 p-3"><div className="max-h-40 space-y-2 overflow-y-auto">{(messages[order.id] || []).length === 0 ? <p className="text-xs text-slate-400">Chưa có tin nhắn từ lễ tân.</p> : messages[order.id].map((item) => <div key={item.id} className="rounded-lg bg-white p-2 text-xs"><p className="font-bold text-slate-700">{item.senderName}</p><p className="mt-1 text-slate-600">{item.message}</p><p className="mt-1 text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p></div>)}</div><div className="mt-2 flex gap-2"><input value={drafts[order.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(order.id) }} placeholder="Nhắn lễ tân..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs outline-none focus:border-[#0f9f94]" /><button type="button" onClick={() => void sendMessage(order.id)} className="rounded-lg bg-[#0f9f94] px-3 py-2 text-xs font-bold text-white">Gửi</button></div></div>}</div>)}</div>}</section>
      </div>
  )

  return embedded ? content : <MemberShell page="shop" onNavigate={onNavigate}>{content}</MemberShell>
}
