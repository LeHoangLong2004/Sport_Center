import { useCallback, useEffect, useMemo, useState } from "react"

type FulfillmentStatus = "pending" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled"

type ProductOrder = {
  id: string
  customerName: string
  totalAmount: number
  paymentMethod: string
  status: string
  createdAt: string
  fulfillmentMethod: "counter_pickup" | "in_center_delivery"
  fulfillmentStatus: FulfillmentStatus
  deliveryLocation?: string | null
  assignedToName?: string
  paidAt?: string | null
  messageCount: number
  items: Array<{ name: string; quantity: number; unitPrice: number }>
}

type OrderMessage = {
  id: string
  senderId: string
  senderName: string
  message: string
  createdAt: string
}

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readResponse(response: Response) {
  const raw = await response.text()
  let body: any = {}
  try { body = raw ? JSON.parse(raw) : {} } catch { /* middleware may return plain text */ }
  if (!response.ok) {
    const error = new Error(body.message || body.title || raw.trim() || `Yêu cầu thất bại (${response.status}).`) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  return body
}

const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  pending: "Chờ xử lý",
  preparing: "Đang chuẩn bị",
  ready: "Sẵn sàng nhận",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
}

function nextAction(order: ProductOrder) {
  if (order.fulfillmentStatus === "preparing") return order.fulfillmentMethod === "in_center_delivery" ? ["delivering", "Bắt đầu giao"] as const : ["ready", "Sẵn sàng nhận"] as const
  if (order.fulfillmentStatus === "ready") return ["delivered", "Xác nhận đã nhận"] as const
  if (order.fulfillmentStatus === "delivering") return ["delivered", "Xác nhận đã giao"] as const
  return null
}

export function ProductOrdersPage() {
  const [orders, setOrders] = useState<ProductOrder[]>([])
  const [filter, setFilter] = useState<"all" | FulfillmentStatus>("all")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, OrderMessage[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [error, setError] = useState("")

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const body = await readResponse(await fetch("/api/product-orders", { headers: authHeaders() }))
      setOrders(Array.isArray(body) ? body : [])
      setError("")
    } catch (loadError) {
      const status = loadError instanceof Error ? (loadError as Error & { status?: number }).status : undefined
      if (status === 403) {
        setError("Tài khoản hiện tại không có quyền xem đơn hàng Member. Hãy đăng nhập bằng tài khoản Receptionist hoặc Center Manager.")
      } else if (status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại bằng tài khoản Receptionist hoặc Center Manager.")
      } else {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải danh sách đơn hàng.")
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadOrders()

    // Đồng bộ đơn mới tạo từ Member Portal mà không cần nhân viên bấm lại thủ công (tải nền im lặng).
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadOrders(true)
    }, 15000)

    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void loadOrders(true)
    }
    document.addEventListener("visibilitychange", refreshOnFocus)
    window.addEventListener("focus", refreshOnFocus)

    return () => {
      window.clearInterval(refreshTimer)
      document.removeEventListener("visibilitychange", refreshOnFocus)
      window.removeEventListener("focus", refreshOnFocus)
    }
  }, [loadOrders])

  const loadMessages = useCallback(async (orderId: string) => {
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, { headers: authHeaders() }))
      setMessages((current) => ({ ...current, [orderId]: Array.isArray(body) ? body : [] }))
      setError("")
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể tải tin nhắn.")
    }
  }, [])

  useEffect(() => {
    if (!openChatId) return
    void loadMessages(openChatId)
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadMessages(openChatId)
    }, 10000)
    return () => window.clearInterval(refreshTimer)
  }, [openChatId, loadMessages])

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter((order) => order.status === "pending" || order.fulfillmentStatus === "pending").length,
    preparing: orders.filter((order) => order.fulfillmentStatus === "preparing" || order.fulfillmentStatus === "ready").length,
    delivering: orders.filter((order) => order.fulfillmentStatus === "delivering").length,
  }), [orders])

  const visibleOrders = orders.filter((order) => {
    if (filter === "all") return true
    if (filter === "pending") return order.status === "pending" || order.fulfillmentStatus === "pending"
    if (filter === "preparing") return order.fulfillmentStatus === "preparing" || order.fulfillmentStatus === "ready"
    return order.fulfillmentStatus === filter
  })

  async function confirmPayment(orderId: string) {
    if (processingId) return
    setProcessingId(orderId)
    setError("")
    try {
      await readResponse(await fetch(`/api/product-orders/${orderId}/confirm`, { method: "PUT", headers: authHeaders() }))
      await loadOrders()
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "Không thể xác nhận thanh toán.")
    } finally {
      setProcessingId(null)
    }
  }

  async function updateFulfillment(orderId: string, status: FulfillmentStatus) {
    if (processingId) return
    setProcessingId(orderId)
    setError("")
    try {
      await readResponse(await fetch(`/api/product-orders/${orderId}/fulfillment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      }))
      await loadOrders()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Không thể cập nhật trạng thái đơn hàng.")
    } finally {
      setProcessingId(null)
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
    const message = drafts[orderId]?.trim()
    if (!message) return
    try {
      const body = await readResponse(await fetch(`/api/product-orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ message }),
      }))
      setMessages((current) => ({ ...current, [orderId]: [...(current[orderId] || []), body] }))
      setDrafts((current) => ({ ...current, [orderId]: "" }))
    } catch (messageError) {
      setError(messageError instanceof Error ? messageError.message : "Không thể gửi tin nhắn.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-500">Lễ tân / Đơn hàng Member</p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Quản lý đơn mua hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Xác nhận thanh toán, chuẩn bị hàng và trao đổi với Member theo từng đơn. Tin nhắn nằm trong nút <strong>Xem chat</strong> của mỗi đơn.</p>
        </div>
        <button type="button" onClick={() => void loadOrders()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-purple-300 hover:text-purple-600">Làm mới</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-4">
        {([
          ["all", "Tổng đơn", counts.all],
          ["pending", "Chờ tiếp nhận", counts.pending],
          ["preparing", "Đang chuẩn bị", counts.preparing],
          ["delivering", "Đang giao", counts.delivering],
        ] as const).map(([status, label, count]) => (
          <button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${filter === status ? "border-purple-400 ring-2 ring-purple-100" : "border-slate-200"}`}>
            <span className="text-sm text-slate-500">{label}</span>
            <strong className="mt-2 block text-2xl text-slate-900">{count}</strong>
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-slate-900">Danh sách đơn Member</h2></div>
        {loading ? <p className="p-8 text-center text-sm text-slate-400">Đang tải đơn hàng...</p> : visibleOrders.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">Không có đơn hàng ở trạng thái này.</p> : <div className="divide-y divide-slate-100">{visibleOrders.map((order) => {
          const action = nextAction(order)
          const isPaid = order.status === "completed"
          const isClosed = order.fulfillmentStatus === "delivered" || order.fulfillmentStatus === "cancelled"
          return (
            <article key={order.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</h3><span className={`rounded-full px-2 py-1 text-xs font-bold ${isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{isPaid ? "Đã thanh toán" : "Chờ thanh toán"}</span><span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">{fulfillmentLabels[order.fulfillmentStatus]}</span></div>
                  <p className="mt-1 text-sm text-slate-600">{order.customerName} · {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
                  <p className="mt-2 text-xs text-slate-500">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-600">{order.fulfillmentMethod === "in_center_delivery" ? `Giao tại: ${order.deliveryLocation || "Chưa nhập vị trí"}` : "Nhận tại quầy lễ tân"}{order.assignedToName ? ` · Phụ trách: ${order.assignedToName}` : ""}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2"><strong className="mr-2 text-lg text-purple-600">{money(order.totalAmount)}</strong>{order.status === "pending" && <button type="button" disabled={processingId === order.id} onClick={() => void confirmPayment(order.id)} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50">{processingId === order.id ? "Đang xử lý..." : "Xác nhận đã thu tiền"}</button>}{isPaid && action && <button type="button" disabled={processingId === order.id} onClick={() => void updateFulfillment(order.id, action[0])} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50">{action[1]}</button>}{!isClosed && <button type="button" onClick={() => void updateFulfillment(order.id, "cancelled")} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Hủy</button>}<button type="button" onClick={() => void toggleChat(order.id)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:border-purple-300 hover:text-purple-600">{openChatId === order.id ? "Đóng chat" : order.messageCount > 0 ? `Xem chat (${order.messageCount})` : "Nhắn Member"}</button></div>
              </div>
              {openChatId === order.id && <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="max-h-48 space-y-2 overflow-y-auto">{(messages[order.id] || []).length === 0 ? <p className="text-sm text-slate-400">Chưa có tin nhắn. Hãy chủ động thông báo tình trạng đơn cho Member.</p> : messages[order.id].map((item) => <div key={item.id} className="rounded-lg bg-white p-3 text-sm shadow-sm"><p className="font-bold text-slate-700">{item.senderName}</p><p className="mt-1 text-slate-600">{item.message}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p></div>)}</div><div className="mt-3 flex gap-2"><input value={drafts[order.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [order.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(order.id) }} placeholder="Nhập tin nhắn cho Member..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400" /><button type="button" onClick={() => void sendMessage(order.id)} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-bold text-white">Gửi</button></div></div>}
            </article>
          )
        })}</div>}
      </section>
    </div>
  )
}
