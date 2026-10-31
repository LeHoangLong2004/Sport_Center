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
    const refreshTimer = window.setInterval(() => {
      if (!document.hidden) void loadMessages(openChatId)
    }, 10000)
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">Mua sắm tại SportCenter</p>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">Cửa hàng sản phẩm</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Đặt trước thực phẩm thể thao, phụ kiện và nhận hàng nhanh chóng.</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 px-4 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {itemCount} món trong giỏ
          </div>
        </div>

        {message && <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{message}</div>}
        {error && <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">{error}</div>}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="mb-5 flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                    category === item
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="py-12 text-center text-sm text-slate-400">Đang tải sản phẩm...</p>
            ) : visibleProducts.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">Chưa có sản phẩm phù hợp.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    disabled={product.stockQuantity <= 0}
                    onClick={() => addToCart(product)}
                    className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 text-left transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer group"
                  >
                    <div className="flex h-40 items-center justify-center bg-slate-50 dark:bg-slate-800 overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <span className="text-xs text-slate-400">Không có ảnh</span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{product.category || "Sản phẩm"}</p>
                      <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold text-slate-900 dark:text-white">{product.name}</h2>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{money(product.price)}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{product.stockQuantity > 0 ? `Còn ${product.stockQuantity}` : "Hết hàng"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Giỏ hàng của bạn</h2>
              <span className="rounded-full bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">{itemCount} món</span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Chưa có sản phẩm trong giỏ.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{money(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => changeQuantity(item.id, -1)} className="h-6 w-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">−</button>
                      <span className="w-5 text-center text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                      <button type="button" onClick={() => changeQuantity(item.id, 1)} className="h-6 w-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Cách nhận hàng</p>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="radio" checked={fulfillmentMethod === "counter_pickup"} onChange={() => setFulfillmentMethod("counter_pickup")} className="mt-0.5 accent-emerald-600" />
                  Nhận tại quầy lễ tân
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="radio" checked={fulfillmentMethod === "in_center_delivery"} onChange={() => setFulfillmentMethod("in_center_delivery")} className="mt-0.5 accent-emerald-600" />
                  Giao đến vị trí trong trung tâm
                </label>
                {fulfillmentMethod === "in_center_delivery" && (
                  <input
                    value={deliveryLocation}
                    onChange={(event) => setDeliveryLocation(event.target.value)}
                    placeholder="Ví dụ: Khu Gym tầng 2, Studio 1..."
                    className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                )}
              </div>
            )}

            {cart.length > 0 && (
              <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Phương thức thanh toán</p>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="radio" checked={paymentMethod === "counter"} onChange={() => setPaymentMethod("counter")} className="mt-0.5 accent-emerald-600" />
                  Thanh toán tại quầy
                </label>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <input type="radio" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-0.5 accent-emerald-600" />
                  Thanh toán online (QR/Ví)
                </label>
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Tạm tính</span>
                <strong className="text-sm font-extrabold text-slate-900 dark:text-white">{money(total)}</strong>
              </div>
              <button
                type="button"
                disabled={cart.length === 0 || submitting}
                onClick={() => void submitOrder()}
                className="mt-3.5 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-emerald-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Đang gửi đơn..." : paymentMethod === "online" ? "Tiếp tục thanh toán online" : "Đặt hàng, thanh toán tại quầy"}
              </button>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">Đơn hàng của tôi</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Theo dõi tiến độ nhận hàng và trao đổi trực tiếp với lễ tân.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{orders.length} đơn</span>
          </div>

          {orders.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">Bạn chưa có đơn mua sản phẩm nào.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      order.status === "completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {order.status === "completed" ? "Đã thanh toán" : "Chờ thanh toán"}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {fulfillmentLabels[order.fulfillmentStatus]} · {order.fulfillmentMethod === "in_center_delivery" ? `Giao tại ${order.deliveryLocation || "vị trí đã chọn"}` : "Nhận tại quầy"}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(order.createdAt).toLocaleString("vi-VN")} · {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{money(order.totalAmount)}</p>
                    <button
                      type="button"
                      onClick={() => void toggleChat(order.id)}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors cursor-pointer"
                    >
                      {openChatId === order.id ? "Đóng trao đổi" : order.messageCount > 0 ? `Xem tin nhắn (${order.messageCount})` : "Nhắn lễ tân"}
                    </button>
                  </div>

                  {openChatId === order.id && (
                    <div className="mt-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <div className="max-h-40 space-y-2 overflow-y-auto">
                        {(messages[order.id] || []).length === 0 ? (
                          <p className="text-xs text-slate-400">Chưa có tin nhắn từ lễ tân.</p>
                        ) : (
                          messages[order.id].map((item) => (
                            <div key={item.id} className="rounded-lg bg-slate-50 dark:bg-slate-700/60 p-2.5 text-xs space-y-1">
                              <p className="font-bold text-slate-800 dark:text-slate-200">{item.senderName}</p>
                              <p className="text-slate-600 dark:text-slate-300">{item.message}</p>
                              <p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={drafts[order.id] || ""}
                          onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: event.target.value }))}
                          onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(order.id) }}
                          placeholder="Nhắn lễ tân..."
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => void sendMessage(order.id)}
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition cursor-pointer"
                        >
                          Gửi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
  )

  return embedded ? content : <MemberShell page="shop" onNavigate={onNavigate}>{content}</MemberShell>
}
